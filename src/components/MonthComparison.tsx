import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { DailyUsage } from '@/lib/electricity-data';

const getMonthRange = (offset: number, billingCycleStart: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, billingCycleStart);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, billingCycleStart);
  // Adjust if current day is before billing start
  if (now.getDate() < billingCycleStart) {
    start.setMonth(start.getMonth() - 1);
    end.setMonth(end.getMonth() - 1);
  }
  return { start, end };
};

const sumUsage = (history: DailyUsage[], start: Date, end: Date) =>
  history
    .filter((d) => {
      const date = new Date(d.date);
      return date >= start && date < end;
    })
    .reduce((sum, d) => sum + d.usage, 0);

const sumCost = (history: DailyUsage[], start: Date, end: Date) =>
  history
    .filter((d) => {
      const date = new Date(d.date);
      return date >= start && date < end;
    })
    .reduce((sum, d) => sum + d.cost, 0);

export const MonthComparison = () => {
  const { usageHistory, settings } = useApp();

  const current = getMonthRange(0, settings.billingCycleStart);
  const previous = getMonthRange(-1, settings.billingCycleStart);

  const currentUsage = sumUsage(usageHistory, current.start, current.end);
  const previousUsage = sumUsage(usageHistory, previous.start, previous.end);
  const currentCost = sumCost(usageHistory, current.start, current.end);
  const previousCost = sumCost(usageHistory, previous.start, previous.end);

  const usageDiff = previousUsage > 0 ? ((currentUsage - previousUsage) / previousUsage) * 100 : 0;
  const costDiff = previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0;

  const TrendIcon = usageDiff > 2 ? TrendingUp : usageDiff < -2 ? TrendingDown : Minus;
  const trendColor = usageDiff > 2 ? 'text-destructive' : usageDiff < -2 ? 'text-energy-safe' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Month vs Previous</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Current Month */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="text-xl font-bold text-foreground">{currentUsage.toFixed(0)} <span className="text-xs font-normal">kWh</span></p>
            <p className="text-sm text-muted-foreground">${currentCost.toFixed(2)}</p>
          </div>
          {/* Previous Month */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Last Month</p>
            <p className="text-xl font-bold text-foreground">{previousUsage.toFixed(0)} <span className="text-xs font-normal">kWh</span></p>
            <p className="text-sm text-muted-foreground">${previousCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Trend indicator */}
        <div className={cn('mt-3 flex items-center gap-2 p-2 rounded-lg border', 
          usageDiff > 2 ? 'bg-destructive/5 border-destructive/10' : usageDiff < -2 ? 'bg-energy-safe/5 border-energy-safe/10' : 'bg-muted/50 border-transparent'
        )}>
          <TrendIcon className={cn('w-4 h-4', trendColor)} />
          <p className="text-xs text-foreground">
            {Math.abs(usageDiff) < 2 ? (
              'Usage is about the same as last month'
            ) : usageDiff > 0 ? (
              <><span className="font-bold text-destructive">{usageDiff.toFixed(0)}% higher</span> than last month</>
            ) : (
              <><span className="font-bold text-energy-safe">{Math.abs(usageDiff).toFixed(0)}% lower</span> than last month</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
