import React from 'react';
import { 
  Attempt, 
  ExamRule, 
  PlanType,
  ExamId 
} from '../../types';
import { 
  FileCheck2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Lock,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ScoreCriteriaBadge } from '../common/ScoreCriteriaBadge';
import { AccessControlService } from '../../services/accessControlService';

interface SimuladosHomeProps {
  attempts: Attempt[];
  examRule: ExamRule;
  plan: PlanType;
  onStartSimulation: () => void;
  onOpenAttemptResult: (attempt: Attempt) => void;
  onOpenUpgradeModal: (feature: string, examId?: ExamId) => void;
}

export const SimuladosHome: React.FC<SimuladosHomeProps> = ({
  attempts,
  examRule,
  plan,
  onStartSimulation,
  onOpenAttemptResult,
  onOpenUpgradeModal
}) => {
  const fullSimulations = attempts.filter(a => a.mode === 'FULL_EXAM' && a.examId === examRule.examId);
  const isPro = AccessControlService.isPro(examRule.examId);
  const isFreePlan = !isPro;
  const accessCheck = AccessControlService.canStartSimulation(examRule.examId);
  const hasReachedFreeLimit = !accessCheck.allowed;

  const handleStart = () => {
    if (hasReachedFreeLimit) {
      onOpenUpgradeModal('Simulados Completos Ilimitados', examRule.examId);
    } else {
      onStartSimulation();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
              {examRule.shortName}
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {isPro ? 'Plano Pro' : 'Plano Free'}
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">{examRule.totalQuestions} questões · {examRule.durationMinutes} minutos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Simulados Oficiais Completos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Experiência fiel ao exame: cronômetro oficial regressivo, correção automatizada e matriz diagnóstica por disciplina.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex-shrink-0"
        >
          {hasReachedFreeLimit ? <Lock className="w-4 h-4" /> : <FileCheck2 className="w-4 h-4" />}
          <span>{hasReachedFreeLimit ? `Liberar Simulados (${examRule.shortName} Pro)` : 'Iniciar Novo Simulado'}</span>
        </button>
      </div>

      {/* Free Plan Alert Banner if limited */}
      {isFreePlan && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              Você está utilizando o <strong>Plano Free</strong> do exame {examRule.shortName} ({fullSimulations.length}/{examRule.maxFreeSimulations} simulado gratuito utilizado). Faça upgrade para realizar simulados ilimitados.
            </span>
          </div>
          <button
            onClick={() => onOpenUpgradeModal(`Simulados Ilimitados (${examRule.shortName})`, examRule.examId)}
            className="font-bold text-amber-800 hover:underline flex-shrink-0 cursor-pointer"
          >
            Fazer Upgrade Pro →
          </button>
        </div>
      )}

      {/* Exam Parameters Overview Card */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 mb-3">Parâmetros do Simulado {examRule.shortName}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-zinc-500 block">Total de Questões</span>
            <span className="text-base font-bold text-zinc-900 mt-0.5 block">{examRule.totalQuestions} questões</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-zinc-500 block">Duração Máxima</span>
            <span className="text-base font-bold text-zinc-900 mt-0.5 block">
              {examRule.durationMinutes} minutos ({Math.floor(examRule.durationMinutes / 60)}h{examRule.durationMinutes % 60 > 0 ? `${examRule.durationMinutes % 60}min` : ''})
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-zinc-500 block">Critério Mínimo</span>
            <span className="text-base font-bold text-emerald-700 mt-0.5 block">{examRule.passingScorePercentage}% de acertos</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-zinc-500 block">Regulamento Vigente</span>
            <span className="text-base font-bold text-zinc-900 mt-0.5 block">{examRule.ruleVersion.split(' - ')[0]}</span>
          </div>
        </div>
      </div>

      {/* History of Completed Full Simulations */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Histórico de Simulados Realizados</h3>
            <p className="text-xs text-zinc-500">{fullSimulations.length} provas completas registradas</p>
          </div>
        </div>

        {fullSimulations.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {fullSimulations.slice().reverse().map((att, idx) => {
              const attemptNumber = fullSimulations.length - idx;
              const isApproved = att.scorePercentage >= examRule.passingScorePercentage;

              return (
                <div
                  key={att.id}
                  onClick={() => onOpenAttemptResult(att)}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 px-3 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      #{attemptNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                          Simulado CPA Completo #{attemptNumber}
                        </h4>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {isApproved ? 'Aprovado' : 'Em Preparação'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                        <span>{new Date(att.finishedAt).toLocaleDateString('pt-BR')} às {new Date(att.finishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span>{Math.floor(att.durationSeconds / 60)} minutos</span>
                        <span>·</span>
                        <span>{att.correctCount} de {att.totalQuestions} acertos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-extrabold text-zinc-900">{att.scorePercentage}%</span>
                      <span className="text-[10px] text-zinc-400 block">Aproveitamento</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-zinc-500 text-xs">
            Nenhum simulado completo realizado ainda. Clique no botão acima para iniciar sua primeira prova!
          </div>
        )}
      </div>
    </div>
  );
};
