import React, { useState, useEffect, useRef } from 'react';
import { 
  ActiveExamSession, 
  Question, 
  Attempt, 
  AppStateData 
} from '../../types';
import { StorageService } from '../../services/storageService';
import { ExamEngine } from '../../services/examEngine';
import { 
  Clock, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Grid, 
  X, 
  Save, 
  LogOut,
  Flag,
  HelpCircle
} from 'lucide-react';

interface ExamRunnerProps {
  appState: AppStateData;
  activeSession: ActiveExamSession;
  onFinishExam: (attempt: Attempt) => void;
  onExitWithoutFinishing: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  appState,
  activeSession,
  onFinishExam,
  onExitWithoutFinishing
}) => {
  const [session, setSession] = useState<ActiveExamSession>(activeSession);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return ExamEngine.getRemainingSeconds(activeSession);
  });
  const [showNavigatorModal, setShowNavigatorModal] = useState(false);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const finishInProgressRef = useRef(false);

  // Prioritize immutable question snapshots from the active session
  const questionMap = useRef<Map<string, Question>>(
    new Map(
      (session.questionSnapshots && session.questionSnapshots.length > 0 
        ? session.questionSnapshots 
        : appState.questions
      ).map(q => [q.id, q])
    )
  ).current;

  const currentQuestionId = session.questionIds[session.currentIndex];
  const currentQuestion = questionMap.get(currentQuestionId);

  // Timer countdown based on persistent timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = ExamEngine.getRemainingSeconds(session);
      setSecondsRemaining(remaining);

      // Auto finalize when time runs out (uses exact same routine)
      if (remaining <= 0 && !finishInProgressRef.current && !hasSubmitted) {
        clearInterval(interval);
        handleFinish();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, hasSubmitted]);

  // Synchronize local session changes to LocalStorage
  const updateSession = (newSession: ActiveExamSession) => {
    setSession(newSession);
    StorageService.saveActiveSession(newSession);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestionId || hasSubmitted || finishInProgressRef.current) return;
    const newAnswers = { ...session.answers, [currentQuestionId]: optionIndex };
    updateSession({
      ...session,
      answers: newAnswers
    });
  };

  const handleToggleFlag = () => {
    if (!currentQuestionId) return;
    const isFlagged = session.flaggedQuestionIds.includes(currentQuestionId);
    const newFlags = isFlagged
      ? session.flaggedQuestionIds.filter(id => id !== currentQuestionId)
      : [...session.flaggedQuestionIds, currentQuestionId];

    updateSession({
      ...session,
      flaggedQuestionIds: newFlags
    });
  };

  const handleNext = () => {
    if (session.currentIndex < session.questionIds.length - 1) {
      updateSession({
        ...session,
        currentIndex: session.currentIndex + 1
      });
    }
  };

  const handlePrev = () => {
    if (session.currentIndex > 0) {
      updateSession({
        ...session,
        currentIndex: session.currentIndex - 1
      });
    }
  };

  const handleJumpToQuestion = (index: number) => {
    updateSession({
      ...session,
      currentIndex: index
    });
    setShowNavigatorModal(false);
  };

  const handleFinish = () => {
    if (finishInProgressRef.current || hasSubmitted) return;
    finishInProgressRef.current = true;
    setHasSubmitted(true);
    try {
      const attempt = ExamEngine.finalizeSession(session);
      onFinishExam(attempt);
    } catch (e) {
      console.error('Erro ao finalizar sessão:', e);
      finishInProgressRef.current = false;
      setHasSubmitted(false);
    }
  };

  // Format timer
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const timerFormatted = `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = secondsRemaining < 900; // < 15 min

  const answeredCount = Object.keys(session.answers).filter(
    k => session.answers[k] !== null && session.answers[k] !== undefined
  ).length;
  const totalQuestions = session.questionIds.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center text-zinc-600">
        Carregando simulado...
      </div>
    );
  }

  const selectedOptionIndex = session.answers[currentQuestion.id];
  const isCurrentFlagged = session.flaggedQuestionIds.includes(currentQuestion.id);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top sticky exam bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200/90 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Exam Title & Mode */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExitWithoutFinishing}
              title="Salvar e sair (seu progresso continuará salvo no LocalStorage)"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 p-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Pausar e Salvar</span>
            </button>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            <div>
              <span className="text-xs font-bold text-zinc-900 block leading-tight">
                {session.mode === 'FULL_EXAM' 
                  ? 'Simulado Completo CPA' 
                  : session.mode === 'TARGETED_TRAINING' 
                  ? 'Treino Direcionado' 
                  : 'Revisão de Erros'}
              </span>
              <span className="text-[10px] text-zinc-500 block leading-tight">
                {session.questionIds.length} questões · Progresso persistido automaticamente
              </span>
            </div>
          </div>

          {/* Central Timer & Status */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm border transition-colors ${
              isLowTime 
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
                : 'bg-zinc-100 text-zinc-800 border-zinc-200'
            }`}>
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>{timerFormatted}</span>
            </div>
          </div>

          {/* Right Navigator and Finish CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNavigatorModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Grade de Questões</span>
              <span className="font-mono text-emerald-700 font-bold">({answeredCount}/{totalQuestions})</span>
            </button>

            <button
              onClick={() => setShowConfirmFinishModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finalizar Prova</span>
            </button>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-zinc-100 h-1.5 mt-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Question Interface */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-between">
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs">
          {/* Question Header & Meta */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Questão {session.currentIndex + 1} de {totalQuestions}
              </span>
              <span className="text-zinc-300">·</span>
              <span className="font-semibold text-zinc-700">{currentQuestion.subjectName}</span>
              <span className="text-zinc-300 hidden sm:inline">·</span>
              <span className="text-zinc-500 hidden sm:inline">{currentQuestion.topic}</span>
            </div>

            {/* Flag for review button */}
            <button
              onClick={handleToggleFlag}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isCurrentFlagged
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'}`} />
              <span>{isCurrentFlagged ? 'Marcada para Revisar' : 'Marcar para Revisão'}</span>
            </button>
          </div>

          {/* Question Stem */}
          <div className="mb-8">
            <p className="text-base sm:text-lg font-medium text-zinc-900 leading-relaxed">
              {currentQuestion.stem}
            </p>
          </div>

          {/* Alternatives */}
          <div className="space-y-3">
            {currentQuestion.options.map((optionText, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex);
              const isSelected = selectedOptionIndex === optIndex;

              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelectOption(optIndex)}
                  className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all flex items-start gap-4 cursor-pointer group ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 text-zinc-900 ring-2 ring-emerald-600/30'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50/80'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200'
                  }`}>
                    {letter}
                  </span>
                  <span className="mt-0.5 leading-relaxed">{optionText}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-6 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={session.currentIndex === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Questão Anterior</span>
          </button>

          <div className="flex items-center gap-2">
            {session.currentIndex < session.questionIds.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <span>Próxima Questão</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmFinishModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Revisar e Finalizar Prova</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Question Grid Navigator Modal */}
      {showNavigatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 relative flex flex-col max-h-[85vh]">
            <button
              onClick={() => setShowNavigatorModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-900 mb-1">Grade Geral de Questões</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Clique em qualquer número para ir diretamente à questão correspondente.
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-600 pb-3 border-b border-zinc-100 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600" />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-zinc-200 border border-zinc-300" />
                <span>Pendente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span>Marcada p/ Revisão</span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 overflow-y-auto flex-1 p-1">
              {session.questionIds.map((qId, idx) => {
                const isAnswered = session.answers[qId] !== undefined && session.answers[qId] !== null;
                const isFlagged = session.flaggedQuestionIds.includes(qId);
                const isCurrent = session.currentIndex === idx;

                let bgClass = 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-200';
                if (isAnswered) bgClass = 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600';
                if (isFlagged) bgClass = 'bg-amber-400 text-amber-950 font-bold border-amber-500';

                return (
                  <button
                    key={qId}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-zinc-900 ring-offset-1' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                {answeredCount} de {totalQuestions} respondidas
              </span>
              <button
                onClick={() => setShowNavigatorModal(false)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-semibold"
              >
                Continuar Prova
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Finish Modal */}
      {showConfirmFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 relative">
            <button
              onClick={() => setShowConfirmFinishModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 text-center">Deseja finalizar este simulado?</h3>
            <p className="text-xs text-zinc-500 text-center mt-1">
              Suas respostas serão processadas e o resultado detalhado será gerado imediatamente.
            </p>

            <div className="my-5 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Questões Respondidas:</span>
                <strong className="text-zinc-900">{answeredCount} de {totalQuestions}</strong>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Questões Pendentes:</span>
                <strong className={totalQuestions - answeredCount > 0 ? 'text-amber-600' : 'text-zinc-900'}>
                  {totalQuestions - answeredCount}
                </strong>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Marcadas para Revisão:</span>
                <strong className="text-amber-600">{session.flaggedQuestionIds.length}</strong>
              </div>
              <div className="flex justify-between text-zinc-600 pt-2 border-t border-zinc-200">
                <span>Tempo restante no relógio:</span>
                <strong className="font-mono text-zinc-900">{timerFormatted}</strong>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Você possui {totalQuestions - answeredCount} questão(ões) não respondida(s). Elas serão computadas como incorretas.
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmFinishModal(false)}
                className="flex-1 py-2.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Voltar à Prova
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Confirmar e Entregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
