import React from 'react';
import { AlertOctagon, ShieldAlert, XCircle } from 'lucide-react';
import { IntegrityState } from '../../types';

interface IntegrityWarningModalProps {
  integrityState: IntegrityState;
  onAcknowledge?: () => void;
}

export const IntegrityWarningModal: React.FC<IntegrityWarningModalProps> = ({
  integrityState,
  onAcknowledge
}) => {
  if (integrityState.status === 'NORMAL') return null;

  const isTerminated = integrityState.status === 'TERMINATED';
  const isFinalWarning = integrityState.status === 'WARNING_2';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
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
                <span>{evt.type}</span>
                <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {!isTerminated && onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="w-full btn-primary py-3 rounded-xl text-xs font-semibold"
          >
            I UNDERSTAND & RETURN TO INTERVIEW
          </button>
        )}

        {isTerminated && (
          <div className="text-center text-xs text-rose-400 font-mono">
            Generating Integrity-Aware Dossier Report...
          </div>
        )}
      </div>
    </div>
  );
};
