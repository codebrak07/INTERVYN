import React, { useState } from 'react';
import { Code, Download, Upload, X, ShieldAlert, Check } from 'lucide-react';

interface VSCodeBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCode?: (code: string) => void;
  currentCode?: string;
}

export const VSCodeBridgeModal: React.FC<VSCodeBridgeModalProps> = ({
  isOpen,
  onClose,
  onImportCode,
  currentCode = '',
}) => {
  const [snippet, setSnippet] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (snippet.trim() && onImportCode) {
      onImportCode(snippet.trim());
      onClose();
    }
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
          <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-800/60 flex items-center justify-center text-violet-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">VS Code Integration</h3>
            <p className="text-xs text-slate-400 font-mono">Import / Export Code Bridge</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 mb-6 text-xs text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Controlled Sandbox Enforcement</span>
            VS Code cannot bypass our controlled evaluation. Any imported code must enter our coding arena, execute inside our sandboxed worker, and run visible + hidden unit tests.
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
              Import Code Snippet From VS Code
            </label>
            <textarea
              rows={4}
              placeholder="Paste code from VS Code here..."
              value={snippet}
              onChange={e => setSnippet(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Export Arena Code to VS Code'}</span>
          </button>

          <button
            disabled={!snippet.trim()}
            onClick={handleImport}
            className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import to Arena</span>
          </button>
        </div>
      </div>
    </div>
  );
};
