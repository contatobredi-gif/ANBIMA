import { ExamId, ExamPlan, ExamSubscription, PlanType, SubscriptionStatus } from '../types';
import { StorageService } from './storageService';
import { INITIAL_EXAM_PLANS } from '../data/initialData';

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  remainingFree?: number;
}

export type ProFeature = 
  | 'FULL_EXAM' 
  | 'TARGETED_TRAINING' 
  | 'ERROR_REVIEW' 
  | 'ANALYTICS_COMPARISON' 
  | 'SHAREABLE_CARDS';

export class AccessControlService {
  /**
   * Retrieves all plans registered for a specific exam.
   */
  public static getPlansForExam(examId: ExamId | string): ExamPlan[] {
    const state = StorageService.getState();
    const plans = state.examPlans || INITIAL_EXAM_PLANS;
    return plans.filter(p => p.examId === examId);
  }

  /**
   * Retrieves a specific plan by its unique ID.
   */
  public static getPlanById(planId: string): ExamPlan | null {
    const state = StorageService.getState();
    const plans = state.examPlans || INITIAL_EXAM_PLANS;
    return plans.find(p => p.id === planId) || null;
  }

  /**
   * Retrieves the current user subscription for an exam.
   */
  public static getSubscription(examId: ExamId | string): ExamSubscription | null {
    const state = StorageService.getState();
    if (!state.subscriptions) return null;
    return state.subscriptions[examId] || null;
  }

