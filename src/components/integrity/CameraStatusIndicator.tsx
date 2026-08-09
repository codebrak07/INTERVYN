import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { IntegrityMonitor } from '../../services/integrity/IntegrityMonitor';

interface CameraStatusIndicatorProps {
  stream?: MediaStream | null;
}

export const CameraStatusIndicator: React.FC<CameraStatusIndicatorProps> = ({ stream }) => {
  const [status, setStatus] = useState<'READY' | 'ACTIVE' | 'INTERRUPTED' | 'DISCONNECTED'>('DISCONNECTED');

  useEffect(() => {
    if (!stream) {
      setStatus('DISCONNECTED');
      return;
    }

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      setStatus('DISCONNECTED');
      return;
    }

    if (videoTrack.readyState === 'live' && videoTrack.enabled) {
      setStatus('ACTIVE');
      IntegrityMonitor.watchMediaTrack(videoTrack, 'CAMERA_INTERRUPTED');
    } else {
      setStatus('INTERRUPTED');
    }

    const handleEnded = () => {
      setStatus('INTERRUPTED');
    };

    const handleMute = () => {
      setStatus('INTERRUPTED');
    };

    const handleUnmute = () => {
      setStatus('ACTIVE');
    };

    videoTrack.addEventListener('ended', handleEnded);
    videoTrack.addEventListener('mute', handleMute);
    videoTrack.addEventListener('unmute', handleUnmute);

    return () => {
      videoTrack.removeEventListener('ended', handleEnded);
      videoTrack.removeEventListener('mute', handleMute);
      videoTrack.removeEventListener('unmute', handleUnmute);
    };
  }, [stream]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-[11px] font-mono">
      {status === 'ACTIVE' && (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300">● CAMERA ACTIVE</span>
        </>
      )}

      {status === 'INTERRUPTED' && (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300">CAMERA INTERRUPTED</span>
        </>
      )}

      {status === 'DISCONNECTED' && (
        <>
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          <CameraOff className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">CAMERA INACTIVE</span>
        </>
      )}
    </div>
  );
};
