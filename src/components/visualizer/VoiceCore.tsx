import React from 'react';
import { STTState } from '../../services/speech/SpeechToTextService';

interface VoiceCoreProps {
  state?: STTState | 'SPEAKING' | 'THINKING' | 'EVALUATING' | 'CODING' | 'IDLE';
  speakerName?: string;
  topic?: string;
  questionText?: string;
  showDetails?: boolean;
}

export const VoiceCore: React.FC<VoiceCoreProps> = ({
  state = 'SPEAKING',
  speakerName = 'AI TECHNICAL INTERVIEWER',
  topic = 'TOPIC: REACT COMPONENTS • DIFFICULTY 6/10',
  questionText = '"Walk me through the architecture of your recent Firebase implementation. How did you handle concurrent writes under high load?"',
  showDetails = true,
}) => {
  const isSpeaking = state === 'SPEAKING';
  const isListening = state === 'LISTENING';

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 relative overflow-hidden bg-[#08090C]/85 rounded-xl border border-white/[0.09] shadow-2xl backdrop-blur-md">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {showDetails && (
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 text-[11px] font-mono-intervyn">
          <div className="px-3 py-1 rounded bg-[#10141A] border border-white/10 text-[#22D3EE] font-medium tracking-wider uppercase">
            QUESTION 1 OF 5
          </div>
          <div className="text-[#858D9A] font-normal tracking-widest uppercase">
            {topic}
          </div>
        </div>
      )}

      {/* Center "VOICE CORE" Visual Device */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
        <div className="relative flex items-center justify-center w-36 h-36">
          {/* Outer Thin Ring (expands subtly when speaking) */}
          <div
            className={`absolute inset-0 rounded-full border border-[#22D3EE]/30 transition-all duration-700 ${
              isSpeaking
                ? 'scale-110 border-[#22D3EE]/60 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                : isListening
                ? 'scale-105 border-emerald-500/40 animate-pulse'
                : 'scale-100 border-white/10'
            }`}
          ></div>

          {/* Secondary Concentric Architectural Ring */}
          <div className="absolute inset-3 rounded-full border border-white/[0.06]"></div>

          {/* Inner Dark Core */}
          <div className="relative w-20 h-20 rounded-full bg-[#10141A] border border-white/10 flex items-center justify-center shadow-inner">
            {/* Tiny Cyan Center Dot */}
            <div
              className={`w-3 h-3 rounded-full bg-[#22D3EE] transition-all duration-500 ${
                isSpeaking
                  ? 'scale-125 shadow-[0_0_12px_#22D3EE]'
                  : 'scale-100 opacity-80'
              }`}
            ></div>
          </div>
        </div>

        {/* Telemetry Labels */}
        <div className="text-center mt-6 space-y-2">
          <span className="font-mono-intervyn text-xs text-[#F3F4F6] tracking-widest uppercase font-semibold block">
            {speakerName}
          </span>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10141A] border border-white/10 text-[#22D3EE] text-[10px] font-mono-intervyn tracking-wider">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSpeaking ? 'bg-[#22D3EE] animate-pulse' : 'bg-[#858D9A]'
              }`}
            ></span>
            <span>{isSpeaking ? 'INTERVIEWER SPEAKING' : 'LISTENING'}</span>
          </div>
        </div>
      </div>

      {showDetails && questionText && (
        <div className="relative z-10 p-4 rounded-lg bg-[#0B0E12] border border-white/[0.08]">
          <p className="font-geist text-xs sm:text-sm text-[#F3F4F6] leading-relaxed font-normal">
            {questionText}
          </p>
        </div>
      )}
    </div>
  );
};
