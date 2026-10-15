import React, { useState } from 'react';
import { X, Star, CheckCircle2, MessageSquareText } from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [improvementText, setImprovementText] = useState('');
  const [consentedToPublish, setConsentedToPublish] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addFeedback(rating, comment, consentedToPublish, improvementText);
    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitted) onSubmitted();
      onClose();
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

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Como está sendo sua preparação?</h3>
                <p className="text-xs text-zinc-500">Sua avaliação ajuda a aprimorar o Bredi Exam Engine.</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-zinc-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-zinc-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-zinc-500 font-medium mt-1 inline-block">
                {rating === 5 ? 'Excelente!' : rating === 4 ? 'Muito bom' : rating === 3 ? 'Regular' : 'Precisa melhorar'}
              </span>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                O que você mais gostou na plataforma? (Opcional)
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ex: As explicações detalhadas por questão e os treinos focados em Matemática..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none resize-none text-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Sugestão de melhoria técnica ou pedagógica: (Opcional)
              </label>
              <input
                type="text"
                value={improvementText}
                onChange={e => setImprovementText(e.target.value)}
                placeholder="Ex: Mais questões comentadas sobre derivativos..."
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-zinc-800"
              />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2.5 text-xs text-zinc-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consentedToPublish}
                onChange={e => setConsentedToPublish(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                Autorizo a divulgação pública do meu depoimento com meu primeiro nome na área de depoimentos da plataforma.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Lembrar depois
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Enviar Avaliação
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-zinc-900">Obrigado pelo seu feedback!</h4>
            <p className="text-xs text-zinc-500 mt-1">Sua avaliação foi registrada com sucesso.</p>
          </div>
        )}
      </div>
    </div>
  );
};
