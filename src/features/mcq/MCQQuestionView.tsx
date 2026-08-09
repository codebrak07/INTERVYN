import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { Question } from '../../types';
import { InterviewEngine } from '../../engine/InterviewEngine';

interface MCQQuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export const MCQQuestionView: React.FC<MCQQuestionViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOptionId) return;
    setIsSubmitting(true);
    const elapsedSecs = Math.round((Date.now() - startTime) / 1000);
    await InterviewEngine.submitMCQAnswer(selectedOptionId, elapsedSecs);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-6">
        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-violet-400 font-semibold">
          TECHNICAL MCQ • QUESTION {questionNumber} OF {totalQuestions}
        </span>
        <span className="uppercase tracking-widest text-slate-400">
          TOPIC: {question.topic}
        </span>
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-violet-400 mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>SCENARIO KNOWLEDGE ASSESSMENT</span>
        </div>
        <h2 className="text-xl font-semibold text-white leading-relaxed">{question.question}</h2>
      </div>

      {/* MCQ Options Grid */}
      <div className="space-y-3 mb-8">
        {(question.options || []).map(opt => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-violet-950/40 border-violet-500 text-white shadow-lg shadow-violet-500/10'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                    isSelected
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {opt.id}
                </span>
                <span className="text-sm font-medium leading-normal">{opt.text}</span>
              </div>

              {isSelected && <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Submit Action */}
      <div className="flex justify-end">
        <button
          disabled={!selectedOptionId || isSubmitting}
          onClick={handleSubmit}
          className="btn-primary text-sm px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2"
        >
          <span>Confirm Selection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
