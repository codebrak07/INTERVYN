import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { ResumeParserService, ResumeValidationResult } from '../../services/resume/ResumeParserService';
import { InterviewEngine } from '../../engine/InterviewEngine';

export const ResumeUploadView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ResumeValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    const result = ResumeParserService.validateFile(file);
    setValidation(result);

    if (result.isValid) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setErrorMessage(result.error || 'Invalid file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const text = await ResumeParserService.extractText(selectedFile);
      // Process resume text through AI and clear file handle
      await InterviewEngine.processResume(text);
      setSelectedFile(null); // Release original file handle from memory
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse resume text.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Container Card */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2 font-serif italic">Upload Your Resume</h2>
          <p className="text-sm text-[#475569]">
            PDF or DOCX format under 1 MB. We analyze claims and projects client-side.
          </p>
        </div>

        {/* Privacy Notice Banner */}
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5 text-emerald-950">Private by design</span>
            <span className="text-emerald-800">Your resume and interview session are processed temporarily and are not stored as a permanent profile.</span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${selectedFile
            ? 'border-cyan-600 bg-cyan-50/60 shadow-sm'
            : 'border-slate-300 bg-slate-50/70 hover:border-cyan-600 hover:bg-cyan-50/40'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-cyan-950/10 border border-cyan-800/20 flex items-center justify-center mx-auto mb-4 text-[#0891B2]">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-[#0F172A] mb-1 font-mono">
            {selectedFile ? selectedFile.name : 'DROP YOUR RESUME'}
          </h3>
          <p className="text-xs text-[#64748B] font-mono">PDF / DOCX • &lt; 1 MB</p>
        </div>

        {/* File Validation Info */}
        {selectedFile && validation && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-cyan-600" />
              <div>
                <p className="text-sm font-bold text-[#0F172A] font-mono">{selectedFile.name}</p>
                <p className="text-xs text-[#64748B] font-mono">{validation.fileSizeKB} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
              <CheckCircle className="w-4 h-4" /> Valid format &lt; 1 MB
            </div>
          </div>
        )}

        {/* Error display */}
        {errorMessage && (
          <div className="mt-6 p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950 mb-1">We couldn't reliably read this resume.</p>
                <p className="text-rose-800">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-rose-200">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setErrorMessage(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-mono text-[11px] font-bold"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => {
                  InterviewEngine.skipResumeUpload();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-[11px] font-semibold"
              >
                CONTINUE WITHOUT RESUME
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            disabled={!selectedFile || isProcessing}
            onClick={handleAnalyze}
            className="btn-primary text-sm px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 font-bold"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Resume Content...</span>
              </>
            ) : (
              <>
                <span>Analyze Resume</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={() => InterviewEngine.skipResumeUpload()}
            className="text-xs text-[#475569] hover:text-[#0F172A] font-semibold transition-colors py-2 px-4"
          >
            Skip Resume & Set Up Role Directly
          </button>
        </div>
      </div>
    </div>
  );
};
