import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Award, ArrowRight, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { ExamId } from '../../types';
import { DailyChallengeService } from '../../services/dailyChallengeService';
import { StorageService } from '../../services/storageService';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetExamId?: ExamId;
  onCompleted?: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  targetExamId,
  onCompleted
}) => {
  const [challenge, setChallenge] = useState(() => DailyChallengeService.getOrCreateDailyChallenge(targetExamId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Sync / reload challenge whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const active = DailyChallengeService.getOrCreateDailyChallenge(targetExamId);
      setChallenge(active);
      setCurrentIndex(0);

      if (!active.completed) {
        const elapsed = Math.floor((Date.now() - active.startedAtTimestamp) / 1000);
        const rem = Math.max(0, active.durationSeconds - elapsed);
        setRemainingSeconds(rem);
      }
    }
  }, [isOpen, targetExamId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || challenge.completed) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on time expiry
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, challenge.completed]);

  if (!isOpen) return null;

  const challengeQuestions = challenge.questionSnapshots || [];
  const currentQ = challengeQuestions[currentIndex];
  const isCompleted = challenge.completed;

  const handleSelectOption = (optionIndex: number) => {
    if (isCompleted) return;
    DailyChallengeService.updateAnswer(currentIndex, optionIndex);
    setChallenge({
      ...challenge,
      answers: {
        ...challenge.answers,
        [currentIndex]: optionIndex
      }
    });
  };

  const handleSubmit = () => {
    if (challenge.completed) return;
    const result = DailyChallengeService.submitChallenge();
    const refreshed = StorageService.getState().activeDailyChallenge;
    if (refreshed) {
      setChallenge(refreshed);
    } else {
      setChallenge(prev => ({
        ...prev,
        completed: true,
        score: result.score
      }));
    }
    if (onCompleted) onCompleted();
  };

  const handleNext = () => {
    if (currentIndex < challengeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const correctCount = challenge.score ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 pr-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Atividade Diária
              </span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-500 font-medium">Exame {challenge.examId.toUpperCase()}</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">Desafio do Dia (5 Questões)</h3>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Concluído Hoje
              </span>
            )}
          </div>
        </div>

        {/* Question Content or Result Summary */}
        {!isCompleted ? (
          <div className="py-4 overflow-y-auto flex-1">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
              <span>Questão {currentIndex + 1} de {challengeQuestions.length}</span>
              <span className="font-semibold text-zinc-700">{currentQ?.subjectName}</span>
            </div>

            <p className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed mb-5">
              {currentQ?.stem}
            </p>

            <div className="space-y-2.5">
              {currentQ?.options.map((opt, oIdx) => {
                const isSelected = challenge.answers[currentIndex] === oIdx;
                const letter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 text-zinc-900 ring-1 ring-emerald-600'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {letter}
                    </span>
                    <span className="mt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Result Summary & Explanations */
          <div className="py-6 overflow-y-auto flex-1">
            <div className="text-center mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900">
                Você acertou {correctCount} de {challengeQuestions.length} questões!
              </h4>
              <p className="text-xs text-zinc-600 mt-1">
                Atividade registrada com sucesso. Recompensa de <strong>+20 pontos</strong> de engajamento concedida.
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>O próximo desafio estará disponível amanhã (após as 00:00).</span>
              </div>
            </div>

            {/* Answer breakdown list */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Gabarito e Comentários Pedagógicos
              </h5>
              {challengeQuestions.map((q, idx) => {
                const userAns = challenge.answers[idx];
                const isCorrect = userAns === q.correctOptionIndex;
                const letterUser = userAns !== undefined ? String.fromCharCode(65 + userAns) : '-';
                const letterCorrect = String.fromCharCode(65 + q.correctOptionIndex);

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-zinc-200 bg-white text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900">Questão {idx + 1} · {q.subjectName}</span>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorreta
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-700 font-medium">{q.stem}</p>
                    <div className="text-zinc-600 space-y-0.5">
                      <div>Sua escolha: <span className="font-semibold text-zinc-900">{letterUser}) {userAns !== undefined ? q.options[userAns] : 'Não respondida'}</span></div>
                      {!isCorrect && (
                        <div className="text-emerald-800">Gabarito: <span className="font-semibold">{letterCorrect}) {q.options[q.correctOptionIndex]}</span></div>
                      )}
                    </div>
                    <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-600">
                      <strong className="text-zinc-800">Explicação: </strong>{q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
          {!isCompleted ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-40 disabled:hover:text-zinc-600 transition-colors cursor-pointer"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < challengeQuestions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Próxima</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Finalizar e Gravar</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Pontuação computada no ranking de constância.
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar e Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
