import React from 'react';
import { InterviewPhase } from '../../types';

interface ChamberBackgroundProps {
  currentPhase?: InterviewPhase;
}

export const ChamberBackground: React.FC<ChamberBackgroundProps> = ({
  currentPhase = 'LANDING',
}) => {
  const isInterviewOrCoding =
    currentPhase === 'QUESTION_VOICE' ||
    currentPhase === 'LISTENING' ||
    currentPhase === 'EVALUATING' ||
    currentPhase === 'CODING_ARENA' ||
    currentPhase === 'RUNNING_TESTS';

  const isCoding =
    currentPhase === 'CODING_ARENA' ||
    currentPhase === 'RUNNING_TESTS' ||
    currentPhase === 'SUBMITTING_HIDDEN';

  const getChapterMarker = (phase?: InterviewPhase) => {
    switch (phase) {
      case 'RESUME_UPLOAD':
      case 'RESUME_ANALYZING':
        return 'CHAPTER 01 / INGESTION';
      case 'ROLE_SETUP':
      case 'BLUEPRINT_READY':
        return 'CHAPTER 02 / CALIBRATION';
      case 'QUESTION_VOICE':
      case 'LISTENING':
      case 'TRANSCRIBING':
        return 'CHAPTER 03 / INTERVIEW';
      case 'EVALUATING':
      case 'MCQ_ROUND':
      case 'BEHAVIORAL_ROUND':
        return 'CHAPTER 04 / EVALUATION';
      case 'CODING_TRANSITION':
      case 'CODING_ARENA':
      case 'RUNNING_TESTS':
      case 'SUBMITTING_HIDDEN':
        return 'CHAPTER 05 / CODING';
      case 'FINAL_EVALUATION':
      case 'REPORT':
        return 'CHAPTER 06 / ASSESSMENT';
      default:
        return 'CHAPTER 00 / PROLOGUE';
    }
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F6F7F5] transition-colors duration-1000">
      {/* 95% OFF-WHITE / NEUTRAL MATERIAL TONAL LAYER */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7F8F6] via-[#F4F5F3] to-[#EFF2F1] opacity-100"></div>

      {/* 0.5% WARM IVORY FIELD (Left Behind Hero #FAF8F3) */}
      <div className="absolute top-1/6 left-1/12 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,#FAF8F3_0%,rgba(250,248,243,0.3)_50%,transparent_75%)] blur-3xl opacity-70 pointer-events-none"></div>

      {/* 1.5% PALE CYAN / COOL GRAY FIELD BEHIND CONSOLE (#EAF5F6 @ ~60% 45%) */}
      <div
        className={`absolute top-[40%] right-[15%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,#EAF5F6_0%,rgba(234,245,246,0.3)_60%,transparent_80%)] blur-3xl transition-opacity duration-1000 ${
          isInterviewOrCoding ? 'opacity-35' : 'opacity-65'
        }`}
      ></div>

      {/* ULTRA-SUBTLE ARCHITECTURAL ARC */}
      <svg
        className="absolute inset-0 w-full h-full transition-opacity duration-1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          {/* Main Compositional Guide Arc */}
          <path
            d="M -150 220 C 320 140, 720 360, 1420 190 C 1720 110, 2020 420, 2220 310"
            stroke="rgba(20, 35, 45, 0.03)"
            strokeWidth="1"
            fill="none"
          />

          {/* Coding Precision Drafting Line (Active during CODING phase) */}
          {isCoding && (
            <line x1="0" y1="300" x2="2000" y2="300" stroke="rgba(8, 145, 178, 0.03)" strokeWidth="1" />
          )}
        </g>
      </svg>

      {/* ULTRA-FAINT EDITORIAL MEASUREMENT GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,30,35,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,30,35,0.008)_1px,transparent_1px)] bg-[size:192px_192px] opacity-50 pointer-events-none"></div>

      {/* THIN VERTICAL ARCHITECTURAL RULES */}
      <div className="absolute inset-0 flex justify-between px-24 lg:px-52 pointer-events-none opacity-20">
        <div className="w-px h-[50vh] bg-gradient-to-b from-slate-900/[0.03] via-transparent to-transparent"></div>
        <div className="w-px h-[65vh] bg-gradient-to-b from-slate-900/[0.03] via-transparent to-transparent hidden lg:block"></div>
      </div>

      {/* EDITORIAL CHAPTER MARKERS AT THE BOTTOM */}
      <div className="absolute bottom-6 left-16 hidden md:block font-mono text-[10px] text-slate-400/60 tracking-[0.16em] uppercase">
        {getChapterMarker(currentPhase)}
      </div>
      <div className="absolute bottom-6 right-16 hidden md:block font-mono text-[10px] text-slate-400/60 tracking-[0.16em] uppercase">
        PRIVATE ASSESSMENT INSTRUMENT
      </div>
    </div>
  );
};
