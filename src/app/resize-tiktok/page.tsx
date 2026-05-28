'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Download, Sliders, Video, Smartphone, Sparkles, Eye, EyeOff, Info } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import ProgressBar from '@/components/ProgressBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ResizerResult {
  downloadToken: string;
  videoSize: string;
  resizedSize: string;
}

export default function ResizeTiktokPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoToken, setVideoToken] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Fit settings
  const [bgType, setBgType] = useState<'blur' | 'color' | 'image' | 'crop' | 'manual'>('blur');
  const [bgColor, setBgColor] = useState('#000000');
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImageToken, setBgImageToken] = useState('');
  const [cropX, setCropX] = useState(50); // 0 to 100 X offset

  // Subtitles
  const [burnSubtitles, setBurnSubtitles] = useState(false);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitleToken, setSubtitleToken] = useState('');

  // Export
  const [format, setFormat] = useState<'mp4' | 'mov'>('mp4');

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ResizerResult | null>(null);
  const [error, setError] = useState<string>('');

  // Visual guides
  const [showSafeZones, setShowSafeZones] = useState(true);

  // File select handlers
  const handleVideoSelect = useCallback(async (selectedFile: File) => {
    setVideoFile(selectedFile);
    setVideoToken('');
    setResult(null);
    setError('');
    setUploadProgress(0);

    setIsUploading(true);

    try {
      const { uploadFile } = await import('@/utils/upload');
      const result = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      setVideoToken(result.token);
    } catch (err: any) {
      setError('Failed to upload video file.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleBgImageSelect = useCallback(async (selectedFile: File) => {
    setBgImageFile(selectedFile);
    setBgImageToken('');

    try {
      const { uploadFile } = await import('@/utils/upload');
      const result = await uploadFile(selectedFile, () => {});
      setBgImageToken(result.token);
    } catch (e) {
      console.error(e);
      setError('Failed to upload background image.');
    }
  }, []);

  const handleSubtitleSelect = useCallback(async (selectedFile: File) => {
    setSubtitleFile(selectedFile);
    setSubtitleToken('');

    try {
      const { uploadFile } = await import('@/utils/upload');
      const result = await uploadFile(selectedFile, () => {});
      setSubtitleToken(result.token);
    } catch (e) {
      console.error(e);
      setError('Failed to upload subtitle file.');
    }
  }, []);

  const handleProcess = async () => {
    if (!videoToken) {
      setError('Please upload a video file first.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/process/resize-tiktok`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: videoToken,
          bgType,
          bgColor,
          bgImageToken: bgType === 'image' ? bgImageToken : null,
          cropX,
          burnSubtitles: burnSubtitles && !!subtitleToken,
          subtitlesToken: burnSubtitles ? subtitleToken : null,
          format
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video resizing failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Resizing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">TikTok Resizer</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Smartphone className="text-indigo-500 w-7 h-7" />
        TikTok Video Resizer
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Fit horizontal clips into standard TikTok 9:16 (1080x1920) layout. Apply blur backgrounds, check safe zones, and burn in subtitles.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Side: Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Video */}
          <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Upload Video</h2>
            <FileUploader
              fileType="video"
              onFileSelect={handleVideoSelect}
            />
          </div>

          {/* Controls Box */}
          {videoToken && !result && (
            <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-850">
                <Sliders size={16} />
                Fit Settings
              </h2>

              {/* Background Fit Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Layout Style
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'blur' as const, label: 'Blurred BG' },
                    { id: 'color' as const, label: 'Solid Color' },
                    { id: 'image' as const, label: 'Custom BG' },
                    { id: 'crop' as const, label: 'Center Crop' },
                    { id: 'manual' as const, label: 'Manual X Slide' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setBgType(type.id)}
                      className={`py-1.5 px-1 text-[10px] font-semibold rounded-lg border transition-all text-center ${
                        bgType === type.id
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solid Color Picker */}
              {bgType === 'color' && (
                <div className="animate-in fade-in duration-200">
                  <span className="text-[10px] text-gray-400 block mb-1">Color Code</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 border-0 p-0 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-2 text-xs py-1"
                    />
                  </div>
                </div>
              )}

              {/* Custom BG Image upload */}
              {bgType === 'image' && (
                <div className="animate-in fade-in duration-200 space-y-2">
                  <span className="text-[10px] text-gray-400 block">Background Image</span>
                  <FileUploader
                    fileType="image"
                    onFileSelect={handleBgImageSelect}
                    showPreview={false}
                    label="Click to add background"
                  />
                  {bgImageFile && (
                    <p className="text-[10px] text-green-500 font-semibold truncate">Uploaded: {bgImageFile.name}</p>
                  )}
                </div>
              )}

              {/* Manual crop slider */}
              {bgType === 'manual' && (
                <div className="animate-in fade-in duration-200">
                  <div className="flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    <span>X Offset Position</span>
                    <span className="text-indigo-500">{cropX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropX}
                    onChange={(e) => setCropX(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}

              {/* Subtitles toggle */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-850 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="subtitles"
                    checked={burnSubtitles}
                    onChange={(e) => setBurnSubtitles(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-800 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <label htmlFor="subtitles" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Burn-in Subtitles File (.srt/.vtt)
                  </label>
                </div>

                {burnSubtitles && (
                  <div className="animate-in slide-in-from-top-2 duration-200 space-y-2">
                    <FileUploader
                      fileType="subtitle"
                      onFileSelect={handleSubtitleSelect}
                      showPreview={false}
                      label="Upload .srt or .vtt file"
                    />
                    {subtitleFile && (
                      <p className="text-[10px] text-green-500 font-semibold truncate">Uploaded: {subtitleFile.name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Export format */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-850">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Export Video Format
                </label>
                <div className="flex gap-2">
                  {['mp4', 'mov'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt as any)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium uppercase transition-colors text-center ${
                        format === fmt
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Safe Zones & Output */}
        <div className="lg:col-span-2 space-y-4">
          {/* Player Safe Zone Simulator */}
          {videoFile && !result && (
            <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  TikTok Layout Preview
                </h3>
                <button
                  onClick={() => setShowSafeZones(!showSafeZones)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-500 font-medium hover:underline"
                >
                  {showSafeZones ? (
                    <>
                      <EyeOff size={14} /> Hide Safe Zones
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Show Safe Zones
                    </>
                  )}
                </button>
              </div>

              {/* Safe zone guide screen simulator */}
              <div className="relative w-[210px] h-[373px] bg-black rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-center">
                {/* Simulated background */}
                {bgType === 'color' && (
                  <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
                )}
                {bgType === 'crop' && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center opacity-60">
                    <Video className="text-gray-600" size={32} />
                  </div>
                )}
                {/* Default/Blur indicator */}
                {bgType === 'blur' && (
                  <div className="absolute inset-0 bg-gray-900 overflow-hidden flex flex-col justify-between p-1 opacity-70">
                    <div className="h-20 bg-gray-850 blur-xs rounded" />
                    <div className="h-32 bg-gray-800/40 rounded flex items-center justify-center">
                      <Video className="text-gray-500" size={24} />
                    </div>
                    <div className="h-20 bg-gray-850 blur-xs rounded" />
                  </div>
                )}

                {/* Safe zone lines overlay */}
                {showSafeZones && (
                  <div className="absolute inset-0 border-2 border-dashed border-red-500/30 pointer-events-none z-20">
                    {/* Top safe zone */}
                    <div className="absolute top-0 left-0 right-0 h-10 bg-red-500/10 border-b border-red-500/20 flex items-center justify-center">
                      <span className="text-[7px] text-red-500 font-bold uppercase tracking-widest">Follow / For You</span>
                    </div>

                    {/* Right side buttons safe zone */}
                    <div className="absolute right-0 top-12 bottom-16 w-10 bg-red-500/10 border-l border-red-500/20 flex flex-col items-center justify-center gap-4 text-red-500">
                      <div className="w-4 h-4 rounded-full border border-red-500/50 bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full border border-red-500/50 bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full border border-red-500/50 bg-red-500/20" />
                    </div>

                    {/* Bottom details safe zone */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-red-500/10 border-t border-red-500/20 p-1.5 flex flex-col justify-end">
                      <div className="h-1.5 w-16 bg-red-500/40 rounded mb-1" />
                      <div className="h-1 w-24 bg-red-500/30 rounded mb-1" />
                      <div className="h-1 w-20 bg-red-500/30 rounded" />
                    </div>
                  </div>
                )}
                
                <span className="text-[9px] font-semibold text-gray-500 select-none z-10">9:16 Output Viewport</span>
              </div>

              {/* Progress and submit */}
              <div className="w-full mt-6 space-y-4">
                {isUploading && (
                  <ProgressBar progress={uploadProgress} label="Uploading source video..." />
                )}

                {videoToken && !isProcessing && (
                  <button
                    onClick={handleProcess}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all"
                  >
                    <Sparkles size={18} />
                    Resize Video to 9:16
                  </button>
                )}

                {isProcessing && (
                  <div>
                    <ProgressBar progress={60} label="Rendering filters on server FFmpeg..." />
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Applying boxblur, scaling, and subtitle streams. May take a few seconds.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results container */}
          {result && (
            <div className="bg-green-50/50 dark:bg-green-950/15 p-6 rounded-2xl border border-green-200/50 dark:border-green-900/50 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 border-b border-green-200/50 dark:border-green-900/50 pb-3">
                <CheckCircle className="text-green-500 shrink-0" size={24} />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Resizing Complete!</h3>
                  <p className="text-xs text-gray-400">Successfully scaled video for TikTok vertical view.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Original Size</span>
                  <p className="text-base font-bold text-gray-800 dark:text-white mt-1">{result.videoSize}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">TikTok Ready Size</span>
                  <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">{result.resizedSize}</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`${API_URL}/api/download/${result.downloadToken}`}
                  download={`tiktok_resized.${format}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-colors text-center"
                >
                  <Download size={18} />
                  Download Vertical Video
                </a>
              </div>
            </div>
          )}

          {/* Error Box */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg text-sm border border-red-150/40 animate-in shake duration-200">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State */}
          {!videoFile && !result && (
            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 p-12 flex flex-col items-center justify-center text-center">
              <Smartphone className="text-indigo-200 dark:text-indigo-900/20 mb-3 w-12 h-12" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No video selected</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Upload a horizontal video (MP4, MOV, AVI) to crop or overlay blurred/solid background frames to fit the 9:16 ratio.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Block */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 flex gap-3 text-xs text-blue-700 dark:text-blue-400 mb-6">
        <Info size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Why use Safe Zone overlays?</p>
          <p className="mt-1 leading-relaxed">
            TikTok covers the top, bottom-left, and middle-right sections of your videos with tabs, usernames, icons, and buttons. 
            Activating the <strong>Safe Zones</strong> outline ensures you don\'t place subtitles, key actions, or focal subjects in those regions.
          </p>
        </div>
      </div>

      {/* Back to Home */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </>
  );
}
