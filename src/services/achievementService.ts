import { Achievement, AppStateData, NotificationItem } from '../types';
import { StorageService } from './storageService';
import { EngagementService } from './engagementService';

export class AchievementService {
  /**
   * Evaluates all achievements and unlocks any whose conditions are met.
   * Completely idempotent: once unlocked (unlockedAt != null), it never re-unlocks or re-awards points.
   */
  public static checkAndUnlockAchievements(): {
    unlockedCount: number;
    newlyUnlocked: Achievement[];
  } {
    const state = StorageService.getState();
    const attempts = state.attempts || [];
    const fullExams = attempts.filter(a => a.mode === 'FULL_EXAM');
    const targetedTrainings = attempts.filter(a => a.mode === 'TARGETED_TRAINING');
    const totalQuestionsAnswered = attempts.reduce((acc, a) => acc + (a.totalQuestions || 0), 0);
    const consecutiveDays = state.user.consecutiveDays || 0;

    // Calculate score progression
    const firstFullExam = fullExams.length > 0 ? fullExams[0] : null;
    const lastFullExam = fullExams.length > 0 ? fullExams[fullExams.length - 1] : null;
    const evolutionScore = firstFullExam && lastFullExam 
      ? Math.max(0, lastFullExam.scorePercentage - firstFullExam.scorePercentage) 
      : 0;

    // Check passing score for selected exam (default 70)
    const selectedExamRule = state.examRules[state.user.selectedExamId || 'cpa'];
    const passingCriteria = selectedExamRule?.passingScorePercentage || 70;
    const hasMetPassingCriteria = fullExams.some(a => a.scorePercentage >= passingCriteria);

    const newlyUnlocked: Achievement[] = [];

    state.achievements.forEach(ach => {
      // 1. "Primeiro Passo" (Primeiro simulado completo)
      if (ach.id === 'ach-01') {
        ach.progress = Math.min(ach.maxProgress, fullExams.length);
        if (fullExams.length >= 1 && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }

      // 2. "Dedicação" (Volume de 100 questões respondidas)
      if (ach.id === 'ach-02') {
        ach.progress = Math.min(ach.maxProgress, totalQuestionsAnswered);
        if (totalQuestionsAnswered >= ach.maxProgress && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }

      // 3. "Foco Total" (Conclusão de 5 treinos direcionados)
      if (ach.id === 'ach-03') {
        ach.progress = Math.min(ach.maxProgress, targetedTrainings.length);
        if (targetedTrainings.length >= ach.maxProgress && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }

      // 4. "Constância" (7 dias consecutivos de estudo qualificável)
      if (ach.id === 'ach-04') {
        ach.progress = Math.min(ach.maxProgress, consecutiveDays);
        if (consecutiveDays >= 7 && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }

      // 5. "Superação" (Melhora de pelo menos 10 p.p. entre simulados comparáveis)
      if (ach.id === 'ach-05') {
        ach.progress = Math.min(ach.maxProgress, evolutionScore);
        if (evolutionScore >= 10 && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }

      // 6. "Meta Alcançada" (Resultado >= critério de referência configurado para o exame em simulado)
      if (ach.id === 'ach-06') {
        const bestScore = fullExams.length > 0 ? Math.max(...fullExams.map(a => a.scorePercentage)) : 0;
        ach.progress = Math.min(ach.maxProgress, bestScore);
        if (hasMetPassingCriteria && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }

      // 7. "Mestre da Regulação" (Aproveitamento > 85% em Sistema Financeiro)
      if (ach.id === 'ach-07') {
        let bestSfn = 0;
        attempts.forEach(att => {
          const sfn = att.disciplineScores?.find(d => d.subjectId === 'sfn');
          if (sfn && sfn.percentage > bestSfn) bestSfn = sfn.percentage;
        });
        ach.progress = Math.min(ach.maxProgress, bestSfn);
        if (bestSfn >= 85 && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }

      // 8. "Aprovação com Folga (80%+)"
      if (ach.id === 'ach-08') {
        const bestScore = fullExams.length > 0 ? Math.max(...fullExams.map(a => a.scorePercentage)) : 0;
        ach.progress = Math.min(ach.maxProgress, bestScore);
        if (bestScore >= 80 && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(ach);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(ach => {
        // Award points deterministically
        EngagementService.awardPoints(
          'ACHIEVEMENT_UNLOCKED',
          ach.id,
          state.user.selectedExamId || 'cpa',
          ach.rewardPoints,
          `Conquista desbloqueada: ${ach.title} (+${ach.rewardPoints} pts)`
        );

        // Add in-app notification
        const notif: NotificationItem = {
          id: `notif-ach-${ach.id}-${Date.now()}`,
          title: 'Nova Conquista Desbloqueada!',
          message: `Parabéns! Você alcançou o marco "${ach.title}". +${ach.rewardPoints} pontos de engajamento adicionados ao seu perfil.`,
          date: 'Agora mesmo',
          read: false,
          category: 'conquista',
          actionPath: 'conquistas'
        };
        state.notifications.unshift(notif);
      });

      StorageService.saveState(state);
    }

    return {
      unlockedCount: newlyUnlocked.length,
      newlyUnlocked
    };
  }
}
