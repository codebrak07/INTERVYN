import React, { useState } from 'react';
import { Key, ShieldCheck, X, Check, Sparkles } from 'lucide-react';
import { InterviewEngine } from '../../engine/InterviewEngine';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      InterviewEngine.setApiKey(apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#121316] border border-[#cebdff]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-purple-950/40 relative overflow-hidden">
        {/* Glow accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-geist">Groq API Gateway Key</h3>
            <p className="text-[11px] text-slate-400 font-mono-vanta">Stateless Server Proxy Architecture</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d0e11] border border-white/10 mb-5 text-xs font-mono-vanta text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Ephemeral Gateway Isolation
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Your Groq API key is used exclusively by our server proxy to handle LLM requests. It is never exposed in the client bundle or persisted to disk.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-mono-vanta text-slate-400 uppercase tracking-widest mb-2">
            Enter Groq API Key
          </label>
          <input
            type="password"
            placeholder="gsk_..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full bg-[#0d0e11] border border-white/10 focus:border-[#cebdff] rounded-xl px-4 py-3 text-sm text-white font-mono-vanta focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-mono-vanta text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Key active for current session
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-vanta transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!apiKey.trim()}
              onClick={handleSaveApiKey}
              className="px-5 py-2 rounded-lg btn-vanta-primary text-xs flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
