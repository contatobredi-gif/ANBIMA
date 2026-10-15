import React, { useState } from 'react';
import { NotificationItem, NotificationPreferences } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Settings, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface NotificationsCenterProps {
  notifications: NotificationItem[];
  preferences: NotificationPreferences;
  onNavigate: (view: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  preferences,
  onNavigate
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(preferences);
  const [prefSavedMessage, setPrefSavedMessage] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead();
  };

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const state = StorageService.getState();
    const updated = {
      ...prefs,
      [key]: !prefs[key]
    };
    setPrefs(updated);
    state.notificationPreferences = updated;
    StorageService.saveState(state);
    setPrefSavedMessage(true);
    setTimeout(() => setPrefSavedMessage(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'conquista': return <Award className="w-4 h-4 text-emerald-600" />;
      case 'desempenho': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'alerta': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <BookOpen className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Central de Avisos
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">{unreadCount} não lidas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Notificações & Alertas
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Acompanhe avisos de desempenho, lembretes de estudo e conquistas liberadas.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Marcar todas como lidas</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs divide-y divide-zinc-100 overflow-hidden">
        {notifications.map(item => (
          <div
            key={item.id}
            onClick={() => {
              if (!item.read) handleMarkAsRead(item.id);
              if (item.actionPath) onNavigate(item.actionPath);
            }}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
              !item.read ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                !item.read ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
              }`}>
                {getCategoryIcon(item.category)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{item.message}</p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2">
                  <span>{item.date}</span>
                  {item.actionPath && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                        Acessar conteúdo <ArrowRight className="w-3 h-3" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!item.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(item.id);
                }}
                className="text-[11px] text-zinc-400 hover:text-zinc-700 p-1 flex-shrink-0 cursor-pointer"
                title="Marcar como lida"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Preferences Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900">Preferências de Notificação (Simuladas)</h3>
          </div>
          {prefSavedMessage && (
            <span className="text-xs text-emerald-700 font-semibold animate-in fade-in">
              Preferência salva!
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-800 block">Lembretes de estudo por e-mail</span>
              <span className="text-zinc-500 block">Avisos semanais de metas e streak</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.emailStudyReminders}
              onChange={() => handleTogglePref('emailStudyReminders')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-800 block">Relatórios de desempenho pós-simulado</span>
              <span className="text-zinc-500 block">Resumo consolidado em sua caixa de entrada</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.emailPerformanceReports}
              onChange={() => handleTogglePref('emailPerformanceReports')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-800 block">Alertas na barra superior da aplicação</span>
              <span className="text-zinc-500 block">Badges e sininho interativo</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.inAppAlerts}
              onChange={() => handleTogglePref('inAppAlerts')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-800 block">Notificações Push no navegador (Simulação futura)</span>
              <span className="text-zinc-500 block">Avisos automáticos de novo desafio do dia</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.pushSimulation}
              onChange={() => handleTogglePref('pushSimulation')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
