import { AppStateData, ExamId, PointEvent, PointEventType } from '../types';
import { StorageService } from './storageService';

export const ENGAGEMENT_POINT_RULES: Record<PointEventType, number> = {
  CHECK_IN: 10,
  DAILY_CHALLENGE: 20,
  FULL_EXAM: 50,
  TARGETED_TRAINING: 20,
  ERROR_REVIEW: 15,
  ACHIEVEMENT_UNLOCKED: 0 // dynamically uses achievement.rewardPoints
};

export class EngagementService {
  /**
   * Awards engagement points deterministically.
   * If a point event with the same ID already exists, it is idempotent and rejected.
   */
  public static awardPoints(
    type: PointEventType,
    referenceId?: string,
    examId?: ExamId,
    customPoints?: number,
    descriptionOverride?: string
  ): { awarded: boolean; points: number; newTotal: number; eventId: string } {
    const state = StorageService.getState();
    const userId = state.user.id;
    const targetExamId = examId || state.user.selectedExamId || 'cpa';

    if (!state.pointEvents) {
      state.pointEvents = [];
    }

    // Build deterministic event ID
    const refKey = referenceId ? `-${referenceId}` : '';
    const eventId = `pts-${type.toLowerCase()}-${userId}-${targetExamId}${refKey}`;

    // Deduplication check
    const existing = state.pointEvents.find(e => e.id === eventId);
    if (existing) {
      return {
        awarded: false,
        points: 0,
        newTotal: state.user.engagementPoints,
        eventId
      };
    }

    const pointsToAward = customPoints !== undefined 
      ? customPoints 
      : (ENGAGEMENT_POINT_RULES[type] || 0);

    const defaultDescriptions: Record<PointEventType, string> = {
      CHECK_IN: 'Check-in diário de presença confirmado (+10 pts)',
      DAILY_CHALLENGE: 'Desafio do Dia concluído com sucesso (+20 pts)',
      FULL_EXAM: 'Simulado Completo finalizado (+50 pts)',
      TARGETED_TRAINING: 'Treino Direcionado por disciplina concluído (+20 pts)',
      ERROR_REVIEW: 'Modo Revisar Meus Erros concluído (+15 pts)',
      ACHIEVEMENT_UNLOCKED: `Conquista desbloqueada (+${pointsToAward} pts)`
    };

    const newEvent: PointEvent = {
      id: eventId,
      userId,
      examId: targetExamId,
      type,
      points: pointsToAward,
      description: descriptionOverride || defaultDescriptions[type] || `Pontos por ${type}`,
      createdAt: new Date().toISOString(),
      referenceId
    };

    state.pointEvents.push(newEvent);
    state.user.engagementPoints = (state.user.engagementPoints || 0) + pointsToAward;

    StorageService.saveState(state);

    return {
      awarded: true,
      points: pointsToAward,
      newTotal: state.user.engagementPoints,
      eventId
    };
  }

  /**
   * Returns list of points events for audit & history.
   */
  public static getPointEvents(limit: number = 20): PointEvent[] {
    const state = StorageService.getState();
    const events = state.pointEvents || [];
    return [...events].reverse().slice(0, limit);
  }

  /**
   * Recalculates total points based on events (safe consistency checker).
   */
  public static getAuditedTotalPoints(): number {
    const state = StorageService.getState();
    return state.user.engagementPoints || 0;
  }
}
