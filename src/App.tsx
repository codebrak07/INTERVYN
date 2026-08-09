import React, { useState, useEffect, lazy, Suspense } from 'react';
import { SessionStorageService } from './services/storage/SessionStorageService';
import { InterviewSession, Question } from './types';
import { IntegrityMonitor } from './services/integrity/IntegrityMonitor';

// Visual & Layout Components
import { ChamberBackground } from './components/visualizer/ChamberBackground';
import { Header } from './components/common/Header';
import { PrivacyModal } from './components/common/PrivacyModal';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { ScreenShareModal } from './features/screenshare/ScreenShareModal';
import { VSCodeBridgeModal } from './features/vscode/VSCodeBridgeModal';
import { IntegrityWarningModal } from './components/integrity/IntegrityWarningModal';

// Lazy-loaded Feature Views
const LandingView = lazy(() => import('./features/landing/LandingView').then(m => ({ default: m.LandingView })));
const ResumeUploadView = lazy(() => import('./features/onboarding/ResumeUploadView').then(m => ({ default: m.ResumeUploadView })));
const ResumeAnalysisView = lazy(() => import('./features/onboarding/ResumeAnalysisView').then(m => ({ default: m.ResumeAnalysisView })));
const RoleSetupView = lazy(() => import('./features/role/RoleSetupView').then(m => ({ default: m.RoleSetupView })));
const BlueprintView = lazy(() => import('./features/blueprint/BlueprintView').then(m => ({ default: m.BlueprintView })));
const VoiceQuestionView = lazy(() => import('./features/interview/VoiceQuestionView').then(m => ({ default: m.VoiceQuestionView })));
const MCQQuestionView = lazy(() => import('./features/mcq/MCQQuestionView').then(m => ({ default: m.MCQQuestionView })));
const CodingTransitionView = lazy(() => import('./features/coding/CodingTransitionView').then(m => ({ default: m.CodingTransitionView })));
const CodingArenaView = lazy(() => import('./features/coding/CodingArenaView').then(m => ({ default: m.CodingArenaView })));
const AssessmentReportView = lazy(() => import('./features/report/AssessmentReportView').then(m => ({ default: m.AssessmentReportView })));

export function App() {
  const [session, setSession] = useState<InterviewSession>(SessionStorageService.getSession());
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false);
  const [isVSCodeOpen, setIsVSCodeOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = SessionStorageService.subscribe(updated => {
      setSession(updated);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Start integrity monitoring when interview starts
    if (session.currentPhase !== 'LANDING' && session.currentPhase !== 'REPORT') {
      IntegrityMonitor.startMonitoring();
    } else {
      IntegrityMonitor.stopMonitoring();
    }
    return () => IntegrityMonitor.stopMonitoring();
  }, [session.currentPhase]);

  const currentQuestion: Question | undefined = session.questions[session.currentQuestionIndex];

  const renderPhaseView = () => {
    switch (session.currentPhase) {
      case 'LANDING':
        return <LandingView />;

      case 'RESUME_UPLOAD':
        return <ResumeUploadView />;

      case 'RESUME_ANALYZING':
        return session.candidateProfile ? (
          <ResumeAnalysisView
            profile={session.candidateProfile}
            onContinue={() => SessionStorageService.setPhase('ROLE_SETUP')}
          />
        ) : (
          <ResumeUploadView />
        );

      case 'ROLE_SETUP':
        return <RoleSetupView />;

      case 'BLUEPRINT_READY':
        return session.blueprint ? (
          <BlueprintView blueprint={session.blueprint} targetRole={session.targetRole} />
        ) : (
          <RoleSetupView />
        );

      case 'QUESTION_VOICE':
      case 'LISTENING':
      case 'TRANSCRIBING':
      case 'EVALUATING':
      case 'BEHAVIORAL_ROUND':
        return currentQuestion ? (
          <VoiceQuestionView
            question={currentQuestion}
            questionNumber={session.currentQuestionIndex + 1}
            totalQuestions={session.questions.length}
          />
        ) : (
          <LandingView />
        );

      case 'MCQ_ROUND':
        return currentQuestion ? (
          <MCQQuestionView
            question={currentQuestion}
            questionNumber={session.currentQuestionIndex + 1}
            totalQuestions={session.questions.length}
          />
        ) : (
          <LandingView />
        );

      case 'CODING_TRANSITION':
        return <CodingTransitionView />;

      case 'CODING_ARENA':
      case 'RUNNING_TESTS':
      case 'SUBMITTING_HIDDEN':
        return currentQuestion ? (
          <CodingArenaView question={currentQuestion} />
        ) : (
          <LandingView />
        );

      case 'FINAL_EVALUATION':
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-mono-intervyn text-[#0891B2]">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-md flex items-center justify-center mb-4 animate-spin">
              <span className="w-4 h-4 rounded-full bg-[#0891B2]"></span>
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2 font-geist">Synthesizing Final Assessment Report</h3>
            <p className="text-xs text-[#64748B]">Aggregating interview depth, voice telemetry, and code sandbox metrics...</p>
          </div>
        );

      case 'REPORT':
        return session.finalReport ? (
          <AssessmentReportView report={session.finalReport} />
        ) : (
          <LandingView />
        );

      default:
        return <LandingView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F3] text-[#0F172A] flex flex-col relative overflow-x-hidden selection:bg-[#0891B2]/20 selection:text-[#0891B2]">
      {/* THE INTERVYN FIELD — Light Editorial Precision Architectural Environment */}
      <ChamberBackground currentPhase={session.currentPhase} />

      <Header
        currentPhase={session.currentPhase}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenScreenShare={() => setIsScreenShareOpen(true)}
        onOpenVSCode={() => setIsVSCodeOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
      />

      <main className="flex-1 relative z-10">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-slate-400">
            Loading INTERVYN Module...
          </div>
        }>
          {renderPhaseView()}
        </Suspense>
      </main>

      <IntegrityWarningModal
        integrityState={session.integrityState}
        onAcknowledge={() => {
          IntegrityMonitor.acknowledgeGracePeriod(3000);
          SessionStorageService.updateSession(prev => ({
            ...prev,
            integrityState: {
              ...prev.integrityState,
              status: 'NORMAL'
            }
          }));
        }}
      />

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
      <ScreenShareModal isOpen={isScreenShareOpen} onClose={() => setIsScreenShareOpen(false)} />
      <VSCodeBridgeModal
        isOpen={isVSCodeOpen}
        onClose={() => setIsVSCodeOpen(false)}
        currentCode={currentQuestion?.codingProblem?.starterCode || ''}
      />
    </div>
  );
}

export default App;
