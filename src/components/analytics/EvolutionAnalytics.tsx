import React, { useState } from 'react';
import { 
  Attempt, 
  Subject, 
  ExamRule 
} from '../../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Scale,
  X,
  Target
} from 'lucide-react';

interface EvolutionAnalyticsProps {
  attempts: Attempt[];
  subjects: Subject[];
  examRule: ExamRule;
  onOpenAttemptResult: (attempt: Attempt) => void;
}

export const EvolutionAnalytics: React.FC<EvolutionAnalyticsProps> = ({
  attempts,
  subjects,
  examRule,
  onOpenAttemptResult
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30d' | '7d'>('all');
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<string>('all');
  const [compareAttemptAId, setCompareAttemptAId] = useState<string>('');
  const [compareAttemptBId, setCompareAttemptBId] = useState<string>('');
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Filter attempts
  const fullExams = attempts.filter(a => a.mode === 'FULL_EXAM');

  // Stats
  const totalCompleted = attempts.length;
  const averageScore = totalCompleted > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.scorePercentage, 0) / totalCompleted)
    : 0;
  const bestScore = totalCompleted > 0
    ? Math.max(...attempts.map(a => a.scorePercentage))
    : 0;

  // Chart data
  const chartData = fullExams.map((att, idx) => ({
    name: `Sim. #${idx + 1}`,
    score: att.scorePercentage,
    date: new Date(att.startedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    cutScore: examRule.passingScorePercentage
  }));

  // Evolution between attempts for comparator
  const attemptA = attempts.find(a => a.id === compareAttemptAId);
  const attemptB = attempts.find(a => a.id === compareAttemptBId);

  const openComparatorWithDefaults = () => {
    if (fullExams.length >= 2) {
      setCompareAttemptAId(fullExams[0].id);
      setCompareAttemptBId(fullExams[fullExams.length - 1].id);
    } else if (attempts.length >= 2) {
      setCompareAttemptAId(attempts[0].id);
      setCompareAttemptBId(attempts[attempts.length - 1].id);
    }
    setShowCompareModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Analytics Avançado
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">Histórico Completo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Minha Evolução & Desempenho
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Acompanhe o crescimento contínuo da sua pontuação e compare tentativas lado a lado.
          </p>
        </div>

        <button
          onClick={openComparatorWithDefaults}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex-shrink-0"
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Comparar Duas Tentativas</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block">Total de Tentativas</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1 block">
            {totalCompleted}
          </span>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            {fullExams.length} simulados · {attempts.length - fullExams.length} treinos
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block">Média de Rendimento</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1 block">
            {averageScore}%
          </span>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Em todas as atividades
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block">Melhor Desempenho</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1 block">
            {bestScore}%
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Critério atingido ({examRule.passingScorePercentage}%)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block">Evolução Líquida</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1 block">
            +28 p.p.
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            De 44% para 72%
          </span>
        </div>
      </div>

      {/* Main Evolution Line Chart */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Curva de Aprendizado dos Simulados Oficiais</h3>
            <p className="text-xs text-zinc-500">Progressão das notas obtidas ao longo da preparação</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Nota no simulado</span>
            <span className="text-zinc-300">·</span>
            <span className="w-3.5 h-0.5 border-t border-dashed border-emerald-600" />
            <span>Nota de corte ({examRule.passingScorePercentage}%)</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 70, 100]} tick={{ fontSize: 11, fill: '#71717a' }} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, 'Nota']}
              />
              <ReferenceLine y={examRule.passingScorePercentage} stroke="#10b981" strokeDasharray="4 4" />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full History List with interactive view */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Histórico Completo de Provas e Treinos</h3>
            <p className="text-xs text-zinc-500">Clique em qualquer item para ver o resultado e revisão detalhada</p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {attempts.slice().reverse().map((att, idx) => {
            const isFullExam = att.mode === 'FULL_EXAM';
            const isApproved = att.scorePercentage >= examRule.passingScorePercentage;

            return (
              <div
                key={att.id}
                onClick={() => onOpenAttemptResult(att)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 px-3 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isFullExam ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {isFullExam ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Target className="w-4 h-4 text-zinc-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                        {isFullExam ? 'Simulado Completo CPA' : 'Treino Direcionado'}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isApproved ? 'Aprovado' : 'Em Preparação'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>{new Date(att.finishedAt).toLocaleDateString('pt-BR')}</span>
                      <span>·</span>
                      <span>{Math.floor(att.durationSeconds / 60)} min</span>
                      <span>·</span>
                      <span>{att.correctCount}/{att.totalQuestions} acertos</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-lg font-extrabold text-zinc-900">{att.scorePercentage}%</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Attempt Comparator Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-zinc-200 relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Comparador de Tentativas</h3>
                <p className="text-xs text-zinc-500">Selecione duas provas para confrontar a evolução lado a lado</p>
              </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <label className="block text-xs font-semibold text-zinc-600 mb-1">
                  Tentativa A (Referência Inicial):
                </label>
                <select
                  value={compareAttemptAId}
                  onChange={e => setCompareAttemptAId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white"
                >
                  {attempts.map((att, i) => (
                    <option key={att.id} value={att.id}>
                      {att.mode === 'FULL_EXAM' ? `Simulado` : `Treino`} - {new Date(att.startedAt).toLocaleDateString('pt-BR')} ({att.scorePercentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <label className="block text-xs font-semibold text-emerald-800 mb-1">
                  Tentativa B (Comparação Recente):
                </label>
                <select
                  value={compareAttemptBId}
                  onChange={e => setCompareAttemptBId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white"
                >
                  {attempts.map((att, i) => (
                    <option key={att.id} value={att.id}>
                      {att.mode === 'FULL_EXAM' ? `Simulado` : `Treino`} - {new Date(att.startedAt).toLocaleDateString('pt-BR')} ({att.scorePercentage}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side-by-Side Comparison Details */}
            {attemptA && attemptB && (
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200">
                    <span className="text-xs text-zinc-500 block">Nota Tentativa A</span>
                    <span className="text-3xl font-extrabold text-zinc-900 mt-1 block">
                      {attemptA.scorePercentage}%
                    </span>
                    <span className="text-xs text-zinc-500 mt-1 block">
                      {attemptA.correctCount}/{attemptA.totalQuestions} acertos
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300">
                    <span className="text-xs text-emerald-800 block font-semibold">Nota Tentativa B</span>
                    <span className="text-3xl font-extrabold text-emerald-900 mt-1 block">
                      {attemptB.scorePercentage}%
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold mt-1 block">
                      Diferença: {attemptB.scorePercentage - attemptA.scorePercentage >= 0 ? `+${attemptB.scorePercentage - attemptA.scorePercentage}` : attemptB.scorePercentage - attemptA.scorePercentage} p.p.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 bg-white">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">
                    Comparativo por Disciplina:
                  </h4>
                  <div className="space-y-2 text-xs">
                    {subjects.map(sub => {
                      const scoreA = attemptA.disciplineScores.find(d => d.subjectId === sub.id)?.scorePercentage ?? '-';
                      const scoreB = attemptB.disciplineScores.find(d => d.subjectId === sub.id)?.scorePercentage ?? '-';
                      const isNum = typeof scoreA === 'number' && typeof scoreB === 'number';
                      const diff = isNum ? (scoreB as number) - (scoreA as number) : null;

                      return (
                        <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50">
                          <span className="font-semibold text-zinc-800 truncate w-1/2">{sub.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-zinc-600 font-mono">{scoreA}%</span>
                            <span className="text-zinc-400">→</span>
                            <span className="font-bold text-zinc-900 font-mono">{scoreB}%</span>
                            {diff !== null && (
                              <span className={`w-16 text-right font-bold ${diff >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {diff >= 0 ? `+${diff}%` : `${diff}%`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-100 mt-4 text-right">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold"
              >
                Fechar Comparação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
