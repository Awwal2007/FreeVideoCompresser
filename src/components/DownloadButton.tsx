import { Download, CheckCircle } from 'lucide-react';

interface DownloadButtonProps {
  href: string;
  filename?: string;
  size?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * DownloadButton Component
 * Large green download button with icon and file details.
 * Used to present processed file download links.
 */
export default function DownloadButton({
  href,
  filename = 'download',
  size,
  className = '',
  onClick
}: DownloadButtonProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-green-600 mb-1">
        <CheckCircle size={20} />
        <span className="text-sm font-medium">Processing complete!</span>
      </div>
      
      <a
        href={href}
        download={filename}
        onClick={onClick}
        className="
          inline-flex items-center gap-3
          px-8 py-4
          bg-green-600 hover:bg-green-700
          text-white font-semibold text-base
          rounded-xl
          shadow-lg hover:shadow-xl
          transform hover:-translate-y-0.5
          transition-all duration-200
          min-w-[240px] justify-center
        "
      >
        <Download size={22} />
        <span>Download File</span>
      </a>
      
      {size && (
        <p className="text-xs text-gray-500">
          File size: {size}
        </p>
      )}
      
      <p className="text-xs text-gray-400 max-w-sm text-center">
        Your file will be automatically deleted from our servers in 1 hour.
      </p>
    </div>
  );
}
