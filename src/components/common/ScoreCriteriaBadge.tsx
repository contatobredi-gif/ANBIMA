import React from 'react';
import { ExamRule } from '../../types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ScoreCriteriaBadgeProps {
  scorePercentage: number;
  rule: ExamRule;
  compact?: boolean;
}

export const ScoreCriteriaBadge: React.FC<ScoreCriteriaBadgeProps> = ({ scorePercentage, rule, compact = false }) => {
  const isApproved = scorePercentage >= rule.passingScorePercentage;
  const difference = scorePercentage - rule.passingScorePercentage;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded border ${
        isApproved 
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}>
        {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
        <span>{isApproved ? `Aprovado (${scorePercentage}%)` : `Em preparação (${scorePercentage}%)`}</span>
        <span className="text-zinc-400">·</span>
        <span className="text-zinc-500 font-normal">Corte: {rule.passingScorePercentage}%</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isApproved 
        ? 'bg-emerald-50/60 border-emerald-200' 
        : 'bg-zinc-50 border-zinc-200'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isApproved ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-700'
          }`}>
            {isApproved ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-zinc-900">
                {isApproved ? 'Atinge Critério de Aprovação' : 'Abaixo do Critério Mínimo'}
              </h4>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {difference >= 0 ? `+${difference}% acima` : `${difference}% para a meta`}
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Sua nota atual: <strong className="text-zinc-900">{scorePercentage}%</strong> · Nota de corte configurada: <strong className="text-zinc-900">{rule.passingScorePercentage}%</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-200/70 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          <span>Regra: {rule.ruleVersion}</span>
          <span>·</span>
          <span>Ref: {rule.sourceReference}</span>
        </div>
        <div className="text-zinc-400">
          Vigência: {rule.effectiveDate}
        </div>
      </div>
    </div>
  );
};
