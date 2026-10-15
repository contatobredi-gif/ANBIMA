import { Question, Attempt, AttemptMode, ActiveExamSession, DisciplineResult, TopicResult } from '../types';
import { StorageService } from './storageService';

export class ExamEngine {
  /**
   * Starts a new exam session or targeted training session
   */
  public static startSession(mode: AttemptMode, targetSubjectId?: string): ActiveExamSession {
    const state = StorageService.getState();
    const examRule = state.examRules[state.user.selectedExamId] || state.examRules['cpa'];

    let eligibleQuestions: Question[] = [];

    if (mode === 'FULL_EXAM') {
      // Pick questions proportional to subjects or all CPA questions up to rule.totalQuestions
      eligibleQuestions = this.shuffle([...state.questions.filter(q => q.examId === state.user.selectedExamId)]);
      if (eligibleQuestions.length > examRule.totalQuestions) {
        eligibleQuestions = eligibleQuestions.slice(0, examRule.totalQuestions);
      }
    } else if (mode === 'TARGETED_TRAINING') {
      // Pick questions for the specific subject
      const subjectId = targetSubjectId || 'mat_fin';
      const subjectPool = state.questions.filter(q => q.subjectId === subjectId);
      eligibleQuestions = this.shuffle([...subjectPool]).slice(0, 20); // 20 questions for targeted training
    } else if (mode === 'ERROR_REVIEW') {
      // Pick questions that were answered incorrectly in previous attempts
      const failedQuestionIds = new Set<string>();
      state.attempts.forEach(att => {
        att.answers.forEach(ans => {
          if (!ans.isCorrect && ans.selectedOptionIndex !== null) {
            failedQuestionIds.add(ans.questionId);
          }
        });
      });

      if (failedQuestionIds.size > 0) {
        eligibleQuestions = state.questions.filter(q => failedQuestionIds.has(q.id));
      } else {
        // Fallback: pick challenging or difficult questions if no recorded errors
        eligibleQuestions = state.questions.filter(q => q.difficulty === 'Difícil' || q.subjectId === 'mat_fin');
      }
      eligibleQuestions = this.shuffle(eligibleQuestions).slice(0, 15);
    } else if (mode === 'DAILY_CHALLENGE') {
      // 5 varied questions
      eligibleQuestions = this.shuffle([...state.questions]).slice(0, 5);
    }

    const durationMinutes = mode === 'FULL_EXAM' 
      ? examRule.durationMinutes 
      : mode === 'TARGETED_TRAINING' ? 60 : 15;

    const newSession: ActiveExamSession = {
      id: `session-${Date.now()}`,
      examId: state.user.selectedExamId,
      mode,
      targetSubjectId,
      startedAtTimestamp: Date.now(),
      totalDurationSeconds: durationMinutes * 60,
      questionIds: eligibleQuestions.map(q => q.id),
      currentIndex: 0,
      answers: {},
      flaggedQuestionIds: []
    };

    StorageService.saveActiveSession(newSession);
    return newSession;
  }

  /**
   * Calculate remaining time in seconds based on epoch timestamp
   */
  public static getRemainingSeconds(session: ActiveExamSession): number {
    const elapsedSeconds = Math.floor((Date.now() - session.startedAtTimestamp) / 1000);
    const remaining = session.totalDurationSeconds - elapsedSeconds;
    return Math.max(0, remaining);
  }

  /**
   * Finalize and score an active session
   */
  public static finalizeSession(session: ActiveExamSession): Attempt {
    const state = StorageService.getState();
    const allQuestionsMap = new Map(state.questions.map(q => [q.id, q]));
    const examRule = state.examRules[session.examId] || state.examRules['cpa'];

    const sessionQuestions: Question[] = session.questionIds
      .map(id => allQuestionsMap.get(id))
      .filter((q): q is Question => q !== undefined);

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
        timeSpentSeconds: 60, // Average estimate per question
        flaggedForReview: session.flaggedQuestionIds.includes(q.id)
      };
    });

    const totalQuestions = sessionQuestions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercentage >= examRule.passingScorePercentage;

    // Calculate discipline breakdown
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
      Math.floor((Date.now() - session.startedAtTimestamp) / 1000)
    );

    const attempt: Attempt = {
      id: `att-${Date.now()}`,
      userId: state.user.id,
      examId: session.examId,
      mode: session.mode,
      targetSubjectId: session.targetSubjectId,
      startedAt: new Date(session.startedAtTimestamp).toISOString(),
      finishedAt: new Date().toISOString(),
      durationSeconds: Math.max(durationSeconds, 10),
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      scorePercentage,
      passed,
      answers: answersList,
      disciplineScores,
      topicScores,
      questionSnapshots: sessionQuestions
    };

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
