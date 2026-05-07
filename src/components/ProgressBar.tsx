/**
 * ProgressBar Component
 * Animated progress indicator with percentage label.
 * Used for upload and processing states.
 */
export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = ''
}: {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-blue-600">
              {clampedProgress.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="w-full h-full animate-pulse opacity-30 bg-white" />
        </div>
      </div>
    </div>
  );
}
