import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { UsageAlert } from '@/lib/electricity-data';

interface AlertCardProps {
  alert: UsageAlert;
  onDismiss?: (id: string) => void;
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    className: 'bg-energy-warning/10 border-energy-warning/30',
    iconClass: 'text-energy-warning',
  },
  danger: {
    icon: AlertCircle,
    className: 'bg-energy-danger/10 border-energy-danger/30',
    iconClass: 'text-energy-danger',
  },
  info: {
    icon: Info,
    className: 'bg-energy-info/10 border-energy-info/30',
    iconClass: 'text-energy-info',
  },
};

export const AlertCard = ({ alert, onDismiss }: AlertCardProps) => {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border animate-slide-up',
        config.className,
        alert.read && 'opacity-60'
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconClass)} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{alert.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1 rounded-full hover:bg-background/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};
