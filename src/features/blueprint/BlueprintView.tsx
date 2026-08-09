import React from 'react';
import { Calendar, Clock, HelpCircle, CheckCircle2, Play, Cpu, Code, Mic, FileText } from 'lucide-react';
import { InterviewBlueprint, TargetRole } from '../../types';
import { InterviewEngine } from '../../engine/InterviewEngine';

interface BlueprintViewProps {
  blueprint: InterviewBlueprint;
  targetRole?: TargetRole;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({ blueprint, targetRole }) => {
  const match = targetRole?.matchMetrics;

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'resume':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'mcq':
        return <HelpCircle className="w-4 h-4 text-violet-400" />;
      case 'technical':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'coding':
        return <Code className="w-4 h-4 text-emerald-400" />;
      default:
        return <Mic className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-3">
          <span>AI INTERVIEW BLUEPRINT READY</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">{blueprint.roleTitle} Interview</h2>
        <div className="flex items-center justify-center gap-6 text-xs font-mono text-slate-400 mt-3">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" /> ~{blueprint.estimatedMinutes} Minutes
          </span>
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-violet-400" /> {blueprint.totalQuestions} Questions
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Difficulty: Adaptive
          </span>
        </div>
      </div>

      {/* Match Metrics if available */}
      {match && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">
            Resume ↔ Role Alignment Analysis
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-2xl font-bold text-cyan-400">{match.overallMatch}%</span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Overall Match</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-2xl font-bold text-emerald-400">{match.technicalMatch}%</span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Technical Fit</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-2xl font-bold text-violet-400">{match.projectMatch}%</span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Project Match</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-2xl font-bold text-amber-400">{match.skillMatch}%</span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Skill Match</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-2xl font-bold text-rose-400">{match.experienceMatch}%</span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Experience</span>
            </div>
          </div>
        </div>
      )}

      {/* Blueprint Sections List */}
      <div className="space-y-4 mb-10">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
          Structured Interview Sections
        </h3>

        {blueprint.sections.map((sec, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                {getSectionIcon(sec.type)}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{sec.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {sec.count} {sec.count === 1 ? 'Question' : 'Questions'}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{sec.description}</p>
              </div>
            </div>
            <div className="text-xs font-mono text-slate-500 hidden sm:block">
              Phase {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <div className="flex justify-center">
        <button
          onClick={() => InterviewEngine.startInterview()}
          className="btn-primary text-base px-10 py-4 rounded-xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Enter AI Interview Room</span>
        </button>
      </div>
    </div>
  );
};
