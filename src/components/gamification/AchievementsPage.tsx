import React from 'react';
import { Achievement } from '../../types';
import { 
  Award, 
  Flag, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  TrendingUp, 
  ShieldCheck, 
  Calculator, 
  Lock, 
  Sparkles, 
  Share2 
} from 'lucide-react';

interface AchievementsPageProps {
  achievements: Achievement[];
  onOpenShareModal: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Flag,
  CheckCircle2,
  Calendar,
  Flame,
  TrendingUp,
  ShieldCheck,
  Calculator,
  Award
};

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ achievements, onOpenShareModal }) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const totalRewardPoints = achievements.reduce((acc, a) => a.unlockedAt ? acc + a.rewardPoints : acc, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Gamificação Pedagógica
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">{unlockedCount} de {achievements.length} desbloqueadas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Minhas Conquistas & Medalhas
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Marcos de evolução pessoal conquistados durante o ciclo de preparação.
          </p>
        </div>

        <button
          onClick={onOpenShareModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartilhar Meu Card de Conquista</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Progresso de Conquistas
          </span>
          <h3 className="text-xl font-extrabold text-zinc-900 mt-0.5">
            {unlockedCount} Conquistas Desbloqueadas ({Math.round((unlockedCount / achievements.length) * 100)}%)
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Total de pontos de mérito obtidos em insígnias: <strong className="text-emerald-700">{totalRewardPoints} pts</strong>
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(ach => {
          const Icon = iconMap[ach.icon] || Award;
          const isUnlocked = ach.unlockedAt !== null;
          const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-zinc-200 hover:border-emerald-300 shadow-xs'
                  : 'bg-zinc-50/70 border-zinc-200/80 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-400'
                  }`}>
                    {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    isUnlocked
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    +{ach.rewardPoints} pts
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-900 mb-1">
                  {ach.title}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  {ach.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Desbloqueada
                    </span>
                    <span className="text-zinc-400 font-normal">
                      {new Date(ach.unlockedAt!).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
                      <span>Progresso:</span>
                      <span className="font-mono">{ach.progress} / {ach.maxProgress}</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-zinc-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
