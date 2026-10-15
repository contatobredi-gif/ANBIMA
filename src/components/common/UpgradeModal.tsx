import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ExamId } from '../../types';
import { AccessControlService } from '../../services/accessControlService';
import { StorageService } from '../../services/storageService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
  featureTriggered?: string;
  targetExamId?: ExamId;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgraded,
  featureTriggered = 'Funcionalidade Pro',
  targetExamId
}) => {
  const state = StorageService.getState();
  const currentExamId: ExamId = targetExamId || state.user.selectedExamId || 'cpa';
  const [selectedExam, setSelectedExam] = useState<ExamId>(currentExamId);
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  if (!isOpen) return null;

  const examRule = state.examRules[selectedExam] || state.examRules['cpa'];
  const plans = AccessControlService.getPlansForExam(selectedExam);
  const proPlan = plans.find(p => p.type === 'Pro') || {
    priceCents: selectedExam === 'oab' ? 5990 : 4990,
    name: `${selectedExam.toUpperCase()} Pro`
  };

  const formattedPrice = (proPlan.priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const handleSimulateUpgrade = () => {
    AccessControlService.subscribeToExam(selectedExam);
    setUpgradedSuccess(true);
    setTimeout(() => {
      if (onUpgraded) onUpgraded();
      onClose();
      setUpgradedSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {upgradedSuccess ? (
          <div className="text-center py-8 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">
              Assinatura Pro Ativada com Sucesso!
            </h3>
            <p className="text-sm text-zinc-600 max-w-sm mx-auto">
              Seu acesso ao <strong>Plano Pro ({examRule.shortName})</strong> foi liberado. A assinatura é independente e válida por 30 dias com renovação automática simulada.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center pt-2 pb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  Assinatura Individual por Exame
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mt-2">
                Desbloqueie o Plano Pro · {examRule.shortName}
              </h3>
              <p className="text-sm text-zinc-600 mt-1">
                {featureTriggered} é exclusivo para alunos assinantes do Plano Pro deste exame.
              </p>
            </div>

            {/* Exam Selector if multiple exams are available */}
            <div className="mb-4 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700">Exame Selecionado:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedExam('cpa')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    selectedExam === 'cpa'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  CPA (ANBIMA)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExam('oab')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    selectedExam === 'oab'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  OAB 1ª Fase
                </button>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 mb-5">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Vantagens inclusas no Plano Pro de {examRule.shortName}:
              </h4>
              <ul className="space-y-2.5 text-sm text-zinc-700">
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>Simulados completos ilimitados</strong> com cronômetro oficial e matriz diagnóstica</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>Treinos direcionados</strong> por disciplina e assuntos específicos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>Modo Revisar Meus Erros</strong> com caderno de questões falhas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>Comparador histórico de tentativas</strong> e projeção de aprovação</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Simulação de Upgrade Comercial</span>
              </div>
              <span className="font-bold text-sm text-emerald-800">{formattedPrice}/mês</span>
            </div>

            <p className="text-[11px] text-zinc-400 text-center mb-4">
              * A contratação é individual para <strong>{examRule.shortName}</strong>. Outros exames da sua conta permanecem com seus respectivos planos.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Permanecer no Free
              </button>
              <button
                onClick={handleSimulateUpgrade}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Ativar Pro ({examRule.shortName})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
