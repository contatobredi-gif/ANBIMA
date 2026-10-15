import React from 'react';
import { X, Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
  featureTriggered?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgraded,
  featureTriggered = 'Funcionalidade Pro'
}) => {
  if (!isOpen) return null;

  const handleSimulateUpgrade = () => {
    StorageService.setPlan('Pro');
    if (onUpgraded) onUpgraded();
    onClose();
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

        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Ambiente de Demonstração
          </span>
          <h3 className="text-xl font-bold text-zinc-900 mt-2">
            Desbloqueie o Plano Pro
          </h3>
          <p className="text-sm text-zinc-600 mt-1">
            {featureTriggered} é exclusivo para alunos assinantes do Plano Pro.
          </p>
        </div>

        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 mb-5">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            O que você recebe no Plano Pro:
          </h4>
          <ul className="space-y-2.5 text-sm text-zinc-700">
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong>Simulados ilimitados</strong> completos de 50 questões com cronômetro</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong>Treinos direcionados</strong> por disciplina (Mat. Financeira, Fundos, etc.)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong>Modo Revisar Meus Erros</strong> com banco personalizado de falhas</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong>Comparador de tentativas</strong> e analytics histórico completo</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Cards compartilháveis e gamificação total</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Simulação de Upgrade (Sem cobrança real)</span>
          </div>
          <span className="font-semibold">R$ 49,90/mês (Demonstração)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Continuar no Free
          </button>
          <button
            onClick={handleSimulateUpgrade}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Ativar Pro Gratuitamente
          </button>
        </div>
      </div>
    </div>
  );
};
