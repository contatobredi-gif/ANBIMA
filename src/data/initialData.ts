import { AppStateData, ExamRule, RankingParticipant, Achievement, NotificationItem, TestimonialFeedback, Article, Attempt } from '../types';
import { INITIAL_QUESTIONS, INITIAL_SUBJECTS } from './questionsData';

export const INITIAL_EXAM_RULES: Record<string, ExamRule> = {
  cpa: {
    examId: 'cpa',
    name: 'Certificação Profissional ANBIMA - CPA',
    shortName: 'CPA',
    description: 'Certificação de alta relevância para profissionais que atuam na distribuição de produtos de investimento e atendimento a clientes no sistema financeiro.',
    totalQuestions: 50,
    durationMinutes: 150,
    passingScorePercentage: 70,
    ruleVersion: 'Regulamento 2026.1 - Edição Vigente',
    sourceReference: 'Diretrizes Oficiais do Programa de Certificação Continuada',
    effectiveDate: '01/01/2026',
    enabledDisciplines: ['mat_fin', 'fundos_inv', 'renda_fixa_var', 'sfn_mercado', 'previdencia', 'risco_compliance', 'economia_fin'],
    maxFreeSimulations: 1,
    isActive: true,
    category: 'Certificação Financeira'
  },
  oab: {
    examId: 'oab',
    name: 'Exame de Ordem Unificado (Demonstrativo)',
    shortName: 'OAB 1ª Fase',
    description: 'Módulo demonstrativo multi-exame para validar a flexibilidade do Bredi Exam Engine em carreiras jurídicas.',
    totalQuestions: 80,
    durationMinutes: 300,
    passingScorePercentage: 50,
    ruleVersion: 'Edital XLII - Demonstração',
    sourceReference: 'Conselho Federal OAB / FGV',
    effectiveDate: '15/03/2026',
    enabledDisciplines: ['etica_prof', 'dir_const', 'dir_civil'],
    maxFreeSimulations: 1,
    isActive: false, // Desabilitado para demonstrar arquitetura expansível
    category: 'Exame de Ordem'
  }
};

