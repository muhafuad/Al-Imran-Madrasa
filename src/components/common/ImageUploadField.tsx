import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
  Eye,
  Sparkles,
  Cloud,
  AlertCircle,
} from 'lucide-react';
import { uploadPhotoToSupabase, compressImage } from '../../lib/supabase';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (imageUrl: string) => void;
  aspectRatio?: 'square' | 'wide' | 'round';
  helperText?: string;
  bucket?: 'student-photos' | 'teacher-photos' | 'id-cards' | 'avatars' | 'madrasa-media' | (string & {});
  customFileName?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  helperText = 'Upload high-resolution photo (PNG, JPG, WebP) or snap via Camera',
  bucket = 'student-photos',
  customFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'synced_cloud' | 'local'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Stop camera stream on unmount or close
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleUploadFile = async (file: File | Blob) => {
    if (!file) return;
    setIsProcessing(true);
    setUploadStatus('uploading');
    setStatusMessage('Optimizing & uploading photo...');

    try {
      const res = await uploadPhotoToSupabase(file, bucket, customFileName);
      if (res.url) {
        onChange(res.url);
        if (res.source === 'supabase') {
          setUploadStatus('synced_cloud');
          setStatusMessage('Uploaded to Supabase Cloud Storage');
        } else {
          setUploadStatus('local');
          setStatusMessage(res.error || 'Saved locally (optimized)');
        }
      }
    } catch (err: any) {
      console.warn('Image upload error:', err);
      // Fallback to simple reader
      try {
        const compressed = await compressImage(file, 600, 600, 0.8);
        onChange(compressed);
        setUploadStatus('local');
        setStatusMessage('Saved locally');
      } catch {
        alert('Failed to process image file.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WebP).');
        return;
      }
      handleUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please drop a valid image file.');
        return;
      }
      handleUploadFile(file);
    }
  };

  // Camera handling
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions in your browser or upload a file.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight) || 480;

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Center crop square
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            handleUploadFile(blob);
            stopCamera();
          }
          setIsCapturing(false);
        },
        'image/jpeg',
        0.88
      );
    } else {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {uploadStatus === 'synced_cloud' && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Cloud className="w-3 h-3" /> Supabase Storage
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Preview Box */}
        <div
          className={`relative border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center transition-all bg-slate-50 dark:bg-slate-800/80 shrink-0 ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-300 dark:border-slate-700'
          } ${
            aspectRatio === 'round'
              ? 'w-18 h-18 rounded-full'
              : aspectRatio === 'wide'
              ? 'w-28 h-18 rounded-xl'
              : 'w-18 h-18 rounded-2xl'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin mb-1" />
              <span className="text-[8px] font-bold text-slate-500">Processing...</span>
            </div>
          ) : value ? (
            <>
              <img
                src={value}
                alt="Upload preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setUploadStatus('idle');
                  setStatusMessage('');
                }}
                className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md cursor-pointer transition-all active:scale-90"
                title="Remove image"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </>
          ) : (
            <div className="text-center p-1">
              <ImageIcon className="w-5 h-5 text-slate-400 mx-auto mb-0.5" />
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold block leading-tight">
                {dragOver ? 'Drop Image' : 'No Photo'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{value ? 'Change Photo' : 'Upload File'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={startCamera}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Snap with Camera</span>
            </button>

            {value && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready</span>
              </span>
            )}
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {statusMessage || helperText}
          </p>
        </div>
      </div>

      {/* Hidden Canvas for Camera Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Camera Snapshot Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Camera Photo Capture</h3>
                  <p className="text-[11px] text-slate-500 font-arabic">التقاط صورة فورية للبطاقة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Camera Unavailable</p>
                  <p>{cameraError}</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border-2 border-emerald-500/40 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Visual Viewfinder Target */}
                <div className="absolute inset-8 border border-white/40 rounded-full pointer-events-none flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  disabled={isCapturing}
                  onClick={capturePhoto}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCapturing ? 'Capturing...' : 'Take Photo'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
