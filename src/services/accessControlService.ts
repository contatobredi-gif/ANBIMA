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
   * Robust multi-criterion Pro validation.
   * A valid Pro subscription must simultaneously satisfy all 10 conditions:
   * 1. Exist in storage
   * 2. Belong to the authenticated demo user
   * 3. Be tied to the requested exam
   * 4. Reference an existing plan in the catalog
   * 5. The referenced plan belongs to the SAME exam
   * 6. The referenced plan is of type 'Pro'
   * 7. The referenced plan is active
   * 8. The subscription status is eligible ('active' or valid 'trialing')
   * 9. Subscription is not expired
   * 10. Expiration date is valid when required
   */
  public static isPro(examId: ExamId | string, userIdOverride?: string): boolean {
    const state = StorageService.getState();
    const targetUserId = userIdOverride || state.user?.id;
    if (!state.subscriptions) return false;

    // 1. Exist in storage
    const sub = state.subscriptions[examId];
    if (!sub || typeof sub !== 'object') return false;

    // 2. Belong to the authenticated user
    if (!sub.userId || sub.userId !== targetUserId) {
      return false;
    }

    // 3. Be tied to the requested exam
    if (sub.examId !== examId) {
      return false;
    }

    // 4. Reference an existing plan in catalog
    const plans = state.examPlans || INITIAL_EXAM_PLANS;
    const plan = plans.find(p => p.id === sub.planId);
    if (!plan) {
      return false;
    }

    // 5. The plan belongs to the same exam
    if (plan.examId !== examId) {
      return false;
    }

    // 6. The plan is of type 'Pro'
    if (plan.type !== 'Pro') {
      return false;
    }

    // 7. The plan is active
    if (!plan.isActive) {
      return false;
    }

    // 8. Subscription status validation
    if (sub.status === 'past_due' || sub.status === 'canceled' || sub.status === 'expired') {
      return false;
    }

    if (sub.status === 'trialing') {
      const examRule = state.examRules?.[examId];
      if (!examRule?.trialPolicy?.enabled) {
        return false;
      }
    } else if (sub.status !== 'active') {
      return false;
    }

    // 9 & 10. Expiration date validation
    if (sub.expiresAt) {
      const expTime = new Date(sub.expiresAt).getTime();
      if (isNaN(expTime)) {
        return false;
      }
      if (Date.now() > expTime) {
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
  public static getRemainingFreeSimulations(examId: ExamId | string, userIdOverride?: string): number {
    if (this.isPro(examId, userIdOverride)) {
      return Infinity;
    }
    const state = StorageService.getState();
    const targetUserId = userIdOverride || state.user?.id;
    const examRule = state.examRules[examId];
    const maxFree = examRule?.maxFreeSimulations ?? 1;

    const usedFree = state.attempts.filter(
      a => a.userId === targetUserId && a.examId === examId && a.mode === 'FULL_EXAM'
    ).length;

    return Math.max(0, maxFree - usedFree);
  }

  /**
   * Validates if the user is allowed to start a full exam simulation for the given exam.
   * Free limits are strictly counted per user and exam.
   */
  public static canStartSimulation(examId: ExamId | string, userIdOverride?: string): AccessCheckResult {
    const state = StorageService.getState();
    const targetUserId = userIdOverride || state.user?.id;

    if (this.isPro(examId, targetUserId)) {
      return { allowed: true };
    }

    const examRule = state.examRules[examId];
    if (!examRule) {
      return { allowed: false, reason: 'Exame não encontrado.' };
    }

    const isExamActive = (examRule.isActive ?? examRule.active ?? false);
    if (!isExamActive) {
      return { allowed: false, reason: 'Este exame ainda não está disponível para realização de simulados.' };
    }

    const maxFree = examRule.maxFreeSimulations ?? 1;

    const fullExamCount = state.attempts.filter(
      a => a.userId === targetUserId && a.examId === examId && a.mode === 'FULL_EXAM'
    ).length;

    const remaining = Math.max(0, maxFree - fullExamCount);

    if (remaining > 0) {
      return { allowed: true, remainingFree: remaining };
    }

    const examName = examRule.shortName || examId.toUpperCase();
    return {
      allowed: false,
      remainingFree: 0,
      reason: `Você atingiu o limite de ${maxFree} simulado(s) gratuito(s) para o exame ${examName}. Assine o Plano Pro deste exame para simulados ilimitados.`
    };
  }

  /**
   * Validates access to specific features per exam.
   */
  public static canAccessFeature(examId: ExamId | string, feature: ProFeature, userIdOverride?: string): AccessCheckResult {
    const isPro = this.isPro(examId, userIdOverride);
    const state = StorageService.getState();
    const examRule = state.examRules[examId];
    const examName = examRule?.shortName || examId.toUpperCase();

    if (feature === 'FULL_EXAM') {
      return this.canStartSimulation(examId, userIdOverride);
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
   * Strict pre-validation:
   * - Exam must exist and be active
   * - Plan must exist, belong to requested exam, be Pro, be active, and have defined commercial price
   * - Prevents duplicate subscription if already active Pro
   * - Never creates fictional fallback plans
   */
  public static subscribeToExam(examId: ExamId, planId?: string): ExamSubscription {
    const state = StorageService.getState();

    // 1. Verify exam exists
    if (!state.examRules || !state.examRules[examId]) {
      throw new Error(`Exame "${examId}" não encontrado no catálogo.`);
    }

    const examRule = state.examRules[examId];
    // 2. Verify exam is active
    const isExamActive = (examRule.isActive ?? examRule.active ?? false);
    if (!isExamActive) {
      throw new Error(`O exame "${examRule.name}" está desativado. Não é permitido contratar planos para exames indisponíveis.`);
    }

    // 3. Find plan
    const plans = state.examPlans || INITIAL_EXAM_PLANS;
    let selectedPlan: ExamPlan | undefined;

    if (planId) {
      selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) {
        throw new Error(`Plano com identificador "${planId}" não encontrado.`);
      }
      if (selectedPlan.examId !== examId) {
        throw new Error(`O plano informado pertence ao exame "${selectedPlan.examId}", não ao exame solicitado "${examId}".`);
      }
    } else {
      selectedPlan = plans.find(p => p.examId === examId && p.type === 'Pro' && p.isActive);
      if (!selectedPlan) {
        throw new Error(`Nenhum plano Pro ativo disponível para o exame "${examRule.name}".`);
      }
    }

    // 4. Validate plan attributes
    if (selectedPlan.type !== 'Pro') {
      throw new Error('Apenas planos do tipo "Pro" podem ser contratados.');
    }
    if (!selectedPlan.isActive) {
      throw new Error(`O plano "${selectedPlan.name}" está desativado no momento.`);
    }
    if (selectedPlan.priceCents === null || selectedPlan.priceCents === undefined) {
      throw new Error(`O plano "${selectedPlan.name}" ainda não possui preço comercial definido para contratação.`);
    }

    // 5. Prevent duplicate subscription if already valid Pro
    if (this.isPro(examId)) {
      throw new Error(`O usuário já possui uma assinatura Pro ativa e válida para o exame "${examRule.shortName}".`);
    }

    if (!state.subscriptions) {
      state.subscriptions = {};
    }

    const now = new Date();
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1); // 30-day validity

    const newSub: ExamSubscription = {
      id: `sub-${state.user.id}-${examId}-${Date.now()}`,
      userId: state.user.id,
      examId,
      planId: selectedPlan.id,
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
  public static cancelSubscription(examId: ExamId): ExamSubscription {
    const state = StorageService.getState();
    if (!state.subscriptions || !state.subscriptions[examId]) {
      throw new Error(`Nenhuma assinatura encontrada para o exame "${examId}".`);
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
    const existing = state.subscriptions?.[examId];

    if (!existing) {
      return this.subscribeToExam(examId);
    }

    const examRule = state.examRules[examId];
    if (examRule) {
      const isExamActive = (examRule.isActive ?? examRule.active ?? false);
      if (!isExamActive) {
        throw new Error(`O exame "${examRule.name}" está desativado. Não é permitido reativar assinaturas.`);
      }
    }

    const plans = state.examPlans || INITIAL_EXAM_PLANS;
    const plan = plans.find(p => p.id === existing.planId);
    if (!plan || !plan.isActive || plan.priceCents === null) {
      throw new Error('O plano vinculado a esta assinatura não está mais disponível com preço definido.');
    }

    existing.status = 'active';
    existing.canceledAt = null;
    existing.autoRenew = true;
    
    // Refresh expiration to 1 month from now
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    existing.expiresAt = expires.toISOString();

    if (state.user.selectedExamId === examId) {
      state.user.plan = 'Pro';
    }

    StorageService.saveState(state);
    return existing;
  }

  /**
   * Quick toggle between Free and Pro for demonstration purposes on a specific exam.
   * Routes strictly through verified commercial methods.
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
