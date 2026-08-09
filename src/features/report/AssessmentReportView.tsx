import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, Download, Copy, RefreshCcw, Sparkles, Code, FileText, Check } from 'lucide-react';
import { FinalReport } from '../../types';
import { SessionStorageService } from '../../services/storage/SessionStorageService';

interface AssessmentReportViewProps {
  report: FinalReport;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  const getHiringBadgeStyle = (signal: FinalReport['hiringSignal']) => {
    switch (signal) {
      case 'Strong Hire':
      case 'Hire':
        return 'bg-emerald-950/60 border-emerald-500 text-emerald-400 glow-emerald';
      case 'Leaning Hire':
        return 'bg-cyan-950/60 border-cyan-500 text-cyan-400';
      case 'Borderline':
        return 'bg-amber-950/60 border-amber-500 text-amber-400';
      default:
        return 'bg-rose-950/60 border-rose-500 text-rose-400';
    }
  };

  const handleCopySummary = () => {
    const summaryText = `HireMe AI Interview Performance Assessment
Role: ${report.roleTitle}
Overall Score: ${report.overallScore}/100
Hiring Signal: ${report.hiringSignal}

Dimensions:
- Technical Depth: ${report.dimensionScores.technical}/100
- Communication: ${report.dimensionScores.communication}/100
- Problem Solving: ${report.dimensionScores.problemSolving}/100
- Coding Performance: ${report.dimensionScores.coding}/100
- System Design: ${report.dimensionScores.systemDesign}/100
- Behavioral: ${report.dimensionScores.behavioral}/100

Actionable Prep Plan:
${report.actionablePreparationPlan.join('\n')}
`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HireMe_Interview_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-4">
          <Award className="w-4 h-4" />
          <span>INTERVIEW COMPLETE • PERFORMANCE REPORT</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
          {report.roleTitle} Assessment
        </h1>

        {/* Hiring Signal Disclaimer */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 mb-6">
          ⚠️ AI-generated practice assessment — not an actual hiring decision.
        </div>
      </div>

      {/* Main Score & Signal Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Score */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Overall Score</span>
          <div className="text-6xl font-extrabold text-gradient-cyan mb-2">
            {report.overallScore} <span className="text-2xl font-normal text-slate-500">/ 100</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Evaluated across 6 dimensions</span>
        </div>

        {/* Hiring Signal */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Hiring Signal</span>
          <div className={`px-6 py-2.5 rounded-2xl border text-xl font-bold font-mono ${getHiringBadgeStyle(report.hiringSignal)}`}>
            {report.hiringSignal}
          </div>
        </div>

        {/* Duration & Questions */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Interview Telemetry</span>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round(report.totalDurationSeconds / 60)} <span className="text-sm font-normal text-slate-400">mins</span>
          </div>
          <span className="text-xs font-mono text-slate-400">{report.questionsAnsweredCount} Questions Completed</span>
        </div>
      </div>

      {/* Dimension Breakdown Bar Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Technical & Behavioral Dimension Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {Object.entries(report.dimensionScores).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="capitalize text-slate-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-cyan-400 font-bold">{val} / 100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-1000"
                  style={{ width: `${val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coding Performance Section */}
      {report.codingPerformance && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" /> Controlled Coding Arena Performance
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-lg font-bold text-emerald-400">
                {report.codingPerformance.visibleTestsPassed} / {report.codingPerformance.visibleTestsTotal}
              </span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Visible Tests Passed</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-lg font-bold text-violet-400">
                {report.codingPerformance.hiddenTestsPassed} / {report.codingPerformance.hiddenTestsTotal}
              </span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Hidden Tests Passed</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-lg font-bold text-cyan-400">{report.codingPerformance.timeComplexity}</span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Time Complexity</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-lg font-bold text-amber-400">{report.codingPerformance.codeQualityScore} / 100</span>
              <span className="block text-[10px] font-mono text-slate-400 mt-1">Code Quality Score</span>
            </div>
          </div>
        </div>
      )}

      {/* Strong Signals vs Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strong Signals */}
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
          <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Demonstrated Strong Signals
          </h3>
          <ul className="space-y-2 text-xs text-slate-200">
            {report.strongSignals.map((sig, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <span>{sig}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/40">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Key Areas for Improvement
          </h3>
          <ul className="space-y-2 text-xs text-slate-200">
            {report.concerns.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Preparation Plan */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8">
        <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Actionable 5-Step Preparation Plan
        </h3>

        <div className="space-y-3">
          {report.actionablePreparationPlan.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 font-mono">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Export & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handlePrintPDF} className="btn-secondary text-xs px-4 py-2.5">
            <FileText className="w-4 h-4 text-cyan-400" /> Export PDF
          </button>

          <button onClick={handleExportJSON} className="btn-secondary text-xs px-4 py-2.5">
            <Download className="w-4 h-4 text-violet-400" /> Export JSON
          </button>

          <button onClick={handleCopySummary} className="btn-secondary text-xs px-4 py-2.5">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>
        </div>

        <button
          onClick={() => SessionStorageService.clearSessionData()}
          className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Clear & Start New Session</span>
        </button>
      </div>
    </div>
  );
};
