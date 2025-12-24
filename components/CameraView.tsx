
import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RotateCw, AlertCircle } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Unable to access camera. Please check your device settings.');
        }
      }
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    onCapture(imageSrc);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent pt-safe">
        <button 
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X size={24} />
        </button>
        
        <button 
          onClick={switchCamera}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <RotateCw size={20} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-900">
            <div className="bg-red-500/20 backdrop-blur-sm rounded-3xl p-8 max-w-sm border border-red-500/30">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-white font-serif font-bold text-xl mb-2">Camera Error</p>
              <p className="text-white/70 text-sm leading-relaxed">{error}</p>
              <button 
                onClick={startCamera}
                className="mt-6 px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-2 border-white/20 rounded-[40px] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
            </div>
          </>
        )}
      </div>

      {hasPermission && !error && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center pb-safe">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white border-[6px] border-white/30 shadow-2xl active:scale-90 transition-all flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-white border-2 border-rose-200" />
          </button>
        </div>
      )}
    </div>
  );
};
