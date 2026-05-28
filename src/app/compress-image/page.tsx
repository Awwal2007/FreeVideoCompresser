'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Download, Sliders, Image as ImageIcon, Sparkles, Scale, Info } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import ProgressBar from '@/components/ProgressBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UploadedImage {
  name: string;
  size: string;
  bytes: number;
  token: string;
  status: 'uploading' | 'uploaded' | 'failed';
  progress: number;
}

interface CompressionResult {
  downloadToken: string;
  originalSize: string;
  compressedSize: string;
  ratio: number;
  isZip: boolean;
  count?: number;
}

export default function CompressImagePage() {
  const [files, setFiles] = useState<UploadedImage[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<string>(''); // empty means keep original
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFilesSelect = useCallback(async (selectedFiles: File[]) => {
    setError('');
    setResult(null);
    
    // Add files to list as uploading
    const initialFiles = selectedFiles.map(f => ({
      name: f.name,
      size: formatFileSize(f.size),
      bytes: f.size,
      token: '',
      status: 'uploading' as const,
      progress: 0
    }));
    setFiles(initialFiles);

    // Upload files sequentially or in parallel
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const xhr = new XMLHttpRequest();
        
        const uploadPromise = new Promise<string>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setFiles(prev => {
                const updated = [...prev];
                if (updated[i]) updated[i].progress = percent;
                return updated;
              });
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.token);
            } else {
              reject(new Error(xhr.statusText || 'Upload failed'));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        });

        xhr.open('POST', `${API_URL}/api/upload`);
        xhr.send(formData);

        const token = await uploadPromise;
        setFiles(prev => {
          const updated = [...prev];
          if (updated[i]) {
            updated[i].token = token;
            updated[i].status = 'uploaded';
          }
          return updated;
        });

      } catch (err: any) {
        console.error(err);
        setFiles(prev => {
          const updated = [...prev];
          if (updated[i]) updated[i].status = 'failed';
          return updated;
        });
        setError(`Failed to upload file: ${file.name}`);
      }
    }
  }, []);

  const handleCompress = async () => {
    const readyTokens = files.filter(f => f.status === 'uploaded').map(f => f.token);
    
    if (readyTokens.length === 0) {
      setError('Please upload at least one image file first.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/image-pdf/compress-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: readyTokens,
          quality,
          width: width ? parseInt(width) : null,
          height: height ? parseInt(height) : null,
          format: format || null,
          preserveMetadata
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Image compression failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Compression failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const allUploaded = files.length > 0 && files.every(f => f.status === 'uploaded');
  const isUploading = files.some(f => f.status === 'uploading');

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Compress Image</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Scale className="text-green-500 w-7 h-7" />
        Free Online Image Compressor
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Compress JPG, PNG, WebP, GIF, SVG files. Adjust quality levels, output dimensions, and preserve important EXIF data.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Side: Uploader */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Upload Images</h2>
            <FileUploader
              fileType="image"
              multiple={true}
              onFilesSelect={handleFilesSelect}
            />
          </div>

          {/* Settings Box */}
          {files.length > 0 && !result && (
            <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-850">
                <Sliders size={16} />
                Compression Options
              </h2>

              {/* Quality Slider */}
              {format !== 'svg' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <span>Quality Level</span>
                    <span className="text-green-500">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">80% is recommended for best size-to-quality balance.</span>
                </div>
              )}

              {/* Convert Format */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Convert Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 focus:ring-1 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Keep Original Format</option>
                  <option value="jpeg">Convert to JPEG</option>
                  <option value="png">Convert to PNG</option>
                  <option value="webp">Convert to WebP (Recommended)</option>
                  <option value="gif">Convert to GIF</option>
                </select>
              </div>

              {/* Resize settings */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Resize Dimensions (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-0.5">Width (px)</span>
                    <input
                      type="number"
                      placeholder="e.g. 1920"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-0.5">Height (px)</span>
                    <input
                      type="number"
                      placeholder="e.g. 1080"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 mt-1 block">Aspect ratio will be locked. Fits inside dimensions.</span>
              </div>

              {/* Metadata preservation */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="metadata"
                  checked={preserveMetadata}
                  onChange={(e) => setPreserveMetadata(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-800 text-green-600 focus:ring-green-500 h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="metadata" className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
                  Preserve EXIF camera metadata
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Upload list and execution */}
        <div className="lg:col-span-2 space-y-4">
          {/* List of uploads */}
          {files.length > 0 && !result && (
            <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">
                Selected Images ({files.length})
              </h2>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div key={file.name} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{file.size}</p>
                    </div>
                    
                    <div className="shrink-0 flex items-center gap-3">
                      {file.status === 'uploading' && (
                        <div className="w-24 text-right">
                          <span className="text-[10px] font-semibold text-blue-500 mr-1.5">{file.progress}%</span>
                          <progress value={file.progress} max="100" className="w-12 h-1 accent-blue-500 bg-gray-100 rounded" />
                        </div>
                      )}
                      {file.status === 'uploaded' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full font-medium border border-green-150/40">
                          Uploaded
                        </span>
                      )}
                      {file.status === 'failed' && (
                        <span className="text-[10px] text-red-500 font-semibold">Failed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action trigger button */}
              <button
                disabled={!allUploaded || isProcessing || isUploading}
                onClick={handleCompress}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Compressing Images...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Compress {files.length} Image(s)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Container */}
          {result && (
            <div className="bg-green-50/50 dark:bg-green-950/15 p-6 rounded-2xl border border-green-200/50 dark:border-green-900/50 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 border-b border-green-200/50 dark:border-green-900/50 pb-3">
                <CheckCircle className="text-green-500 shrink-0" size={24} />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Compression Complete!</h3>
                  <p className="text-xs text-gray-400">Processed all images successfully.</p>
                </div>
              </div>

              {/* Data Table details */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Original Size</span>
                  <p className="text-base font-bold text-gray-800 dark:text-white mt-1">{result.originalSize}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Compressed Size</span>
                  <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">{result.compressedSize}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Saved Ratio</span>
                  <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">-{result.ratio}%</p>
                </div>
              </div>

              {/* ZIP / Individual download action */}
              <div className="pt-2">
                <a
                  href={`${API_URL}/api/download/${result.downloadToken}`}
                  download={result.isZip ? 'compressed_images.zip' : undefined}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-colors text-center"
                >
                  <Download size={18} />
                  Download {result.isZip ? `Zipped Archive (${result.count} images)` : 'Compressed Image'}
                </a>
              </div>

              {/* Batch feedback message */}
              {result.isZip && (
                <div className="flex gap-2 items-start bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-400 border border-blue-100/30">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>Multiple files were compressed in a batch and bundled together in a ZIP file for a fast single-click download.</p>
                </div>
              )}
            </div>
          )}

          {/* Error Container */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg text-sm border border-red-150/40">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State visual */}
          {files.length === 0 && !result && (
            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 p-12 flex flex-col items-center justify-center text-center">
              <ImageIcon size={48} className="text-green-200 dark:text-green-900/30 mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No images selected</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Upload up to 20 images in JPG, PNG, WebP, GIF, or SVG formats to configure compression settings.</p>
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
