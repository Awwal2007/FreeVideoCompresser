'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, Download, Image as ImageIcon, Sliders, CheckCircle, Trash } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import ProgressBar from '@/components/ProgressBar';

// We'll dynamically import @mediapipe/tasks-vision only on client
let ImageSegmenter: any = null;
let FilesetResolver: any = null;

export default function RemoveBackgroundPage() {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState('');

  // Image states
  const [images, setImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bgType, setBgType] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [solidColor, setSolidColor] = useState('#00ff00');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [feather, setFeather] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);

  // Video states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const segmenterRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const bgImageObjRef = useRef<HTMLImageElement | null>(null);
  const initCalledRef = useRef(false);

  // Load MediaPipe Tasks Vision via npm package (dynamic import for client-only)
  const initModel = useCallback(async () => {
    if (segmenterRef.current || modelLoading) return;
    setModelLoading(true);
    setModelError('');

    try {
      // Dynamic import of the npm package (client-only)
      const vision = await import('@mediapipe/tasks-vision');
      ImageSegmenter = vision.ImageSegmenter;
      FilesetResolver = vision.FilesetResolver;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      const segmenter = await ImageSegmenter.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });

      segmenterRef.current = segmenter;
      setModelLoaded(true);
      console.log('[AI Model] MediaPipe Tasks Vision segmenter loaded successfully');
    } catch (err: any) {
      console.error('[AI Model] Failed to load segmenter:', err);
      setModelError(
        'Failed to load the AI model. Your browser may not support WebGPU/WebGL. Please try Chrome or Edge.'
      );
    } finally {
      setModelLoading(false);
    }
  }, [modelLoading]);

  // Auto-init model on mount (once)
  useEffect(() => {
    if (!initCalledRef.current) {
      initCalledRef.current = true;
      initModel();
    }
  }, []);

  // Manage video object URL lifecycle to prevent memory leaks
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoObjectUrl(null);
    }
  }, [videoFile]);

  // Pre-load background image object for faster canvas rendering
  useEffect(() => {
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      img.onload = () => {
        bgImageObjRef.current = img;
      };
    } else {
      bgImageObjRef.current = null;
    }
  }, [bgImage]);

  /**
   * Render the segmentation result to the canvas.
   * Uses CONFIDENCE MASKS for smooth alpha edges.
   * confidenceMask values: 0.0 = background, 1.0 = person/foreground.
   */
  const renderSegmentedImage = useCallback(
    (
      sourceImage: HTMLImageElement | HTMLVideoElement,
      confidenceMask: Float32Array,
      width: number,
      height: number
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw original image to extract pixel data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(sourceImage, 0, 0, width, height);
      const originalPixels = tempCtx.getImageData(0, 0, width, height);

      // Draw the replacement background first
      if (bgType === 'color') {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, width, height);
      } else if (bgType === 'image' && bgImageObjRef.current) {
        ctx.drawImage(bgImageObjRef.current, 0, 0, width, height);
      }
      // For 'transparent', canvas is already clear

      // Get the background pixels we just drew
      const bgData = ctx.getImageData(0, 0, width, height);
      const bgPixels = bgData.data;
      const fgPixels = originalPixels.data;

      // Create output
      const output = ctx.createImageData(width, height);
      const out = output.data;

      const featherStrength = feather / 10; // Normalize 0-10 to 0-1

      for (let i = 0; i < confidenceMask.length; i++) {
        // confidenceMask[i] is 0.0 (background) to 1.0 (person/foreground)
        let alpha = confidenceMask[i];

        // Apply feathering: soften edges by adjusting the alpha curve
        if (featherStrength > 0) {
          // Smoothstep for natural edge blending
          const lo = 0.3 - featherStrength * 0.25;
          const hi = 0.7 + featherStrength * 0.25;
          if (alpha <= lo) {
            alpha = 0;
          } else if (alpha >= hi) {
            alpha = 1;
          } else {
            const t = (alpha - lo) / (hi - lo);
            alpha = t * t * (3 - 2 * t); // smoothstep
          }
        } else {
          // Hard threshold without feathering
          alpha = alpha > 0.5 ? 1 : 0;
        }

        const px = i * 4;

        if (bgType === 'transparent') {
          // Foreground pixels with alpha, background pixels fully transparent
          out[px] = fgPixels[px];
          out[px + 1] = fgPixels[px + 1];
          out[px + 2] = fgPixels[px + 2];
          out[px + 3] = Math.round(255 * alpha);
        } else {
          // Blend foreground over replacement background
          out[px] = Math.round(fgPixels[px] * alpha + bgPixels[px] * (1 - alpha));
          out[px + 1] = Math.round(fgPixels[px + 1] * alpha + bgPixels[px + 1] * (1 - alpha));
          out[px + 2] = Math.round(fgPixels[px + 2] * alpha + bgPixels[px + 2] * (1 - alpha));
          out[px + 3] = 255;
        }
      }

      ctx.putImageData(output, 0, 0);
    },
    [bgType, solidColor, feather]
  );

  // Process a single image
  const processImage = useCallback(async () => {
    if (!modelLoaded || images.length === 0 || !segmenterRef.current) return;
    setIsProcessing(true);

    try {
      const currentFile = images[currentImageIndex];

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(currentFile);
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      // Run segmentation — confidence masks mode
      const result = segmenterRef.current.segment(img);

      if (result && result.confidenceMasks && result.confidenceMasks.length > 0) {
        // confidenceMasks[0] is the person/foreground mask for selfie_segmenter
        const maskData = result.confidenceMasks[0].getAsFloat32Array();
        renderSegmentedImage(img, maskData, img.naturalWidth, img.naturalHeight);

        // Close the result to free GPU memory
        result.close();

        // Save output
        if (canvasRef.current) {
          const outUrl = canvasRef.current.toDataURL('image/png');
          setProcessedImages((prev) => {
            const updated = [...prev];
            updated[currentImageIndex] = outUrl;
            return updated;
          });
        }
      } else {
        console.warn('[AI] No confidence masks returned from segmenter');
      }
    } catch (err) {
      console.error('[AI Processing Error]:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [modelLoaded, images, currentImageIndex, renderSegmentedImage]);

  // Trigger processing when inputs change
  useEffect(() => {
    if (modelLoaded && images.length > 0 && activeTab === 'image') {
      processImage();
    }
  }, [currentImageIndex, bgType, solidColor, bgImage, feather, images, modelLoaded, activeTab, processImage]);

  // ─── Video Processing ────────────────────────────────────────────
  const videoProcessingRef = useRef(false);

  const processVideoFrame = useCallback(
    async (startTimeMs: number) => {
      const video = hiddenVideoRef.current;
      if (!video || video.paused || video.ended || !videoProcessingRef.current || !segmenterRef.current)
        return;

      try {
        const nowMs = performance.now();
        // VIDEO mode requires a timestamp
        const result = segmenterRef.current.segmentForVideo(video, nowMs);

        if (result && result.confidenceMasks && result.confidenceMasks.length > 0) {
          const maskData = result.confidenceMasks[0].getAsFloat32Array();
          renderSegmentedImage(video, maskData, video.videoWidth, video.videoHeight);
          result.close();
        }

        setVideoProgress(Math.round((video.currentTime / video.duration) * 100));

        if (videoProcessingRef.current) {
          requestAnimationFrame(() => processVideoFrame(startTimeMs));
        }
      } catch (err) {
        console.error('[Video Frame Error]:', err);
      }
    },
    [renderSegmentedImage]
  );

  const startVideoProcessing = useCallback(async () => {
    const video = hiddenVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !modelLoaded || !videoFile || !segmenterRef.current) return;

    // Switch to VIDEO running mode
    try {
      segmenterRef.current.setOptions({ runningMode: 'VIDEO' });
    } catch (e) {
      console.warn('Could not switch to VIDEO mode:', e);
    }

    videoProcessingRef.current = true;
    setVideoProcessing(true);
    setProcessedVideoUrl(null);
    setVideoProgress(0);
    recordedChunksRef.current = [];

    // Setup MediaRecorder
    const stream = canvas.captureStream(30);
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    } catch (e) {
      recorder = new MediaRecorder(stream);
    }

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setProcessedVideoUrl(url);
      setVideoProcessing(false);
      videoProcessingRef.current = false;
    };

    mediaRecorderRef.current = recorder;

    video.currentTime = 0;
    video.play();
    recorder.start();
    const startTimeMs = performance.now();
    requestAnimationFrame(() => processVideoFrame(startTimeMs));
  }, [modelLoaded, videoFile, processVideoFrame]);

  const handleVideoEnded = useCallback(() => {
    videoProcessingRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setVideoProcessing(false);
    setVideoProgress(100);
  }, []);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
        setBgType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesSelect = useCallback((files: File[]) => {
    setImages(files);
    setProcessedImages([]);
    setCurrentImageIndex(0);
  }, []);

  const handleVideoSelect = useCallback((file: File) => {
    setVideoFile(file);
    setProcessedVideoUrl(null);
  }, []);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Remove Background</span>
      </nav>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-pink-500 fill-pink-500 w-7 h-7" />
          AI Background Remover
        </h1>
        {modelLoading && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading AI Engine
          </span>
        )}
        {modelLoaded && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3.5 h-3.5" />
            AI Ready
          </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Remove background from images or videos automatically using local client-side AI. Supports
        solid replacement or transparency.
      </p>

      {modelError && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg text-sm border border-red-100">
          <span>{modelError}</span>
          <button
            onClick={initModel}
            className="ml-auto text-xs font-medium px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => {
            setActiveTab('image');
            setVideoFile(null);
            setProcessedVideoUrl(null);
          }}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-all ${
            activeTab === 'image'
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Image Background Remover
        </button>
        <button
          onClick={() => {
            setActiveTab('video');
            setImages([]);
            setProcessedImages([]);
          }}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-all ${
            activeTab === 'video'
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Video Background Remover
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Uploader Box */}
          <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Upload Media</h2>
            {activeTab === 'image' ? (
              <FileUploader fileType="image" multiple={true} onFilesSelect={handleImagesSelect} />
            ) : (
              <FileUploader fileType="video" onFileSelect={handleVideoSelect} />
            )}
          </div>

          {/* AI Settings Box */}
          <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-850">
              <Sliders size={16} />
              Refinement Settings
            </h2>

            {/* Background Style */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Replace Background With
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'transparent' as const, label: 'Transparent' },
                    { id: 'color' as const, label: 'Color' },
                    { id: 'image' as const, label: 'Custom' },
                  ] as const
                ).map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setBgType(type.id)}
                    className={`py-2 px-1 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                      bgType === type.id
                        ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400'
                        : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid color picker */}
            {bgType === 'color' && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Background Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="w-10 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Custom image background upload */}
            {bgType === 'image' && (
              <div className="animate-in fade-in duration-200 space-y-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Background Image
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => bgInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded transition-colors text-center"
                  >
                    {bgImage ? 'Change Image' : 'Select Image'}
                  </button>
                  <input
                    ref={bgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                    className="hidden"
                  />
                </div>
                {bgImage && (
                  <div className="relative w-full h-16 rounded overflow-hidden border border-gray-100 dark:border-gray-800">
                    <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setBgImage(null)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <Trash size={10} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Edge Feathering Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                <span>Feathering (Edges)</span>
                <span className="text-pink-500">{feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={feather}
                onChange={(e) => setFeather(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Right Canvas / Preview Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Preview Container */}
          <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 p-6 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
            {/* Loading AI State */}
            {modelLoading && (
              <div className="text-center space-y-3 z-10">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Initializing AI Neural Network...
                </p>
                <p className="text-xs text-gray-400">
                  This happens locally in your browser. Almost ready!
                </p>
              </div>
            )}

            {/* Empty State */}
            {!modelLoading && modelLoaded && images.length === 0 && !videoFile && (
              <div className="text-center space-y-2 text-gray-400 dark:text-gray-600">
                <ImageIcon size={48} className="mx-auto text-pink-200 dark:text-pink-900/50" />
                <p className="text-sm font-medium">Select image/video files on the left to start</p>
                <p className="text-[10px]">
                  Processing is done 100% locally in your browser without uploads.
                </p>
              </div>
            )}

            {/* Rendering Canvas */}
            <div
              className={`relative ${
                (images.length > 0 && activeTab === 'image') ||
                (videoFile && activeTab === 'video')
                  ? 'block'
                  : 'hidden'
              } max-w-full max-h-[400px] overflow-hidden rounded-lg shadow-md`}
              style={{
                backgroundImage:
                  'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)',
                backgroundSize: '16px 16px',
              }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[350px] w-auto h-auto object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Video element (hidden for processing) */}
            {videoObjectUrl && (
              <video
                ref={hiddenVideoRef}
                src={videoObjectUrl}
                onEnded={handleVideoEnded}
                className="hidden"
                muted
                playsInline
              />
            )}
          </div>

          {/* Image Batch Carousel Navigation */}
          {activeTab === 'image' && images.length > 1 && (
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Batch processing image{' '}
                <strong className="text-pink-500">{currentImageIndex + 1}</strong> of{' '}
                <strong>{images.length}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentImageIndex === 0}
                  onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                  className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed rounded"
                >
                  Previous
                </button>
                <button
                  disabled={currentImageIndex === images.length - 1}
                  onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                  className="px-3 py-1 text-xs bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Image Results */}
          {activeTab === 'image' && processedImages[currentImageIndex] && (
            <div className="bg-green-50/50 dark:bg-green-950/20 p-5 rounded-2xl border border-green-200/50 dark:border-green-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    AI Background Removed Successfully!
                  </p>
                  <p className="text-[10px] text-gray-400">
                    High definition PNG ready for download.
                  </p>
                </div>
              </div>
              <a
                href={processedImages[currentImageIndex]}
                download={`bg_removed_${images[currentImageIndex]?.name || 'image'}.png`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow transition-colors"
              >
                <Download size={16} />
                Download PNG
              </a>
            </div>
          )}

          {/* Video Processing Controls */}
          {activeTab === 'video' && videoFile && (
            <div className="space-y-4">
              {!videoProcessing && !processedVideoUrl && (
                <button
                  onClick={startVideoProcessing}
                  disabled={!modelLoaded}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  <Sparkles size={18} />
                  Process Video Background
                </button>
              )}

              {videoProcessing && (
                <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <ProgressBar
                    progress={videoProgress}
                    label="AI Video Segmentation rendering frame loop..."
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Processing speed relies on browser GPU power. Keep this tab active.
                  </p>
                </div>
              )}

              {processedVideoUrl && (
                <div className="bg-green-50/50 dark:bg-green-950/20 p-5 rounded-2xl border border-green-200/50 dark:border-green-900/50 flex flex-col items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-center sm:text-left">
                    <CheckCircle className="text-green-500 shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Video Background Removed Successfully!
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Processed file compiled locally as WebM.
                      </p>
                    </div>
                  </div>
                  <a
                    href={processedVideoUrl}
                    download={`bg_removed_${videoFile.name.substring(0, videoFile.name.lastIndexOf('.'))}.webm`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow transition-colors"
                  >
                    <Download size={16} />
                    Download WebM
                  </a>
                </div>
              )}
            </div>
          )}
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
