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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h2>
        <p className="text-sm text-slate-400">
          PDF or DOCX format under 1 MB. We analyze claims and projects client-side.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-3 text-xs text-emerald-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Private by design</span>
          Your resume and interview session are processed temporarily and are not stored as a permanent profile.
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          selectedFile
            ? 'border-cyan-500 bg-cyan-950/20'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">
          {selectedFile ? selectedFile.name : 'DROP YOUR RESUME'}
        </h3>
        <p className="text-xs text-slate-400 font-mono">PDF / DOCX • &lt; 1 MB</p>
      </div>

      {/* File Validation Info */}
      {selectedFile && validation && (
        <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 font-mono">{validation.fileSizeKB} KB</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <CheckCircle className="w-4 h-4" /> Valid format &lt; 1 MB
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-8 flex justify-center">
        <button
          disabled={!selectedFile || isProcessing}
          onClick={handleAnalyze}
          className="btn-primary text-sm px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <>
              <span>Analyze Resume</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
