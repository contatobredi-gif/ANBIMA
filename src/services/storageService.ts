import { AppStateData, Attempt, ActiveExamSession, PlanType, ExamRule, TestimonialFeedback, DailyActivity, NotificationItem, Question, ExamId, ExamPlan, ExamSubscription, PointEvent, ActiveDailyChallenge } from '../types';
import { INITIAL_APP_STATE, INITIAL_EXAM_RULES, INITIAL_EXAM_PLANS, INITIAL_SUBSCRIPTIONS } from '../data/initialData';
import { INITIAL_QUESTIONS } from '../data/questionsData';
import { AccessControlService } from './accessControlService';
import { EngagementService } from './engagementService';
import { DailyActivityService } from './dailyActivityService';
import { AchievementService } from './achievementService';
import { DailyChallengeService } from './dailyChallengeService';

const STORAGE_KEY = 'simulados_anbima_engine_v1';

export class StorageService {
  private static cachedState: AppStateData | null = null;

  public static clearCache(): void {
    this.cachedState = null;
  }

  public static getState(): AppStateData {
    if (this.cachedState) {
      return this.cachedState;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppStateData;
        if (parsed && typeof parsed === 'object' && parsed.user) {
          parsed.version = INITIAL_APP_STATE.version;

          // Ensure basic collections exist if migrating from older schemas
          if (!parsed.subjects) parsed.subjects = JSON.parse(JSON.stringify(INITIAL_APP_STATE.subjects));
          if (!parsed.dailyActivities) parsed.dailyActivities = {};
          if (!parsed.achievements) parsed.achievements = JSON.parse(JSON.stringify(INITIAL_APP_STATE.achievements));
          if (!parsed.rankings) parsed.rankings = JSON.parse(JSON.stringify(INITIAL_APP_STATE.rankings));
          if (!parsed.notifications) parsed.notifications = JSON.parse(JSON.stringify(INITIAL_APP_STATE.notifications));
          if (!parsed.articles) parsed.articles = JSON.parse(JSON.stringify(INITIAL_APP_STATE.articles));
          if (!parsed.feedbacks) parsed.feedbacks = JSON.parse(JSON.stringify(INITIAL_APP_STATE.feedbacks));
          if (!parsed.attempts) parsed.attempts = [];
          // Perform controlled non-destructive migrations:
          // 1. Ensure all questions have status: 'approved', version, origin
          if (Array.isArray(parsed.questions)) {
            const existingIdMap = new Map<string, Question>();
            parsed.questions.forEach(q => {
              if (!q.status) {
                q.status = 'approved';
              }
              if (!q.version) q.version = 1;
              if (!q.origin) q.origin = 'Bredi Exam Engine - Base Autoral Demonstrativa';
              existingIdMap.set(q.id, q);
            });

            // 2. Add any newly added questions from INITIAL_QUESTIONS (e.g. new mat_fin questions)
            INITIAL_QUESTIONS.forEach(newQ => {
              if (!existingIdMap.has(newQ.id)) {
                parsed.questions.push(newQ);
              }
            });
          } else {
            parsed.questions = JSON.parse(JSON.stringify(INITIAL_QUESTIONS));
          }

          // 3. Ensure examRules has trainingSettings, active, isActive, and sync with INITIAL_EXAM_RULES
          if (parsed.examRules && typeof parsed.examRules === 'object') {
            // Ensure any new exams from INITIAL_EXAM_RULES exist
            Object.keys(INITIAL_EXAM_RULES).forEach(examKey => {
              if (!parsed.examRules[examKey]) {
                parsed.examRules[examKey] = JSON.parse(JSON.stringify(INITIAL_EXAM_RULES[examKey]));
              }
            });

            Object.values(parsed.examRules).forEach((r: any) => {
              if (r.allowRedistributionIfInsufficient === undefined) {
                r.allowRedistributionIfInsufficient = false;
              }
              const defaultRule = INITIAL_EXAM_RULES[r.examId] || INITIAL_EXAM_RULES['cpa'];
              if (r.isActive === undefined) {
                r.isActive = defaultRule?.isActive ?? true;
              }
              if (r.active === undefined) {
                r.active = r.isActive;
              }

              // Ensure trainingSettings is safely migrated
              if (!r.trainingSettings) {
                r.trainingSettings = JSON.parse(JSON.stringify(defaultRule.trainingSettings || {
                  targetedTraining: { enabled: true, questionCount: 20, durationMinutes: 60 },
                  errorReview: { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
                  dailyChallenge: { enabled: true, questionCount: 5, durationMinutes: 15 }
                }));
              } else {
                const defSettings = defaultRule.trainingSettings;
                if (!r.trainingSettings.targetedTraining) {
                  r.trainingSettings.targetedTraining = { ...defSettings?.targetedTraining };
                }
                if (!r.trainingSettings.errorReview) {
                  r.trainingSettings.errorReview = { ...defSettings?.errorReview };
                }
                if (!r.trainingSettings.dailyChallenge) {
                  r.trainingSettings.dailyChallenge = { ...defSettings?.dailyChallenge };
                }
              }
            });
          }

          // 4. Ensure past attempts have snapshots & ruleVersion & ruleSnapshot
          if (Array.isArray(parsed.attempts)) {
            parsed.attempts.forEach((att: any) => {
              if (!att.ruleVersion) {
                att.ruleVersion = 'Regulamento 2026.1 - Edição Vigente';
              }
              if (!att.sessionRefId) {
                att.sessionRefId = att.id;
              }
              if (!att.questionSnapshots || att.questionSnapshots.length === 0) {
                att.questionSnapshots = parsed.questions.slice(0, att.totalQuestions);
              }
              // STRICTLY query rule corresponding to the original exam - NO FALLBACK TO CPA!
              if (!att.ruleSnapshot && parsed.examRules && att.examId && parsed.examRules[att.examId]) {
                att.ruleSnapshot = JSON.parse(JSON.stringify(parsed.examRules[att.examId]));
              }
            });
          }

          // 5. Ensure activeSession has ruleSnapshot if present - STRICTLY by its examId, NO CPA FALLBACK!
          if (parsed.activeSession && !parsed.activeSession.ruleSnapshot && parsed.examRules && parsed.activeSession.examId) {
            const rule = parsed.examRules[parsed.activeSession.examId];
            if (rule) {
              parsed.activeSession.ruleSnapshot = JSON.parse(JSON.stringify(rule));
            } else {
              console.warn(`[Motor de Provas] Configurações do exame "${parsed.activeSession.examId}" não disponíveis para a sessão ativa.`);
            }
          }

          // 6. Ensure examPlans catalog exists and perform non-destructive price migration
          if (!parsed.examPlans || !Array.isArray(parsed.examPlans) || parsed.examPlans.length === 0) {
            parsed.examPlans = JSON.parse(JSON.stringify(INITIAL_EXAM_PLANS));
          } else {
            INITIAL_EXAM_PLANS.forEach(ip => {
              const existingPlan = parsed.examPlans.find(p => p.id === ip.id);
              if (!existingPlan) {
                parsed.examPlans.push(JSON.parse(JSON.stringify(ip)));
              }
            });

            // Correct default CPA Pro demonstrative price from 4990 to 2990 without altering admin-customized prices
            const cpaPlan = parsed.examPlans.find(p => p.id === 'plan-cpa-pro');
            if (cpaPlan && cpaPlan.priceCents === 4990) {
              cpaPlan.priceCents = 2990;
            }

            // OAB Pro price: no approved commercial price yet, disable public subscribing
            const oabPlan = parsed.examPlans.find(p => p.id === 'plan-oab-pro');
            if (oabPlan && (oabPlan.priceCents === 5990 || oabPlan.priceCents === null)) {
              oabPlan.priceCents = null;
              oabPlan.isActive = false;
            }
          }

          // 7. Ensure subscriptions map exists and is populated
          // Do NOT duplicate subscriptions, do NOT re-activate canceled ones on repeated migration
          if (!parsed.subscriptions || typeof parsed.subscriptions !== 'object') {
            parsed.subscriptions = {};
            if (parsed.user.plan === 'Pro') {
              parsed.subscriptions['cpa'] = JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTIONS['cpa']));
            }
          }

          // 8. Ensure selectedExamId exists
          if (!parsed.user.selectedExamId) {
            parsed.user.selectedExamId = 'cpa';
          }

          // 9. Ensure errorReview has maxDurationMinutes in all examRules
          if (parsed.examRules) {
            Object.values(parsed.examRules).forEach(r => {
              if (r.trainingSettings?.errorReview) {
                if (!r.trainingSettings.errorReview.maxDurationMinutes) {
                  r.trainingSettings.errorReview.maxDurationMinutes = 60;
                }
              }
            });
          }

          // 10. Sync user.plan with the current status of selectedExamId
          const activeSub = parsed.subscriptions[parsed.user.selectedExamId];
          const isSelectedExamPro = activeSub && 
            activeSub.userId === parsed.user.id &&
            activeSub.examId === parsed.user.selectedExamId &&
            activeSub.status === 'active' && 
            (!activeSub.expiresAt || new Date(activeSub.expiresAt).getTime() > Date.now());
          parsed.user.plan = isSelectedExamPro ? 'Pro' : 'Free';

          // 11. Gamification collections migration
          if (!parsed.pointEvents) parsed.pointEvents = [];
          if (parsed.activeDailyChallenge === undefined) parsed.activeDailyChallenge = null;
          if (parsed.user.bestStreakDays === undefined) {
            parsed.user.bestStreakDays = Math.max(parsed.user.consecutiveDays || 0, 7);
          }
          if (parsed.user.publicRankingOptIn === undefined) {
            parsed.user.publicRankingOptIn = false;
          }
          if (!parsed.user.publicDisplayName) {
            parsed.user.publicDisplayName = parsed.user.name;
          }

          this.cachedState = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Inconsistência detectada nos dados locais. Inicializando com estado padrão seguro:', e);
    }

    // Initialize with seed data
    this.cachedState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    this.saveState(this.cachedState!);
    return this.cachedState!;
  }

