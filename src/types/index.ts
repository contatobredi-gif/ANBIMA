export type PlanType = 'Free' | 'Pro';

export type ExamId = 'cpa' | 'oab';

export interface ExamRule {
  examId: ExamId;
  name: string;
  shortName: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScorePercentage: number;
  ruleVersion: string;
  sourceReference: string;
  effectiveDate: string;
  enabledDisciplines: string[];
  maxFreeSimulations: number;
  isActive: boolean;
  category: 'Certificação Financeira' | 'Exame de Ordem' | 'Concurso Público';
  allowRedistributionIfInsufficient?: boolean; // Default false
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  weightPercentage: number;
  topics: string[];
  recommendedQuestionCount?: number;
}

export type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

export type QuestionEditorialStatus = 'draft' | 'in_review' | 'approved' | 'disabled';

export interface Question {
  id: string;
  examId: ExamId;
  subjectId: string;
  subjectName: string;
  topic: string;
  difficulty: Difficulty;
  stem: string;
  options: [string, string, string, string]; // 4 alternatives A, B, C, D
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation: string;
  status: QuestionEditorialStatus;
  version?: number;
  origin?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type AttemptMode = 'FULL_EXAM' | 'TARGETED_TRAINING' | 'ERROR_REVIEW' | 'DAILY_CHALLENGE';

export interface QuestionAnswer {
  questionId: string;
  selectedOptionIndex: number | null; // null if skipped
  isCorrect: boolean;
  timeSpentSeconds: number;
  flaggedForReview?: boolean;
}

export interface DisciplineResult {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
}

export interface TopicResult {
  topic: string;
  subjectName: string;
  total: number;
  correct: number;
  scorePercentage: number;
}

export interface Attempt {
  id: string; // Stable unique ID (matches session.id)
  sessionRefId?: string;
  userId: string;
  examId: ExamId;
  mode: AttemptMode;
  targetSubjectId?: string;
  ruleVersion: string;
  totalQuestions: number;
  durationMinutes?: number;
  totalDurationSeconds?: number;
  disciplineDistribution?: Record<string, number>;
  startedAt: string; // ISO date
  finishedAt: string; // ISO date
  durationSeconds: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercentage: number;
  passed: boolean;
  answers: QuestionAnswer[];
  disciplineScores: DisciplineResult[];
  topicScores?: TopicResult[];
  questionOrder?: string[];
  questionSnapshots: Question[]; // Immutable snapshot of questions used
}

export interface ActiveExamSession {
  id: string; // Stable unique identifier from start
  examId: ExamId;
  mode: AttemptMode;
  targetSubjectId?: string;
  ruleVersion: string;
  startedAtTimestamp: number; // epoch ms
  totalDurationSeconds: number;
  disciplineDistribution?: Record<string, number>;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, number | null>; // questionId -> selectedOptionIndex
  flaggedQuestionIds: string[];
  questionSnapshots: Question[]; // Snapshot taken at session creation
  completed?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  selectedExamId: ExamId;
  consecutiveDays: number;
  lastActiveDate: string;
  engagementPoints: number;
  targetExamDate?: string;
  avatarUrl?: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  checkedIn: boolean;
  challengeCompleted: boolean;
  challengeScore?: number;
  simulationsCompleted: number;
  questionsAnswered: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'simulados' | 'disciplina' | 'constancia' | 'desempenho';
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  rewardPoints: number;
}

export interface RankingParticipant {
  id: string;
  name: string;
  avatar: string;
  isCurrentUser: boolean;
  exam: string;
  averageScore: number;
  completedSimulations: number;
  engagementPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  rankWeekly: number;
  rankMonthly: number;
  rankOverall: number;
  streakDays: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  category: 'alerta' | 'conquista' | 'desempenho' | 'conteudo';
  actionPath?: string;
}

export interface NotificationPreferences {
  emailStudyReminders: boolean;
  emailPerformanceReports: boolean;
  inAppAlerts: boolean;
  pushSimulation: boolean;
}

export interface TestimonialFeedback {
  id: string;
  userName: string;
  userRole: string;
  rating: number; // 1 to 5
  comment: string;
  improvementText?: string;
  consentedToPublish: boolean;
  approvedForDisplay: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  category: 'Orientações de Estudo' | 'Dicas da Prova' | 'Alterações no Edital' | 'Calendário & Prazos';
  summary: string;
  content: string;
  date: string;
  readTime: string;
  examId: ExamId;
  author: string;
}

export interface AppStateData {
  version: number;
  user: UserProfile;
  examRules: Record<ExamId, ExamRule>;
  subjects: Subject[];
  questions: Question[];
  attempts: Attempt[];
  activeSession: ActiveExamSession | null;
  dailyActivities: Record<string, DailyActivity>;
  achievements: Achievement[];
  rankings: RankingParticipant[];
  notifications: NotificationItem[];
  notificationPreferences: NotificationPreferences;
  feedbacks: TestimonialFeedback[];
  articles: Article[];
  newsletterSubscribed: boolean;
  feedbackDismissed: boolean;
}