// Seed 6 completed full exam simulations for Rafael Martins: 44%, 52%, 58%, 54%, 62%, 72%
const SEED_ATTEMPTS: Attempt[] = [
  {
    id: 'att-sim-01',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'FULL_EXAM',
    startedAt: '2026-09-20T14:00:00Z',
    finishedAt: '2026-09-20T16:15:00Z',
    durationSeconds: 8100,
    totalQuestions: 50,
    correctCount: 22,
    wrongCount: 28,
    unansweredCount: 0,
    scorePercentage: 44,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 8, correctCount: 2, scorePercentage: 25 },
      { subjectId: 'fundos_inv', subjectName: 'Fundos de Investimento', totalQuestions: 10, correctCount: 4, scorePercentage: 40 },
      { subjectId: 'renda_fixa_var', subjectName: 'Instrumentos de Renda Fixa e Variável', totalQuestions: 10, correctCount: 5, scorePercentage: 50 },
      { subjectId: 'sfn_mercado', subjectName: 'Sistema Financeiro Nacional e Participantes', totalQuestions: 8, correctCount: 4, scorePercentage: 50 },
      { subjectId: 'previdencia', subjectName: 'Previdência Complementar Aberta', totalQuestions: 5, correctCount: 3, scorePercentage: 60 },
      { subjectId: 'risco_compliance', subjectName: 'Gestão de Risco, Compliance e PLD-FT', totalQuestions: 5, correctCount: 2, scorePercentage: 40 },
      { subjectId: 'economia_fin', subjectName: 'Conceitos de Economia e Finanças', totalQuestions: 4, correctCount: 2, scorePercentage: 50 }
    ]
  },
  {
    id: 'att-sim-02',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'FULL_EXAM',
    startedAt: '2026-09-27T10:00:00Z',
    finishedAt: '2026-09-27T12:05:00Z',
    durationSeconds: 7500,
    totalQuestions: 50,
    correctCount: 26,
    wrongCount: 24,
    unansweredCount: 0,
    scorePercentage: 52,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 8, correctCount: 2, scorePercentage: 25 },
      { subjectId: 'fundos_inv', subjectName: 'Fundos de Investimento', totalQuestions: 10, correctCount: 6, scorePercentage: 60 },
      { subjectId: 'renda_fixa_var', subjectName: 'Instrumentos de Renda Fixa e Variável', totalQuestions: 10, correctCount: 6, scorePercentage: 60 },
      { subjectId: 'sfn_mercado', subjectName: 'Sistema Financeiro Nacional e Participantes', totalQuestions: 8, correctCount: 5, scorePercentage: 62 },
      { subjectId: 'previdencia', subjectName: 'Previdência Complementar Aberta', totalQuestions: 5, correctCount: 3, scorePercentage: 60 },
      { subjectId: 'risco_compliance', subjectName: 'Gestão de Risco, Compliance e PLD-FT', totalQuestions: 5, correctCount: 2, scorePercentage: 40 },
      { subjectId: 'economia_fin', subjectName: 'Conceitos de Economia e Finanças', totalQuestions: 4, correctCount: 2, scorePercentage: 50 }
    ]
  },
  {
    id: 'att-sim-03',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'FULL_EXAM',
    startedAt: '2026-10-02T15:00:00Z',
    finishedAt: '2026-10-02T17:10:00Z',
    durationSeconds: 7800,
    totalQuestions: 50,
    correctCount: 29,
    wrongCount: 21,
    unansweredCount: 0,
    scorePercentage: 58,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 8, correctCount: 3, scorePercentage: 37 },
      { subjectId: 'fundos_inv', subjectName: 'Fundos de Investimento', totalQuestions: 10, correctCount: 6, scorePercentage: 60 },
      { subjectId: 'renda_fixa_var', subjectName: 'Instrumentos de Renda Fixa e Variável', totalQuestions: 10, correctCount: 7, scorePercentage: 70 },
      { subjectId: 'sfn_mercado', subjectName: 'Sistema Financeiro Nacional e Participantes', totalQuestions: 8, correctCount: 5, scorePercentage: 62 },
      { subjectId: 'previdencia', subjectName: 'Previdência Complementar Aberta', totalQuestions: 5, correctCount: 4, scorePercentage: 80 },
      { subjectId: 'risco_compliance', subjectName: 'Gestão de Risco, Compliance e PLD-FT', totalQuestions: 5, correctCount: 2, scorePercentage: 40 },
      { subjectId: 'economia_fin', subjectName: 'Conceitos de Economia e Finanças', totalQuestions: 4, correctCount: 2, scorePercentage: 50 }
    ]
  },
  {
    id: 'att-sim-04',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'FULL_EXAM',
    startedAt: '2026-10-06T09:30:00Z',
    finishedAt: '2026-10-06T11:40:00Z',
    durationSeconds: 7800,
    totalQuestions: 50,
    correctCount: 27,
    wrongCount: 23,
    unansweredCount: 0,
    scorePercentage: 54,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 8, correctCount: 2, scorePercentage: 25 },
      { subjectId: 'fundos_inv', subjectName: 'Fundos de Investimento', totalQuestions: 10, correctCount: 6, scorePercentage: 60 },
      { subjectId: 'renda_fixa_var', subjectName: 'Instrumentos de Renda Fixa e Variável', totalQuestions: 10, correctCount: 6, scorePercentage: 60 },
      { subjectId: 'sfn_mercado', subjectName: 'Sistema Financeiro Nacional e Participantes', totalQuestions: 8, correctCount: 5, scorePercentage: 62 },
      { subjectId: 'previdencia', subjectName: 'Previdência Complementar Aberta', totalQuestions: 5, correctCount: 3, scorePercentage: 60 },
      { subjectId: 'risco_compliance', subjectName: 'Gestão de Risco, Compliance e PLD-FT', totalQuestions: 5, correctCount: 3, scorePercentage: 60 },
      { subjectId: 'economia_fin', subjectName: 'Conceitos de Economia e Finanças', totalQuestions: 4, correctCount: 2, scorePercentage: 50 }
    ]
  },
  {
    id: 'att-sim-05',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'FULL_EXAM',
    startedAt: '2026-10-09T14:30:00Z',
    finishedAt: '2026-10-09T16:45:00Z',
    durationSeconds: 8100,
    totalQuestions: 50,
    correctCount: 31,
    wrongCount: 19,
    unansweredCount: 0,
    scorePercentage: 62,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 8, correctCount: 3, scorePercentage: 37 },
      { subjectId: 'fundos_inv', subjectName: 'Fundos de Investimento', totalQuestions: 10, correctCount: 7, scorePercentage: 70 },
      { subjectId: 'renda_fixa_var', subjectName: 'Instrumentos de Renda Fixa e Variável', totalQuestions: 10, correctCount: 7, scorePercentage: 70 },
      { subjectId: 'sfn_mercado', subjectName: 'Sistema Financeiro Nacional e Participantes', totalQuestions: 8, correctCount: 6, scorePercentage: 75 },
      { subjectId: 'previdencia', subjectName: 'Previdência Complementar Aberta', totalQuestions: 5, correctCount: 4, scorePercentage: 80 },
      { subjectId: 'risco_compliance', subjectName: 'Gestão de Risco, Compliance e PLD-FT', totalQuestions: 5, correctCount: 2, scorePercentage: 40 },
      { subjectId: 'economia_fin', subjectName: 'Conceitos de Economia e Finanças', totalQuestions: 4, correctCount: 2, scorePercentage: 50 }
    ]
  },
  {
    id: 'att-sim-06',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'FULL_EXAM',
    startedAt: '2026-10-13T10:00:00Z',
    finishedAt: '2026-10-13T12:12:00Z',
    durationSeconds: 7920,
    totalQuestions: 50,
    correctCount: 36,
    wrongCount: 14,
    unansweredCount: 0,
    scorePercentage: 72,
    passed: true,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 8, correctCount: 3, scorePercentage: 37 }, // Continua merecendo atenção!
      { subjectId: 'fundos_inv', subjectName: 'Fundos de Investimento', totalQuestions: 10, correctCount: 8, scorePercentage: 80 },
      { subjectId: 'renda_fixa_var', subjectName: 'Instrumentos de Renda Fixa e Variável', totalQuestions: 10, correctCount: 8, scorePercentage: 80 },
      { subjectId: 'sfn_mercado', subjectName: 'Sistema Financeiro Nacional e Participantes', totalQuestions: 8, correctCount: 7, scorePercentage: 87 },
      { subjectId: 'previdencia', subjectName: 'Previdência Complementar Aberta', totalQuestions: 5, correctCount: 4, scorePercentage: 80 },
      { subjectId: 'risco_compliance', subjectName: 'Gestão de Risco, Compliance e PLD-FT', totalQuestions: 5, correctCount: 3, scorePercentage: 60 },
      { subjectId: 'economia_fin', subjectName: 'Conceitos de Economia e Finanças', totalQuestions: 4, correctCount: 3, scorePercentage: 75 }
    ]
  },
  // 3 treinos de Matemática Financeira (histórico independente!)
  {
    id: 'att-tr-01',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'TARGETED_TRAINING',
    targetSubjectId: 'mat_fin',
    startedAt: '2026-10-07T18:00:00Z',
    finishedAt: '2026-10-07T18:42:00Z',
    durationSeconds: 2520,
    totalQuestions: 20,
    correctCount: 7,
    wrongCount: 13,
    unansweredCount: 0,
    scorePercentage: 35,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 20, correctCount: 7, scorePercentage: 35 }
    ]
  },
  {
    id: 'att-tr-02',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'TARGETED_TRAINING',
    targetSubjectId: 'mat_fin',
    startedAt: '2026-10-10T19:00:00Z',
    finishedAt: '2026-10-10T19:38:00Z',
    durationSeconds: 2280,
    totalQuestions: 20,
    correctCount: 9,
    wrongCount: 11,
    unansweredCount: 0,
    scorePercentage: 45,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 20, correctCount: 9, scorePercentage: 45 }
    ]
  },
  {
    id: 'att-tr-03',
    userId: 'user-rafael-01',
    examId: 'cpa',
    mode: 'TARGETED_TRAINING',
    targetSubjectId: 'mat_fin',
    startedAt: '2026-10-12T20:15:00Z',
    finishedAt: '2026-10-12T20:51:00Z',
    durationSeconds: 2160,
    totalQuestions: 20,
    correctCount: 10,
    wrongCount: 10,
    unansweredCount: 0,
    scorePercentage: 50,
    passed: false,
    answers: [],
    disciplineScores: [
      { subjectId: 'mat_fin', subjectName: 'Matemática Financeira', totalQuestions: 20, correctCount: 10, scorePercentage: 50 }
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-01',
    title: 'Primeiro Simulado Concluído',
    description: 'Completou a primeira prova completa de 50 questões.',
    icon: 'Flag',
    category: 'simulados',
    unlockedAt: '2026-09-20T16:15:00Z',
    progress: 1,
    maxProgress: 1,
    rewardPoints: 100
  },
  {
    id: 'ach-02',
    title: 'Maratona: 100 Questões',
    description: 'Respondeu a mais de 100 questões em simulados e treinos.',
    icon: 'CheckCircle2',
    category: 'desempenho',
    unlockedAt: '2026-09-27T12:05:00Z',
    progress: 360,
    maxProgress: 100,
    rewardPoints: 200
  },
  {
    id: 'ach-03',
    title: 'Hábito de Estudo: 5 Dias',
    description: 'Manteve atividade e estudos registrados por 5 dias.',
    icon: 'Calendar',
    category: 'constancia',
    unlockedAt: '2026-10-10T19:38:00Z',
    progress: 5,
    maxProgress: 5,
    rewardPoints: 150
  },
  {
    id: 'ach-04',
    title: 'Ritmo Imparável: 7 Dias Seguidos',
    description: 'Completou uma sequência de 7 dias consecutivos de dedicação.',
    icon: 'Flame',
    category: 'constancia',
    unlockedAt: '2026-10-14T10:00:00Z',
    progress: 7,
    maxProgress: 7,
    rewardPoints: 300
  },
  {
    id: 'ach-05',
    title: 'Grande Salto: +20 p.p.',
    description: 'Evoluiu seu rendimento em mais de 20 pontos percentuais desde a primeira tentativa.',
    icon: 'TrendingUp',
    category: 'desempenho',
    unlockedAt: '2026-10-13T12:12:00Z',
    progress: 28,
    maxProgress: 20,
    rewardPoints: 400
  },
  {
    id: 'ach-06',
    title: 'Mestre da Regulação',
    description: 'Alcance aproveitamento superior a 85% em Sistema Financeiro Nacional.',
    icon: 'ShieldCheck',
    category: 'disciplina',
    unlockedAt: '2026-10-13T12:12:00Z',
    progress: 87,
    maxProgress: 85,
    rewardPoints: 250
  },
  {
    id: 'ach-07',
    title: 'Superação em Matemática',
    description: 'Atinja 70% ou mais em um treino direcionado de Matemática Financeira.',
    icon: 'Calculator',
    category: 'disciplina',
    unlockedAt: null,
    progress: 50,
    maxProgress: 70,
    rewardPoints: 350
  },
  {
    id: 'ach-08',
    title: 'Aprovação com Folga (80%+)',
    description: 'Obtenha 80% ou mais de acertos em um simulado completo.',
    icon: 'Award',
    category: 'desempenho',
    unlockedAt: null,
    progress: 72,
    maxProgress: 80,
    rewardPoints: 500
  }
];

