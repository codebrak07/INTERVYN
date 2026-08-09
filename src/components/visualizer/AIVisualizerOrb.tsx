import React, { useEffect, useRef } from 'react';
import { STTState } from '../../services/speech/SpeechToTextService';

interface AIVisualizerOrbProps {
  state?: STTState | 'SPEAKING' | 'THINKING' | 'EVALUATING' | 'CODING' | 'IDLE';
  speakerName?: string;
  topic?: string;
  questionText?: string;
  showDetails?: boolean;
}

export const AIVisualizerOrb: React.FC<AIVisualizerOrbProps> = ({
  state = 'SPEAKING',
  speakerName = 'AI TECHNICAL INTERVIEWER',
  topic = 'TOPIC: REACT COMPONENTS • DIFFICULTY 6/10',
  questionText = '"Walk me through the architecture of your recent Firebase implementation. How did you handle concurrent writes under high load?"',
  showDetails = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.035;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // JARVIS Cyan-Emerald Colors
      const cyanGlow = 'rgba(6, 182, 212, ';
      const emeraldGlow = 'rgba(16, 185, 129, ';

      // 1. Radial Intense Aura Glow Behind Core
      const auraRadius = 65 + Math.sin(time * 2) * 8;
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        auraRadius
      );
      auraGradient.addColorStop(0, cyanGlow + '0.7)');
      auraGradient.addColorStop(0.4, emeraldGlow + '0.35)');
      auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
      ctx.fillStyle = auraGradient;
      ctx.fill();

      // 2. Rotating Radial Audio Ray Spikes (JARVIS Rays)
      const rayCount = 32;
      const baseRadius = 38;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.4);

      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const wave = Math.sin(time * 5 + i * 0.4) * 0.5 + 0.5;
        const rayLen = 14 + wave * 22;

        const x1 = Math.cos(angle) * baseRadius;
        const y1 = Math.sin(angle) * baseRadius;
        const x2 = Math.cos(angle) * (baseRadius + rayLen);
        const y2 = Math.sin(angle) * (baseRadius + rayLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i % 2 === 0 ? '#06b6d4' : '#10b981';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06b6d4';
        ctx.stroke();
      }
      ctx.restore();

      // 3. Central Core Glowing Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 28 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#06b6d4';
      ctx.stroke();

      // Inner Core Fill
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#10b981';
      ctx.fill();

      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 relative overflow-hidden bg-[#08090c] rounded-xl border border-[#06b6d4]/30 shadow-2xl">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

      {showDetails && (
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 text-[11px] font-mono-vanta">
          <div className="px-3 py-1 rounded-md bg-[#06b6d4]/15 border border-[#06b6d4]/40 text-[#06b6d4] font-bold tracking-wider uppercase">
            QUESTION 1 OF 5
          </div>
          <div className="text-slate-400 font-medium tracking-wider uppercase">
            {topic}
          </div>
        </div>
      )}

      {/* Center JARVIS Orb Visualizer Canvas */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
        <canvas
          ref={canvasRef}
          width={280}
          height={200}
          className="w-[280px] h-[200px] block drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]"
        />

        <div className="text-center mt-2 space-y-2">
          <span className="font-mono-vanta text-xs text-slate-300 tracking-widest uppercase font-bold block">
            {speakerName}
          </span>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4]/40 text-[#06b6d4] text-[10px] font-mono-vanta tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping"></span>
            <span>INTERVIEWER SPEAKING</span>
          </div>
        </div>
      </div>

      {showDetails && questionText && (
        <div className="relative z-10 p-4 rounded-lg bg-[#0d0e12]/90 border border-white/10 backdrop-blur-md">
          <p className="font-geist text-xs sm:text-sm text-white leading-relaxed font-normal">
            {questionText}
          </p>
        </div>
      )}
    </div>
  );
};
