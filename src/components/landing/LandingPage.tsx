import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Star, 
  Clock, 
  Award,
  ChevronRight,
  Flame,
  LayoutDashboard
} from 'lucide-react';
import { TestimonialFeedback, PlanType } from '../../types';
import { AccessControlService } from '../../services/accessControlService';

interface LandingPageProps {
  feedbacks: TestimonialFeedback[];
  onEnterStudentArea: () => void;
  onSelectPlanAndEnter: (plan: PlanType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  feedbacks,
  onEnterStudentArea,
  onSelectPlanAndEnter
}) => {
  const cpaPlans = AccessControlService.getPlansForExam('cpa');
  const cpaProPlan = cpaPlans.find(p => p.type === 'Pro');
  const cpaPriceFormatted = cpaProPlan?.priceCents !== null && cpaProPlan?.priceCents !== undefined
    ? (cpaProPlan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 29,90';
  const approvedFeedbacks = feedbacks.filter(f => f.approvedForDisplay);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-zinc-900 font-sans">
      {/* Top Independence Notice Header */}
      <div className="bg-zinc-100 text-zinc-600 border-b border-zinc-200 py-2 px-4 text-center text-xs">
        <span>
          Aviso Institucional: Plataforma independente de preparação para certificações financeiras. Não possui qualquer vínculo ou afiliação oficial com a ANBIMA.
        </span>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              SA
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-zinc-900 block leading-tight">
                Simulados ANBIMA
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block leading-tight">
                Bredi Exam Engine
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
            <a href="#beneficios" className="hover:text-zinc-900 transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-zinc-900 transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-zinc-900 transition-colors">Planos & Preços</a>
            <a href="#depoimentos" className="hover:text-zinc-900 transition-colors">Depoimentos</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterStudentArea}
              className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Entrar (Demo)
            </button>
            <button
              onClick={() => onSelectPlanAndEnter('Pro')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Acessar Plataforma</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-8 max-w-6xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protótipo Funcional Interativo V1 · Bredi Tecnologia Digital</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Acelere sua aprovação com o motor de simulados mais preciso do mercado.
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          Simulados completos com cronômetro oficial, diagnóstico instantâneo por disciplina, treinos focados nos seus erros e acompanhamento analítico em tempo real.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onSelectPlanAndEnter('Pro')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Experimentar como Rafael Martins (Pro)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectPlanAndEnter('Free')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <span>Ver Modo Free (Gratuito)</span>
          </button>
        </div>

        {/* Indicators of demo usage */}
        <div className="mt-14 pt-8 border-t border-zinc-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">12.400+</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Questões Respondidas*</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">89.4%</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Taxa de Aprovação*</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">70+</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Questões no Banco</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">+28 p.p.</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Evolução Média*</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 mt-2 text-center">
          *Indicadores ilustrativos para validação de protótipo.
        </p>
      </section>

      {/* Interactive Teaser of the Dashboard */}
      <section className="py-12 bg-zinc-100/70 border-y border-zinc-200 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Interface Real
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2">
              Compreenda sua situação em cinco segundos
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Desenvolvido segundo rigorosos padrões ergonômicos e pedagógicos. Sem poluição visual, sem distração.
            </p>
          </div>

          {/* Interactive Preview Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  RM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Painel do Aluno · Rafael Martins</h3>
                  <span className="text-xs text-zinc-500">Exame CPA · Certificação Profissional</span>
                </div>
              </div>
              <button
                onClick={onEnterStudentArea}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Abrir Dashboard Completo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-xs text-zinc-500">Última Nota</span>
                <span className="text-3xl font-extrabold text-zinc-900 mt-1 block">72%</span>
                <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 block">Atinge corte de aprovação</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-xs text-zinc-500">Evolução Geral</span>
                <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">+28 p.p.</span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">Desde o 1º simulado (44%)</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-xs text-zinc-500">Ponto de Atenção</span>
                <span className="text-lg font-bold text-amber-700 mt-1 block">Mat. Financeira</span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">35% de acertos médios</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-950 font-medium">
                  Próximo passo recomendado: Treino direcionado de 20 questões em Matemática Financeira.
                </span>
              </div>
              <button
                onClick={onEnterStudentArea}
                className="font-bold text-emerald-800 hover:underline flex-shrink-0 cursor-pointer"
              >
                Iniciar Treino →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Diferenciais Exclusivos
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2">
            Por que estudar com o Bredi Exam Engine?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">Simulação Fiel de Tempo</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Cronômetro regressivo com persistência de horário no LocalStorage. Se a aba for atualizada, o relógio não reinicia.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>Experiência autêntica de prova</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">Treinos Direcionados</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Pratique apenas a matéria em que você precisa melhorar, sem misturar as notas com o histórico das provas completas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>Foco cirúrgico nas fraquezas</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">Analytics & Comparador</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Confronte duas tentativas lado a lado e veja a evolução real da sua pontuação por assunto.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>Decisões baseadas em dados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing: Free vs Pro */}
      <section id="planos" className="py-16 bg-zinc-50 border-t border-zinc-200 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Planos Transparentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2">
              Escolha a melhor modalidade para sua rotina
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Acesso Básico</span>
                <h3 className="text-2xl font-extrabold text-zinc-900 mt-1">Plano Free</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-zinc-900">R$ 0</span>
                  <span className="text-xs text-zinc-500 ml-1">/ para sempre</span>
                </div>

                <ul className="space-y-3 text-xs text-zinc-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>1 simulado completo oficial de 50 questões</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Resultado detalhado da prova realizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Diagnóstico de pontos fortes e fracos</span>
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <span className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center text-[10px]">✕</span>
                    <span>Treinos direcionados por disciplina</span>
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <span className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center text-[10px]">✕</span>
                    <span>Modo Revisar Meus Erros</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectPlanAndEnter('Free')}
                className="w-full py-3 rounded-xl border border-zinc-300 text-zinc-800 font-semibold text-xs hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Acessar no Modo Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-white border-2 border-emerald-600 shadow-md flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                Mais Escolhido
              </span>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Aprovação Acelerada</span>
                <h3 className="text-2xl font-extrabold text-zinc-900 mt-1">Plano Pro</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-zinc-900">R$ 49,90</span>
                  <span className="text-xs text-zinc-500 ml-1">/mês (Demonstração)</span>
                </div>

                <ul className="space-y-3 text-xs text-zinc-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Simulados completos ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Treinos direcionados</strong> por disciplina</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Modo inteligente de Revisão de Erros</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Comparador lado a lado de tentativas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Cards de evolução exportáveis</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectPlanAndEnter('Pro')}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Começar Demonstração no Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Prova Social
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2">
            O que dizem os alunos aprovados
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Depoimentos com autorização expressa de divulgação para demonstração do produto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedFeedbacks.map(fb => (
            <div key={fb.id} className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed italic mb-4">
                  "{fb.comment}"
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100">
                <span className="text-xs font-bold text-zinc-900 block">{fb.userName}</span>
                <span className="text-[11px] text-zinc-500 block">{fb.userRole}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-zinc-200 px-4 sm:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="font-bold text-zinc-900 text-sm">Simulados ANBIMA</span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 font-medium">Bredi Exam Engine</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Desenvolvido por Bredi Tecnologia Digital · Protótipo funcional para validação de produto.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-zinc-600">
            <button onClick={onEnterStudentArea} className="hover:text-zinc-900 cursor-pointer">
              Área do Aluno (Rafael Martins)
            </button>
            <span>·</span>
            <a href="https://simuladosanbima.com.br" target="_blank" rel="noreferrer" className="hover:text-zinc-900">
              simuladosanbima.com.br
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
