import { DailyActivity, ExamId } from '../types';
import { StorageService } from './storageService';
import { EngagementService } from './engagementService';
import { AchievementService } from './achievementService';

export interface StreakCalculationResult {
  currentStreak: number;
  bestStreak: number;
  studiedDaysCount: number;
  hasActivityToday: boolean;
  hasCheckedInToday: boolean;
}

export class DailyActivityService {
  /**
   * Returns current local date as 'YYYY-MM-DD' using client's local timezone.
   */
  public static getTodayLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Returns date string for yesterday in local timezone.
   */
  public static getYesterdayLocalDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Checks whether a specific day's activity record is qualifying for streak counting.
   * A qualifying day requires either:
   * 1. Check-in + at least some study activity (simulations > 0, questions > 0, or challenge)
   * 2. Completed challenge
   * 3. Completed full exam or targeted training (questionsAnswered >= 5)
   */
  public static isQualifyingActivity(act?: DailyActivity): boolean {
    if (!act) return false;
    if (act.challengeCompleted) return true;
    if (act.simulationsCompleted > 0) return true;
    if (act.questionsAnswered >= 5) return true;
    if (act.checkedIn && act.questionsAnswered > 0) return true;
    // Simple check-in without any study is also given credit if explicitly confirmed by user
    if (act.checkedIn) return true;
    return false;
  }

  /**
   * Pure calculation of consecutive study streak from daily activities map.
   */
  public static calculateStreak(
    activities: Record<string, DailyActivity>,
    referenceDateStr?: string
  ): StreakCalculationResult {
    const todayStr = referenceDateStr || this.getTodayLocalDateString();
    const todayActivity = activities[todayStr];
    const hasActivityToday = this.isQualifyingActivity(todayActivity);
    const hasCheckedInToday = Boolean(todayActivity?.checkedIn);

    // Collect all qualifying dates
    const qualifyingDates = new Set<string>();
    let studiedDaysCount = 0;

    Object.keys(activities).forEach(dateStr => {
      if (this.isQualifyingActivity(activities[dateStr])) {
        qualifyingDates.add(dateStr);
        studiedDaysCount++;
      }
    });

    // Helper to format date offset
    const getDateOffset = (baseStr: string, offsetDays: number): string => {
      const parts = baseStr.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() + offsetDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // Calculate current consecutive streak backwards
    let currentStreak = 0;
    if (hasActivityToday) {
      currentStreak = 1;
      let offset = -1;
      while (qualifyingDates.has(getDateOffset(todayStr, offset))) {
        currentStreak++;
        offset--;
      }
    } else {
      // If no activity today yet, check if yesterday had activity (streak is preserved pending today's action)
      const yesterdayStr = getDateOffset(todayStr, -1);
      if (qualifyingDates.has(yesterdayStr)) {
        currentStreak = 1;
        let offset = -2;
        while (qualifyingDates.has(getDateOffset(todayStr, offset))) {
          currentStreak++;
          offset--;
        }
      } else {
        // Gap of more than 1 day: streak reset to 0
        currentStreak = 0;
      }
    }

    // Calculate best historical streak
    const sortedDates = Array.from(qualifyingDates).sort();
    let bestStreak = currentStreak;
    let tempStreak = 0;
    let prevDate: string | null = null;

    for (const dStr of sortedDates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const expectedNext = getDateOffset(prevDate, 1);
        if (dStr === expectedNext) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      prevDate = dStr;
    }

    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      studiedDaysCount,
      hasActivityToday,
      hasCheckedInToday
    };
  }

  /**
   * Performs daily check-in with duplicate protection, local date handling and points award.
   */
  public static performDailyCheckIn(examIdOverride?: ExamId): {
    success: boolean;
    message: string;
    pointsGained: number;
    currentStreak: number;
  } {
    const state = StorageService.getState();
    const today = this.getTodayLocalDateString();
    const examId = examIdOverride || state.user.selectedExamId || 'cpa';

    if (!state.dailyActivities) {
      state.dailyActivities = {};
    }

    const currentActivity = state.dailyActivities[today];
    if (currentActivity && currentActivity.checkedIn) {
      const streakInfo = this.calculateStreak(state.dailyActivities, today);
      return {
        success: false,
        message: 'Você já realizou o check-in de hoje!',
        pointsGained: 0,
        currentStreak: streakInfo.currentStreak
      };
    }

    // Register check-in
    const updatedActivity: DailyActivity = {
      date: today,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      challengeCompleted: currentActivity ? currentActivity.challengeCompleted : false,
      challengeCompletedAt: currentActivity ? currentActivity.challengeCompletedAt : undefined,
      challengeScore: currentActivity ? currentActivity.challengeScore : undefined,
      simulationsCompleted: currentActivity ? currentActivity.simulationsCompleted : 0,
      questionsAnswered: currentActivity ? currentActivity.questionsAnswered : 0,
      examId
    };

    state.dailyActivities[today] = updatedActivity;
    state.user.lastActiveDate = today;

    // Award 10 points via EngagementService
    const pointResult = EngagementService.awardPoints(
      'CHECK_IN',
      today,
      examId,
      10,
      `Check-in de presença em ${today} (+10 pts)`
    );

    // Recalculate streak
    const streakInfo = this.calculateStreak(state.dailyActivities, today);
    state.user.consecutiveDays = streakInfo.currentStreak;
    if ((state.user.bestStreakDays || 0) < streakInfo.bestStreak) {
      state.user.bestStreakDays = streakInfo.bestStreak;
    }

    StorageService.saveState(state);

    // Evaluate achievements (e.g. Constância 7 days)
    AchievementService.checkAndUnlockAchievements();

    return {
      success: true,
      message: `Presença confirmada! +${pointResult.points} pontos acumulados.`,
      pointsGained: pointResult.points,
      currentStreak: streakInfo.currentStreak
    };
  }

  /**
   * Registers study activity (e.g. completed questions) for today's local date.
   */
  public static recordStudyActivity(
    questionsCount: number,
    isFullSimulation: boolean,
    examId?: ExamId
  ): void {
    const state = StorageService.getState();
    const today = this.getTodayLocalDateString();
    if (!state.dailyActivities) state.dailyActivities = {};

    const act = state.dailyActivities[today] || {
      date: today,
      checkedIn: false,
      challengeCompleted: false,
      simulationsCompleted: 0,
      questionsAnswered: 0,
      examId: examId || state.user.selectedExamId || 'cpa'
    };

    act.questionsAnswered += questionsCount;
    if (isFullSimulation) {
      act.simulationsCompleted += 1;
    }
    state.dailyActivities[today] = act;

    // Recalculate streak with newly recorded activity
    const streakInfo = this.calculateStreak(state.dailyActivities, today);
    state.user.consecutiveDays = streakInfo.currentStreak;
    if ((state.user.bestStreakDays || 0) < streakInfo.bestStreak) {
      state.user.bestStreakDays = streakInfo.bestStreak;
    }

    StorageService.saveState(state);
  }
}