  /**
   * Checks if the user has an active Pro entitlement for a specific exam.
   * Considers subscription status, expiration, and independent exam scope.
   */
  public static isPro(examId: ExamId | string): boolean {
    const sub = this.getSubscription(examId);
    if (!sub) return false;

    // Check status
    const validStatuses: SubscriptionStatus[] = ['active', 'trialing'];
    if (!validStatuses.includes(sub.status)) return false;

    // Check expiration if set
    if (sub.expiresAt) {
      const expires = new Date(sub.expiresAt).getTime();
      const now = Date.now();
      if (now > expires) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns 'Pro' or 'Free' for the specified exam.
   */
  public static getPlanType(examId: ExamId | string): PlanType {
    return this.isPro(examId) ? 'Pro' : 'Free';
  }

  /**
   * Returns how many free simulations are remaining for a specific exam.
   */
  public static getRemainingFreeSimulations(examId: ExamId | string): number {
    if (this.isPro(examId)) {
      return Infinity;
    }
    const state = StorageService.getState();
    const examRule = state.examRules[examId];
    const maxFree = examRule?.maxFreeSimulations ?? 1;

    const usedFree = state.attempts.filter(
      a => a.examId === examId && a.mode === 'FULL_EXAM'
    ).length;

    return Math.max(0, maxFree - usedFree);
  }

  /**
   * Validates if the user is allowed to start a full exam simulation for the given exam.
   */
  public static canStartSimulation(examId: ExamId | string): AccessCheckResult {
    if (this.isPro(examId)) {
      return { allowed: true };
    }

    const state = StorageService.getState();
    const examRule = state.examRules[examId];
    const maxFree = examRule?.maxFreeSimulations ?? 1;

    const fullExamCount = state.attempts.filter(
      a => a.examId === examId && a.mode === 'FULL_EXAM'
    ).length;

    const remaining = Math.max(0, maxFree - fullExamCount);

    if (remaining > 0) {
      return { allowed: true, remainingFree: remaining };
    }

    const examName = examRule?.shortName || examId.toUpperCase();
    return {
      allowed: false,
      remainingFree: 0,
      reason: `Você atingiu o limite de ${maxFree} simulado(s) gratuito(s) para o exame ${examName}. Assine o Plano Pro deste exame para simulados ilimitados.`
    };
  }

  /**
   * Validates access to specific features per exam.
   */
  public static canAccessFeature(examId: ExamId | string, feature: ProFeature): AccessCheckResult {
    const isPro = this.isPro(examId);
    const state = StorageService.getState();
    const examRule = state.examRules[examId];
    const examName = examRule?.shortName || examId.toUpperCase();

    if (feature === 'FULL_EXAM') {
      return this.canStartSimulation(examId);
    }

    if (isPro) {
      return { allowed: true };
    }

    switch (feature) {
      case 'TARGETED_TRAINING':
        return {
          allowed: false,
          reason: `Treinos direcionados por disciplina são exclusivos para assinantes Pro do exame ${examName}.`
        };
      case 'ERROR_REVIEW':
        return {
          allowed: false,
          reason: `O Modo Inteligente de Revisão de Erros é exclusivo para assinantes Pro do exame ${examName}.`
        };
      case 'ANALYTICS_COMPARISON':
        return {
          allowed: false,
          reason: `A comparação detalhada de tentativas e matriz de evolução histórica é exclusiva do Plano Pro do exame ${examName}.`
        };
      case 'SHAREABLE_CARDS':
        return {
          allowed: false,
          reason: `A emissão de cards de aprovação e diagnósticos compartilháveis é exclusiva para alunos Pro do exame ${examName}.`
        };
      default:
        return { allowed: isPro };
    }
  }

  /**
   * Subscribes the user to the Pro plan for a specific exam.
   * Canceling or altering one exam never alters subscriptions of other exams.
   */
  public static subscribeToExam(examId: ExamId, planId?: string): ExamSubscription {
    const state = StorageService.getState();
    if (!state.subscriptions) {
      state.subscriptions = {};
    }

    const proPlan = planId 
      ? this.getPlanById(planId) 
      : this.getPlansForExam(examId).find(p => p.type === 'Pro') || {
          id: `plan-${examId}-pro`,
          examId,
          name: `${examId.toUpperCase()} Pro`,
          type: 'Pro' as PlanType,
          priceCents: 4990,
          currency: 'BRL' as const,
          billingCycle: 'monthly' as const,
          isActive: true
        };

    const now = new Date();
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1); // 1 month validity

    const newSub: ExamSubscription = {
      id: `sub-${state.user.id}-${examId}-${Date.now()}`,
      userId: state.user.id,
      examId,
      planId: proPlan.id,
      status: 'active',
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      canceledAt: null,
      autoRenew: true,
      isDemo: true
    };

    state.subscriptions[examId] = newSub;

    // Sync user.plan for backward compatibility with selected exam
    if (state.user.selectedExamId === examId) {
      state.user.plan = 'Pro';
    }

    StorageService.saveState(state);
    return newSub;
  }

  /**
   * Cancels subscription for a specific exam.
   * Retains attempt history and doesn't affect other exam subscriptions.
   */
  public static cancelSubscription(examId: ExamId): ExamSubscription | null {
    const state = StorageService.getState();
    if (!state.subscriptions || !state.subscriptions[examId]) {
      return null;
    }

    const sub = state.subscriptions[examId];
    sub.status = 'canceled';
    sub.canceledAt = new Date().toISOString();
    sub.autoRenew = false;

    // Sync user.plan for backward compatibility with selected exam
    if (state.user.selectedExamId === examId) {
      state.user.plan = 'Free';
    }

    StorageService.saveState(state);
    return sub;
  }

  /**
   * Reactivates a canceled subscription for an exam.
   */
  public static reactivateSubscription(examId: ExamId): ExamSubscription {
    const state = StorageService.getState();
    if (!state.subscriptions || !state.subscriptions[examId]) {
      return this.subscribeToExam(examId);
    }

    const sub = state.subscriptions[examId];
    sub.status = 'active';
    sub.canceledAt = null;
    sub.autoRenew = true;
    
    // Refresh expiration to 1 month from now
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    sub.expiresAt = expires.toISOString();

    if (state.user.selectedExamId === examId) {
      state.user.plan = 'Pro';
    }

    StorageService.saveState(state);
    return sub;
  }

  /**
   * Quick toggle between Free and Pro for demonstration purposes on a specific exam.
   */
  public static toggleExamPlan(examId: ExamId): PlanType {
    if (this.isPro(examId)) {
      this.cancelSubscription(examId);
      return 'Free';
    } else {
      this.subscribeToExam(examId);
      return 'Pro';
    }
  }
}
