import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, CheckCircle2, XCircle, Clock, Lightbulb, Code, RefreshCw, AlertTriangle } from 'lucide-react';
import { Question, TestResult } from '../../types';
import { CodeExecutionService } from '../../services/code/CodeExecutionService';
import { InterviewEngine } from '../../engine/InterviewEngine';

interface CodingArenaViewProps {
  question: Question;
}

export const CodingArenaView: React.FC<CodingArenaViewProps> = ({ question }) => {
  const problem = question.codingProblem || {
    id: 'code_default',
    title: 'Implement Function',
    difficulty: 'Medium',
    description: 'Implement the target function inside our sandboxed environment.',
    examples: [],
    constraints: [],
    starterCode: '// Write your solution here\nfunction solution() {\n  return true;\n}',
    language: 'javascript',
    visibleTests: [],
    hiddenTests: [],
  };

  const [code, setCode] = useState(problem.starterCode);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());

  const handleRunVisible = async () => {
    setIsRunning(true);
    const visibleCases = problem.visibleTests || [];
    const { results } = await CodeExecutionService.executeCode(code, visibleCases);
    setTestResults(results);
    setIsRunning(false);
  };

  const handleSubmitSolution = async () => {
    setIsSubmitting(true);
    const elapsedSecs = Math.round((Date.now() - startTime) / 1000);
    await InterviewEngine.submitCodingSolution(code, elapsedSecs);
    setIsSubmitting(false);
  };

  const visibleCount = problem.visibleTests?.length || 0;
  const passedVisibleCount = testResults.filter(t => !t.isHidden && t.passed).length;

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-slate-950">
      {/* Top Banner Bar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-xs">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>CODING ROUND: {problem.title}</span>
              <span className="badge badge-amber text-[10px]">{problem.difficulty}</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Sandboxed Monaco Execution Arena</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-mono border border-slate-700 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'Request Conceptual Hint'}</span>
          </button>

          <button
            disabled={isRunning || isSubmitting}
            onClick={handleRunVisible}
            className="btn-secondary text-xs px-4 py-2"
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
            )}
            <span>Run Code</span>
          </button>

          <button
            disabled={isRunning || isSubmitting}
            onClick={handleSubmitSolution}
            className="btn-primary text-xs px-5 py-2 shadow-lg"
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: Problem & Constraints */}
        <div className="lg:col-span-5 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-140px)] bg-slate-900/30">
          {showHint && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
              <span className="font-bold block mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" /> AI Interviewer Hint:
              </span>
              Ensure you clean up pending timer references inside your debounced wrapper to prevent memory leaks or stale function execution.
            </div>
          )}

          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">
            Problem Description
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed mb-6 whitespace-pre-line font-sans">
            {problem.description}
          </p>

          {problem.examples && problem.examples.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">
                Examples
              </h4>
              <div className="space-y-2">
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <p className="text-slate-300">Input: <span className="text-cyan-400">{ex.input}</span></p>
                    <p className="text-slate-300">Output: <span className="text-emerald-400">{ex.output}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.constraints && problem.constraints.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                Constraints & Rules
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
                {problem.constraints.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Monaco Code Editor & Test Results */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[350px]">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={val => setCode(val || '')}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {/* Test Results Output Drawer */}
          <div className="h-56 border-t border-slate-800 bg-slate-900/90 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span>Test Execution Results</span>
                {testResults.length > 0 && (
                  <span className="text-cyan-400 font-semibold">
                    ({passedVisibleCount} / {visibleCount} passed)
                  </span>
                )}
              </h4>

              <span className="text-[10px] font-mono text-slate-500">
                Hidden tests execute automatically on Submission
              </span>
            </div>

            {testResults.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs font-mono text-slate-500">
                Click [ Run Code ] to evaluate visible test cases.
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map(tr => (
                  <div
                    key={tr.testId}
                    className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                      tr.passed
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {tr.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">{tr.description}</span>
                        {tr.error && (
                          <p className="text-[11px] text-rose-400 mt-0.5">{tr.error}</p>
                        )}
                      </div>
                    </div>
                    {tr.executionTimeMs !== undefined && (
                      <span className="text-[10px] text-slate-400">{tr.executionTimeMs} ms</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
