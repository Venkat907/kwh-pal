import { ArrowLeft, Lightbulb, TrendingDown, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { getUsageStatus, energySavingTips } from '@/lib/electricity-data';
import { cn } from '@/lib/utils';

export const GuidanceScreen = () => {
  const {
    todayUsage,
    recommendedDailyUsage,
    currentCycleUsage,
    remainingDays,
    settings,
  } = useApp();

  const usageStatus = getUsageStatus(todayUsage, recommendedDailyUsage);
  const usagePercentage = (todayUsage / recommendedDailyUsage) * 100;
  const remainingAllowance = settings.monthlyLimit - currentCycleUsage;

  const getGuidanceMessage = () => {
    if (usageStatus === 'safe') {
      return {
        icon: '✅',
        title: 'Great job!',
        message: `You can use up to ${recommendedDailyUsage.toFixed(1)} kWh today to stay within your limit.`,
        color: 'text-energy-safe',
      };
    } else if (usageStatus === 'warning') {
      return {
        icon: '⚠️',
        title: 'Approaching limit',
        message: `You've used ${usagePercentage.toFixed(0)}% of your daily allowance. Consider reducing usage.`,
        color: 'text-energy-warning',
      };
    } else {
      return {
        icon: '🚨',
        title: 'Over daily limit',
        message: 'Reduce usage immediately to avoid exceeding your monthly target.',
        color: 'text-energy-danger',
      };
    }
  };

  const guidance = getGuidanceMessage();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Daily Guidance</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Today's Guidance Card */}
        <Card className="shadow-energy animate-slide-up">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <span className="text-5xl">{guidance.icon}</span>
              <h2 className={cn('text-xl font-bold mt-3', guidance.color)}>
                {guidance.title}
              </h2>
              <p className="text-muted-foreground mt-2">{guidance.message}</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Today's Usage</span>
                  <span className="font-medium">
                    {todayUsage.toFixed(1)} / {recommendedDailyUsage.toFixed(1)} kWh
                  </span>
                </div>
                <Progress
                  value={Math.min(usagePercentage, 100)}
                  className="h-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {remainingAllowance.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  kWh remaining this cycle
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingDown className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{remainingDays}</p>
                <p className="text-xs text-muted-foreground">days remaining</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Actions */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {usageStatus === 'safe' ? (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <span className="text-xl">👍</span>
                  <p className="text-sm">
                    Keep up the good work! You're on track to meet your monthly
                    goal.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <span className="text-xl">📊</span>
                  <p className="text-sm">
                    Check the prediction screen to see your estimated monthly
                    bill.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-energy-warning/10">
                  <span className="text-xl">💡</span>
                  <p className="text-sm">
                    Turn off lights and unplug unused appliances immediately.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-energy-warning/10">
                  <span className="text-xl">🌡️</span>
                  <p className="text-sm">
                    Increase AC temperature by 2°C to reduce consumption.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-energy-warning/10">
                  <span className="text-xl">⏰</span>
                  <p className="text-sm">
                    Delay using high-power appliances until tomorrow.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Energy Saving Tips */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Energy Saving Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {energySavingTips.slice(0, 4).map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted"
              >
                <span className="text-xl">{tip.icon}</span>
                <p className="text-sm text-muted-foreground">{tip.tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};
