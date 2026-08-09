import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, Key, Clock, Video, Code, ArrowRight, FolderArchive } from 'lucide-react';
import { SessionStorageService } from '../../services/storage/SessionStorageService';
import { InterviewPhase } from '../../types';

interface HeaderProps {
  currentPhase: InterviewPhase;
  onOpenPrivacy: () => void;
  onOpenScreenShare: () => void;
  onOpenVSCode: () => void;
  onOpenApiKey: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  onOpenPrivacy,
  onOpenScreenShare,
  onOpenVSCode,
  onOpenApiKey,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showArchiveNotice, setShowArchiveNotice] = useState(false);

  useEffect(() => {
    let interval: any;
    if (
      currentPhase !== 'LANDING' &&
      currentPhase !== 'RESUME_UPLOAD' &&
      currentPhase !== 'REPORT'
    ) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPhase]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    SessionStorageService.setPhase('RESUME_UPLOAD');
  };

  const handleArchiveClick = () => {
    setShowArchiveNotice(true);
  };

  return (
    <header className="relative z-40 flex justify-between items-center w-full px-6 md:px-16 py-4 border-b border-slate-900/[0.08] bg-[#F5F6F3]/90 backdrop-blur-md">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => SessionStorageService.setPhase('LANDING')}>
        <img
          src="/assets/logo.png"
          alt="INTERVYN Logo"
          className="h-8 w-auto object-contain"
        />
        <div className="flex items-baseline gap-2">
          <span className="font-geist text-2xl font-bold tracking-tighter text-[#0F172A]">INTERVYN</span>
          <span className="font-mono-intervyn text-[10px] text-slate-500 hidden md:inline-block border border-slate-300 px-2 py-0.5 rounded tracking-wider">
            AI INTERVIEW SIMULATOR
          </span>
        </div>
      </div>

      {/* Nav items / Middle status */}
      <div className="hidden md:flex items-center gap-6">
        {currentPhase === 'LANDING' ? (
          <>
            <button
              onClick={handleStartSession}
              className="font-mono-intervyn text-xs text-[#475569] hover:text-[#0891B2] transition-colors uppercase cursor-pointer bg-transparent border-none font-medium"
            >
              SIMULATIONS
            </button>
            <button
              onClick={handleArchiveClick}
              className="font-mono-intervyn text-xs text-[#475569] hover:text-[#0891B2] transition-colors uppercase cursor-pointer bg-transparent border-none font-medium"
            >
              ARCHIVE
            </button>
            <button
              onClick={handleStartSession}
              className="font-mono-intervyn text-xs text-[#475569] hover:text-[#0891B2] transition-colors uppercase cursor-pointer bg-transparent border-none font-medium"
            >
              SESSIONS
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFFFFF] border border-slate-200 text-xs font-mono text-cyan-700 shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <button
              onClick={onOpenScreenShare}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFFFFF] hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono transition-colors shadow-sm"
            >
              <Video className="w-3.5 h-3.5 text-cyan-600" />
              <span>Screen Share</span>
            </button>

            <button
              onClick={onOpenVSCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFFFFF] hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono transition-colors shadow-sm"
            >
              <Code className="w-3.5 h-3.5 text-purple-600" />
              <span>VS Code</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPrivacy}
          className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 hover:text-emerald-800 transition-colors px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Private by design</span>
        </button>

        <button
          onClick={onOpenApiKey}
          className="p-1.5 rounded bg-[#FFFFFF] hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-1 transition-colors hover:border-amber-400/50 shadow-sm"
          title="Configure Groq API Key"
        >
          <Key className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {currentPhase === 'LANDING' ? (
          <button
            onClick={handleStartSession}
            className="btn-intervyn-outline flex items-center gap-1.5 font-bold"
          >
            <span>START_SESSION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => SessionStorageService.clearSessionData()}
            className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-mono flex items-center gap-1 transition-colors"
            title="Clear Session Data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Session</span>
          </button>
        )}
      </div>

      {/* Archive Modal Notice */}
      {showArchiveNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <FolderArchive className="w-6 h-6 text-[#0891B2]" />
              <h3 className="text-lg font-bold text-[#0F172A] font-geist">Zero-Persistence Archive</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed mb-5 font-geist">
              By architectural design, INTERVYN operates with 0 persistent database storage. All interview sessions are ephemeral and cleared upon teardown.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowArchiveNotice(false)}
                className="px-4 py-2 rounded bg-[#F8FAFC] border border-slate-200 text-[#0F172A] text-xs font-mono-intervyn hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
