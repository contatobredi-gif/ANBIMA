import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';
import { Question } from '../../types';
import { StorageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onCompleted?: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  questions,
  onCompleted
}) => {
  // Use first 5 questions
  const challengeQuestions = questions.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || challengeQuestions.length === 0) return null;

  const currentQ = challengeQuestions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
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

  const calculateScore = () => {
    let correct = 0;
    challengeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    StorageService.recordDailyChallenge(score);
    if (score >= 4) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
    if (onCompleted) onCompleted();
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
  };

  const correctCount = isSubmitted ? calculateScore() : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Atividade do Dia
              </span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-500 font-medium">5 Questões Rápidas</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">Desafio Diário de Fixação</h3>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded">
            <span>{currentIndex + 1}</span>
            <span className="text-zinc-400">/</span>
            <span>{challengeQuestions.length}</span>
          </div>
        </div>

        {/* Question Content */}
        {!isSubmitted ? (
          <div className="py-4 overflow-y-auto flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700">{currentQ.subjectName}</span>
              <span>·</span>
              <span>{currentQ.topic}</span>
            </div>

            <p className="text-base font-medium text-zinc-900 leading-relaxed mb-5">
              {currentQ.stem}
            </p>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIndex] === oIdx;
                const letter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${
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
          /* Result Summary */
          <div className="py-6 overflow-y-auto flex-1">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900">
                Você acertou {correctCount} de {challengeQuestions.length} questões!
              </h4>
              <p className="text-sm text-zinc-600 mt-1">
                +{correctCount * 20 + 50} pontos de engajamento adicionados ao seu ranking.
              </p>
            </div>

            {/* Answer breakdown list */}
            <div className="space-y-4">
              {challengeQuestions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctOptionIndex;
                const letterUser = userAns !== undefined ? String.fromCharCode(65 + userAns) : '-';
                const letterCorrect = String.fromCharCode(65 + q.correctOptionIndex);

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-zinc-800">Questão {idx + 1} · {q.subjectName}</span>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> Incorreta
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-700 mb-2 font-medium">{q.stem}</p>
                    <div className="text-zinc-600 space-y-1 mb-2">
                      <div>Sua resposta: <span className="font-semibold">{letterUser}) {userAns !== undefined ? q.options[userAns] : 'Não respondida'}</span></div>
                      {!isCorrect && (
                        <div className="text-emerald-700">Resposta correta: <span className="font-semibold">{letterCorrect}) {q.options[q.correctOptionIndex]}</span></div>
                      )}
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-zinc-200 text-zinc-600">
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
          {!isSubmitted ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-40 disabled:hover:text-zinc-600 transition-colors"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < challengeQuestions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Próxima <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Finalizar Desafio
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Tentar novamente
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Concluir e Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
