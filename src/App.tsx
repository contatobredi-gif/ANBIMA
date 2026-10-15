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

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(() => StorageService.getState());
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isPublicLanding, setIsPublicLanding] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Active exam execution or result view state
  const [activeSession, setActiveSession] = useState<ActiveExamSession | null>(() => appState.activeSession);
  const [viewingAttempt, setViewingAttempt] = useState<Attempt | null>(null);

  // Modals state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('Funcionalidade Pro');
  const [dailyChallengeOpen, setDailyChallengeOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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

  // Start exam / training
  const handleStartExam = (mode: AttemptMode, targetSubjectId?: string) => {
    const session = ExamEngine.startSession(mode, targetSubjectId);
    setActiveSession(session);
    setViewingAttempt(null);
    refreshState();
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
