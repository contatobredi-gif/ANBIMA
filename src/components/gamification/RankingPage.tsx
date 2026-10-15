import React, { useState } from 'react';
import { RankingParticipant } from '../../types';
import { Trophy, Medal, Flame, Zap, Award, Info, ChevronUp, ChevronDown } from 'lucide-react';

interface RankingPageProps {
  rankings: RankingParticipant[];
  currentUserId: string;
}

export const RankingPage: React.FC<RankingPageProps> = ({ rankings, currentUserId }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'overall'>('overall');
  const [metricTab, setMetricTab] = useState<'performance' | 'engagement'>('performance');

  // Sort participants based on selection
  const sortedList = [...rankings].sort((a, b) => {
    if (metricTab === 'performance') {
      return b.averageScore - a.averageScore;
    } else {
      if (period === 'weekly') return b.weeklyPoints - a.weeklyPoints;
      if (period === 'monthly') return b.monthlyPoints - a.monthlyPoints;
      return b.engagementPoints - a.engagementPoints;
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Comunidade de Estudos
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">Exame CPA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Ranking de Participantes
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Compare seu progresso e mantenha o ritmo. Todos os demais dados são fictícios para fins de demonstração.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              period === 'weekly' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              period === 'monthly' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPeriod('overall')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              period === 'overall' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {/* Metric Mode Selector: Desempenho vs Engajamento */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setMetricTab('performance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            metricTab === 'performance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Classificação por Desempenho (% Média)</span>
        </button>

        <button
          onClick={() => setMetricTab('engagement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            metricTab === 'engagement'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Pontuação de Engajamento & Dedicação</span>
        </button>
      </div>

      {/* Demo Notice Banner */}
      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <span>
          Ambiente de Demonstração: Os participantes abaixo são perfis fictícios parametrizados para demonstrar o ecossistema competitivo do Bredi Exam Engine.
        </span>
      </div>

      {/* Ranking List Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {sortedList.map((participant, index) => {
            const rank = index + 1;
            const isMe = participant.isCurrentUser;
            const isTop3 = rank <= 3;

            return (
              <div
                key={participant.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isMe ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-zinc-50'
                }`}
              >
                {/* Left: Position & Avatar & Name */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    rank === 1 
                      ? 'bg-amber-400 text-amber-950 shadow-xs' 
                      : rank === 2 
                      ? 'bg-zinc-300 text-zinc-800' 
                      : rank === 3 
                      ? 'bg-amber-700 text-white' 
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {rank === 1 ? '1º' : rank === 2 ? '2º' : rank === 3 ? '3º' : `${rank}º`}
                  </div>

                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm truncate ${isMe ? 'font-bold text-emerald-950' : 'font-medium text-zinc-900'}`}>
                        {participant.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span>{participant.completedSimulations} simulados</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {participant.streakDays} dias
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score or Points */}
                <div className="text-right flex-shrink-0">
                  {metricTab === 'performance' ? (
                    <div>
                      <span className={`text-base sm:text-lg font-extrabold ${isMe ? 'text-emerald-800' : 'text-zinc-900'}`}>
                        {participant.averageScore}%
                      </span>
                      <span className="text-[10px] text-zinc-400 block">Média de acertos</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-700 flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        {period === 'weekly' ? participant.weeklyPoints : period === 'monthly' ? participant.monthlyPoints : participant.engagementPoints}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">Pontos de estudo</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