  public static saveState(state: AppStateData): void {
    this.cachedState = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage-update'));
      }
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
  }

  // Plan toggling per exam - delegates directly to AccessControlService to unify business rules
  public static togglePlan(targetExamId?: ExamId): PlanType {
    const state = this.getState();
    const examId = targetExamId || state.user.selectedExamId || 'cpa';
    return AccessControlService.toggleExamPlan(examId);
  }

  public static setPlan(plan: PlanType, targetExamId?: ExamId): void {
    const state = this.getState();
    const examId = targetExamId || state.user.selectedExamId || 'cpa';
    if (plan === 'Pro') {
      if (!AccessControlService.isPro(examId)) {
        AccessControlService.subscribeToExam(examId);
      }
    } else {
      if (AccessControlService.isPro(examId)) {
        AccessControlService.cancelSubscription(examId);
      }
    }
  }

  public static setSelectedExam(examId: ExamId): void {
    const state = this.getState();
    state.user.selectedExamId = examId;
    state.user.plan = AccessControlService.isPro(examId) ? 'Pro' : 'Free';
    this.saveState(state);
  }

  // Reset to default seed
  public static restoreInitialData(): void {
    const fresh: AppStateData = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    this.saveState(fresh);
  }

  // Clear all attempts and start blank demo
  public static resetDemoData(): void {
    const state = this.getState();
    state.attempts = [];
    state.activeSession = null;
    state.user.consecutiveDays = 1;
    state.user.engagementPoints = 100;
    state.dailyActivities = {
      [new Date().toISOString().split('T')[0]]: {
        date: new Date().toISOString().split('T')[0],
        checkedIn: false,
        challengeCompleted: false,
        simulationsCompleted: 0,
        questionsAnswered: 0
      }
    };
    state.achievements = state.achievements.map(a => ({
      ...a,
      unlockedAt: null,
      progress: 0
    }));
    this.saveState(state);
  }

  // Attempts
  public static getAttempts(): Attempt[] {
    return this.getState().attempts;
  }

  public static getAttemptById(id: string): Attempt | undefined {
    return this.getState().attempts.find(a => a.id === id || a.sessionRefId === id);
  }

  public static getAttemptBySessionId(sessionId: string): Attempt | undefined {
    return this.getState().attempts.find(a => a.id === sessionId || a.sessionRefId === sessionId);
  }

  public static saveCompletedAttempt(attempt: Attempt): void {
    const state = this.getState();

    // IDEMPOTENCY CHECK:
    // If an attempt with this ID or sessionRefId already exists, do not duplicate
    const existingIndex = state.attempts.findIndex(
      a => a.id === attempt.id || (attempt.sessionRefId && a.sessionRefId === attempt.sessionRefId)
    );
    if (existingIndex >= 0) {
      // Already persisted, safely ignore repeat calls
      return;
    }

    state.attempts.push(attempt);
    state.activeSession = null; // Clear active session

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: attempt.mode === 'FULL_EXAM' ? 'Simulado Completo Finalizado' : 'Treino Direcionado Finalizado',
      message: `Você alcançou ${attempt.scorePercentage}% de acertos (${attempt.correctCount}/${attempt.totalQuestions}).`,
      date: 'Agora mesmo',
      read: false,
      category: 'desempenho',
      actionPath: 'history'
    };
    state.notifications.unshift(newNotif);

    this.saveState(state);

    // Award engagement points deterministically based on mode
    const pointsGained = attempt.mode === 'FULL_EXAM' ? 50 : (attempt.mode === 'ERROR_REVIEW' ? 15 : 20);
    EngagementService.awardPoints(
      attempt.mode,
      attempt.id,
      attempt.examId,
      pointsGained,
      attempt.mode === 'FULL_EXAM'
        ? 'Simulado Completo finalizado (+50 pts)'
        : (attempt.mode === 'ERROR_REVIEW' ? 'Revisão de Erros finalizada (+15 pts)' : 'Treino Direcionado finalizado (+20 pts)')
    );

    // Record study activity in daily tracker and recalculate streak
    DailyActivityService.recordStudyActivity(attempt.totalQuestions, attempt.mode === 'FULL_EXAM', attempt.examId);

    // Evaluate and unlock achievements
    AchievementService.checkAndUnlockAchievements();
  }

  // Active Session Persistence (ensures refresh does not lose time or progress)
  public static getActiveSession(): ActiveExamSession | null {
    return this.getState().activeSession;
  }

  public static saveActiveSession(session: ActiveExamSession | null): void {
    const state = this.getState();
    state.activeSession = session;
    this.saveState(state);
  }

  // Update a single answer in active session immediately
  public static updateSessionAnswer(questionId: string, selectedOptionIndex: number | null): void {
    const state = this.getState();
    if (state.activeSession) {
      state.activeSession.answers[questionId] = selectedOptionIndex;
      this.saveState(state);
    }
  }

  // Daily Check-in with duplicate protection and local date calculation
  public static performDailyCheckIn(examIdOverride?: ExamId): {
    success: boolean;
    message: string;
    pointsGained: number;
    currentStreak: number;
  } {
    return DailyActivityService.performDailyCheckIn(examIdOverride);
  }

  // Daily Challenge completion via DailyChallengeService
  public static recordDailyChallenge(): {
    score: number;
    total: number;
    pointsAwarded: number;
    alreadyCompleted: boolean;
  } {
    return DailyChallengeService.submitChallenge();
  }

  // Notifications
  public static markNotificationAsRead(id: string): void {
    const state = this.getState();
    const notif = state.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveState(state);
    }
  }

  public static markAllNotificationsAsRead(): void {
    const state = this.getState();
    state.notifications.forEach(n => { n.read = true; });
    this.saveState(state);
  }

  // Feedback & Social Proof
  public static addFeedback(rating: number, comment: string, consented: boolean, improvementText?: string): void {
    const state = this.getState();
    const newFeedback: TestimonialFeedback = {
      id: `fb-${Date.now()}`,
      userName: state.user.name,
      userRole: 'Aluno em preparação · CPA',
      rating,
      comment,
      improvementText,
      consentedToPublish: consented,
      approvedForDisplay: false, // Must be approved by admin
      createdAt: new Date().toISOString()
    };
    state.feedbacks.unshift(newFeedback);
    this.saveState(state);
  }

  public static toggleFeedbackApproval(id: string): void {
    const state = this.getState();
    const fb = state.feedbacks.find(f => f.id === id);
    if (fb) {
      fb.approvedForDisplay = !fb.approvedForDisplay;
      this.saveState(state);
    }
  }

  // Newsletter
  public static toggleNewsletter(email: string): boolean {
    const state = this.getState();
    state.newsletterSubscribed = !state.newsletterSubscribed;
    this.saveState(state);
    return state.newsletterSubscribed;
  }

  // Admin Exam Rules update
  public static updateExamRule(examId: string, updatedRule: Partial<ExamRule>): void {
    const state = this.getState();
    if (state.examRules[examId as keyof typeof state.examRules]) {
      const current = state.examRules[examId as keyof typeof state.examRules];
      const merged: ExamRule = {
        ...current,
        ...updatedRule,
        trainingSettings: updatedRule.trainingSettings
          ? {
              targetedTraining: {
                ...current.trainingSettings?.targetedTraining,
                ...updatedRule.trainingSettings.targetedTraining
              },
              errorReview: {
                ...current.trainingSettings?.errorReview,
                ...updatedRule.trainingSettings.errorReview
              },
              dailyChallenge: {
                ...current.trainingSettings?.dailyChallenge,
                ...updatedRule.trainingSettings.dailyChallenge
              }
            }
          : current.trainingSettings
      };

      if (updatedRule.active !== undefined && updatedRule.isActive === undefined) {
        merged.isActive = updatedRule.active;
      } else if (updatedRule.isActive !== undefined && updatedRule.active === undefined) {
        merged.active = updatedRule.isActive;
      }

      state.examRules[examId as keyof typeof state.examRules] = merged;
      this.saveState(state);
    }
  }
}
