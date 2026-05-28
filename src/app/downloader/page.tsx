'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Download, Globe, Play, Sparkles, Clock, List, RefreshCw } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MediaInfo {
  success: boolean;
  title: string;
  duration: number | null;
  thumbnail: string | null;
  platform: string;
  formats: Array<{
    formatId: string;
    ext: string;
    resolution: string;
    filesize: number | null;
    hasVideo: boolean;
    hasAudio: boolean;
    note: string;
  }>;
  subtitles: Array<{
    lang: string;
    name: string;
    ext: string;
  }>;
  playlist: Array<{
    title: string;
    url: string;
    duration: number | null;
  }> | null;
  isPlaylist: boolean;
  url: string;
}

export default function DownloaderPage() {
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  
  // Settings
  const [option, setOption] = useState<'video' | 'audio' | 'video-only' | 'subtitle' | 'thumbnail'>('video');
  const [quality, setQuality] = useState<'normal' | 'hd'>('hd');
  const [subtitleLang, setSubtitleLang] = useState('');
  
  // Tracking
  const [taskToken, setTaskToken] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('0 KB/s');
  const [downloadEta, setDownloadEta] = useState('Unknown');
  const [taskStatus, setTaskStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | ''>('');
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  
  const [error, setError] = useState<string>('');

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return 'Unknown';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFetchInfo = async () => {
    if (!urlInput.trim()) {
      setError('Please paste a valid media URL link.');
      return;
    }

    setIsFetchingInfo(true);
    setError('');
    setMediaInfo(null);
    setTaskToken('');
    setTaskStatus('');
    setDownloadToken(null);

    try {
      const response = await fetch(`${API_URL}/api/downloader/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not parse media details.');
      }

      setMediaInfo(data);
      
      // Auto select default subtitle language if available
      if (data.subtitles && data.subtitles.length > 0) {
        setSubtitleLang(data.subtitles[0].lang);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video details.');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleDownloadLaunch = async (customUrl?: string) => {
    setError('');
    setTaskToken('');
    setDownloadToken(null);
    setTaskStatus('pending');

    const downloadUrl = customUrl || (mediaInfo ? mediaInfo.url : urlInput);

    try {
      const response = await fetch(`${API_URL}/api/downloader/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: downloadUrl,
          option,
          quality,
          subtitleLang: option === 'subtitle' ? subtitleLang : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to launch download.');
      }

      setTaskToken(data.token);
    } catch (err: any) {
      setError(err.message || 'Download launch failed.');
      setTaskStatus('failed');
    }
  };

  // Poll for download status
  useEffect(() => {
    if (!taskToken) return;

    let timer: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/downloader/status/${taskToken}`);
        const data = await response.json();

        setTaskStatus(data.status);
        setDownloadProgress(data.progress);
        setDownloadSpeed(data.speed);
        setDownloadEta(data.eta);

        if (data.status === 'completed') {
          setDownloadToken(data.downloadToken);
          setTaskToken(''); // Stop polling
        } else if (data.status === 'failed') {
          setError(data.error || 'Downloader processing failed.');
          setTaskToken(''); // Stop polling
        } else {
          // Continue polling
          timer = setTimeout(checkStatus, 500);
        }
      } catch (err) {
        console.error(err);
        setTaskToken('');
      }
    };

    timer = setTimeout(checkStatus, 500);

    return () => clearTimeout(timer);
  }, [taskToken]);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Downloader</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Globe className="text-orange-500 w-7 h-7" />
        Universal Video Downloader
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Download videos and audio from YouTube, TikTok, Instagram, Facebook, X/Twitter, and more. Auto-detect platform, get up to 4K streams with no watermarks.
      </p>

      {/* Input Field Form */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
          Paste video or playlist link
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleFetchInfo}
            disabled={isFetchingInfo || !!taskToken}
            className="sm:w-36 flex items-center justify-center gap-1.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl shadow transition-colors"
          >
            {isFetchingInfo ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Fetch Details
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg text-xs border border-red-150/40">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Details Box & Configuration */}
      {mediaInfo && !taskStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-in fade-in duration-200">
          {/* Thumbnail / Info Card */}
          <div className="md:col-span-1 bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
            {mediaInfo.thumbnail ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100 dark:border-gray-850 mb-3 bg-black">
                <img src={mediaInfo.thumbnail} alt={mediaInfo.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-3">
                <Play className="text-gray-400" size={32} />
              </div>
            )}
            
            <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 max-w-full">
              {mediaInfo.title}
            </h3>
            
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-400 border border-orange-200/50">
                {mediaInfo.platform}
              </span>
              {mediaInfo.duration && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <Clock size={10} />
                  {formatDuration(mediaInfo.duration)}
                </span>
              )}
            </div>
          </div>

          {/* Form options Selector */}
          <div className="md:col-span-2 bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">
              Configure Download Options
            </h3>

            {/* Option type */}
            <div>
              <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Download Format</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'video' as const, label: 'Video + Audio' },
                  { id: 'audio' as const, label: 'Audio Only (MP3)' },
                  { id: 'video-only' as const, label: 'Video Only' },
                  { id: 'subtitle' as const, label: 'Subtitles / Captions' },
                  { id: 'thumbnail' as const, label: 'Thumbnail Cover' }
                ].slice(0, mediaInfo.isPlaylist ? 2 : 5).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setOption(opt.id)}
                    className={`py-2 px-1 text-[11px] font-semibold rounded-lg border transition-colors text-center ${
                      option === opt.id
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality level */}
            {option === 'video' && (
              <div>
                <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quality Selector</span>
                <div className="flex gap-2">
                  {[
                    { id: 'normal' as const, label: 'Normal Quality (Up to 720p)' },
                    { id: 'hd' as const, label: 'HD Quality (1080p / 4K if available)' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setQuality(q.id)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors text-center ${
                        quality === q.id
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitle Selector */}
            {option === 'subtitle' && (
              <div>
                <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</span>
                {mediaInfo.subtitles && mediaInfo.subtitles.length > 0 ? (
                  <select
                    value={subtitleLang}
                    onChange={(e) => setSubtitleLang(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded px-2.5 py-1.5 focus:outline-none"
                  >
                    {mediaInfo.subtitles.map((sub) => (
                      <option key={sub.lang} value={sub.lang}>{sub.name} (.{sub.ext})</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 border border-amber-100 rounded">No captions were detected for this video. You can try to fetch auto-generated tracks if the platform supports it.</p>
                )}
              </div>
            )}

            {/* Trigger download button */}
            <button
              onClick={() => handleDownloadLaunch()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
            >
              <Download size={18} />
              Start Processing Download
            </button>
          </div>
        </div>
      )}

      {/* Playlist List Display */}
      {mediaInfo && mediaInfo.isPlaylist && mediaInfo.playlist && !taskStatus && (
        <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-1.5 mb-3">
            <List size={16} />
            Playlist Videos ({mediaInfo.playlist.length})
          </h3>
          <div className="divide-y divide-gray-150 dark:divide-gray-850 max-h-60 overflow-y-auto pr-1">
            {mediaInfo.playlist.map((video, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{video.title}</p>
                  {video.duration && <p className="text-[10px] text-gray-400 mt-0.5">{formatDuration(video.duration)}</p>}
                </div>
                <button
                  onClick={() => handleDownloadLaunch(video.url)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-500 dark:hover:bg-orange-500 text-orange-600 hover:text-white rounded border border-orange-100 dark:border-orange-900 text-[10px] font-bold transition-all"
                >
                  <Download size={10} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress polling viewer */}
      {taskStatus && (taskStatus === 'pending' || taskStatus === 'processing') && (
        <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 animate-in fade-in duration-200">
          <ProgressBar 
            progress={downloadProgress} 
            label={downloadProgress >= 98 ? "Merging and finalizing media files..." : "Downloading media files..."} 
          />
          
          <div className="grid grid-cols-2 gap-4 text-center mt-4 border-t border-gray-100 dark:border-gray-850 pt-4">
            <div>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Speed</span>
              <p className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">{downloadSpeed}</p>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Time Remaining</span>
              <p className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">{downloadEta}</p>
            </div>
          </div>
        </div>
      )}

      {/* Complete Download button result */}
      {downloadToken && (
        <div className="bg-green-50/50 dark:bg-green-950/15 p-6 rounded-2xl border border-green-200/50 dark:border-green-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500 shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Download Processing Complete!</h3>
              <p className="text-xs text-gray-400">File is processed and ready to save to your local drive.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                setDownloadToken(null);
                setTaskStatus('');
              }}
              className="px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-semibold"
            >
              Convert Another
            </button>
            <a
              href={`${API_URL}/api/download/${downloadToken}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow transition-colors text-center"
            >
              <Download size={16} />
              Save File
            </a>
          </div>
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
    </>
  );
}
