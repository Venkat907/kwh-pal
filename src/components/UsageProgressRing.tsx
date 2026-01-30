import { cn } from '@/lib/utils';

interface UsageProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  status: 'safe' | 'warning' | 'danger';
  children?: React.ReactNode;
}

export const UsageProgressRing = ({
  value,
  max,
  size = 180,
  strokeWidth = 12,
  status,
  children,
}: UsageProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const statusColors = {
    safe: 'stroke-energy-safe',
    warning: 'stroke-energy-warning',
    danger: 'stroke-energy-danger',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted opacity-30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-500', statusColors[status])}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
