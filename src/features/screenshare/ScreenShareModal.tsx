import React, { useState, useRef } from 'react';
import { Video, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  const handleStartShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (err) {
      console.warn('Screen share cancelled or rejected:', err);
    }
  };

  const handleStopShare = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Screen Sharing (Optional)</h3>
            <p className="text-xs text-slate-400 font-mono">Live Interviewer Screen Capture Stream</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Ephemeral Privacy Guarantee
          </div>
          <p>
            If enabled, your shared screen may be temporarily analyzed during the interview to understand your problem-solving approach. Nothing is permanently stored.
          </p>
        </div>

        {isActive ? (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono mb-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>● SCREEN SHARING ACTIVE</span>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          {isActive ? (
            <button
              onClick={handleStopShare}
              className="px-5 py-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-white text-xs font-semibold"
            >
              Stop Sharing
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStartShare}
                className="btn-primary text-xs px-6 py-2.5"
              >
                Share Screen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
