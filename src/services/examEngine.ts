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
import { AccessControlService } from './accessControlService';

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
    overrideExamId?: ExamId | string
  ): ActiveExamSession {
    const state = StorageService.getState();
    const examId = (overrideExamId || state.user?.selectedExamId) as ExamId;

    // 1. Identify selected exam & consult specific configuration - NO FALLBACK TO CPA!
    if (!examId || !state.examRules || !state.examRules[examId]) {
      throw new Error('Não foi possível iniciar a prova. As configurações deste exame não estão disponíveis.');
    }

    const examRule = state.examRules[examId];

    // 2. Check if exam is active (supports both active and isActive)
    const isExamActive = (examRule.isActive ?? examRule.active ?? false);
    if (!isExamActive) {
      throw new Error('Este exame ainda não está disponível para realização de simulados.');
    }

    // 2.1 Check if an active session already exists for the user
    if (state.activeSession && !state.activeSession.completed) {
      if (state.activeSession.examId === examId && state.activeSession.mode === mode) {
        if (mode !== 'TARGETED_TRAINING' || state.activeSession.targetSubjectId === targetSubjectId) {
          // Permit resumption of in-progress session, do not duplicate or consume extra free attempts
          return state.activeSession;
        }
      }
      throw new Error('Já existe um simulado ou treino em andamento. Conclua ou descarte a tentativa atual antes de iniciar uma nova.');
    }

    let selectedQuestions: Question[] = [];
    let disciplineDistribution: Record<string, number> = {};
    let durationMinutes = examRule.durationMinutes;

    if (mode === 'FULL_EXAM') {
      // 3. Commercial access validation per exam
      const accessCheck = AccessControlService.canStartSimulation(examId);
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.reason || `Limite de simulados atingido para o exame ${examRule.shortName}. Assine o Plano Pro para simulados ilimitados.`);
      }

      if (!Number.isInteger(examRule.totalQuestions) || examRule.totalQuestions <= 0) {
        throw new Error('Configuração inválida: quantidade total de questões do exame deve ser um número inteiro positivo.');
      }
      if (!Number.isInteger(examRule.durationMinutes) || examRule.durationMinutes <= 0) {
        throw new Error('Configuração inválida: duração do exame deve ser um número inteiro positivo.');
      }

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
      // Commercial access check
      const accessCheck = AccessControlService.canAccessFeature(examId, 'TARGETED_TRAINING');
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.reason || `Treinos direcionados são exclusivos para assinantes do Plano Pro do exame ${examRule.shortName}.`);
      }

      // 5.1 Disciplina obrigatória: cannot be empty or fallback to 'mat_fin'
      if (!targetSubjectId || typeof targetSubjectId !== 'string' || targetSubjectId.trim() === '') {
        throw new Error('É obrigatório informar a disciplina para iniciar o Treino Direcionado.');
      }
      const subjectId = targetSubjectId.trim();

      // Validate discipline exists in system
      const subject = state.subjects.find(s => s.id === subjectId);
      if (!subject) {
        throw new Error(`Disciplina "${subjectId}" não encontrada no sistema.`);
      }

      // Validate discipline belongs to and is enabled for this specific exam
      if (!examRule.enabledDisciplines || !examRule.enabledDisciplines.includes(subjectId)) {
        throw new Error(`A disciplina "${subject.name}" não pertence ou não está habilitada para o exame "${examRule.name}".`);
      }
      const subjectName = subject.name;

      const trainingSettings = examRule.trainingSettings?.targetedTraining;
      if (!trainingSettings || !trainingSettings.enabled) {
        throw new Error(`A modalidade de Treino Direcionado não está habilitada para o exame "${examRule.name}".`);
      }

      const targetCount = trainingSettings.questionCount;
      const trainingDuration = trainingSettings.durationMinutes;

      // Safe operational limits validation
      if (!Number.isInteger(targetCount) || targetCount <= 0 || targetCount > 200) {
        throw new Error('Configuração inválida: quantidade de questões do treino deve ser um inteiro positivo entre 1 e 200.');
      }
      if (!Number.isInteger(trainingDuration) || trainingDuration <= 0 || trainingDuration > 480) {
        throw new Error('Configuração inválida: duração do treino deve ser um inteiro positivo entre 1 e 480 minutos.');
      }

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
      durationMinutes = trainingDuration;

    } else if (mode === 'ERROR_REVIEW') {
      // Commercial access check
      const accessCheck = AccessControlService.canAccessFeature(examId, 'ERROR_REVIEW');
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.reason || `A Revisão de Erros é exclusiva para assinantes do Plano Pro do exame ${examRule.shortName}.`);
      }

      const reviewSettings = examRule.trainingSettings?.errorReview;
      if (!reviewSettings || !reviewSettings.enabled) {
        throw new Error(`A modalidade de Revisão de Erros não está habilitada para o exame "${examRule.name}".`);
      }

      const maxQuestions = reviewSettings.maxQuestions;
      const minutesPerQuestion = reviewSettings.minutesPerQuestion;
      const maxDuration = reviewSettings.maxDurationMinutes || 60;

      if (!Number.isInteger(maxQuestions) || maxQuestions <= 0 || maxQuestions > 200) {
        throw new Error('Configuração inválida: quantidade máxima de questões para revisão de erros deve ser entre 1 e 200.');
      }
      if (!Number.isInteger(minutesPerQuestion) || minutesPerQuestion <= 0 || minutesPerQuestion > 60) {
        throw new Error('Configuração inválida: minutos por questão para revisão de erros deve ser entre 1 e 60.');
      }

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

      // Select up to maxQuestions failed questions
      selectedQuestions = this.shuffle(eligibleFailed).slice(0, maxQuestions);
      // Configurable max duration
      durationMinutes = Math.min(maxDuration, selectedQuestions.length * minutesPerQuestion);

    } else if (mode === 'DAILY_CHALLENGE') {
      const challengeSettings = examRule.trainingSettings?.dailyChallenge;
      if (!challengeSettings || !challengeSettings.enabled) {
        throw new Error(`O Desafio Diário não está habilitado para o exame "${examRule.name}".`);
      }

      const questionCount = challengeSettings.questionCount;
      const challengeDuration = challengeSettings.durationMinutes;

      if (!Number.isInteger(questionCount) || questionCount <= 0 || questionCount > 50) {
        throw new Error('Configuração inválida: quantidade de questões do desafio diário deve ser entre 1 e 50.');
      }
      if (!Number.isInteger(challengeDuration) || challengeDuration <= 0 || challengeDuration > 120) {
        throw new Error('Configuração inválida: duração do desafio diário deve ser entre 1 e 120 minutos.');
      }

      const eligible = state.questions.filter(q => 
        q.examId === examId &&
        q.status === 'approved'
      );
      if (eligible.length < questionCount) {
        throw new Error(`Questões insuficientes no banco para o desafio diário do exame "${examRule.name}".`);
      }
      selectedQuestions = this.shuffle(eligible).slice(0, questionCount);
      durationMinutes = challengeDuration;
    }

    // Stable unique session ID established once at start
    const stableSessionId = `session_${examId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Take immutable snapshot of the questions and rules at creation time
    const snapshots: Question[] = JSON.parse(JSON.stringify(selectedQuestions));
    const ruleSnapshot: ExamRule = JSON.parse(JSON.stringify(examRule));

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
      ruleSnapshot,
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
    // Prioritize preserved ruleSnapshot from session creation - NO FALLBACK TO CPA!
    const examRule = session.ruleSnapshot || (state.examRules ? state.examRules[session.examId] : undefined);
    if (!examRule) {
      throw new Error(`Não foi possível finalizar a prova. As configurações do exame "${session.examId}" não estão disponíveis.`);
    }

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
      questionSnapshots: sessionQuestions,
      ruleSnapshot: session.ruleSnapshot || JSON.parse(JSON.stringify(examRule))
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
