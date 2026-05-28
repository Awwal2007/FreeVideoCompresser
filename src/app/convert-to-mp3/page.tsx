'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, Music, ArrowDown } from 'lucide-react';
import { JsonLd, schemas } from '@/components/JsonLd';
import FileUploader from '@/components/FileUploader';
import ProgressBar from '@/components/ProgressBar';
import DownloadButton from '@/components/DownloadButton';
import AdBanner from '@/components/AdBanner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ConversionResult {
  downloadToken: string;
  videoSize: string;
  audioSize: string;
  quality: string;
  estimatedDuration: string;
}

export default function ConvertToMp3Page() {
  const siteUrl = 'https://freefileconvert.com';
  const [file, setFile] = useState<File | null>(null);
  const [uploadToken, setUploadToken] = useState<string>('');
  const [audioQuality, setAudioQuality] = useState<'128' | '192' | '320'>('192');
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
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

  const handleConvert = async () => {
    if (!uploadToken) {
      setError('Please upload a file first');
      return;
    }

    setIsConverting(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/process/convert-to-mp3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: uploadToken,
          quality: audioQuality
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'MP3 conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const qualityLabels: Record<string, { label: string; desc: string }> = {
    '128': { label: '128 kbps', desc: 'Standard quality, smaller file' },
    '192': { label: '192 kbps', desc: 'Excellent balance (recommended)' },
    '320': { label: '320 kbps', desc: 'Near-lossless, larger file' }
  };

  return (
    <>
      <JsonLd data={[
        schemas.softwareApplication(
          'Video to MP3 Converter',
          'Free online video to MP3 converter. Extract high-quality audio from any video format.',
          `${siteUrl}/convert-to-mp3`
        ),
        schemas.breadcrumbs([
          { name: 'Home', url: siteUrl },
          { name: 'Video to MP3', url: `${siteUrl}/convert-to-mp3` }
        ]),
        schemas.howTo(
          'How to Convert Video to MP3 Online Free',
          'Learn how to extract audio from any video file in three simple steps.',
          [
            { name: 'Upload Video', text: 'Select or drag and drop your video file (MP4, MOV, AVI, etc.) into the converter.' },
            { name: 'Choose Quality', text: 'Select your preferred MP3 bitrate: 128kbps, 192kbps (recommended), or 320kbps.' },
            { name: 'Download MP3', text: 'Click "Convert to MP3" and wait. Once extracted, download your high-quality audio file.' }
          ]
        )
      ]} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Video to MP3</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Free Video to MP3 Converter Online — Fast & Easy
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Extract high-quality MP3 audio from any video. Supports MP4, MOV, AVI, MKV, WEBM. No sign-up required.
      </p>

      {/* Inline Ad */}
      <div className="flex justify-center mb-6 lg:hidden">
        <AdBanner slot="mp3-inline-1" format="mobile" />
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

      {/* Audio Quality Settings */}
      {uploadToken && !result && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Audio Quality Settings</h2>

          {/* Quality Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              MP3 Bitrate Quality
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['128', '192', '320'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setAudioQuality(q)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    audioQuality === q
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Music size={16} className={audioQuality === q ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'} />
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {qualityLabels[q].label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-6">{qualityLabels[q].desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File Info Preview */}
          {file && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Music size={20} className="text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &middot; Output: MP3 {qualityLabels[audioQuality].label}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            {isConverting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Converting to MP3... This may take a moment
              </>
            ) : (
              <>
                <Music size={20} />
                Convert to MP3
                <ArrowDown size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Processing Progress */}
      {isConverting && (
        <div className="mb-6">
          <ProgressBar progress={75} label="Extracting audio..." />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Video Size</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{result.videoSize}</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Audio Size</p>
              <p className="text-sm font-bold text-green-600">{result.audioSize}</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Est. Duration</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{result.estimatedDuration}</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
              <Music size={14} />
              MP3 at {result.quality} quality
            </span>
          </div>

          <DownloadButton
            href={`${API_URL}/api/download/${result.downloadToken}`}
            filename={`${file?.name?.replace(/\.[^.]+$/, '') || 'audio'}.mp3`}
            size={result.audioSize}
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
      <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Need to reduce video size instead?{' '}
          <Link href="/compress" className="text-purple-600 hover:underline font-medium">
            Compress your video online free →
          </Link>
        </p>
      </div>

      {/* SEO Content Block */}
      <section className="prose dark:prose-invert max-w-none border-t border-gray-200 dark:border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          About Video to MP3 Conversion
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
          <p>
            Converting video to MP3 is the process of extracting the audio track from a video file and saving it 
            as a standalone MP3 audio file. Our <strong>video to MP3 converter online free</strong> tool uses 
            FFmpeg with the industry-standard LAME MP3 encoder to produce high-quality audio output from any 
            video format including MP4, MOV, AVI, MKV, and WEBM.
          </p>
          <p>
            When you <strong>convert MP4 to MP3 online</strong>, you can choose from three quality levels. 
            128kbps provides standard quality suitable for voice recordings and podcasts where file size matters. 
            192kbps offers an excellent balance between quality and size, making it ideal for music and most 
            general-purpose audio. 320kbps delivers near-lossless quality that satisfies even discerning 
            audiophiles, though the resulting files are larger.
          </p>
          <p>
            Our server-side processing ensures fast conversion without burdening your device. The FFmpeg audio 
            extraction pipeline uses the <code>-vn</code> flag to discard video, <code>-acodec libmp3lame</code> 
            for optimal MP3 encoding, and sets appropriate sample rates and channel configurations for 
            compatibility with all music players and devices. All files are automatically deleted from our 
            servers after one hour, ensuring your content remains private and secure.
          </p>
        </div>
      </section>
    </>
  );
}
