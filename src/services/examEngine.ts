import { 
  Question, 
  Attempt, 
  AttemptMode, 
  ActiveExamSession, 
  DisciplineResult, 
  TopicResult, 
  ExamRule, 
  Subject, 
  ExamId 
} from '../types';
import { StorageService } from './storageService';

export interface DisciplineQuota {
  subjectId: string;
  subjectName: string;
  weightPercentage: number;
  quota: number;
}

export class ExamEngine {
  /**
   * Deterministically calculates the distribution of questions across disciplines
   * using the Largest Remainder (Hamilton-Hare) method.
   * Guarantees that the sum of quotas equals examRule.totalQuestions exactly.
   */
  public static calculateDisciplineDistribution(
    examRule: ExamRule,
    allSubjects: Subject[]
  ): DisciplineQuota[] {
    const enabledSubjects = allSubjects.filter(s => 
      examRule.enabledDisciplines.includes(s.id)
    );

    if (enabledSubjects.length === 0) {
      return [];
    }

    const totalQuestions = examRule.totalQuestions;
    const totalWeight = enabledSubjects.reduce((acc, s) => acc + s.weightPercentage, 0) || 100;

    // Calculate exact float quotas and initial floor allocations
    const intermediate = enabledSubjects.map(s => {
      const exactQuota = (s.weightPercentage / totalWeight) * totalQuestions;
      const floorQuota = Math.floor(exactQuota);
      const remainder = exactQuota - floorQuota;
      return {
        subjectId: s.id,
        subjectName: s.name,
        weightPercentage: s.weightPercentage,
        quota: floorQuota,
        remainder
      };
    });

    const sumFloor = intermediate.reduce((acc, item) => acc + item.quota, 0);
    let remainingToDistribute = totalQuestions - sumFloor;

    // Sort by largest remainder fraction descending, breaking ties by higher weight, then subjectId
    intermediate.sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 0.00001) {
        return b.remainder - a.remainder;
      }
      if (b.weightPercentage !== a.weightPercentage) {
        return b.weightPercentage - a.weightPercentage;
      }
      return a.subjectId.localeCompare(b.subjectId);
    });

    // Distribute remaining questions one by one
    for (let i = 0; i < remainingToDistribute; i++) {
      intermediate[i % intermediate.length].quota += 1;
    }

    // Return in original subject order
    const quotaMap = new Map(intermediate.map(item => [item.subjectId, item.quota]));
    return enabledSubjects.map(s => ({
      subjectId: s.id,
      subjectName: s.name,
      weightPercentage: s.weightPercentage,
      quota: quotaMap.get(s.id) || 0
    }));
  }

  /**
   * Starts a new exam session or targeted training session with strict validation.
   */
  public static startSession(
    mode: AttemptMode, 
    targetSubjectId?: string, 
    overrideExamId?: ExamId
  ): ActiveExamSession {
    const state = StorageService.getState();
    const examId: ExamId = overrideExamId || state.user.selectedExamId || 'cpa';
    const examRule = state.examRules[examId] || state.examRules['cpa'];

    let selectedQuestions: Question[] = [];
    let disciplineDistribution: Record<string, number> = {};
    let durationMinutes = examRule.durationMinutes;

    if (mode === 'FULL_EXAM') {
      const distribution = this.calculateDisciplineDistribution(examRule, state.subjects);
      const chosenPerSubject: Question[] = [];

      for (const item of distribution) {
        disciplineDistribution[item.subjectId] = item.quota;
        if (item.quota <= 0) continue;

        // Strictly query approved questions for this specific exam and subject
        const eligible = state.questions.filter(q => 
          q.examId === examId &&
          q.subjectId === item.subjectId &&
          q.status === 'approved'
        );

        if (eligible.length < item.quota) {
          if (!examRule.allowRedistributionIfInsufficient) {
            throw new Error(
              `Questões insuficientes na disciplina "${item.subjectName}". Necessárias: ${item.quota}, disponíveis: ${eligible.length}. Prova cancelada.`
            );
          }
        }

        // Shuffle within discipline and pick exact quota
        const shuffledDiscipline = this.shuffle(eligible).slice(0, item.quota);
        chosenPerSubject.push(...shuffledDiscipline);
      }

      // Final count check
      if (chosenPerSubject.length !== examRule.totalQuestions) {
        throw new Error(
          `Erro na composição da prova: selecionadas ${chosenPerSubject.length} questões, esperado ${examRule.totalQuestions}.`
        );
      }

      // Shuffle entire exam so disciplines are naturally intermingled
      selectedQuestions = this.shuffle(chosenPerSubject);
      durationMinutes = examRule.durationMinutes;

    } else if (mode === 'TARGETED_TRAINING') {
      const subjectId = targetSubjectId || 'mat_fin';
      const subject = state.subjects.find(s => s.id === subjectId);
      const subjectName = subject?.name || subjectId;
      const targetCount = 20; // Exact required count for targeted training

      // Filter approved questions for this exam and subject
      const eligible = state.questions.filter(q => 
        q.examId === examId &&
        q.subjectId === subjectId &&
        q.status === 'approved'
      );

      if (eligible.length < targetCount) {
        throw new Error(
          `Questões insuficientes para o treino da disciplina "${subjectName}". Necessárias: ${targetCount}, disponíveis: ${eligible.length}.`
        );
      }

      // Prioritize questions not yet answered in previous attempts for this exam
      const answeredQuestionIds = new Set<string>();
      state.attempts
        .filter(a => a.userId === state.user.id && a.examId === examId)
        .forEach(a => {
          a.answers.forEach(ans => answeredQuestionIds.add(ans.questionId));
        });

      const unattempted = eligible.filter(q => !answeredQuestionIds.has(q.id));
      const alreadyAttempted = eligible.filter(q => answeredQuestionIds.has(q.id));

      const chosen: Question[] = [];
      chosen.push(...this.shuffle(unattempted).slice(0, targetCount));

      if (chosen.length < targetCount) {
        const remainingNeeded = targetCount - chosen.length;
        chosen.push(...this.shuffle(alreadyAttempted).slice(0, remainingNeeded));
      }

      selectedQuestions = this.shuffle(chosen);
      disciplineDistribution[subjectId] = selectedQuestions.length;
      durationMinutes = 60; // 60 minutes for targeted training

    } else if (mode === 'ERROR_REVIEW') {
      // Query ONLY previous attempts from the SAME user and SAME exam
      const failedQuestionIds = new Set<string>();
      state.attempts
        .filter(a => a.userId === state.user.id && a.examId === examId)
        .forEach(att => {
          att.answers.forEach(ans => {
            if (!ans.isCorrect && ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined) {
              failedQuestionIds.add(ans.questionId);
            }
          });
        });

      if (failedQuestionIds.size === 0) {
        // Do NOT silently replace with random difficult questions!
        throw new Error(
          'Nenhuma questão incorreta encontrada para revisão neste exame. Complete simulados ou treinos para identificar seus erros.'
        );
      }

      // Filter eligible approved questions matching failed IDs in this exam
      const eligibleFailed = state.questions.filter(q => 
        q.examId === examId &&
        q.status === 'approved' &&
        failedQuestionIds.has(q.id)
      );

      if (eligibleFailed.length === 0) {
        throw new Error(
          'As questões erradas anteriormente não estão mais ativas no banco de questões.'
        );
      }

      // Select up to 20 failed questions
      selectedQuestions = this.shuffle(eligibleFailed).slice(0, 20);
      durationMinutes = Math.min(60, selectedQuestions.length * 3);

    } else if (mode === 'DAILY_CHALLENGE') {
      const eligible = state.questions.filter(q => 
        q.examId === examId &&
        q.status === 'approved'
      );
      selectedQuestions = this.shuffle(eligible).slice(0, 5);
      durationMinutes = 15;
    }

    // Stable unique session ID established once at start
    const stableSessionId = `session_${examId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Take immutable snapshot of the questions at creation time
    const snapshots: Question[] = JSON.parse(JSON.stringify(selectedQuestions));

    const newSession: ActiveExamSession = {
      id: stableSessionId,
      examId,
      mode,
      targetSubjectId,
      ruleVersion: examRule.ruleVersion,
      startedAtTimestamp: Date.now(),
      totalDurationSeconds: durationMinutes * 60,
      disciplineDistribution,
      questionIds: selectedQuestions.map(q => q.id),
      currentIndex: 0,
      answers: {},
      flaggedQuestionIds: [],
      questionSnapshots: snapshots,
      completed: false
    };

    StorageService.saveActiveSession(newSession);
    return newSession;
  }

  /**
   * Calculate remaining time in seconds based on epoch timestamp.
   * Guarantees refresh does not reset the timer.
   */
  public static getRemainingSeconds(session: ActiveExamSession): number {
    const elapsedSeconds = Math.floor((Date.now() - session.startedAtTimestamp) / 1000);
    const remaining = session.totalDurationSeconds - elapsedSeconds;
    return Math.max(0, remaining);
  }

  /**
   * Finalize and score an active session.
   * IDEMPOTENT: If already finalized, returns the existing attempt without duplicating.
   */
  public static finalizeSession(session: ActiveExamSession): Attempt {
    // 1. Idempotency Check: Return existing attempt if already completed
    const existingAttempt = StorageService.getAttemptBySessionId(session.id);
    if (existingAttempt) {
      return existingAttempt;
    }

    const state = StorageService.getState();
    const examRule = state.examRules[session.examId] || state.examRules['cpa'];

    // Mark session as completed in session object
    session.completed = true;

    // Use questionSnapshots preserved from session creation to guarantee immutable evaluation
    let sessionQuestions: Question[] = session.questionSnapshots;
    if (!sessionQuestions || sessionQuestions.length === 0) {
      const allQuestionsMap = new Map(state.questions.map(q => [q.id, q]));
      sessionQuestions = session.questionIds
        .map(id => allQuestionsMap.get(id))
        .filter((q): q is Question => q !== undefined);
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const answersList = sessionQuestions.map(q => {
      const selectedOption = session.answers[q.id];
      const isUnanswered = selectedOption === undefined || selectedOption === null;
      const isCorrect = !isUnanswered && selectedOption === q.correctOptionIndex;

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        selectedOptionIndex: isUnanswered ? null : selectedOption,
        isCorrect,
        timeSpentSeconds: 60,
        flaggedForReview: session.flaggedQuestionIds.includes(q.id)
      };
    });

    const totalQuestions = sessionQuestions.length;
    // Uniform scoring: (acertos / total_de_questões) * 100
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercentage >= examRule.passingScorePercentage;

    // Calculate discipline breakdown with exact base (correct / total)
    const subjectStats: Record<string, { total: number; correct: number; name: string }> = {};
    const topicStats: Record<string, { total: number; correct: number; subjectName: string }> = {};

    sessionQuestions.forEach((q, idx) => {
      const ans = answersList[idx];
      // Subject stats
      if (!subjectStats[q.subjectId]) {
        subjectStats[q.subjectId] = { total: 0, correct: 0, name: q.subjectName };
      }
      subjectStats[q.subjectId].total++;
      if (ans.isCorrect) subjectStats[q.subjectId].correct++;

      // Topic stats
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0, subjectName: q.subjectName };
      }
      topicStats[q.topic].total++;
      if (ans.isCorrect) topicStats[q.topic].correct++;
    });

    const disciplineScores: DisciplineResult[] = Object.entries(subjectStats).map(([sId, val]) => ({
      subjectId: sId,
      subjectName: val.name,
      totalQuestions: val.total,
      correctCount: val.correct,
      scorePercentage: Math.round((val.correct / val.total) * 100)
    }));

    const topicScores: TopicResult[] = Object.entries(topicStats).map(([topic, val]) => ({
      topic,
      subjectName: val.subjectName,
      total: val.total,
      correct: val.correct,
      scorePercentage: Math.round((val.correct / val.total) * 100)
    }));

    const durationSeconds = Math.min(
      session.totalDurationSeconds,
      Math.max(5, Math.floor((Date.now() - session.startedAtTimestamp) / 1000))
    );

    const attempt: Attempt = {
      id: session.id, // Stable unique ID matching the session
      sessionRefId: session.id,
      userId: state.user.id,
      examId: session.examId,
      mode: session.mode,
      targetSubjectId: session.targetSubjectId,
      ruleVersion: session.ruleVersion || examRule.ruleVersion,
      totalQuestions,
      durationMinutes: Math.round(session.totalDurationSeconds / 60),
      totalDurationSeconds: session.totalDurationSeconds,
      disciplineDistribution: session.disciplineDistribution,
      startedAt: new Date(session.startedAtTimestamp).toISOString(),
      finishedAt: new Date().toISOString(),
      durationSeconds,
      correctCount,
      wrongCount,
      unansweredCount,
      scorePercentage,
      passed,
      answers: answersList,
      disciplineScores,
      topicScores,
      questionOrder: session.questionIds,
      questionSnapshots: sessionQuestions
    };

    // Save and clear active session
    StorageService.saveCompletedAttempt(attempt);
    return attempt;
  }

  private static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
