import { ExamId, RankingParticipant } from '../types';
import { StorageService } from './storageService';

export class RankingService {
  /**
   * Returns filtered, sorted rankings for the requested exam and period.
   * Strictly isolates CPA and OAB.
   */
  public static getRankings(
    period: 'weekly' | 'monthly' | 'overall',
    targetExamId?: ExamId | string
  ): {
    participants: RankingParticipant[];
    currentUserRank: number;
    rulesDescription: string;
    isDemoNotice: string;
  } {
    const state = StorageService.getState();
    const examId = targetExamId || state.user.selectedExamId || 'cpa';
    const examRule = state.examRules[examId];
    const examLabel = examRule?.shortName || examId.toUpperCase();

    // Raw rankings list from state
    let baseList = state.rankings ? [...state.rankings] : [];

    // Filter strictly by requested exam
    // Note: Participants with matching exam string (e.g. 'CPA' vs 'OAB')
    baseList = baseList.filter(p => {
      const pExam = (p.exam || '').toLowerCase();
      return pExam === examId.toLowerCase();
    });

    // Calculate real user statistics
    const userAttempts = (state.attempts || []).filter(
      a => a.examId === examId && a.mode === 'FULL_EXAM'
    );
    const avgScore = userAttempts.length > 0
      ? Math.round(
          userAttempts.reduce((acc, a) => acc + a.scorePercentage, 0) / userAttempts.length * 10
        ) / 10
      : 0;

    const streakDays = state.user.consecutiveDays || 0;
    const currentPoints = state.user.engagementPoints || 0;

    // Check if current user is already in the list
    const userIndex = baseList.findIndex(p => p.isCurrentUser || p.id === state.user.id);
    const userDisplayName = state.user.publicDisplayName || state.user.name || 'Rafael Martins';

    const currentUserEntry: RankingParticipant = {
      id: state.user.id,
      name: userDisplayName,
      avatar: state.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      isCurrentUser: true,
      exam: examLabel,
      averageScore: avgScore,
      completedSimulations: userAttempts.length,
      engagementPoints: currentPoints,
      weeklyPoints: Math.round(currentPoints * 0.22),
      monthlyPoints: Math.round(currentPoints * 0.70),
      rankWeekly: 1,
      rankMonthly: 1,
      rankOverall: 1,
      streakDays
    };

    if (userIndex >= 0) {
      baseList[userIndex] = currentUserEntry;
    } else {
      baseList.push(currentUserEntry);
    }

    // Sort by requested period points
    baseList.sort((a, b) => {
      if (period === 'weekly') {
        return (b.weeklyPoints || 0) - (a.weeklyPoints || 0);
      }
      if (period === 'monthly') {
        return (b.monthlyPoints || 0) - (a.monthlyPoints || 0);
      }
      return (b.engagementPoints || 0) - (a.engagementPoints || 0);
    });

    // Re-index ranks
    baseList.forEach((p, idx) => {
      if (period === 'weekly') p.rankWeekly = idx + 1;
      else if (period === 'monthly') p.rankMonthly = idx + 1;
      else p.rankOverall = idx + 1;
    });

    const userRank = baseList.findIndex(p => p.isCurrentUser) + 1;

    return {
      participants: baseList,
      currentUserRank: userRank > 0 ? userRank : 1,
      rulesDescription: 'Classificação calculada com base na constância de estudos (check-in, desafios diários e simulados concluídos). A pontuação de engajamento incentiva o aprendizado diário e é independente da nota acadêmica.',
      isDemoNotice: 'Os dados dos demais participantes são simulados para validação pedagógica do protótipo e não representam alunos reais.'
    };
  }

  /**
   * Updates user opt-in status or public display name in rankings.
   */
  public static updateRankingSettings(optIn: boolean, displayName?: string): void {
    const state = StorageService.getState();
    state.user.publicRankingOptIn = optIn;
    if (displayName) {
      state.user.publicDisplayName = displayName;
    }
    StorageService.saveState(state);
  }
}
