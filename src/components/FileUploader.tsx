'use client';

import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { Upload, X, FileVideo, FileImage, FileText, File as FileIcon, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  fileType?: 'video' | 'image' | 'pdf' | 'subtitle' | 'any';
  multiple?: boolean;
  acceptedFormats?: string;
  maxSizeMB?: number;
  label?: string;
  showPreview?: boolean;
}

export default function FileUploader({
  onFileSelect,
  onFilesSelect,
  fileType = 'any',
  multiple = false,
  acceptedFormats,
  maxSizeMB = 500,
  label,
  showPreview = true
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const pendingCallbackRef = useRef<{ type: 'single' | 'multi'; files: File[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Set default labels and formats based on type
  const getDefaults = () => {
    switch (fileType) {
      case 'video':
        return {
          formats: acceptedFormats || '.mp4,.mov,.avi,.mkv,.webm,.m4v',
          label: label || 'Drop your video here or click to browse',
          exts: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'],
          types: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'video/x-m4v']
        };
      case 'image':
        return {
          formats: acceptedFormats || '.jpg,.jpeg,.png,.webp,.gif,.svg',
          label: label || 'Drop your image here or click to browse',
          exts: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
          types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
        };
      case 'pdf':
        return {
          formats: acceptedFormats || '.pdf',
          label: label || 'Drop your PDF here or click to browse',
          exts: ['.pdf'],
          types: ['application/pdf']
        };
      case 'subtitle':
        return {
          formats: acceptedFormats || '.srt,.vtt,.txt',
          label: label || 'Drop your subtitle file here',
          exts: ['.srt', '.vtt', '.txt'],
          types: ['text/plain', 'application/x-subrip', 'text/vtt', 'application/octet-stream']
        };
      default:
        return {
          formats: acceptedFormats || '*',
          label: label || 'Drop your file here or click to browse',
          exts: [],
          types: []
        };
    }
  };

  const defaults = getDefaults();

  const validateFile = (file: File): boolean => {
    if (file.size > maxSizeBytes) {
      setError(`File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    if (fileType !== 'any' && defaults.types.length > 0) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isTypeAllowed = defaults.types.includes(file.type);
      const isExtAllowed = defaults.exts.includes(ext);

      if (!isTypeAllowed && !isExtAllowed) {
        setError(`Invalid file type for "${file.name}". Expected formats: ${defaults.formats.toUpperCase()}`);
        return false;
      }
    }

    return true;
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError('');
    const validFiles: File[] = [];

    // Process files up to limit if multiple, or just take first
    const limit = multiple ? files.length : 1;
    
    for (let i = 0; i < limit; i++) {
      const file = files[i];
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      if (multiple) {
        setSelectedFiles(prev => {
          const updated = [...prev, ...validFiles].slice(0, 20); // Cap at 20 files
          pendingCallbackRef.current = { type: 'multi', files: updated };
          return updated;
        });
      } else {
        setSelectedFiles([validFiles[0]]);
        pendingCallbackRef.current = { type: 'single', files: [validFiles[0]] };
      }
    }
  }, [multiple, fileType, maxSizeMB]);

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
      handleFiles(Array.from(files));
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  }, [handleFiles]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      pendingCallbackRef.current = multiple
        ? { type: 'multi', files: updated }
        : { type: 'single', files: [] };
      return updated;
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [multiple]);

  // Deferred callback: fires parent callbacks after state commits
  useEffect(() => {
    const pending = pendingCallbackRef.current;
    if (!pending) return;
    pendingCallbackRef.current = null;

    if (pending.type === 'multi' && onFilesSelect) {
      onFilesSelect(pending.files);
    } else if (pending.type === 'single' && onFileSelect && pending.files.length > 0) {
      onFileSelect(pending.files[0]);
    }
  }, [selectedFiles, onFileSelect, onFilesSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('video/')) return <FileVideo size={24} className="text-blue-500" />;
    if (type.startsWith('image/')) return <FileImage size={24} className="text-purple-500" />;
    if (type === 'application/pdf') return <FileText size={24} className="text-red-500" />;
    return <FileIcon size={24} className="text-gray-500" />;
  };

  const getGeneralIcon = () => {
    if (fileType === 'video') return <FileVideo size={32} />;
    if (fileType === 'image') return <FileImage size={32} />;
    if (fileType === 'pdf') return <FileText size={32} />;
    return <Upload size={32} />;
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
          px-6 py-8
          ${isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01] shadow-lg'
            : selectedFiles.length > 0
              ? 'border-green-400 bg-green-50/20 dark:bg-green-950/10'
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/30'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={defaults.formats}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFiles.length === 0 ? (
          <>
            <div className={`
              p-4 rounded-full transition-all duration-300
              ${isDragging ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}
            `}>
              <span className={isDragging ? 'animate-bounce block' : 'block'}>
                {getGeneralIcon()}
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragging ? 'Drop files here' : defaults.label}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Accepted: {defaults.formats.toUpperCase().replace(/\./g, '')} &middot; Max {maxSizeMB}MB {multiple && '(Up to 20 files)'}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mx-auto w-fit mb-2">
              {multiple ? <FileIcon size={24} /> : getFileIcon(selectedFiles[0])}
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {multiple ? `${selectedFiles.length} file(s) selected` : selectedFiles[0].name}
            </p>
            {!multiple && (
              <p className="text-xs text-gray-400 mt-0.5">
                {formatFileSize(selectedFiles[0].size)}
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFiles([]);
                if (onFileSelect) onFileSelect(null as any);
                if (onFilesSelect) onFilesSelect([]);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* File List for Multiple Uploads */}
      {showPreview && multiple && selectedFiles.length > 0 && (
        <div className="mt-4 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(file)}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Remove file"
              >
                <X size={14} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
