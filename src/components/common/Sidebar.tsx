import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck2, 
  Target, 
  TrendingUp, 
  Trophy, 
  Medal, 
  Newspaper, 
  Bell, 
  User, 
  ShieldCheck, 
  X,
  Flame,
  Zap,
  ExternalLink
} from 'lucide-react';
import { PlanType } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  plan: PlanType;
  consecutiveDays: number;
  engagementPoints: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  plan,
  consecutiveDays,
  engagementPoints
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulados', label: 'Simulados', icon: FileCheck2 },
    { id: 'treinos', label: 'Treinos Direcionados', icon: Target },
    { id: 'analytics', label: 'Minha Evolução', icon: TrendingUp },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'conquistas', label: 'Conquistas', icon: Medal },
    { id: 'updates', label: 'Central de Atualizações', icon: Newspaper },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'profile', label: 'Meu Perfil', icon: User }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200/80 w-64">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              SA
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight leading-tight">
                Simulados ANBIMA
              </h1>
              <p className="text-[10px] text-emerald-700 font-semibold tracking-wider uppercase">
                Bredi Exam Engine
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mini Streak & Points card in Sidebar */}
      <div className="px-4 py-3 mx-3 my-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-700">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{consecutiveDays} dias</span>
            <span className="text-[10px] text-zinc-400">seguidos</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>{engagementPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-3 py-1">
          Menu Principal
        </div>
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-zinc-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section: Admin & Demo info */}
      <div className="p-3 border-t border-zinc-100 space-y-1">
        <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-3 py-1">
          Gestão & Motor
        </div>
        <button
          onClick={() => handleItemClick('admin')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
            currentView === 'admin'
              ? 'bg-zinc-900 text-white font-semibold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${currentView === 'admin' ? 'text-white' : 'text-zinc-400'}`} />
          <span className="truncate">Painel Administrativo</span>
        </button>

        <div className="mt-2 pt-2 px-3 text-[10px] text-zinc-400 leading-normal border-t border-zinc-100">
          <p className="font-medium text-zinc-500">Desenvolvido por Bredi</p>
          <p>Protótipo para validação de UX</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 flex-shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
