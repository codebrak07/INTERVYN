import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { CandidateProfile } from '../../types';

interface ResumeAnalysisViewProps {
  profile: CandidateProfile;
  onContinue: () => void;
}

export const ResumeAnalysisView: React.FC<ResumeAnalysisViewProps> = ({ profile, onContinue }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Candidate Profile Normalized</h2>
          <p className="text-xs text-slate-400 font-mono">Extracted Skills, Projects & Probing Topics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Skills */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Extracted Core Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span key={idx} className="badge badge-cyan">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Weak Areas / Probing Targets */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Interview Probing Targets
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {profile.weakAreas.map((area, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Projects */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8">
        <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" /> Major Resume Projects
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.projects.map((proj, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-850">
              <h4 className="text-sm font-semibold text-white mb-1">{proj.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{proj.description}</p>
              <div className="flex flex-wrap gap-1">
                {proj.tech.map((t, tid) => (
                  <span key={tid} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onContinue} className="btn-primary px-8 py-3.5 rounded-xl text-sm">
          Select Target Role & Job Match
        </button>
      </div>
    </div>
  );
};