export const INITIAL_RANKINGS: RankingParticipant[] = [
  {
    id: 'rank-01',
    name: 'Carolina Mendes',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 84.5,
    completedSimulations: 9,
    engagementPoints: 2950,
    weeklyPoints: 620,
    monthlyPoints: 2100,
    rankWeekly: 1,
    rankMonthly: 1,
    rankOverall: 1,
    streakDays: 14
  },
  {
    id: 'rank-02',
    name: 'Lucas Brandão',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 79.0,
    completedSimulations: 8,
    engagementPoints: 2680,
    weeklyPoints: 540,
    monthlyPoints: 1950,
    rankWeekly: 2,
    rankMonthly: 2,
    rankOverall: 2,
    streakDays: 11
  },
  {
    id: 'rank-03',
    name: 'Beatriz Vasconcelos',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 76.5,
    completedSimulations: 7,
    engagementPoints: 2420,
    weeklyPoints: 510,
    monthlyPoints: 1780,
    rankWeekly: 3,
    rankMonthly: 4,
    rankOverall: 3,
    streakDays: 9
  },
  {
    id: 'user-rafael-01',
    name: 'Rafael Martins',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: true,
    exam: 'CPA',
    averageScore: 72.0, // Última nota
    completedSimulations: 6,
    engagementPoints: 2350,
    weeklyPoints: 480,
    monthlyPoints: 1650,
    rankWeekly: 4,
    rankMonthly: 3,
    rankOverall: 4,
    streakDays: 7
  },
  {
    id: 'rank-05',
    name: 'Thiago Alencar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 70.0,
    completedSimulations: 6,
    engagementPoints: 2180,
    weeklyPoints: 420,
    monthlyPoints: 1540,
    rankWeekly: 5,
    rankMonthly: 5,
    rankOverall: 5,
    streakDays: 6
  },
  {
    id: 'rank-06',
    name: 'Juliana Prado',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 68.5,
    completedSimulations: 5,
    engagementPoints: 1980,
    weeklyPoints: 390,
    monthlyPoints: 1420,
    rankWeekly: 6,
    rankMonthly: 6,
    rankOverall: 6,
    streakDays: 5
  },
  {
    id: 'rank-07',
    name: 'Rodrigo Siqueira',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 65.0,
    completedSimulations: 5,
    engagementPoints: 1840,
    weeklyPoints: 360,
    monthlyPoints: 1310,
    rankWeekly: 7,
    rankMonthly: 7,
    rankOverall: 7,
    streakDays: 4
  },
  {
    id: 'rank-08',
    name: 'Fernanda Lima',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 63.5,
    completedSimulations: 4,
    engagementPoints: 1690,
    weeklyPoints: 310,
    monthlyPoints: 1210,
    rankWeekly: 8,
    rankMonthly: 8,
    rankOverall: 8,
    streakDays: 4
  },
  {
    id: 'rank-09',
    name: 'Gabriel Nogueira',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 61.0,
    completedSimulations: 4,
    engagementPoints: 1520,
    weeklyPoints: 290,
    monthlyPoints: 1090,
    rankWeekly: 9,
    rankMonthly: 9,
    rankOverall: 9,
    streakDays: 3
  },
  {
    id: 'rank-10',
    name: 'Mariana Azevedo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: false,
    exam: 'CPA',
    averageScore: 59.5,
    completedSimulations: 4,
    engagementPoints: 1410,
    weeklyPoints: 240,
    monthlyPoints: 980,
    rankWeekly: 10,
    rankMonthly: 10,
    rankOverall: 10,
    streakDays: 2
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'Novo desafio diário liberado',
    message: '5 questões rápidas selecionadas para reforçar conceitos-chave de Fundos de Investimento e Renda Fixa.',
    date: 'Hoje, 08:30',
    read: false,
    category: 'alerta',
    actionPath: 'daily_challenge'
  },
  {
    id: 'notif-02',
    title: 'Você alcançou sua melhor nota!',
    message: 'Parabéns, Rafael! Seu último simulado atingiu 72% de acertos, superando os 70% mínimos para aprovação.',
    date: 'Ontem, 12:15',
    read: false,
    category: 'desempenho',
    actionPath: 'history'
  },
  {
    id: 'notif-03',
    title: 'Matemática Financeira precisa de atenção',
    message: 'Seu aproveitamento médio nesta matéria está em 35%. Recomendamos um treino focado de 20 questões.',
    date: '12 de Outubro',
    read: false,
    category: 'alerta',
    actionPath: 'training_mat_fin'
  },
  {
    id: 'notif-04',
    title: 'Conquista desbloqueada: Ritmo Imparável',
    message: 'Você completou 7 dias consecutivos de estudos! +300 pontos de engajamento creditados.',
    date: '11 de Outubro',
    read: true,
    category: 'conquista',
    actionPath: 'achievements'
  },
  {
    id: 'notif-05',
    title: 'Nova publicação no edital do exame',
    message: 'Guia editorial com os principais erros cometidos na prova e como evitar pegadinhas de tributação.',
    date: '09 de Outubro',
    read: true,
    category: 'conteudo',
    actionPath: 'updates'
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-01',
    title: 'Como dominar o Come-Cotas e a tributação de fundos sem decorar tabelas',
    category: 'Orientações de Estudo',
    summary: 'A lógica conceitual das alíquotas semestrais em maio e novembro e como diferenciar curto e longo prazo com clareza.',
    content: 'O mecanismo do come-cotas é um dos tópicos mais frequentes e cobrados nas provas de certificação financeira. Em essência, trata-se de uma antecipação semestral do Imposto de Renda realizada no último dia útil dos meses de maio e novembro. A alíquota aplicada na antecipação é sempre a menor do tipo de fundo: 15% para fundos de longo prazo (prazo médio dos títulos superior a 365 dias) e 20% para fundos de curto prazo. No momento do resgate, a instituição financeira calcula a alíquota regressiva devida em função do tempo real da aplicação e recolhe a diferença residual, ou conclui sem imposto adicional caso o prazo tenha atingido a faixa mínima.',
    date: '10 Out 2026',
    readTime: '4 min',
    examId: 'cpa',
    author: 'Prof. Carlos Eduardo (Bredi Exam Engine)'
  },
  {
    id: 'art-02',
    title: 'PGBL x VGBL: Os 3 critérios determinantes para orientar investidores',
    category: 'Dicas da Prova',
    summary: 'Entenda como o tipo de declaração (simplificada ou completa) e a renda tributável definem a escolha recomendada.',
    content: 'A principal pegadinha na prova reside na base de cálculo do imposto na fase de usufruto/resgate. No PGBL, o imposto incide sobre o total acumulado (principal + rendimentos), pois o investidor pôde deduzir até 12% da renda bruta anual na fase de aportes. No VGBL, o imposto recai única e exclusivamente sobre os rendimentos gerados.',
    date: '06 Out 2026',
    readTime: '5 min',
    examId: 'cpa',
    author: 'Equipe Pedagógica Bredi'
  },
  {
    id: 'art-03',
    title: 'Atualizações regulatórias do SFN e novas diretrizes de autorregulação',
    category: 'Alterações no Edital',
    summary: 'Revisão das competências normativas do CMN e regras de conduta para atendimento a investidores.',
    content: 'Fique atento: o Conselho Monetário Nacional (CMN) permanece como o órgão deliberativo máximo, enquanto o Banco Central e a CVM exercem os papéis fiscalizadores e executivos em seus respectivos âmbitos bancário e mobiliário.',
    date: '28 Set 2026',
    readTime: '6 min',
    examId: 'cpa',
    author: 'Coordenação Acadêmica'
  },
  {
    id: 'art-04',
    title: 'Cronograma sugerido: como sair dos 45% para os 75% em 4 semanas',
    category: 'Orientações de Estudo',
    summary: 'O método de estudo reverso com resolução dirigida de simulados e reforço direcionado de matérias críticas.',
    content: 'Estudar por questões com correção fundamentada reduz o tempo de retenção pela metade. Ao identificar lacunas em tópicos como Matemática Financeira, intercalar treinos direcionados de 20 questões permite ganho substancial de precisão.',
    date: '22 Set 2026',
    readTime: '7 min',
    examId: 'cpa',
    author: 'Bredi Tecnologia Digital'
  }
];

