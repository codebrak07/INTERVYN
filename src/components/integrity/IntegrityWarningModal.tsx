import React from 'react';
import { ShieldAlert, XCircle, X } from 'lucide-react';
import { IntegrityState } from '../../types';

interface IntegrityWarningModalProps {
  integrityState: IntegrityState;
  currentPhase?: string;
  onAcknowledge?: () => void;
}

export const IntegrityWarningModal: React.FC<IntegrityWarningModalProps> = ({
  integrityState,
  currentPhase,
  onAcknowledge
}) => {
  const isInterviewActive =
    currentPhase === 'QUESTION_VOICE' ||
    currentPhase === 'LISTENING' ||
    currentPhase === 'TRANSCRIBING' ||
    currentPhase === 'EVALUATING' ||
    currentPhase === 'MCQ_ROUND' ||
    currentPhase === 'BEHAVIORAL_ROUND' ||
    currentPhase === 'CODING_TRANSITION' ||
    currentPhase === 'CODING_ARENA' ||
    currentPhase === 'RUNNING_TESTS' ||
    currentPhase === 'SUBMITTING_HIDDEN';

  if (!isInterviewActive || integrityState.status === 'NORMAL') return null;

  const isTerminated = integrityState.status === 'TERMINATED';
  const isFinalWarning = integrityState.status === 'WARNING_2';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        {!isTerminated && (
          <button
            onClick={() => {
              if (onAcknowledge) onAcknowledge();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Acknowledge & Close Notice"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isTerminated
              ? 'bg-rose-950 text-rose-400 border border-rose-800'
              : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}>
            {isTerminated ? <XCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isTerminated
                ? 'INTERVIEW TERMINATED'
                : isFinalWarning
                ? 'FINAL INTEGRITY WARNING'
                : 'INTEGRITY WARNING 01 / 03'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              STATUS: {integrityState.status} • VIOLATIONS: {integrityState.violationsCount}/3
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 mb-6 text-xs text-slate-300 leading-relaxed font-mono">
          {isTerminated ? (
            <p className="text-rose-300">
              The interview was automatically submitted because the integrity threshold was exceeded (3 window/tab departures or media interruptions).
            </p>
          ) : isFinalWarning ? (
            <p className="text-amber-300">
              Interview integrity warning. Leaving the interview environment or switching tabs again will automatically terminate this session and finalize available evidence.
            </p>
          ) : (
            <p className="text-slate-300">
              We detected that the interview window lost focus or changed visibility state. Please remain inside the interview environment.
            </p>
          )}
        </div>

        {integrityState.events.length > 0 && (
          <div className="mb-6 space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {integrityState.events.slice(-3).map((evt) => (
              <div key={evt.id} className="text-[11px] font-mono text-slate-400 flex items-center justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-300">{evt.type}</span>
                <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {!isTerminated && (
          <button
            onClick={() => {
              if (onAcknowledge) onAcknowledge();
            }}
            className="w-full bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs tracking-wider font-mono transition-all cursor-pointer shadow-lg active:scale-95 text-center flex items-center justify-center gap-2 border border-cyan-400/40"
          >
            <span>I UNDERSTAND & RETURN TO INTERVIEW</span>
          </button>
        )}

        {isTerminated && (
          <div className="text-center text-xs text-rose-400 font-mono font-bold py-2 bg-rose-950/40 border border-rose-900/60 rounded-xl">
            Generating Integrity-Aware Dossier Report...
          </div>
        )}
      </div>
    </div>
  );
};
