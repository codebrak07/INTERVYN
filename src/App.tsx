import React, { useState, useEffect } from 'react';
import { SessionStorageService } from './services/storage/SessionStorageService';
import { InterviewSession, Question } from './types';

// Visual & Layout Components
import { ChamberBackground } from './components/visualizer/ChamberBackground';
import { Header } from './components/common/Header';
import { PrivacyModal } from './components/common/PrivacyModal';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { ScreenShareModal } from './features/screenshare/ScreenShareModal';
import { VSCodeBridgeModal } from './features/vscode/VSCodeBridgeModal';

// Features Views
import { LandingView } from './features/landing/LandingView';
import { ResumeUploadView } from './features/onboarding/ResumeUploadView';
import { ResumeAnalysisView } from './features/onboarding/ResumeAnalysisView';
import { RoleSetupView } from './features/role/RoleSetupView';
import { BlueprintView } from './features/blueprint/BlueprintView';
import { VoiceQuestionView } from './features/interview/VoiceQuestionView';
import { MCQQuestionView } from './features/mcq/MCQQuestionView';
import { CodingTransitionView } from './features/coding/CodingTransitionView';
import { CodingArenaView } from './features/coding/CodingArenaView';
import { AssessmentReportView } from './features/report/AssessmentReportView';

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

      <main className="flex-1 relative z-10">{renderPhaseView()}</main>

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
