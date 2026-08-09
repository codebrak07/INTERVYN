import React, { useRef } from 'react';
import { ArrowRight, Lock, Trash2, Mic, Terminal, FileText, Target, Cpu, Code, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { SessionStorageService } from '../../services/storage/SessionStorageService';
import { AIVisualizerOrb } from '../../components/visualizer/AIVisualizerOrb';

export const LandingView: React.FC = () => {
  const workflowRef = useRef<HTMLDivElement | null>(null);

  const handleStart = () => {
    SessionStorageService.setPhase('RESUME_UPLOAD');
  };

  const scrollToWorkflow = () => {
    workflowRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative z-10 w-full px-4 md:px-16 mx-auto max-w-[1600px]">
      {/* Hero Section */}
      <section className="min-h-[85vh] flex flex-col justify-center py-12 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-5 space-y-8">
            <div className="inline-flex items-center gap-2 border border-slate-900/[0.1] px-3.5 py-1.5 rounded bg-[#FFFFFF] shadow-sm hover-glow-cyan cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-[#0891B2] animate-pulse"></span>
              <span className="font-mono-intervyn text-[10px] text-[#0891B2] tracking-widest uppercase font-bold">
                PRIVATE AI INTERVIEW ENVIRONMENT
              </span>
            </div>

            <h1 className="font-geist text-4xl sm:text-6xl lg:text-7xl font-semibold text-[#0F172A] leading-[1.1] tracking-tight">
              Practice the <span className="text-[#0891B2] italic font-serif">interview</span> before they do.
            </h1>

            <p className="font-geist text-lg text-[#475569] max-w-lg leading-relaxed font-normal">
              Upload your resume. Choose your role. Then step into a live interview room that adapts to how you think, speak, and code in real time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleStart}
                className="px-7 py-4 bg-[#0891B2] text-[#FFFFFF] font-mono-intervyn text-xs tracking-wider rounded transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:bg-[#0e7490] cursor-pointer"
              >
                <span>START INTERVIEW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={scrollToWorkflow}
                className="px-7 py-4 border border-slate-300 bg-[#FFFFFF] text-[#0F172A] font-mono-intervyn text-xs tracking-wider rounded hover:bg-slate-50 hover:border-[#0891B2]/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>SEE HOW IT WORKS</span>
                <HelpCircle className="w-4 h-4 text-[#0891B2]" />
              </button>
            </div>
          </div>

          {/* Hero Visual Anchor: Embedded Instrument Console with Soft Architectural Shadow */}
          <div className="lg:col-span-7 relative">
            <div className="aspect-[4/3] w-full hover-card-lift shadow-[0_35px_90px_-20px_rgba(15,23,42,0.16)] rounded-xl overflow-hidden border border-slate-900/10 bg-[#08090C]">
              <AIVisualizerOrb
                state="SPEAKING"
                speakerName="AI TECHNICAL INTERVIEWER"
                topic="TOPIC: REACT COMPONENTS • DIFFICULTY 6/10"
                questionText='"Walk me through the architecture of your recent Firebase implementation. How did you handle concurrent writes under high load?"'
                showDetails={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 border-y border-slate-900/10 flex flex-wrap justify-center gap-8 md:gap-16 mb-20 font-mono-intervyn text-xs text-[#475569]">
        <span className="flex items-center gap-2 px-3 py-1 rounded cursor-default font-medium">
          <Lock className="w-3.5 h-3.5 text-[#0891B2]" /> PRIVATE BY DESIGN
        </span>
        <span className="flex items-center gap-2 px-3 py-1 rounded cursor-default font-medium">
          <Trash2 className="w-3.5 h-3.5 text-[#0891B2]" /> NO RESUME STORAGE
        </span>
        <span className="flex items-center gap-2 px-3 py-1 rounded cursor-default font-medium">
          <Mic className="w-3.5 h-3.5 text-[#0891B2]" /> VOICE INTERVIEW
        </span>
        <span className="flex items-center gap-2 px-3 py-1 rounded cursor-default font-medium">
          <Terminal className="w-3.5 h-3.5 text-[#0891B2]" /> REAL CODE EXECUTION
        </span>
      </section>

      {/* How the Simulation Works (4-Step First Time User Journey) */}
      <section ref={workflowRef} className="mb-24 pt-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-slate-900/10 px-3.5 py-1.5 rounded bg-[#FFFFFF] mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#0891B2]" />
            <span className="font-mono-intervyn text-[10px] text-[#0891B2] tracking-widest uppercase font-bold">
              STEP-BY-STEP INTERVIEW SIMULATION FLOW
            </span>
          </div>
          <h2 className="font-geist text-3xl sm:text-5xl font-semibold text-[#0F172A] mb-3">
            How your simulation unfolds.
          </h2>
          <p className="font-geist text-sm text-[#475569] max-w-xl mx-auto">
            From resume analysis to sandboxed code execution, experience an authentic technical interview loop in four clear stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 border border-slate-200 bg-[#FFFFFF] rounded-xl hover-card-lift relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-intervyn text-xs text-[#0891B2] font-bold">01 / RESUME</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0891B2]">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-geist text-lg font-semibold text-[#0F172A] mb-2">Upload Resume</h3>
              <p className="font-geist text-xs text-[#475569] leading-relaxed">
                Drop your PDF or DOCX resume (&lt; 1 MB). Our client-side parser extracts skills, project claims, and probing areas privately.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-intervyn text-[#0891B2] font-semibold">
              <span>Ephemeral parsing</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 border border-slate-200 bg-[#FFFFFF] rounded-xl hover-card-lift relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-intervyn text-xs text-sky-700 font-bold">02 / ROLE TARGET</span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-geist text-lg font-semibold text-[#0F172A] mb-2">Select Target Role</h3>
              <p className="font-geist text-xs text-[#475569] leading-relaxed">
                Choose your role (e.g. Frontend Engineer) and optionally paste the job description to analyze resume ↔ role alignment metrics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-intervyn text-sky-700 font-semibold">
              <span>Job Match Analysis</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 border border-slate-200 bg-[#FFFFFF] rounded-xl hover-card-lift relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-intervyn text-xs text-emerald-700 font-bold">03 / BLUEPRINT</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-geist text-lg font-semibold text-[#0F172A] mb-2">AI Interview Blueprint</h3>
              <p className="font-geist text-xs text-[#475569] leading-relaxed">
                Review your personalized ~35 minute interview plan containing Resume Deep Dive, MCQ, Technical, Controlled Coding, and Behavioral stages.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-intervyn text-emerald-700 font-semibold">
              <span>Adaptive Question Plan</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 border border-slate-200 bg-[#FFFFFF] rounded-xl hover-card-lift relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-intervyn text-xs text-[#0891B2] font-bold">04 / SIMULATION</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0891B2]">
                  <Code className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-geist text-lg font-semibold text-[#0F172A] mb-2">Voice & Coding Arena</h3>
              <p className="font-geist text-xs text-[#475569] leading-relaxed">
                Speak aloud to the AI interviewer, solve coding challenges in Monaco Editor, execute visible & hidden test suites, and view your final report.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-intervyn text-[#0891B2] font-semibold">
              <span>Real Code Execution</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-[#0891B2] text-[#FFFFFF] font-mono-intervyn text-xs tracking-wider rounded font-bold hover:bg-[#0e7490] flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>START YOUR SIMULATION NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Chapter 01: Ingestion */}
      <section className="mb-24">
        <div className="mb-8">
          <span className="font-mono-intervyn text-xs text-[#0891B2] block mb-2 tracking-widest uppercase font-bold">
            01 / INGESTION
          </span>
          <h2 className="font-geist text-3xl sm:text-4xl font-semibold text-[#0F172A]">
            Your resume becomes the interview.
          </h2>
        </div>

        <div className="border border-slate-200 bg-[#FFFFFF] rounded-sm p-8 md:p-12 relative overflow-hidden hover-card-lift shadow-sm">
          <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-5">
              <div className="p-6 border border-slate-200 bg-[#F8FAFC] rounded">
                <span className="font-mono-intervyn text-[10px] text-[#64748B] block mb-4 tracking-widest font-semibold">
                  UPLOADED_CV.PDF
                </span>
                <div className="space-y-2 font-geist text-xs text-[#475569]">
                  <p>
                    ...built real-time collaborative editing using{' '}
                    <span className="text-[#0F172A] border-b border-[#0891B2]/50 font-semibold">React</span> and{' '}
                    <span className="text-[#0F172A] border-b border-[#0891B2]/50 font-semibold">Firebase</span>, leveraging{' '}
                    <span className="text-[#0F172A] border-b border-[#0891B2]/50 font-semibold">PeerJS</span> for WebRTC connections...
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center">
              <ArrowRight className="w-8 h-8 text-[#0891B2] animate-pulse" />
            </div>

            <div className="md:col-span-5">
              <div className="p-6 border border-slate-200 bg-[#F8FAFC] rounded">
                <span className="font-mono-intervyn text-[10px] text-[#0891B2] block mb-2 tracking-widest font-bold">
                  PARSED CANDIDATE CONTEXT
                </span>
                <p className="font-geist text-xs text-[#0F172A] leading-relaxed">
                  Extracted 4 technical project claims, 12 core framework skills, and 2 architecture trade-off topics ready for adaptive probing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 border-t border-slate-900/10 py-12 flex flex-col md:flex-row justify-between items-center gap-8 font-mono-intervyn text-xs">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="INTERVYN Logo" className="h-6 w-auto object-contain" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[#0F172A] font-bold tracking-widest">INTERVYN</span>
            <span className="text-[#64748B] text-[10px]">© 2026 INTERVYN SYSTEMS. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
        <div className="flex gap-8 text-[#64748B]">
          <span className="hover:text-[#0891B2] transition-colors cursor-pointer font-medium">PRIVACY_PROTOCOL</span>
          <span className="hover:text-[#0891B2] transition-colors cursor-pointer font-medium">TECHNICAL_DOCS</span>
          <span className="hover:text-[#0891B2] transition-colors cursor-pointer font-medium">SYSTEM_STATUS</span>
        </div>
      </footer>
    </div>
  );
};
