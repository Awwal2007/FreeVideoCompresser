'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, ArrowDown } from 'lucide-react';
import { JsonLd, schemas } from '@/components/JsonLd';
import FileUploader from '@/components/FileUploader';
import ProgressBar from '@/components/ProgressBar';
import DownloadButton from '@/components/DownloadButton';
import AdBanner from '@/components/AdBanner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface CompressionResult {
  downloadToken: string;
  originalSize: string;
  compressedSize: string;
  ratio: string;
}

export default function CompressPage() {
  const siteUrl = 'https://freefileconvert.com';
  const [_file, setFile] = useState<File | null>(null);
  const [uploadToken, setUploadToken] = useState<string>('');
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [outputFormat, setOutputFormat] = useState<'mp4' | 'webm'>('mp4');
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadToken('');
    setResult(null);
    setError('');
    setUploadProgress(0);

    // Upload file via Pinata
    setIsUploading(true);

    try {
      const { uploadFile } = await import('@/utils/upload');
      const result = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      setUploadToken(result.token);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleCompress = async () => {
    if (!uploadToken) {
      setError('Please upload a file first');
      return;
    }

    setIsCompressing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/process/compress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: uploadToken,
          level: compressionLevel,
          outputFormat
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Compression failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Compression failed. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <>
      <JsonLd data={[
        schemas.softwareApplication(
          'Free Video Compressor',
          'Free online video compressor. Reduce MP4, MOV, AVI, MKV, WEBM file sizes without losing quality.',
          `${siteUrl}/compress`
        ),
        schemas.breadcrumbs([
          { name: 'Home', url: siteUrl },
          { name: 'Video Compressor', url: `${siteUrl}/compress` }
        ]),
        schemas.howTo(
          'How to Compress Video Online Free',
          'Learn how to reduce video file size in three simple steps without losing quality.',
          [
            { name: 'Upload Video', text: 'Select or drag and drop your video file (MP4, MOV, AVI, etc.) into the uploader.' },
            { name: 'Choose Quality', text: 'Select a compression level: Low (best quality), Medium (balanced), or High (smallest size).' },
            { name: 'Download File', text: 'Click "Compress Video" and wait a moment. Once finished, download your smaller video file.' }
          ]
        )
      ]} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Video Compressor</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Free Online Video Compressor — Reduce Video File Size
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Compress video files online free. Supports MP4, MOV, AVI, MKV, WEBM. No sign-up required.
      </p>

      {/* Inline Ad Between Header and Content */}
      <div className="flex justify-center mb-6 lg:hidden">
        <AdBanner slot="compress-inline-1" format="mobile" />
      </div>

      {/* File Uploader */}
      <div className="mb-6">
        <FileUploader
          onFileSelect={handleFileSelect}
          label="Drop your video here or click to browse"
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6">
          <ProgressBar
            progress={uploadProgress}
            label="Uploading..."
          />
        </div>
      )}

      {/* Compression Settings */}
      {uploadToken && !result && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Compression Settings</h2>

          {/* Compression Level */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Compression Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low' as const, label: 'Low', desc: 'Good quality' },
                { value: 'medium' as const, label: 'Medium', desc: 'Balanced' },
                { value: 'high' as const, label: 'High', desc: 'Smaller size' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCompressionLevel(opt.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    compressionLevel === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Format
            </label>
            <div className="flex gap-2">
              {(['mp4', 'webm'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                    outputFormat === fmt
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Compress Button */}
          <button
            onClick={handleCompress}
            disabled={isCompressing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            {isCompressing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Compressing... This may take a moment
              </>
            ) : (
              <>
                Compress Video
                <ArrowDown size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Processing Progress (simulated) */}
      {isCompressing && (
        <div className="mb-6">
          <ProgressBar progress={75} label="Processing video..." />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-900">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Original</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{result.originalSize}</p>
            </div>
            <ArrowDown size={20} className="text-green-600 rotate-[-90deg] sm:rotate-0" />
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Compressed</p>
              <p className="text-lg font-bold text-green-600">{result.compressedSize}</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              <CheckCircle size={14} />
              Saved {result.ratio}% file size
            </span>
          </div>

          <DownloadButton
            href={`${API_URL}/api/download/${result.downloadToken}`}
            filename={`compressed-video.${outputFormat}`}
            size={result.compressedSize}
          />
        </div>
      )}

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

      {/* Internal Linking */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Need to extract audio instead?{' '}
          <Link href="/convert-to-mp3" className="text-blue-600 hover:underline font-medium">
            Convert your video to MP3 online free →
          </Link>
        </p>
      </div>

      {/* SEO Content Block */}
      <section className="prose dark:prose-invert max-w-none border-t border-gray-200 dark:border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          About Video Compression
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
          <p>
            Video compression is the process of reducing the file size of a video while maintaining acceptable visual quality. 
            Our <strong>free video compressor online</strong> uses FFmpeg, the industry-standard multimedia framework, to 
            process your files server-side. This means you can <strong>compress video file size online free</strong> without 
            installing any software on your computer.
          </p>
          <p>
            We use CRF (Constant Rate Factor) encoding to control the quality-size tradeoff. A lower CRF value means better 
            quality and larger file size, while a higher CRF produces smaller files with more compression artifacts. 
            With our tool, you can <strong>reduce video file size without losing quality</strong> by choosing the "Low" 
            compression setting (CRF 28), which provides excellent results for most use cases including social media uploads, 
            email attachments, and website embedding.
          </p>
          <p>
            The "Medium" setting (CRF 32) offers the best balance for everyday sharing, while "High" (CRF 38) maximizes 
            compression for situations where file size is critical. Our free video compressor supports MP4 output using H.264 
            encoding for maximum compatibility, and WEBM output using VP9 for modern web applications. All processing happens 
            securely on our servers, and your files are automatically deleted after one hour to protect your privacy.
          </p>
        </div>
      </section>
    </>
  );
}
