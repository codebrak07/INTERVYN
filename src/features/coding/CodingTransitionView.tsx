import React, { useEffect } from 'react';
import { Code, Sparkles, ArrowRight } from 'lucide-react';
import { SessionStorageService } from '../../services/storage/SessionStorageService';

export const CodingTransitionView: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      SessionStorageService.setPhase('CODING_ARENA');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-0.5 shadow-2xl mb-8 animate-pulse">
        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-cyan-400">
          <Code className="w-10 h-10" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>CINEMATIC ARENA TRANSITION</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
        "Let's test how you approach this problem."
      </h2>

      <p className="text-sm text-slate-400 max-w-md font-mono mb-8">
        Entering Controlled Sandboxed Coding Arena. Monaco Editor initializing with visible and hidden test suites.
      </p>

      <div className="w-48 h-1.5 rounded-full bg-slate-900 overflow-hidden mx-auto">
        <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-violet-500 animate-pulse"></div>
      </div>
    </div>
  );
};
