import React, { useState } from 'react';
import { Target, Sparkles, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { InterviewEngine } from '../../engine/InterviewEngine';
import { SessionStorageService } from '../../services/storage/SessionStorageService';

export const RoleSetupView: React.FC = () => {
  const predefinedRoles = [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'Software Systems Architect',
    'DevOps / Platform Engineer',
    'AI / Machine Learning Engineer',
  ];

  const [selectedRole, setSelectedRole] = useState('Frontend Engineer');
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const handleGenerate = async () => {
    const usage = SessionStorageService.getDailyUsageCount();
    if (usage.isLimitReached) {
      setRateLimitExceeded(true);
      return;
    }

    SessionStorageService.incrementDailyUsage();
    const roleTitle = customRole.trim() || selectedRole;
    setIsBuilding(true);
    await InterviewEngine.setupRole(roleTitle, jobDescription.trim() || undefined);
    setIsBuilding(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center mx-auto mb-3 text-cyan-400">
          <Target className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">What role are you applying for?</h2>
        <p className="text-sm text-slate-400">
          Select a role target or paste a specific job description to generate an adaptive interview plan.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {predefinedRoles.map(role => (
          <button
            key={role}
            onClick={() => {
              setSelectedRole(role);
              setCustomRole('');
            }}
            className={`p-3.5 rounded-xl text-left border transition-all text-xs font-semibold ${
              selectedRole === role && !customRole
                ? 'bg-cyan-950/40 border-cyan-500 text-white glow-cyan'
                : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span>{role}</span>
              {selectedRole === role && !customRole && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Role Input */}
      <div className="mb-6">
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
          Or Enter Custom Role Title
        </label>
        <input
          type="text"
          placeholder="e.g. Lead React Developer"
          value={customRole}
          onChange={e => setCustomRole(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
        />
      </div>

      {/* Job Description (Optional) */}
      <div className="mb-8">
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Paste Job Description (Optional)</span>
          <span className="text-slate-500 font-normal">Enables Deep Resume ↔ Job Match Analysis</span>
        </label>
        <textarea
          rows={4}
          placeholder="Paste requirements, tech stack, or responsibilities..."
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
        />
      </div>

      {rateLimitExceeded && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div>
            <span className="font-bold block mb-1">DAILY FREE INTERVIEW LIMIT REACHED (3/3)</span>
            <span>You have reached today's 3 free interview sessions limit. Enter your custom Groq API key in API Settings to unlock unlimited sessions.</span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          disabled={isBuilding}
          onClick={handleGenerate}
          className="btn-primary text-sm px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2"
        >
          {isBuilding ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating AI Blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Interview Blueprint</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
