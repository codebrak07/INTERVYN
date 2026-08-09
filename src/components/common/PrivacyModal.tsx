import React from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle2, X } from 'lucide-react';
import { SessionStorageService } from '../../services/storage/SessionStorageService';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClear = () => {
    SessionStorageService.clearSessionData();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Private by Design</h3>
            <p className="text-xs text-slate-400 font-mono">Ephemeral Session Architecture</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Zero Database Storage</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Resumes, audio transcripts, coding submissions, and job match metrics are processed in volatile memory and are NEVER permanently persisted.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">No Request Logging</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Our ephemeral API gateway passes payloads directly to AI processing endpoints without retaining logs of your code or voice transcripts.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Purge Session Data Now
          </button>

          <button
            onClick={onClose}
            className="btn-primary text-xs px-5 py-2"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
