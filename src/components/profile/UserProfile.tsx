import React, { useState } from 'react';
import { UserProfile as UserProfileType, PlanType, ExamId } from '../../types';
import { 
  User, 
  Mail, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Shield, 
  Flame, 
  Zap, 
  MessageSquareText, 
  CreditCard,
  Check,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { AccessControlService } from '../../services/accessControlService';

interface UserProfileProps {
  user: UserProfileType;
  onPlanToggle: (examId?: ExamId) => void;
  onResetData: () => void;
  onRestoreData: () => void;
  onOpenAdmin: () => void;
  onOpenFeedbackModal: () => void;
}

export const UserProfileView: React.FC<UserProfileProps> = ({
  user,
  onPlanToggle,
  onResetData,
  onRestoreData,
  onOpenAdmin,
  onOpenFeedbackModal
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const state = StorageService.getState();
  const cpaSubscription = AccessControlService.getSubscription('cpa');
  const oabSubscription = AccessControlService.getSubscription('oab');
  const isCpaPro = AccessControlService.isPro('cpa');
  const isOabPro = AccessControlService.isPro('oab');

  const cpaPlans = AccessControlService.getPlansForExam('cpa');
  const cpaProPlan = cpaPlans.find(p => p.type === 'Pro');
  const cpaFormattedPrice = cpaProPlan?.priceCents !== null && cpaProPlan?.priceCents !== undefined
    ? `${(cpaProPlan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / mês`
    : 'Preço a definir';

  const oabPlans = AccessControlService.getPlansForExam('oab');
  const oabProPlan = oabPlans.find(p => p.type === 'Pro');
  const oabFormattedPrice = oabProPlan?.priceCents !== null && oabProPlan?.priceCents !== undefined
    ? `${(oabProPlan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / mês`
    : 'Preço a definir (Em breve)';

  const handleToggleExam = (examId: ExamId) => {
    try {
      const newPlan = AccessControlService.toggleExamPlan(examId);
      triggerSuccess(`Assinatura de ${examId.toUpperCase()} alterada para ${newPlan}.`);
      onPlanToggle(examId);
    } catch (err: any) {
      triggerSuccess(err.message || 'Operação comercial não permitida.');
    }
  };

  const handleCancelSub = (examId: ExamId) => {
    try {
      AccessControlService.cancelSubscription(examId);
      triggerSuccess(`Assinatura de ${examId.toUpperCase()} cancelada.`);
      onPlanToggle(examId);
    } catch (err: any) {
      triggerSuccess(err.message || 'Erro ao cancelar.');
    }
  };

  const handleReactivateSub = (examId: ExamId) => {
    try {
      AccessControlService.reactivateSubscription(examId);
      triggerSuccess(`Assinatura de ${examId.toUpperCase()} reativada com sucesso.`);
      onPlanToggle(examId);
    } catch (err: any) {
      triggerSuccess(err.message || 'Erro ao reativar.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Perfil do Aluno
          </span>
          <span className="text-xs text-zinc-400">·</span>
          <span className="text-xs text-zinc-500 font-medium">Conta Demonstrativa</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
          Meu Perfil & Assinaturas por Exame
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Gerenciamento comercial descentralizado: controle planos, vigências e direitos de acesso independentes para cada exame.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* User Card */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900">{user.name}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                Conta Única
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-600 mt-2">
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                {user.consecutiveDays} dias consecutivos
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Zap className="w-3.5 h-3.5 fill-emerald-600" />
                {user.engagementPoints} pontos
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenFeedbackModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-200 hover:border-zinc-300 text-zinc-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <MessageSquareText className="w-4 h-4 text-emerald-600" />
          <span>Avaliar Plataforma</span>
        </button>
      </div>

      {/* Per-Exam Subscription Architecture Section */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-bold text-zinc-900">Assinaturas Individuais por Exame</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Cada exame possui contratação, precificação e ciclo de vigência 100% independentes.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
            Motor Universal de Cobrança v5.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exam 1: CPA Card */}
          <div className={`p-5 rounded-xl border transition-all ${
            isCpaPro 
              ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-400' 
              : 'border-zinc-200 bg-zinc-50/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider">
                  Certificação ANBIMA
                </span>
                <h4 className="text-base font-extrabold text-zinc-900">CPA</h4>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                isCpaPro ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {isCpaPro ? 'Plano Pro Ativo' : (cpaSubscription?.status === 'canceled' ? 'Pro Cancelado' : 'Plano Free')}
              </span>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 mb-4 pb-4 border-b border-zinc-200/60">
              <div className="flex items-center justify-between">
                <span>Valor:</span>
                <span className="font-semibold text-zinc-900">{cpaFormattedPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status da Assinatura:</span>
                <span className="font-semibold capitalize text-zinc-900">
                  {cpaSubscription?.status || 'Padrão Free'}
                </span>
              </div>
              {cpaSubscription?.expiresAt && (
                <div className="flex items-center justify-between">
                  <span>Vigência até:</span>
                  <span className="font-semibold text-zinc-900">
                    {new Date(cpaSubscription.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Renovação Automática:</span>
                <span className="font-semibold text-zinc-900">
                  {cpaSubscription?.autoRenew ? 'Habilitada (Mensal)' : 'Desabilitada'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCpaPro ? (
                <>
                  <button
                    onClick={() => handleCancelSub('cpa')}
                    className="flex-1 py-2 px-3 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancelar Assinatura
                  </button>
                  <button
                    onClick={() => handleToggleExam('cpa')}
                    className="py-2 px-3 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Alternar rapidamente para Free"
                  >
                    Simular Free
                  </button>
                </>
              ) : cpaSubscription?.status === 'canceled' ? (
                <button
                  onClick={() => handleReactivateSub('cpa')}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reativar Plano Pro (CPA)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleExam('cpa')}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Assinar Pro CPA ({cpaFormattedPrice})</span>
                </button>
              )}
            </div>
          </div>

          {/* Exam 2: OAB Card */}
          <div className={`p-5 rounded-xl border transition-all ${
            isOabPro 
              ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-400' 
              : 'border-zinc-200 bg-zinc-50/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                  Carreira Jurídica Demonstrativa
                </span>
                <h4 className="text-base font-extrabold text-zinc-900">OAB 1ª Fase</h4>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                isOabPro ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {isOabPro ? 'Plano Pro Ativo' : 'Plano Free'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 mb-4 pb-4 border-b border-zinc-200/60">
              <div className="flex items-center justify-between">
                <span>Valor Pro no Catálogo:</span>
                <span className="font-semibold text-zinc-900">{oabFormattedPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status da Assinatura:</span>
                <span className="font-semibold capitalize text-zinc-900">
                  {oabSubscription?.status || 'Padrão Free (Sem custos)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Limite no Free:</span>
                <span className="font-semibold text-zinc-900">1 Simulado Demonstrativo</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Independência:</span>
                <span className="font-semibold text-emerald-700">Isolado da CPA</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOabPro ? (
                <button
                  onClick={() => handleCancelSub('oab')}
                  className="w-full py-2 px-3 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar Assinatura OAB
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 px-3 bg-zinc-200 text-zinc-500 rounded-lg text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                  title="A OAB não possui preço aprovado nem contratação pública ativa"
                >
                  <span>Contratação Indisponível (Em Breve)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-100/70 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Regra de Isolamento Comercial:</strong> Ter o Plano Pro ativo na CPA <strong>não</strong> concede direitos Pro na OAB ou em outros exames futuros. As tentativas, dados de desempenho e histórico de provas permanecem intactos mesmo em caso de cancelamento.
          </p>
        </div>
      </div>

      {/* Demo Controls: Reset & Restore */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Controles do Ambiente de Demonstração</h3>
          <p className="text-xs text-zinc-500">
            Ferramentas para reiniciar dados ou restaurar o estado padrão do aluno Rafael Martins (com 6 simulados e 3 treinos pré-populados).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => {
              onRestoreData();
              triggerSuccess('Dados iniciais de demonstração (Rafael Martins) restaurados com sucesso.');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Restaurar Dados Iniciais (Rafael Martins)</span>
          </button>

          <button
            onClick={() => {
              onResetData();
              triggerSuccess('Dados de teste limpos. Você pode começar do zero.');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-zinc-500" />
            <span>Reiniciar / Zerar Dados de Teste</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Acessar Painel Administrativo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
