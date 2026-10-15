import { AppStateData, Attempt, ActiveExamSession, PlanType, ExamRule, TestimonialFeedback, DailyActivity, NotificationItem, Question } from '../types';
import { INITIAL_APP_STATE } from '../data/initialData';
import { INITIAL_QUESTIONS } from '../data/questionsData';

const STORAGE_KEY = 'simulados_anbima_engine_v1';

export class StorageService {
  private static cachedState: AppStateData | null = null;

  public static getState(): AppStateData {
    if (this.cachedState) {
      return this.cachedState;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppStateData;
        if (parsed.version === INITIAL_APP_STATE.version && parsed.user) {
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

          // 3. Ensure examRules has allowRedistributionIfInsufficient
          if (parsed.examRules) {
            Object.values(parsed.examRules).forEach(r => {
              if (r.allowRedistributionIfInsufficient === undefined) {
                r.allowRedistributionIfInsufficient = false;
              }
            });
          }

          // 4. Ensure past attempts have snapshots & ruleVersion
          if (Array.isArray(parsed.attempts)) {
            parsed.attempts.forEach(att => {
              if (!att.ruleVersion) {
                att.ruleVersion = 'Regulamento 2026.1 - Edição Vigente';
              }
              if (!att.sessionRefId) {
                att.sessionRefId = att.id;
              }
              if (!att.questionSnapshots || att.questionSnapshots.length === 0) {
                att.questionSnapshots = parsed.questions.slice(0, att.totalQuestions);
              }
            });
          }

          this.cachedState = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler LocalStorage, inicializando com estado padrão:', e);
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

  // Plan toggling
  public static togglePlan(): PlanType {
    const state = this.getState();
    const newPlan: PlanType = state.user.plan === 'Pro' ? 'Free' : 'Pro';
    state.user.plan = newPlan;
    this.saveState(state);
    return newPlan;
  }

  public static setPlan(plan: PlanType): void {
    const state = this.getState();
    state.user.plan = plan;
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

    // Add engagement points only once
    const pointsGained = attempt.mode === 'FULL_EXAM' ? 150 : 60;
    state.user.engagementPoints += pointsGained;

    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    const currentDay = state.dailyActivities[today] || {
      date: today,
      checkedIn: true,
      challengeCompleted: false,
      simulationsCompleted: 0,
      questionsAnswered: 0
    };
    if (attempt.mode === 'FULL_EXAM') {
      currentDay.simulationsCompleted += 1;
    }
    currentDay.questionsAnswered += attempt.totalQuestions;
    currentDay.checkedIn = true;
    state.dailyActivities[today] = currentDay;

    // Check achievement progress
    this.evaluateAchievements(state, attempt);

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
  }

  private static evaluateAchievements(state: AppStateData, lastAttempt: Attempt): void {
    const fullExams = state.attempts.filter(a => a.mode === 'FULL_EXAM');
    const totalQuestions = state.attempts.reduce((acc, a) => acc + a.totalQuestions, 0);

    state.achievements.forEach(ach => {
      if (ach.id === 'ach-01' && fullExams.length >= 1 && !ach.unlockedAt) {
        ach.unlockedAt = new Date().toISOString();
        ach.progress = 1;
      }
      if (ach.id === 'ach-02') {
        ach.progress = totalQuestions;
        if (totalQuestions >= ach.maxProgress && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
        }
      }
      if (ach.id === 'ach-08' && lastAttempt.scorePercentage >= 80 && !ach.unlockedAt) {
        ach.unlockedAt = new Date().toISOString();
        ach.progress = lastAttempt.scorePercentage;
      }
      if (ach.id === 'ach-07' && lastAttempt.mode === 'TARGETED_TRAINING' && lastAttempt.targetSubjectId === 'mat_fin' && lastAttempt.scorePercentage >= 70 && !ach.unlockedAt) {
        ach.unlockedAt = new Date().toISOString();
        ach.progress = lastAttempt.scorePercentage;
      }
    });
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

  // Daily Check-in with duplicate protection
  public static performDailyCheckIn(): { success: boolean; message: string; pointsGained: number } {
    const state = this.getState();
    const today = new Date().toISOString().split('T')[0];

    const currentActivity = state.dailyActivities[today];
    if (currentActivity && currentActivity.checkedIn) {
      return { success: false, message: 'Você já realizou o check-in de hoje!', pointsGained: 0 };
    }

    const points = 50;
    state.user.engagementPoints += points;
    state.user.lastActiveDate = today;

    state.dailyActivities[today] = {
      date: today,
      checkedIn: true,
      challengeCompleted: currentActivity ? currentActivity.challengeCompleted : false,
      challengeScore: currentActivity ? currentActivity.challengeScore : undefined,
      simulationsCompleted: currentActivity ? currentActivity.simulationsCompleted : 0,
      questionsAnswered: currentActivity ? currentActivity.questionsAnswered : 0
    };

    // Calculate streak
    state.user.consecutiveDays = (state.user.consecutiveDays || 0) + 1;

    // Check 7 days badge
    const streakBadge = state.achievements.find(a => a.id === 'ach-04');
    if (streakBadge && state.user.consecutiveDays >= 7 && !streakBadge.unlockedAt) {
      streakBadge.unlockedAt = new Date().toISOString();
      streakBadge.progress = 7;
    }

    this.saveState(state);
    return { success: true, message: `Check-in diário confirmado! +${points} pontos de engajamento.`, pointsGained: points };
  }

  // Daily Challenge completion
  public static recordDailyChallenge(score: number): void {
    const state = this.getState();
    const today = new Date().toISOString().split('T')[0];
    const act = state.dailyActivities[today] || {
      date: today,
      checkedIn: true,
      challengeCompleted: false,
      simulationsCompleted: 0,
      questionsAnswered: 0
    };

    act.challengeCompleted = true;
    act.challengeScore = score;
    act.questionsAnswered += 5;
    act.checkedIn = true;
    state.dailyActivities[today] = act;
    state.user.engagementPoints += (score * 20) + 50; // Points per correct answer + bonus

    this.saveState(state);
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
      state.examRules[examId as keyof typeof state.examRules] = {
        ...state.examRules[examId as keyof typeof state.examRules],
        ...updatedRule
      };
      this.saveState(state);
    }
  }
}
