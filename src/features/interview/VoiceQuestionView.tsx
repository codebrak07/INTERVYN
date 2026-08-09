import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { Question } from '../../types';
import { TextToSpeechService } from '../../services/tts/TextToSpeechService';
import { SpeechToTextService, STTState } from '../../services/speech/SpeechToTextService';
import { AIVisualizerOrb } from '../../components/visualizer/AIVisualizerOrb';
import { InterviewEngine } from '../../engine/InterviewEngine';

interface VoiceQuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export const VoiceQuestionView: React.FC<VoiceQuestionViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
}) => {
  const [ttsState, setTtsState] = useState<'IDLE' | 'SPEAKING'>('IDLE');
  const [sttState, setSttState] = useState<STTState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const ttsRef = useRef<TextToSpeechService | null>(null);
  const sttRef = useRef<SpeechToTextService | null>(null);

  useEffect(() => {
    ttsRef.current = new TextToSpeechService();
    sttRef.current = new SpeechToTextService();

    sttRef.current.setListener({
      onStateChange: state => setSttState(state),
      onTranscriptUpdate: text => setTranscript(text),
      onError: err => console.warn('STT Error:', err),
    });

    // Automatically speak question when loaded
    speakQuestion();

    return () => {
      ttsRef.current?.cancel();
      sttRef.current?.reset();
    };
  }, [question.id]);

  const speakQuestion = () => {
    if (ttsRef.current) {
      ttsRef.current.speak(question.question, {
        onStart: () => setTtsState('SPEAKING'),
        onEnd: () => setTtsState('IDLE'),
      });
    }
  };

  const handleToggleMic = () => {
    if (!sttRef.current) return;
    if (sttState === 'LISTENING') {
      sttRef.current.stopListening();
    } else {
      ttsRef.current?.cancel();
      setTtsState('IDLE');
      sttRef.current.startListening();
    }
  };

  const handleSubmit = async () => {
    const finalAnswer = transcript || manualAnswer;
    if (!finalAnswer.trim()) return;

    setIsSubmitting(true);
    sttRef.current?.reset();
    ttsRef.current?.cancel();

    const elapsedSecs = Math.round((Date.now() - startTime) / 1000);
    await InterviewEngine.submitVoiceAnswer(finalAnswer.trim(), elapsedSecs);
    setIsSubmitting(false);
  };

  const getOrbState = () => {
    if (isSubmitting) return 'EVALUATING';
    if (ttsState === 'SPEAKING') return 'SPEAKING';
    if (sttState === 'LISTENING') return 'LISTENING';
    if (sttState === 'TRANSCRIBING') return 'TRANSCRIBING';
    return 'IDLE';
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-6">
        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-semibold">
          QUESTION {questionNumber} OF {totalQuestions}
        </span>
        <span className="uppercase tracking-widest text-slate-400">
          TOPIC: {question.topic} • DIFFICULTY {question.difficulty}/10
        </span>
      </div>

      {/* Visualizer Orb */}
      <div className="mb-6 flex justify-center">
        <AIVisualizerOrb state={getOrbState()} />
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6 shadow-xl relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-xl font-semibold text-white leading-relaxed">{question.question}</h2>
          <button
            onClick={speakQuestion}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 shrink-0"
            title="Replay Voice Question"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {question.type === 'followup' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-violet-950/60 border border-violet-800/60 text-violet-300 text-[11px] font-mono mt-2">
            <span>Adaptive Follow-up Question</span>
          </div>
        )}
      </div>

      {/* Voice Microphone Control Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>CANDIDATE VOICE ANSWER</span>
          </div>

          <button
            onClick={handleToggleMic}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              sttState === 'LISTENING'
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-lg'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
            }`}
          >
            {sttState === 'LISTENING' ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Activate Microphone</span>
              </>
            )}
          </button>
        </div>

        {/* Live Transcript / Manual Answer Box */}
        <div className="relative">
          <textarea
            rows={4}
            placeholder={
              sttState === 'LISTENING'
                ? 'Listening to your voice... Speak your answer now.'
                : 'Click Activate Microphone to speak your answer, or type your response here...'
            }
            value={transcript || manualAnswer}
            onChange={e => {
              setManualAnswer(e.target.value);
              setTranscript('');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {sttState === 'ERROR' && (
          <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Microphone unavailable or blocked. You can type your answer above.</span>
          </div>
        )}
      </div>

      {/* Submit Action */}
      <div className="flex justify-end">
        <button
          disabled={!(transcript || manualAnswer).trim() || isSubmitting}
          onClick={handleSubmit}
          className="btn-primary text-sm px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Answer...</span>
            </>
          ) : (
            <>
              <span>Finish Answer</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
