import React, { useState, useRef, useEffect } from 'react';
import { Bell, Shield, RotateCcw, Sparkles, User, LogOut, ExternalLink, Menu, Check, ChevronDown, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { UserProfile, NotificationItem, PlanType, ExamId } from '../../types';
import { StorageService } from '../../services/storageService';
import { AccessControlService } from '../../services/accessControlService';

interface NavbarProps {
  user: UserProfile;
  notifications: NotificationItem[];
  onNavigate: (view: string) => void;
  onOpenMobileMenu: () => void;
  onPlanToggle: (examId?: ExamId) => void;
  onResetData: () => void;
  onRestoreData: () => void;
  isPublicMode: boolean;
  onTogglePublicMode: () => void;
  onSelectExam?: (examId: ExamId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  notifications,
  onNavigate,
  onOpenMobileMenu,
  onPlanToggle,
  onResetData,
  onRestoreData,
  isPublicMode,
  onTogglePublicMode,
  onSelectExam
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const examRef = useRef<HTMLDivElement>(null);

  const selectedExamId: ExamId = user.selectedExamId || 'cpa';
  const currentPlanType = AccessControlService.getPlanType(selectedExamId);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (examRef.current && !examRef.current.contains(e.target as Node)) {
        setExamDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchExam = (examId: ExamId) => {
    StorageService.setSelectedExam(examId);
    if (onSelectExam) onSelectExam(examId);
    setExamDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 lg:px-8 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left side: Mobile menu toggle + Interactive Exam Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Exam Selector Dropdown */}
          <div className="relative" ref={examRef}>
            <button
              onClick={() => setExamDropdownOpen(!examDropdownOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 border border-zinc-200 transition-colors cursor-pointer"
              title="Trocar exame ativo"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Exame: {selectedExamId.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {examDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                  Selecionar Exame Ativo
                </div>
                <button
                  onClick={() => handleSwitchExam('cpa')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-50 ${
                    selectedExamId === 'cpa' ? 'font-bold text-emerald-800 bg-emerald-50/50' : 'text-zinc-700'
                  }`}
                >
                  <div>
                    <span className="block">CPA (ANBIMA)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      Plano: {AccessControlService.getPlanType('cpa')}
                    </span>
                  </div>
                  {selectedExamId === 'cpa' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => handleSwitchExam('oab')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-50 ${
                    selectedExamId === 'oab' ? 'font-bold text-emerald-800 bg-emerald-50/50' : 'text-zinc-700'
                  }`}
                >
                  <div>
                    <span className="block">OAB 1ª Fase (Demonstrativo)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      Plano: {AccessControlService.getPlanType('oab')}
                    </span>
                  </div>
                  {selectedExamId === 'oab' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-normal">
            Ambiente Demonstrativo Independente
          </span>
        </div>

        {/* Right side: Public Toggle + Plan Badge for Selected Exam + Notifications + User Menu */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Public / Student Area Switcher Button */}
          <button
            onClick={onTogglePublicMode}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            <span>{isPublicMode ? 'Entrar na Área do Aluno' : 'Ver Landing Page'}</span>
          </button>

          {/* Quick Plan Switcher Badge for the currently selected exam */}
          <div className="flex items-center">
            <button
              onClick={() => onPlanToggle(selectedExamId)}
              title={`Clique para alternar entre Free e Pro no exame ${selectedExamId.toUpperCase()}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentPlanType === 'Pro'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                  : 'bg-zinc-100 text-zinc-700 border border-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{selectedExamId.toUpperCase()}: Plano {currentPlanType}</span>
              <span className="text-[10px] text-zinc-500 font-normal">(Alternar)</span>
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">Notificações</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        StorageService.markAllNotificationsAsRead();
                      }}
                      className="text-[11px] text-emerald-700 hover:underline font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
                  {notifications.slice(0, 4).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        StorageService.markNotificationAsRead(notif.id);
                        if (notif.actionPath) onNavigate(notif.actionPath);
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-3 text-left hover:bg-zinc-50 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-900">{notif.title}</span>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap">{notif.date}</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-zinc-100 text-center">
                  <button
                    onClick={() => {
                      onNavigate('notifications');
                      setNotifDropdownOpen(false);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-200"
              />
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-zinc-900 block leading-tight">{user.name}</span>
                <span className="text-[10px] text-zinc-500 block leading-tight">Aluno Demonstrativo</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-zinc-100">
                  <p className="text-xs font-bold text-zinc-900">{user.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Plano ativo:</span>
                    <span className="font-semibold text-emerald-700">{user.plan}</span>
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      onPlanToggle();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center justify-between text-zinc-700"
                  >
                    <span>Alternar Free / Pro</span>
                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 font-mono">
                      {user.plan === 'Pro' ? 'Mudar p/ Free' : 'Mudar p/ Pro'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-700"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Meu Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-700"
                  >
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Painel Administrativo</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-zinc-100 text-xs">
                  <button
                    onClick={() => {
                      onResetData();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-600"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Reiniciar dados de teste</span>
                  </button>

                  <button
                    onClick={() => {
                      onRestoreData();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-emerald-700 font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restaurar dados iniciais (Rafael Martins)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
