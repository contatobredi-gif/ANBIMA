import { ActiveDailyChallenge, ExamId, Question } from '../types';
import { StorageService } from './storageService';
import { DailyActivityService } from './dailyActivityService';
import { EngagementService } from './engagementService';
import { AchievementService } from './achievementService';

export class DailyChallengeService {
  /**
   * Deterministically generates or loads today's daily challenge for the specified exam.
   * Ensures the exact same 5 questions are served across refreshes on the same local day.
   */
  public static getOrCreateDailyChallenge(targetExamId?: ExamId): ActiveDailyChallenge {
    const state = StorageService.getState();
    const examId = targetExamId || state.user.selectedExamId || 'cpa';
    const today = DailyActivityService.getTodayLocalDateString();
    const challengeId = `challenge-${examId}-${today}`;

    // If an active or completed challenge already exists for today & this exam, return it
    if (state.activeDailyChallenge && state.activeDailyChallenge.id === challengeId) {
      return state.activeDailyChallenge;
    }

    // Verify exam rules and duration
    const examRule = state.examRules[examId];
    const durationMinutes = examRule?.trainingSettings?.dailyChallenge?.durationMinutes || 15;
    const durationSeconds = durationMinutes * 60;

    // Filter questions: approved and belonging to this exam
    const eligibleQuestions = (state.questions || []).filter(
      q => q.status === 'approved' && q.examId === examId
    );

    if (eligibleQuestions.length === 0) {
      // Fallback: any approved questions
      eligibleQuestions.push(...(state.questions || []).filter(q => q.status === 'approved'));
    }

    // Deterministic pseudo-random seed based on date string and examId
    let seed = 0;
    const seedString = `${challengeId}-${today}`;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed * 31 + seedString.charCodeAt(i)) % 2147483647;
    }

    // Deterministic selection of 5 questions
    const selected: Question[] = [];
    const pool = [...eligibleQuestions];
    const countToPick = Math.min(5, pool.length);

    for (let i = 0; i < countToPick; i++) {
      seed = (seed * 16807) % 2147483647;
      const index = Math.abs(seed) % pool.length;
      selected.push(pool[index]);
      pool.splice(index, 1);
    }

    // Check if user already completed the challenge in dailyActivities
    const todayActivity = state.dailyActivities?.[today];
    const alreadyCompleted = Boolean(todayActivity?.challengeCompleted);

    const newChallenge: ActiveDailyChallenge = {
      id: challengeId,
      examId,
      date: today,
      questionIds: selected.map(q => q.id),
      questionSnapshots: selected,
      startedAtTimestamp: Date.now(),
      durationSeconds,
      currentIndex: 0,
      answers: {},
      completed: alreadyCompleted,
      score: alreadyCompleted ? todayActivity?.challengeScore : undefined,
      completedAt: alreadyCompleted ? todayActivity?.challengeCompletedAt : undefined
    };

    state.activeDailyChallenge = newChallenge;
    StorageService.saveState(state);

    return newChallenge;
  }

  /**
   * Updates an answer in the active daily challenge.
   */
  public static updateAnswer(questionIndex: number, selectedOptionIndex: number): void {
    const state = StorageService.getState();
    if (state.activeDailyChallenge && !state.activeDailyChallenge.completed) {
      state.activeDailyChallenge.answers[questionIndex] = selectedOptionIndex;
      StorageService.saveState(state);
    }
  }

  /**
   * Submits the daily challenge.
   * Completely idempotent: awards points and updates records exactly once.
   */
  public static submitChallenge(): {
    score: number;
    total: number;
    pointsAwarded: number;
    alreadyCompleted: boolean;
  } {
    const state = StorageService.getState();
    const challenge = state.activeDailyChallenge;
    const today = DailyActivityService.getTodayLocalDateString();

    if (!challenge) {
      throw new Error('Nenhum desafio diário ativo no momento.');
    }

    // Calculate score
    let correct = 0;
    challenge.questionSnapshots.forEach((q, idx) => {
      if (challenge.answers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });

    if (challenge.completed) {
      return {
        score: challenge.score ?? correct,
        total: challenge.questionSnapshots.length,
        pointsAwarded: 0,
        alreadyCompleted: true
      };
    }

    // Mark challenge as completed
    challenge.completed = true;
    challenge.score = correct;
    challenge.completedAt = new Date().toISOString();

    // Update daily activity
    if (!state.dailyActivities) state.dailyActivities = {};
    const act = state.dailyActivities[today] || {
      date: today,
      checkedIn: true,
      challengeCompleted: false,
      simulationsCompleted: 0,
      questionsAnswered: 0,
      examId: challenge.examId
    };

    act.challengeCompleted = true;
    act.challengeCompletedAt = challenge.completedAt;
    act.challengeScore = correct;
    act.questionsAnswered += challenge.questionSnapshots.length;
    act.checkedIn = true;
    state.dailyActivities[today] = act;

    // Award 20 points via EngagementService (idempotent for this exam & date)
    const pointResult = EngagementService.awardPoints(
      'DAILY_CHALLENGE',
      `${challenge.examId}-${today}`,
      challenge.examId,
      20,
      `Desafio do Dia (${today}) concluído (+20 pts)`
    );

    // Recalculate streak
    const streakInfo = DailyActivityService.calculateStreak(state.dailyActivities, today);
    state.user.consecutiveDays = streakInfo.currentStreak;
    if ((state.user.bestStreakDays || 0) < streakInfo.bestStreak) {
      state.user.bestStreakDays = streakInfo.bestStreak;
    }

    StorageService.saveState(state);

    // Evaluate achievements
    AchievementService.checkAndUnlockAchievements();

    return {
      score: correct,
      total: challenge.questionSnapshots.length,
      pointsAwarded: pointResult.points,
      alreadyCompleted: false
    };
  }

  /**
   * Checks if today's challenge was already completed.
   */
  public static isCompletedToday(examId?: ExamId): boolean {
    const state = StorageService.getState();
    const today = DailyActivityService.getTodayLocalDateString();
    return Boolean(state.dailyActivities?.[today]?.challengeCompleted);
  }
}
