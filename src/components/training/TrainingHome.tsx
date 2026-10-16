import { 
  Subject, 
  Attempt, 
  PlanType, 
  Question,
  ExamRule,
  ExamId
} from '../../types';
import { 
  Target, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  AlertCircle, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  Calculator
} from 'lucide-react';
import { AccessControlService } from '../../services/accessControlService';

interface TrainingHomeProps {
  subjects: Subject[];
  attempts: Attempt[];
  plan: PlanType;
  questions: Question[];
  selectedExamId: string;
  examRule?: ExamRule;
  onStartTraining: (subjectId: string) => void;
  onStartErrorReview: () => void;
  onOpenAttemptResult: (attempt: Attempt) => void;
  onOpenUpgradeModal: (feature: string, targetExamId?: ExamId) => void;
}

export const TrainingHome: React.FC<TrainingHomeProps> = ({
  subjects,
  attempts,
  plan,
  questions,
  selectedExamId,
  examRule,
  onStartTraining,
  onStartErrorReview,
  onOpenAttemptResult,
  onOpenUpgradeModal
}) => {
  const isPro = AccessControlService.isPro(selectedExamId);
  const isFreePlan = !isPro;
  const targetedSettings = examRule?.trainingSettings?.targetedTraining;
  const trainingQuestionCount = targetedSettings?.questionCount || 20;
  const trainingDurationMinutes = targetedSettings?.durationMinutes || 60;
  const errorSettings = examRule?.trainingSettings?.errorReview;
  const errorMaxQuestions = errorSettings?.maxQuestions || 20;

  const trainingAttempts = attempts.filter(
    a => (a.mode === 'TARGETED_TRAINING' || a.mode === 'ERROR_REVIEW') && a.examId === selectedExamId
  );

  // Count failed questions across attempts strictly belonging to this exam
  const failedQuestionIds = new Set<string>();
  attempts
    .filter(a => a.examId === selectedExamId)
    .forEach(att => {
      att.answers.forEach(ans => {
        if (!ans.isCorrect && ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined) {
          failedQuestionIds.add(ans.questionId);
        }
      });
    });
  const totalFailedCount = failedQuestionIds.size;

  const handleStartDisciplineTraining = (subjectId: string, subjectName: string) => {
    if (isFreePlan) {
      onOpenUpgradeModal(`Treinos Direcionados (${subjectName})`, selectedExamId as ExamId);
    } else {
      onStartTraining(subjectId);
    }
  };

  const handleStartErrors = () => {
    if (isFreePlan) {
      onOpenUpgradeModal('Modo Revisar Meus Erros', selectedExamId as ExamId);
    } else {
      onStartErrorReview();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Módulos Específicos
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">{trainingQuestionCount} questões por sessão · {trainingDurationMinutes} minutos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Treinos Direcionados & Revisão
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Isole matérias críticas para fortalecer pontos fracos sem impactar a média dos simulados completos.
          </p>
        </div>
      </div>

      {/* Mode 1: Revisar Meus Erros Spotlight Card */}
      <div className="bg-gradient-to-r from-rose-50/80 via-white to-orange-50/50 rounded-2xl p-5 border border-rose-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                  Modo Inteligente
                </span>
                <span className="text-xs text-zinc-400">·</span>
                <span className="text-xs text-zinc-500 font-medium">{totalFailedCount} questões mapeadas</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mt-1">
                Revisar Meus Erros Anteriores
              </h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                Gera um treino exclusivo composto unicamente pelas questões que você errou nos simulados anteriores, com foco na superação de lacunas conceituais.
              </p>
            </div>
          </div>

          <button
            onClick={handleStartErrors}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex-shrink-0"
          >
            {isFreePlan ? <Lock className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            <span>{isFreePlan ? 'Desbloquear (Pro)' : 'Revisar Meus Erros Agora'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Disciplines for Targeted Training */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Treinar por Disciplina</h3>
            <p className="text-xs text-zinc-500">Escolha o conteúdo específico para aprofundar</p>
          </div>
          <span className="text-xs text-zinc-400">Padrão: {trainingQuestionCount} questões · {trainingDurationMinutes} min</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const isMatFin = subject.id === 'mat_fin';
            const subjectQuestionsCount = questions.filter(q => q.subjectId === subject.id).length;

            return (
              <div
                key={subject.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isMatFin
                    ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-400/30 shadow-xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Peso {subject.weightPercentage}% da prova
                    </span>
                    {isMatFin && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                    {subject.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    Tópicos: {subject.topics.join(', ')}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">
                    {subjectQuestionsCount} no banco
                  </span>
                  <button
                    onClick={() => handleStartDisciplineTraining(subject.id, subject.name)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isFreePlan ? <Lock className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                    <span>{isFreePlan ? 'Treinar (Pro)' : 'Iniciar Treino'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History of Targeted Trainings (Independently recorded!) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Histórico de Treinos Específicos</h3>
            <p className="text-xs text-zinc-500">
              Registrado de forma separada das provas completas para não distorcer a nota geral
            </p>
          </div>
        </div>

        {trainingAttempts.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {trainingAttempts.slice().reverse().map((att, idx) => {
              const targetSubject = subjects.find(s => s.id === att.targetSubjectId);
              const label = att.mode === 'ERROR_REVIEW' 
                ? 'Revisão de Erros' 
                : `Treino de ${targetSubject?.name || 'Disciplina'}`;

              return (
                <div
                  key={att.id}
                  onClick={() => onOpenAttemptResult(att)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 px-3 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs">
                      {att.mode === 'ERROR_REVIEW' ? <RotateCcw className="w-4 h-4 text-rose-600" /> : <Target className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                        {label}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span>{new Date(att.finishedAt).toLocaleDateString('pt-BR')}</span>
                        <span>·</span>
                        <span>{Math.floor(att.durationSeconds / 60)} min</span>
                        <span>·</span>
                        <span>{att.correctCount} de {att.totalQuestions} acertos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <span className="text-lg font-extrabold text-zinc-800">{att.scorePercentage}%</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500 text-xs">
            Nenhum treino direcionado realizado ainda. Escolha uma disciplina acima para começar!
          </div>
        )}
      </div>
    </div>
  );
};
