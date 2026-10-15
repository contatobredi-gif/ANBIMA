import React, { useState } from 'react';
import { 
  Attempt, 
  ExamRule, 
  Question 
} from '../../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Share2, 
  ChevronRight, 
  TrendingUp, 
  Award, 
  AlertCircle,
  Filter,
  Sparkles
} from 'lucide-react';
import { ScoreCriteriaBadge } from '../common/ScoreCriteriaBadge';

interface ExamResultViewProps {
  attempt: Attempt;
  examRule: ExamRule;
  previousAttempt?: Attempt;
  bestScoreOverall: number;
  allQuestions: Question[];
  onStartTraining: (subjectId: string) => void;
  onBackToDashboard: () => void;
  onOpenShareModal: () => void;
  onNewSimulation: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  examRule,
  previousAttempt,
  bestScoreOverall,
  allQuestions,
  onStartTraining,
  onBackToDashboard,
  onOpenShareModal,
  onNewSimulation
}) => {
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'UNANSWERED'>('ALL');

  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const questionSnapshots = attempt.questionSnapshots || allQuestions;
  const snapshotMap = new Map(questionSnapshots.map(q => [q.id, q]));

  // Donut data
  const donutData = [
    { name: 'Acertos', value: attempt.correctCount, color: '#059669' }, // emerald-600
    { name: 'Erros', value: attempt.wrongCount, color: '#e11d48' },   // rose-600
    { name: 'Não Respondidas', value: attempt.unansweredCount, color: '#a1a1aa' } // zinc-400
  ].filter(d => d.value > 0);

  // Time formatted
  const minutes = Math.floor(attempt.durationSeconds / 60);
  const seconds = attempt.durationSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  // Comparison with previous
  const prevDiff = previousAttempt ? attempt.scorePercentage - previousAttempt.scorePercentage : null;

  // Weakest discipline
  const sortedDisciplines = [...attempt.disciplineScores].sort((a, b) => a.scorePercentage - b.scorePercentage);
  const weakest = sortedDisciplines[0];

  // Filtered answers for review
  const filteredAnswers = attempt.answers.filter(ans => {
    if (reviewFilter === 'ALL') return true;
    if (reviewFilter === 'CORRECT') return ans.isCorrect;
    if (reviewFilter === 'WRONG') return !ans.isCorrect && ans.selectedOptionIndex !== null;
    if (reviewFilter === 'UNANSWERED') return ans.selectedOptionIndex === null;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              {attempt.mode === 'FULL_EXAM' ? 'Resultado do Simulado Completo' : 'Resultado do Treino'}
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-mono">
              {new Date(attempt.finishedAt).toLocaleDateString('pt-BR')} às {new Date(attempt.finishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Análise de Desempenho
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Compartilhar Conquista</span>
          </button>

          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Voltar ao Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Score & Approval Criteria Component */}
      <ScoreCriteriaBadge scorePercentage={attempt.scorePercentage} rule={examRule} />

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block mb-1">Nota Final</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">{attempt.scorePercentage}%</span>
            <span className="text-xs text-zinc-500">({attempt.correctCount}/{attempt.totalQuestions})</span>
          </div>
          <span className={`text-[11px] font-semibold block mt-1 ${attempt.passed ? 'text-emerald-700' : 'text-amber-600'}`}>
            {attempt.passed ? 'Critério atingido' : 'Meta não atingida'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block mb-1">Comparação Anterior</span>
          <div className="flex items-baseline gap-2">
            {prevDiff !== null ? (
              <>
                <span className={`text-3xl font-extrabold ${prevDiff >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {prevDiff >= 0 ? `+${prevDiff}` : prevDiff} p.p.
                </span>
                <span className="text-xs text-zinc-400">vs anterior</span>
              </>
            ) : (
              <span className="text-xl font-bold text-zinc-700">Primeiro simulado</span>
            )}
          </div>
          <span className="text-[11px] text-zinc-400 block mt-1">Evolução contínua</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block mb-1">Tempo de Prova</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-mono">{timeFormatted}</span>
          </div>
          <span className="text-[11px] text-zinc-400 block mt-1">
            Média de {Math.round(attempt.durationSeconds / (attempt.totalQuestions || 1))}s por questão
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 block mb-1">Recorde Pessoal</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">{bestScoreOverall}%</span>
            <span className="text-xs text-amber-600 font-semibold">Melhor nota</span>
          </div>
          <span className="text-[11px] text-zinc-400 block mt-1">No exame {examRule.shortName}</span>
        </div>
      </div>

      {/* Visual Diagnostic Banner */}
      {weakest && weakest.scorePercentage < 60 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Diagnóstico de Reforço Imediato
              </span>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 mt-1">
                Você acertou {weakest.scorePercentage}% das questões de {weakest.subjectName}.
              </h4>
              <p className="text-xs text-zinc-600 mt-0.5">
                Esta foi a disciplina com menor aproveitamento nesta prova ({weakest.correctCount} acertos em {weakest.totalQuestions} questões).
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartTraining(weakest.subjectId)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex-shrink-0"
          >
            <span>Treinar {weakest.subjectName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts Section: Donut + Discipline Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Distribuição das Questões</h3>
            <p className="text-xs text-zinc-500">Balanço entre acertos, erros e omissões</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} questão(ões)`, '']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-zinc-900">{attempt.scorePercentage}%</span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Aproveitamento</span>
            </div>
          </div>

          <div className="flex items-center justify-around pt-3 border-t border-zinc-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-zinc-700 font-medium">{attempt.correctCount} Acertos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600" />
              <span className="text-zinc-700 font-medium">{attempt.wrongCount} Erros</span>
            </div>
            {attempt.unansweredCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-400" />
                <span className="text-zinc-700 font-medium">{attempt.unansweredCount} Em branco</span>
              </div>
            )}
          </div>
        </div>

        {/* Discipline Bars */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-900">Aproveitamento por Disciplina</h3>
            <p className="text-xs text-zinc-500">Percentual de acertos em cada área da prova</p>
          </div>

          <div className="h-60 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={attempt.disciplineScores} 
                layout="vertical"
                margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis 
                  type="category" 
                  dataKey="subjectName" 
                  width={140} 
                  tick={{ fontSize: 11, fill: '#3f3f46' }}
                  tickFormatter={(val: string) => val.length > 20 ? `${val.substring(0, 18)}...` : val}
                />
                <Tooltip 
                  formatter={(val: any) => [`${val}% de acertos`, 'Desempenho']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="scorePercentage" 
                  radius={[0, 4, 4, 0]}
                  fill="#059669"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Matriz Visual por Assunto (Topic Matrix) */}
      {attempt.topicScores && attempt.topicScores.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-900">Matriz de Domínio por Assunto</h3>
            <p className="text-xs text-zinc-500">Mapeamento granular dos conteúdos cobrados nesta tentativa</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attempt.topicScores.map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold truncate">
                    {t.subjectName}
                  </span>
                  <span className="text-xs font-bold text-zinc-900 block mt-0.5">
                    {t.topic}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">
                    {t.correct}/{t.total} acertos
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    t.scorePercentage >= 70 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : t.scorePercentage >= 50 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {t.scorePercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Review Section with Explanations */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 mb-6">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Revisão Detalhada das Questões</h2>
            <p className="text-xs text-zinc-500">Confira o gabarito oficial e as justificativas pedagógicas</p>
          </div>

          {/* Review Filter */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setReviewFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                reviewFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todas ({attempt.totalQuestions})
            </button>
            <button
              onClick={() => setReviewFilter('CORRECT')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                reviewFilter === 'CORRECT' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Acertos ({attempt.correctCount})
            </button>
            <button
              onClick={() => setReviewFilter('WRONG')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                reviewFilter === 'WRONG' ? 'bg-white text-rose-800 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Erros ({attempt.wrongCount})
            </button>
            {attempt.unansweredCount > 0 && (
              <button
                onClick={() => setReviewFilter('UNANSWERED')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'UNANSWERED' ? 'bg-white text-zinc-800 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Em branco ({attempt.unansweredCount})
              </button>
            )}
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {filteredAnswers.map((ans, idx) => {
            const question = snapshotMap.get(ans.questionId) || questionMap.get(ans.questionId);
            if (!question) return null;

            const isUnanswered = ans.selectedOptionIndex === null || ans.selectedOptionIndex === undefined;
            const isCorrect = ans.isCorrect;

            return (
              <div 
                key={ans.questionId}
                className={`p-5 rounded-xl border transition-all ${
                  isCorrect 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : isUnanswered 
                    ? 'border-zinc-200 bg-zinc-50/40' 
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-zinc-700 bg-white px-2 py-0.5 rounded border border-zinc-200">
                      Questão {idx + 1}
                    </span>
                    <span className="text-zinc-400">·</span>
                    <span className="font-semibold text-zinc-800">{question.subjectName}</span>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-500">{question.topic}</span>
                  </div>

                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acertou
                    </span>
                  ) : isUnanswered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 bg-zinc-200 px-2.5 py-0.5 rounded">
                      Não Respondida
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded">
                      <XCircle className="w-3.5 h-3.5" /> Errou
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed mb-4">
                  {question.stem}
                </p>

                {/* Alternatives */}
                <div className="space-y-2 mb-4">
                  {question.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isUserPick = ans.selectedOptionIndex === oIdx;
                    const isGabarito = question.correctOptionIndex === oIdx;

                    let optClass = 'bg-white border-zinc-200 text-zinc-700';
                    if (isGabarito) {
                      optClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-500';
                    } else if (isUserPick && !isCorrect) {
                      optClass = 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-400';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-3 ${optClass}`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isGabarito ? 'bg-emerald-600 text-white' : isUserPick && !isCorrect ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {letter}
                        </span>
                        <div className="flex-1">
                          <span>{opt}</span>
                          {isGabarito && (
                            <span className="ml-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                              (Resposta Correta)
                            </span>
                          )}
                          {isUserPick && !isCorrect && (
                            <span className="ml-2 text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                              (Sua Escolha)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3.5 bg-white rounded-lg border border-zinc-200/90 text-xs text-zinc-700 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Justificativa e Fundamentação:</span>
                  </div>
                  <p>{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
