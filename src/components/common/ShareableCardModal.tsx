import React, { useRef } from 'react';
import { X, Download, Share2, Award, TrendingUp, CheckCircle2 } from 'lucide-react';

interface ShareableCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  initialScore: number;
  currentScore: number;
  completedSimulations: number;
  streakDays: number;
}

export const ShareableCardModal: React.FC<ShareableCardModalProps> = ({
  isOpen,
  onClose,
  userName,
  initialScore,
  currentScore,
  completedSimulations,
  streakDays
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const evolution = currentScore - initialScore;

  if (!isOpen) return null;

  const handleDownload = () => {
    // Generate an image using HTML5 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient (Warm slate / dark charcoal, NOT blue!)
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#18181b'); // zinc-900
    gradient.addColorStop(1, '#09090b'); // zinc-950
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Accent line (Emerald)
    ctx.fillStyle = '#059669'; // emerald-600
    ctx.fillRect(80, 70, 8, 80);

    // Header branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('SIMULADOS ANBIMA', 105, 105);

    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('BREDI EXAM ENGINE · PREPARAÇÃO INDEPENDENTE', 105, 140);

    // Title
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillText(`Minha Evolução no Exame CPA`, 80, 240);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'normal 24px Inter, sans-serif';
    ctx.fillText(`Aluno: ${userName} · ${completedSimulations} simulados concluídos · Sequência de ${streakDays} dias`, 80, 280);

    // Big stats boxes
    // Box 1: Nota Inicial
    ctx.fillStyle = '#27272a';
    ctx.roundRect(80, 330, 320, 190, 16);
    ctx.fill();
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('NOTA INICIAL', 110, 380);
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(`${initialScore}%`, 110, 470);

    // Box 2: Nota Atual
    ctx.fillStyle = '#27272a';
    ctx.roundRect(440, 330, 320, 190, 16);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('NOTA ATUAL (APROVADO)', 470, 380);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(`${currentScore}%`, 470, 470);

    // Box 3: Crescimento
    ctx.fillStyle = '#27272a';
    ctx.roundRect(800, 330, 320, 190, 16);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('CRESCIMENTO TOTAL', 830, 380);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(`+${evolution} p.p.`, 830, 470);

    // Footer
    ctx.fillStyle = '#71717a';
    ctx.font = 'normal 18px Inter, sans-serif';
    ctx.fillText('simuladosanbima.com.br · Protótipo funcional desenvolvido por Bredi Tecnologia Digital', 80, 580);

    const link = document.createElement('a');
    link.download = `evolucao-cpa-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-zinc-900">Card Compartilhável de Conquista</h3>
        </div>

        {/* Visual Card Preview */}
        <div 
          ref={cardRef}
          className="rounded-xl p-6 text-white bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 border border-zinc-700 shadow-xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-zinc-700/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                SA
              </div>
              <div>
                <span className="font-bold text-sm tracking-wide text-zinc-100">SIMULADOS ANBIMA</span>
                <p className="text-[10px] text-emerald-400 font-medium">Bredi Exam Engine</p>
              </div>
            </div>
            <span className="text-[11px] text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded border border-zinc-700 font-mono">
              Certificação CPA
            </span>
          </div>

          <h4 className="text-xl font-bold text-zinc-100">Minha evolução nos simulados CPA</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Aluno: <span className="text-zinc-200 font-medium">{userName}</span> · {completedSimulations} simulados concluídos · {streakDays} dias de sequência
          </p>

          <div className="grid grid-cols-3 gap-3 my-5">
            <div className="bg-zinc-800/80 rounded-lg p-3 border border-zinc-700">
              <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase block">Nota Inicial</span>
              <span className="text-2xl font-bold text-zinc-200 mt-1 block">{initialScore}%</span>
            </div>
            <div className="bg-emerald-950/40 rounded-lg p-3 border border-emerald-800/60">
              <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase block">Nota Atual</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">{currentScore}%</span>
            </div>
            <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-800/60">
              <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase block">Crescimento</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{evolution} p.p.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-700/80 flex items-center justify-between text-[10px] text-zinc-400">
            <span>simuladosanbima.com.br</span>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Critério de corte atingido</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Exportação em alta resolução (1200×630px) pronta para LinkedIn ou WhatsApp.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar Imagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
