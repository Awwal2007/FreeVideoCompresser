'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, X, FileVideo, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
  label?: string;
  showPreview?: boolean;
}

/**
 * FileUploader Component
 * Drag-and-drop + click-to-upload file input zone.
 * Shows file preview, validation, and animated drag states.
 */
export default function FileUploader({
  onFileSelect,
  acceptedFormats = '.mp4,.mov,.avi,.mkv,.webm,.m4v',
  maxSizeMB = 500,
  label = 'Drop your video here or click to browse',
  showPreview = true
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): boolean => {
    setError('');

    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    const allowedTypes = [
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'video/x-matroska', 'video/webm', 'video/x-m4v', 'audio/mpeg'
    ];
    const allowedExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.mpeg', '.mpg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setError('Invalid file type. Accepted: MP4, MOV, AVI, MKV, WEBM, M4V');
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setError('');
      onFileSelect(file);
    } else {
      setSelectedFile(null);
    }
  }, [onFileSelect, maxSizeBytes, maxSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed 
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center gap-3
          px-6 py-10
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
            : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleInputChange}
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <div className={`
              p-4 rounded-full transition-all duration-300
              ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
            `}>
              <Upload size={32} className={isDragging ? 'animate-bounce' : ''} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop your file here' : label}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Accepted: MP4, MOV, AVI, MKV, WEBM &middot; Max {maxSizeMB}MB
              </p>
            </div>
          </>
        ) : showPreview ? (
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="p-3 bg-green-100 rounded-lg shrink-0">
              <FileVideo size={28} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-2 hover:bg-red-50 rounded-full transition-colors shrink-0"
              title="Remove file"
            >
              <X size={18} className="text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ) : null}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-400 text-center">
        Files are automatically deleted after 1 hour for your privacy.
      </p>
    </div>
  );
}
