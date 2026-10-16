import React, { useState } from 'react';
import { ExamId, RankingParticipant, UserProfile } from '../../types';
import { RankingService } from '../../services/rankingService';
import { StorageService } from '../../services/storageService';
import { Trophy, Medal, Flame, Zap, Award, Info, ShieldCheck, UserCheck, Eye, EyeOff, Check } from 'lucide-react';

interface RankingPageProps {
  rankings: RankingParticipant[];
  currentUserId: string;
  selectedExamId?: ExamId;
  user?: UserProfile;
  onRefresh?: () => void;
}

export const RankingPage: React.FC<RankingPageProps> = ({
  selectedExamId = 'cpa',
  user,
  onRefresh
}) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'overall'>('overall');
  const [metricTab, setMetricTab] = useState<'engagement' | 'performance'>('engagement');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState(user?.publicDisplayName || user?.name || 'Rafael Martins');

  const { participants, currentUserRank, rulesDescription, isDemoNotice } = RankingService.getRankings(
    period,
    selectedExamId
  );

  // Sort according to metric tab
  const sortedList = [...participants].sort((a, b) => {
    if (metricTab === 'performance') {
      return (b.averageScore || 0) - (a.averageScore || 0);
    } else {
      if (period === 'weekly') return (b.weeklyPoints || 0) - (a.weeklyPoints || 0);
      if (period === 'monthly') return (b.monthlyPoints || 0) - (a.monthlyPoints || 0);
      return (b.engagementPoints || 0) - (a.engagementPoints || 0);
    }
  });

  const handleToggleOptIn = (checked: boolean) => {
    RankingService.updateRankingSettings(checked);
    if (onRefresh) onRefresh();
  };

  const handleSaveName = () => {
    RankingService.updateRankingSettings(user?.publicRankingOptIn ?? true, tempDisplayName);
    setIsEditingName(false);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Comunidade & Hábitos
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">Exame {selectedExamId.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Ranking de Constância
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Acompanhe a constância de preparação da turma. Ranking isolado por exame para garantir comparação justa.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              period === 'weekly' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              period === 'monthly' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPeriod('overall')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              period === 'overall' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {/* Metric Mode Selector: Engajamento vs Desempenho */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 text-xs">
        <button
          onClick={() => setMetricTab('engagement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
            metricTab === 'engagement'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Pontuação de Engajamento & Constância</span>
        </button>

        <button
          onClick={() => setMetricTab('performance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
            metricTab === 'performance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Aproveitamento em Simulados (% Média)</span>
        </button>
      </div>

      {/* Privacy and Display Name Box */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 text-xs text-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={user?.publicRankingOptIn ?? true}
              onChange={(e) => handleToggleOptIn(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Exibir meu perfil no ranking demonstrativo</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Nome de exibição:</span>
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempDisplayName}
                onChange={(e) => setTempDisplayName(e.target.value)}
                className="px-2 py-1 border border-zinc-300 rounded text-xs focus:outline-emerald-600"
              />
              <button
                onClick={handleSaveName}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Salvar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900">{user?.publicDisplayName || user?.name || 'Rafael Martins'}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                Alterar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ranking Rules & Demo Explanation */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-zinc-800">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Critérios de Classificação Transparentes</span>
        </div>
        <p>{rulesDescription}</p>
        <p className="text-[11px] text-zinc-400 italic">{isDemoNotice}</p>
      </div>

      {/* Ranking List Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {sortedList.map((participant, index) => {
            const rank = index + 1;
            const isMe = participant.isCurrentUser;

            return (
              <div
                key={participant.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isMe ? 'bg-emerald-50/70 font-semibold ring-1 ring-emerald-300 inset-0' : 'hover:bg-zinc-50'
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
                      <span>{participant.completedSimulations} simulado(s)</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {participant.streakDays} dias consecutivos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score or Points */}
                <div className="text-right flex-shrink-0">
                  {metricTab === 'performance' ? (
                    <div>
                      <span className={`text-base sm:text-lg font-extrabold ${isMe ? 'text-emerald-800' : 'text-zinc-900'}`}>
                        {participant.averageScore > 0 ? `${participant.averageScore}%` : '—'}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">Média de simulados</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-700 flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        {period === 'weekly' ? participant.weeklyPoints : period === 'monthly' ? participant.monthlyPoints : participant.engagementPoints}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">Pontos de constância</span>
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
