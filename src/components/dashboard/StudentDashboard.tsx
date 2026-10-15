import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Award, 
  Flame, 
  Zap, 
  ArrowRight, 
  RotateCcw, 
  Calendar, 
  HelpCircle, 
  Sparkles,
  Trophy,
  BookOpen,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { AppStateData, Attempt, Subject } from '../../types';
import { StorageService } from '../../services/storageService';
import { ScoreCriteriaBadge } from '../common/ScoreCriteriaBadge';
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  appState: AppStateData;
  onStartExam: (mode: 'FULL_EXAM' | 'TARGETED_TRAINING' | 'ERROR_REVIEW', targetSubjectId?: string) => void;
  onOpenDailyChallenge: () => void;
  onOpenUpgradeModal: (feature: string) => void;
  onNavigate: (view: string) => void;
  onShareProgress: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  appState,
  onStartExam,
  onOpenDailyChallenge,
  onOpenUpgradeModal,
  onNavigate,
  onShareProgress
}) => {
  const { user, attempts, examRules, subjects, achievements, rankings, dailyActivities } = appState;
  const examRule = examRules[user.selectedExamId] || examRules['cpa'];

  // State for chart filter
  const [chartMode, setChartMode] = useState<'FULL_EXAM' | 'ALL'>('FULL_EXAM');
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<Subject | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);

  // Filter attempts
  const fullExamAttempts = attempts.filter(a => a.mode === 'FULL_EXAM');
  const trainingAttempts = attempts.filter(a => a.mode === 'TARGETED_TRAINING');

  // Stats calculation
  const lastAttempt = fullExamAttempts.length > 0 ? fullExamAttempts[fullExamAttempts.length - 1] : null;
  const firstAttempt = fullExamAttempts.length > 0 ? fullExamAttempts[0] : null;

  const lastScore = lastAttempt ? lastAttempt.scorePercentage : 0;
  const firstScore = firstAttempt ? firstAttempt.scorePercentage : 0;
  const evolutionPoints = lastAttempt && firstAttempt ? lastScore - firstScore : 0;
  const bestScore = fullExamAttempts.length > 0 
    ? Math.max(...fullExamAttempts.map(a => a.scorePercentage)) 
    : 0;

  // Today's activity check
  const todayKey = new Date().toISOString().split('T')[0];
  const todayActivity = dailyActivities[todayKey];
  const hasCheckedInToday = todayActivity?.checkedIn || false;
  const hasCompletedChallengeToday = todayActivity?.challengeCompleted || false;

  // Chart data preparation
  const chartAttempts = chartMode === 'FULL_EXAM' ? fullExamAttempts : attempts;
  const evolutionChartData = chartAttempts.map((att, idx) => ({
    name: att.mode === 'FULL_EXAM' ? `Simulado ${idx + 1}` : `Treino`,
    date: new Date(att.startedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    score: att.scorePercentage,
    passingScore: examRule.passingScorePercentage,
    mode: att.mode
  }));

  // Discipline aggregated performance from latest attempts
  const disciplineStats = subjects.map(subject => {
    // Find all questions answered for this subject across all attempts
    let totalQuestions = 0;
    let correctCount = 0;

    attempts.forEach(att => {
      const disc = att.disciplineScores.find(d => d.subjectId === subject.id);
      if (disc) {
        totalQuestions += disc.totalQuestions;
        correctCount += disc.correctCount;
      }
    });

    // Default fallback if no data recorded yet
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 40;

    return {
      subject,
      totalQuestions: totalQuestions || 28,
      correctCount: correctCount || Math.round((totalQuestions || 28) * (accuracy / 100)),
      accuracy
    };
  });

  // Sort discipline by accuracy ascending so weakest discipline is first
  const sortedDisciplines = [...disciplineStats].sort((a, b) => a.accuracy - b.accuracy);
  const weakestDiscipline = sortedDisciplines[0];

  // Daily check-in handler
  const handleCheckIn = () => {
    const res = StorageService.performDailyCheckIn();
    setCheckInStatus(res.message);
    if (res.success) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }
    setTimeout(() => setCheckInStatus(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Student Greeting & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Olá, {user.name}!
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Plano {user.plan}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Preparação para o exame <span className="font-semibold text-zinc-800">{examRule.shortName}</span> · Foco em consolidação e aprovação.
          </p>
        </div>

        {/* Action button to share card */}
        <div className="flex items-center gap-2">
          <button
            onClick={onShareProgress}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Card de Evolução (+{evolutionPoints} p.p.)</span>
          </button>

          <button
            onClick={() => onStartExam('FULL_EXAM')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span>Iniciar Novo Simulado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Primary Recommendation Card ("Seu próximo passo") */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/50 rounded-2xl p-5 border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  Seu próximo passo recomendado
                </span>
                <span className="text-xs text-zinc-400">·</span>
                <span className="text-xs text-zinc-500">Baseado no seu histórico de tentativas</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-zinc-900 mt-1.5">
                Seu desempenho está evoluindo, mas <span className="text-amber-800 underline decoration-amber-300 decoration-2 font-bold">{weakestDiscipline?.subject.name || 'Matemática Financeira'}</span> merece atenção imediata.
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Aproveitamento atual de {weakestDiscipline?.accuracy || 35}%. Recomendamos um treino direcionado de 20 questões para consolidar conceitos essenciais de cálculo e taxas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                if (user.plan === 'Free') {
                  onOpenUpgradeModal('Treino Direcionado de Matemática');
                } else {
                  onStartExam('TARGETED_TRAINING', weakestDiscipline?.subject.id || 'mat_fin');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Treinar agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Four Compact Indicator Cards (Key metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Última nota */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Última Nota</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{lastScore}%</span>
            <span className={`text-[11px] font-semibold ${lastScore >= examRule.passingScorePercentage ? 'text-emerald-700' : 'text-amber-600'}`}>
              {lastScore >= examRule.passingScorePercentage ? 'Aprovado' : 'Abaixo do corte'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Corte do exame: {examRule.passingScorePercentage}%
          </div>
        </div>

        {/* Card 2: Evolução desde o 1º simulado */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Evolução Geral</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">+{evolutionPoints} p.p.</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            De <span className="font-semibold text-zinc-700">{firstScore}%</span> para <span className="font-semibold text-zinc-700">{lastScore}%</span>
          </div>
        </div>

        {/* Card 3: Quantidade de simulados completos */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Simulados Completos</span>
            <BookOpen className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{fullExamAttempts.length}</span>
            <span className="text-xs text-zinc-500 font-medium">concluídos</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            + {trainingAttempts.length} treinos direcionados
          </div>
        </div>

        {/* Card 4: Melhor nota */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Melhor Nota</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{bestScore}%</span>
            <span className="text-[11px] font-semibold text-emerald-700">Recorde pessoal</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Meta pessoal: 80%
          </div>
        </div>
      </div>

      {/* 4. Evolution Chart & Gamification Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Evolução do Rendimento</h2>
              <p className="text-xs text-zinc-500">Histórico de pontuação ao longo das tentativas</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg self-start sm:self-auto text-xs">
              <button
                onClick={() => setChartMode('FULL_EXAM')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  chartMode === 'FULL_EXAM'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Apenas Simulados Completos
              </button>
              <button
                onClick={() => setChartMode('ALL')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  chartMode === 'ALL'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Todas as Provas & Treinos
              </button>
            </div>
          </div>

          {/* Recharts Line Chart */}
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  ticks={[0, 25, 50, 70, 100]}
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  formatter={(val: any) => [`${val}% de acertos`, 'Nota obtida']}
                />
                {/* Approval Line Reference */}
                <ReferenceLine 
                  y={examRule.passingScorePercentage} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  label={{ value: `Corte ${examRule.passingScorePercentage}%`, fill: '#059669', fontSize: 10, position: 'insideTopLeft' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#059669" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#047857' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Sua nota na tentativa</span>
              <span className="text-zinc-300">·</span>
              <span className="w-4 h-0.5 border-t border-dashed border-emerald-500 inline-block" />
              <span>Linha de aprovação ({examRule.passingScorePercentage}%)</span>
            </div>
            <span className="font-medium text-emerald-700">Crescimento contínuo</span>
          </div>
        </div>

        {/* Gamification & Quick Stats (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Engajamento & Hábitos</h2>
            <p className="text-xs text-zinc-500">Constância diária na preparação</p>
          </div>

          <div className="space-y-3">
            {/* Streak card */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">{user.consecutiveDays} Dias Consecutivos</h4>
                  <p className="text-[11px] text-zinc-600">Ritmo excelente de consistência</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Ativo
              </span>
            </div>

            {/* Ranking Position */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-700 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">4º Lugar no Ranking Geral</h4>
                  <p className="text-[11px] text-zinc-600">Top 5 entre os participantes da CPA</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('ranking')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Ver Ranking
              </button>
            </div>

            {/* Next Achievement progress */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-zinc-800">Próxima Conquista</span>
                <span className="text-[11px] text-zinc-500">72% / 80%</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: '90%' }} />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                <strong className="text-zinc-700">Aprovação com Folga (80%+)</strong> · Faltam apenas 8 pontos percentuais.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Pontos acumulados:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              {user.engagementPoints} pts
            </span>
          </div>
        </div>
      </div>

      {/* 5. Desempenho por Disciplina (Horizontal Bars with modal detail) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Desempenho por Disciplina</h2>
            <p className="text-xs text-zinc-500">
              Clique em qualquer disciplina para ver seus tópicos e iniciar treinos específicos.
            </p>
          </div>
          <div className="text-xs text-zinc-400">
            Mínimo recomendado por disciplina: 50%
          </div>
        </div>

        <div className="space-y-4">
          {disciplineStats.map(({ subject, totalQuestions, correctCount, accuracy }) => {
            const isCritical = accuracy < 50;
            const isGood = accuracy >= 70;

            return (
              <div
                key={subject.id}
                onClick={() => setSelectedSubjectDetail(subject)}
                className="group p-3.5 rounded-xl border border-zinc-200/70 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-800 group-hover:text-emerald-800 transition-colors">
                      {subject.name}
                    </span>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs text-zinc-500">{correctCount} de {totalQuestions} acertos</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isGood 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isCritical 
                        ? 'bg-rose-100 text-rose-800 font-bold' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {accuracy}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isGood ? 'bg-emerald-600' : isCritical ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Atividades de Hoje (Ações Rápidas) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Atividades de Hoje</h2>
            <p className="text-xs text-zinc-500">Mantenha seu ritmo de estudos diário ativo</p>
          </div>
          {checkInStatus && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 animate-in fade-in">
              {checkInStatus}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: Check-in */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-700">Check-in Diário</span>
                <Calendar className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                {hasCheckedInToday 
                  ? 'Check-in de hoje já foi registrado com sucesso!' 
                  : 'Confirme sua presença hoje para garantir sua sequência e +50 pontos.'}
              </p>
            </div>
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedInToday}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                hasCheckedInToday
                  ? 'bg-zinc-200 text-zinc-500 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{hasCheckedInToday ? 'Presença Confirmada' : 'Fazer Check-in'}</span>
            </button>
          </div>

          {/* Action 2: Desafio do Dia */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-700">Desafio do Dia</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                {hasCompletedChallengeToday
                  ? 'Desafio diário já respondido hoje! Excelente dedicação.'
                  : '5 questões selecionadas para revisão expressa em menos de 5 minutos.'}
              </p>
            </div>
            <button
              onClick={onOpenDailyChallenge}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasCompletedChallengeToday ? 'Refazer Desafio' : 'Responder Desafio'}</span>
            </button>
          </div>

          {/* Action 3: Revisar Erros */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-700">Revisar Questões Erradas</span>
                <RotateCcw className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                Foco no banco personalizado de questões que você errou nos simulados anteriores.
              </p>
            </div>
            <button
              onClick={() => {
                if (user.plan === 'Free') {
                  onOpenUpgradeModal('Modo Revisar Meus Erros');
                } else {
                  onStartExam('ERROR_REVIEW');
                }
              }}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Revisar Meus Erros</span>
            </button>
          </div>

          {/* Action 4: Simulado Completo */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-700">Simulado CPA Completo</span>
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                Prova de 50 questões com cronômetro real de 150 minutos e nota oficial calculada.
              </p>
            </div>
            <button
              onClick={() => onStartExam('FULL_EXAM')}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Novo Simulado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject Detail Modal */}
      {selectedSubjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 relative">
            <button
              onClick={() => setSelectedSubjectDetail(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Detalhamento Pedagógico
            </span>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">{selectedSubjectDetail.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Peso estimado na prova: {selectedSubjectDetail.weightPercentage}% do conteúdo.
            </p>

            <div className="my-4">
              <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Principais Assuntos Cobrados:
              </h4>
              <ul className="space-y-1.5">
                {selectedSubjectDetail.topics.map((t, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs text-zinc-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                onClick={() => setSelectedSubjectDetail(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const sId = selectedSubjectDetail.id;
                  setSelectedSubjectDetail(null);
                  if (user.plan === 'Free') {
                    onOpenUpgradeModal(`Treino de ${selectedSubjectDetail.name}`);
                  } else {
                    onStartExam('TARGETED_TRAINING', sId);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>Iniciar Treino Desta Disciplina (20 Questões)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