export const INITIAL_FEEDBACKS: TestimonialFeedback[] = [
  {
    id: 'fb-01',
    userName: 'Mariana Silveira',
    userRole: 'Aprovada no CPA · Especialista de Investimentos',
    rating: 5,
    comment: 'O motor de simulados com explicação detalhada em cada alternativa foi o diferencial para a minha aprovação. Saí de 51% para 82% em três semanas.',
    consentedToPublish: true,
    approvedForDisplay: true,
    createdAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'fb-02',
    userName: 'Henrique Barreto',
    userRole: 'Gerente de Contas PJ',
    rating: 5,
    comment: 'A identificação das disciplinas mais fracas e os treinos direcionados economizaram semanas de estudo desnecessário. Excelente metodologia.',
    consentedToPublish: true,
    approvedForDisplay: true,
    createdAt: '2026-09-29T14:30:00Z'
  },
  {
    id: 'fb-03',
    userName: 'Aline Nogueira',
    userRole: 'Assessora de Investimentos',
    rating: 5,
    comment: 'A interface sem poluição visual e o cronômetro realista deram toda a segurança necessária para o dia da prova.',
    consentedToPublish: true,
    approvedForDisplay: true,
    createdAt: '2026-10-05T16:00:00Z'
  }
];

export const INITIAL_APP_STATE: AppStateData = {
  version: 1,
  user: {
    id: 'user-rafael-01',
    name: 'Rafael Martins',
    email: 'rafael.martins@exemplo.com.br',
    plan: 'Pro', // Conforme especificação: Rafael Martins, Exame CPA, Plano Pro
    selectedExamId: 'cpa',
    consecutiveDays: 7, // 7 dias de atividade consecutiva
    lastActiveDate: '2026-10-14',
    engagementPoints: 2350,
    targetExamDate: '2026-11-20',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  },
  examRules: INITIAL_EXAM_RULES,
  subjects: INITIAL_SUBJECTS,
  questions: INITIAL_QUESTIONS,
  attempts: SEED_ATTEMPTS,
  activeSession: null,
  dailyActivities: {
    '2026-10-08': { date: '2026-10-08', checkedIn: true, challengeCompleted: true, challengeScore: 4, simulationsCompleted: 0, questionsAnswered: 5 },
    '2026-10-09': { date: '2026-10-09', checkedIn: true, challengeCompleted: false, simulationsCompleted: 1, questionsAnswered: 50 },
    '2026-10-10': { date: '2026-10-10', checkedIn: true, challengeCompleted: true, challengeScore: 5, simulationsCompleted: 0, questionsAnswered: 25 },
    '2026-10-11': { date: '2026-10-11', checkedIn: true, challengeCompleted: true, challengeScore: 4, simulationsCompleted: 0, questionsAnswered: 5 },
    '2026-10-12': { date: '2026-10-12', checkedIn: true, challengeCompleted: false, simulationsCompleted: 0, questionsAnswered: 20 },
    '2026-10-13': { date: '2026-10-13', checkedIn: true, challengeCompleted: true, challengeScore: 5, simulationsCompleted: 1, questionsAnswered: 55 },
    '2026-10-14': { date: '2026-10-14', checkedIn: true, challengeCompleted: false, simulationsCompleted: 0, questionsAnswered: 0 } // Atividade de hoje
  },
  achievements: INITIAL_ACHIEVEMENTS,
  rankings: INITIAL_RANKINGS,
  notifications: INITIAL_NOTIFICATIONS,
  notificationPreferences: {
    emailStudyReminders: true,
    emailPerformanceReports: true,
    inAppAlerts: true,
    pushSimulation: false
  },
  feedbacks: INITIAL_FEEDBACKS,
  articles: INITIAL_ARTICLES,
  newsletterSubscribed: false,
  feedbackDismissed: false
};
