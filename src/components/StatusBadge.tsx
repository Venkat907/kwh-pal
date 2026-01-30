import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'safe' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  safe: {
    label: 'Safe',
    icon: CheckCircle,
    className: 'bg-energy-safe/10 text-energy-safe border-energy-safe/20',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    className: 'bg-energy-warning/10 text-energy-warning border-energy-warning/20',
  },
  danger: {
    label: 'Over Limit',
    icon: XCircle,
    className: 'bg-energy-danger/10 text-energy-danger border-energy-danger/20',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.className,
        sizeConfig[size]
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
};
