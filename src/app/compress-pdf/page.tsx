'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Download, Sliders, FileText, Sparkles, Layers, Lock, Unlock } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import ProgressBar from '@/components/ProgressBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UploadedFile {
  name: string;
  size: string;
  token: string;
  status: 'uploading' | 'uploaded' | 'failed';
  progress: number;
}

export default function CompressPdfPage() {
  const [activeTab, setActiveTab] = useState<'compress' | 'merge'>('compress');
  
  // File lists
  const [singleFile, setSingleFile] = useState<UploadedFile | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<UploadedFile[]>([]);
  
  // Form options
  const [level, setLevel] = useState<'low' | 'medium' | 'high' | 'maximum'>('medium');
  const [singlePassword, setSinglePassword] = useState('');
  const [pdfPasswords, setPdfPasswords] = useState<Record<string, string>>({});
  
  // Encryption checks
  const [singleEncrypted, setSingleEncrypted] = useState(false);
  const [encryptedFilesMap, setEncryptedFilesMap] = useState<Record<string, boolean>>({});

  // Execution states
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    downloadToken: string;
    originalSize?: string;
    compressedSize?: string;
    mergedSize?: string;
    ratio?: number;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if PDF is encrypted
  const checkEncryption = async (token: string, isSingle: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/image-pdf/pdf-check-encryption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      
      if (isSingle) {
        setSingleEncrypted(data.isEncrypted);
      } else {
        setEncryptedFilesMap(prev => ({ ...prev, [token]: data.isEncrypted }));
      }
    } catch (err) {
      console.error('[PDF Encryption Check] error:', err);
    }
  };

  // Upload single file for Compress
  const handleSingleSelect = useCallback(async (selectedFile: File) => {
    setError('');
    setResult(null);
    setSingleEncrypted(false);
    setSinglePassword('');
    
    setSingleFile({
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      token: '',
      status: 'uploading',
      progress: 0
    });

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setSingleFile(prev => prev ? { ...prev, progress: percent } : null);
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
      setSingleFile(prev => prev ? { ...prev, token, status: 'uploaded' } : null);
      checkEncryption(token, true);
    } catch (err: any) {
      setSingleFile(prev => prev ? { ...prev, status: 'failed' } : null);
      setError('Failed to upload PDF.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Upload multiple files for Merge
  const handleMultipleSelect = useCallback(async (selectedFiles: File[]) => {
    setError('');
    setResult(null);
    
    const initialFiles = selectedFiles.map(f => ({
      name: f.name,
      size: formatFileSize(f.size),
      token: '',
      status: 'uploading' as const,
      progress: 0
    }));
    setMultipleFiles(initialFiles);

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
              setMultipleFiles(prev => {
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
        setMultipleFiles(prev => {
          const updated = [...prev];
          if (updated[i]) {
            updated[i].token = token;
            updated[i].status = 'uploaded';
          }
          return updated;
        });
        
        checkEncryption(token, false);
      } catch (err: any) {
        setMultipleFiles(prev => {
          const updated = [...prev];
          if (updated[i]) updated[i].status = 'failed';
          return updated;
        });
        setError(`Failed to upload: ${file.name}`);
      }
    }
  }, []);

  const handleCompress = async () => {
    if (!singleFile || singleFile.status !== 'uploaded') {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/image-pdf/compress-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: singleFile.token,
          level,
          password: singlePassword || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PDF compression failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'PDF compression failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMerge = async () => {
    const readyTokens = multipleFiles.filter(f => f.status === 'uploaded').map(f => f.token);
    
    if (readyTokens.length < 2) {
      setError('Please upload at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    // Map token passwords to their uploads
    const passwordsPayload: Record<string, string> = {};
    Object.keys(pdfPasswords).forEach(token => {
      if (pdfPasswords[token]) {
        passwordsPayload[token] = pdfPasswords[token];
      }
    });

    try {
      const response = await fetch(`${API_URL}/api/image-pdf/merge-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: readyTokens,
          passwords: passwordsPayload
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PDF merging failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'PDF merging failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordChange = (token: string, val: string) => {
    setPdfPasswords(prev => ({ ...prev, [token]: val }));
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">PDF Tools</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <FileText className="text-red-500 w-7 h-7" />
        Free Online PDF Tools
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Compress PDF file sizes using advanced image optimization, or merge multiple documents together securely.
      </p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => {
            setActiveTab('compress');
            setMultipleFiles([]);
            setResult(null);
            setError('');
          }}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-all ${
            activeTab === 'compress'
              ? 'border-red-500 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Compress PDF
        </button>
        <button
          onClick={() => {
            setActiveTab('merge');
            setSingleFile(null);
            setResult(null);
            setError('');
          }}
          className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-all ${
            activeTab === 'merge'
              ? 'border-red-500 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Merge PDFs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Side: Uploader & settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Upload PDF</h2>
            {activeTab === 'compress' ? (
              <FileUploader
                fileType="pdf"
                onFileSelect={handleSingleSelect}
              />
            ) : (
              <FileUploader
                fileType="pdf"
                multiple={true}
                onFilesSelect={handleMultipleSelect}
              />
            )}
          </div>

          {/* Compress settings */}
          {activeTab === 'compress' && singleFile && !result && (
            <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-850">
                <Sliders size={16} />
                Compression Level
              </h2>

              <div className="space-y-2">
                {[
                  { value: 'low' as const, label: 'Low', desc: 'Slight compression, high DPI images' },
                  { value: 'medium' as const, label: 'Medium (Recommended)', desc: 'Balanced quality and size' },
                  { value: 'high' as const, label: 'High', desc: 'Aggressive image scale down' },
                  { value: 'maximum' as const, label: 'Maximum', desc: 'Smallest size, lower quality images' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLevel(opt.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      level === opt.value
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-xs text-gray-900 dark:text-white">{opt.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Password box if encrypted */}
              {singleEncrypted && (
                <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-semibold text-red-500 flex items-center gap-1.5 mb-1.5">
                    <Lock size={12} />
                    This PDF is Password Protected
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Decryption Password"
                    value={singlePassword}
                    onChange={(e) => setSinglePassword(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: List and execution outputs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Compress execution block */}
          {activeTab === 'compress' && singleFile && !result && (
            <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">
                Selected PDF
              </h2>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{singleFile.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{singleFile.size}</p>
                </div>
                {singleFile.status === 'uploading' && (
                  <span className="text-xs font-semibold text-blue-500">{singleFile.progress}%</span>
                )}
                {singleFile.status === 'uploaded' && (
                  <span className="text-[10px] px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full font-medium">Uploaded</span>
                )}
              </div>

              <button
                disabled={singleFile.status !== 'uploaded' || isProcessing}
                onClick={handleCompress}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Optimizing PDF Elements...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Compress PDF
                  </>
                )}
              </button>
            </div>
          )}

          {/* Merge execution block */}
          {activeTab === 'merge' && multipleFiles.length > 0 && !result && (
            <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">
                Documents list to Merge
              </h2>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto pr-1">
                {multipleFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="py-3 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{file.size}</p>
                      </div>
                      
                      {file.status === 'uploading' && (
                        <span className="text-[10px] font-semibold text-blue-500">{file.progress}%</span>
                      )}
                      {file.status === 'uploaded' && (
                        <div className="flex items-center gap-1.5">
                          {encryptedFilesMap[file.token] ? (
                            <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full font-bold border border-red-100/50">
                              <Lock size={8} /> Encrypted
                            </span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full font-medium">Ready</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Password input for individual encrypted files */}
                    {file.status === 'uploaded' && encryptedFilesMap[file.token] && (
                      <input
                        type="password"
                        placeholder="Enter password for this PDF"
                        value={pdfPasswords[file.token] || ''}
                        onChange={(e) => handlePasswordChange(file.token, e.target.value)}
                        className="w-full text-[11px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                disabled={multipleFiles.length < 2 || multipleFiles.some(f => f.status !== 'uploaded') || isProcessing}
                onClick={handleMerge}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Merging Pages...
                  </>
                ) : (
                  <>
                    <Layers size={18} />
                    Merge {multipleFiles.length} PDFs
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Block */}
          {result && (
            <div className="bg-green-50/50 dark:bg-green-950/15 p-6 rounded-2xl border border-green-200/50 dark:border-green-900/50 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 border-b border-green-200/50 dark:border-green-900/50 pb-3">
                <CheckCircle className="text-green-500 shrink-0" size={24} />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">PDF Processing Complete!</h3>
                  <p className="text-xs text-gray-400">File is processed and ready for secure download.</p>
                </div>
              </div>

              {activeTab === 'compress' ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Original Size</span>
                    <p className="text-base font-bold text-gray-800 dark:text-white mt-1">{result.originalSize}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Optimized Size</span>
                    <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">{result.compressedSize}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Savings</span>
                    <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">-{result.ratio}%</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800 max-w-sm mx-auto">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Merged Output size</span>
                  <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{result.mergedSize}</p>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={`${API_URL}/api/download/${result.downloadToken}`}
                  download={activeTab === 'merge' ? 'merged_document.pdf' : undefined}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition-colors text-center"
                >
                  <Download size={18} />
                  Download PDF Document
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
          {!singleFile && multipleFiles.length === 0 && !result && (
            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 p-12 flex flex-col items-center justify-center text-center">
              <FileText size={48} className="text-red-200 dark:text-red-900/20 mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No PDF uploaded</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                {activeTab === 'compress' 
                  ? 'Upload a single PDF file to shrink its embedded images and compress it.' 
                  : 'Upload two or more PDF files to combine them into a single merged document.'}
              </p>
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
