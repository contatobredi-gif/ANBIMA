import React, { useState, useEffect } from 'react';
import { 
  AppStateData, 
  Attempt, 
  ActiveExamSession, 
  PlanType,
  AttemptMode 
} from './types';
import { StorageService } from './services/storageService';
import { ExamEngine } from './services/examEngine';

// Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ShareableCardModal } from './components/common/ShareableCardModal';
import { UpgradeModal } from './components/common/UpgradeModal';
import { DailyChallengeModal } from './components/common/DailyChallengeModal';
import { FeedbackModal } from './components/common/FeedbackModal';

import { LandingPage } from './components/landing/LandingPage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ExamRunner } from './components/exam/ExamRunner';
import { ExamResultView } from './components/exam/ExamResultView';
import { SimuladosHome } from './components/exam/SimuladosHome';
import { TrainingHome } from './components/training/TrainingHome';
import { EvolutionAnalytics } from './components/analytics/EvolutionAnalytics';
import { RankingPage } from './components/gamification/RankingPage';
import { AchievementsPage } from './components/gamification/AchievementsPage';
import { UpdatesCenter } from './components/updates/UpdatesCenter';
import { NotificationsCenter } from './components/notifications/NotificationsCenter';
import { UserProfileView } from './components/profile/UserProfile';
import { AdminPanel } from './components/admin/AdminPanel';
import { AlertCircle, X, PlayCircle, Trash2 } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(() => StorageService.getState());
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isPublicLanding, setIsPublicLanding] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Active exam execution or result view state
  const [activeSession, setActiveSession] = useState<ActiveExamSession | null>(() => appState.activeSession);
  const [viewingAttempt, setViewingAttempt] = useState<Attempt | null>(null);

  // Modals and Alerts state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('Funcionalidade Pro');
  const [dailyChallengeOpen, setDailyChallengeOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [engineAlert, setEngineAlert] = useState<string | null>(null);

  // Sync state with storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      setAppState(StorageService.getState());
    };
    window.addEventListener('storage-update', handleStorageUpdate);
    return () => window.removeEventListener('storage-update', handleStorageUpdate);
  }, []);

  const refreshState = () => {
    setAppState(StorageService.getState());
  };

  // Switch Plan
  const handlePlanToggle = () => {
    StorageService.togglePlan();
    refreshState();
  };

  // Reset Demo
  const handleResetData = () => {
    StorageService.resetDemoData();
    setActiveSession(null);
    setViewingAttempt(null);
    refreshState();
  };

  // Restore Initial Seed (Rafael Martins)
  const handleRestoreData = () => {
    StorageService.restoreInitialData();
    setActiveSession(null);
    setViewingAttempt(null);
    refreshState();
  };

  // Start exam / training with safe engine exception handling
  const handleStartExam = (mode: AttemptMode, targetSubjectId?: string) => {
    try {
      const session = ExamEngine.startSession(mode, targetSubjectId);
      setActiveSession(session);
      setViewingAttempt(null);
      refreshState();
    } catch (err: any) {
      setEngineAlert(err?.message || 'Não foi possível iniciar a tentativa.');
    }
  };

  // Finish exam
  const handleFinishExam = (attempt: Attempt) => {
    setActiveSession(null);
    setViewingAttempt(attempt);
    refreshState();
  };

  // Exit without finishing
  const handleExitWithoutFinishing = () => {
    setActiveSession(null);
    refreshState();
  };

  // Open upgrade modal with custom feature trigger
  const handleOpenUpgrade = (featureName: string) => {
    setUpgradeFeature(featureName);
    setUpgradeModalOpen(true);
  };

  // Navigation handler
  const handleNavigate = (view: string) => {
    if (view === 'daily_challenge') {
      setDailyChallengeOpen(true);
      return;
    }
    if (view === 'training_mat_fin') {
      handleStartExam('TARGETED_TRAINING', 'mat_fin');
      return;
    }
    if (view === 'history') {
      setCurrentView('analytics');
      setViewingAttempt(null);
      return;
    }
    setViewingAttempt(null);
    setCurrentView(view);
  };

  // Public Landing vs Student Area
  if (isPublicLanding) {
    return (
      <LandingPage
        feedbacks={appState.feedbacks}
        onEnterStudentArea={() => setIsPublicLanding(false)}
        onSelectPlanAndEnter={(plan: PlanType) => {
          StorageService.setPlan(plan);
          refreshState();
          setIsPublicLanding(false);
        }}
      />
    );
  }

  // Active Exam Runner takes full screen
  if (activeSession) {
    return (
      <ExamRunner
        appState={appState}
        activeSession={activeSession}
        onFinishExam={handleFinishExam}
        onExitWithoutFinishing={handleExitWithoutFinishing}
      />
    );
  }

  const examRule = appState.examRules[appState.user.selectedExamId] || appState.examRules['cpa'];
  const fullExams = appState.attempts.filter(a => a.mode === 'FULL_EXAM');
  const bestScoreOverall = fullExams.length > 0 
    ? Math.max(...fullExams.map(a => a.scorePercentage)) 
    : 0;

  return (
    <div className="min-h-screen bg-[#FDFDFC] flex text-zinc-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        plan={appState.user.plan}
        consecutiveDays={appState.user.consecutiveDays}
        engagementPoints={appState.user.engagementPoints}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={appState.user}
          notifications={appState.notifications}
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onPlanToggle={handlePlanToggle}
          onResetData={handleResetData}
          onRestoreData={handleRestoreData}
          isPublicMode={isPublicLanding}
          onTogglePublicMode={() => setIsPublicLanding(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Engine Alert Banner (e.g. content validation errors) */}
          {engineAlert && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Aviso do Motor de Provas</h4>
                  <p className="text-xs text-amber-800 mt-0.5">{engineAlert}</p>
                </div>
              </div>
              <button
                onClick={() => setEngineAlert(null)}
                className="p-1 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Paused Session Resumption Banner */}
          {appState.activeSession && !activeSession && !viewingAttempt && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Você tem uma sessão em andamento!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    {appState.activeSession.mode === 'FULL_EXAM'
                      ? 'Simulado Completo CPA'
                      : appState.activeSession.mode === 'TARGETED_TRAINING'
                      ? 'Treino Direcionado'
                      : 'Revisão de Erros'} · {Object.keys(appState.activeSession.answers).length} de {appState.activeSession.questionIds.length} questões respondidas.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    StorageService.saveActiveSession(null);
                    refreshState();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Descartar</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSession(appState.activeSession);
                    setViewingAttempt(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Retomar Prova</span>
                </button>
              </div>
            </div>
          )}

          {/* If viewing a completed attempt result */}
          {viewingAttempt ? (
            <ExamResultView
              attempt={viewingAttempt}
              examRule={examRule}
              previousAttempt={
                fullExams.length > 1 ? fullExams[fullExams.length - 2] : undefined
              }
              bestScoreOverall={bestScoreOverall}
              allQuestions={appState.questions}
              onStartTraining={(subjectId) => {
                setViewingAttempt(null);
                handleStartExam('TARGETED_TRAINING', subjectId);
              }}
              onBackToDashboard={() => {
                setViewingAttempt(null);
                setCurrentView('dashboard');
              }}
              onOpenShareModal={() => setShareModalOpen(true)}
              onNewSimulation={() => {
                setViewingAttempt(null);
                handleStartExam('FULL_EXAM');
              }}
            />
          ) : (
            /* Views */
            <>
              {currentView === 'dashboard' && (
                <StudentDashboard
                  appState={appState}
                  onStartExam={handleStartExam}
                  onOpenDailyChallenge={() => setDailyChallengeOpen(true)}
                  onOpenUpgradeModal={handleOpenUpgrade}
                  onNavigate={handleNavigate}
                  onShareProgress={() => setShareModalOpen(true)}
                />
              )}

              {currentView === 'simulados' && (
                <SimuladosHome
                  attempts={appState.attempts}
                  examRule={examRule}
                  plan={appState.user.plan}
                  onStartSimulation={() => handleStartExam('FULL_EXAM')}
                  onOpenAttemptResult={(att) => setViewingAttempt(att)}
                  onOpenUpgradeModal={handleOpenUpgrade}
                />
              )}

              {currentView === 'treinos' && (
                <TrainingHome
                  subjects={appState.subjects}
                  attempts={appState.attempts}
                  plan={appState.user.plan}
                  questions={appState.questions}
                  selectedExamId={appState.user.selectedExamId || 'cpa'}
                  examRule={examRule}
                  onStartTraining={(subjectId) => handleStartExam('TARGETED_TRAINING', subjectId)}
                  onStartErrorReview={() => handleStartExam('ERROR_REVIEW')}
                  onOpenAttemptResult={(att) => setViewingAttempt(att)}
                  onOpenUpgradeModal={handleOpenUpgrade}
                />
              )}

              {currentView === 'analytics' && (
                <EvolutionAnalytics
                  attempts={appState.attempts}
                  subjects={appState.subjects}
                  examRule={examRule}
                  onOpenAttemptResult={(att) => setViewingAttempt(att)}
                />
              )}

              {currentView === 'ranking' && (
                <RankingPage
                  rankings={appState.rankings}
                  currentUserId={appState.user.id}
                />
              )}

              {currentView === 'conquistas' && (
                <AchievementsPage
                  achievements={appState.achievements}
                  onOpenShareModal={() => setShareModalOpen(true)}
                />
              )}

              {currentView === 'updates' && (
                <UpdatesCenter
                  articles={appState.articles}
                  newsletterSubscribed={appState.newsletterSubscribed}
                  onNewsletterToggle={(email) => {
                    StorageService.toggleNewsletter(email);
                    refreshState();
                  }}
                />
              )}

              {currentView === 'notifications' && (
                <NotificationsCenter
                  notifications={appState.notifications}
                  preferences={appState.notificationPreferences}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'profile' && (
                <UserProfileView
                  user={appState.user}
                  onPlanToggle={handlePlanToggle}
                  onResetData={handleResetData}
                  onRestoreData={handleRestoreData}
                  onOpenAdmin={() => setCurrentView('admin')}
                  onOpenFeedbackModal={() => setFeedbackModalOpen(true)}
                />
              )}

              {currentView === 'admin' && (
                <AdminPanel
                  appState={appState}
                  onRefresh={refreshState}
                  onBackToDashboard={() => setCurrentView('dashboard')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        featureTriggered={upgradeFeature}
        onUpgraded={() => refreshState()}
      />

      <DailyChallengeModal
        isOpen={dailyChallengeOpen}
        onClose={() => setDailyChallengeOpen(false)}
        questions={appState.questions}
        onCompleted={() => refreshState()}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmitted={() => refreshState()}
      />

      <ShareableCardModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        userName={appState.user.name}
        initialScore={fullExams.length > 0 ? fullExams[0].scorePercentage : 44}
        currentScore={fullExams.length > 0 ? fullExams[fullExams.length - 1].scorePercentage : 72}
        completedSimulations={fullExams.length}
        streakDays={appState.user.consecutiveDays}
      />
    </div>
  );
}
