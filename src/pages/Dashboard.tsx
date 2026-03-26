import { Bell, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/BottomNav';
import { UsageProgressRing } from '@/components/UsageProgressRing';
import { StatusBadge } from '@/components/StatusBadge';
import { AlertCard } from '@/components/AlertCard';
import { LogUsageDialog } from '@/components/LogUsageDialog';
import { EnergySavingTips } from '@/components/EnergySavingTips';
import { EnergyBadges } from '@/components/EnergyBadges';
import { MonthComparison } from '@/components/MonthComparison';
import { useApp } from '@/contexts/AppContext';
import { getUsageStatus } from '@/lib/electricity-data';

export const Dashboard = () => {
  const {
    user,
    todayUsage,
    recommendedDailyUsage,
    currentCycleUsage,
    remainingDays,
    daysElapsed,
    settings,
    alerts,
    markAlertAsRead,
  } = useApp();

  const usageStatus = getUsageStatus(todayUsage, recommendedDailyUsage);
  const monthlyProgress = (currentCycleUsage / settings.monthlyLimit) * 100;
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-energy p-4 pb-24 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-sm">Good morning,</p>
            <h1 className="text-xl font-bold text-primary-foreground">
              {user?.name || 'User'}
            </h1>
          </div>
          <Link
            to="/settings"
            className="relative p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
          >
            <Bell className="w-6 h-6 text-primary-foreground" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-energy-danger text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 -mt-20 space-y-4">
        {/* Log Usage Action */}
        <div className="flex justify-end">
          <LogUsageDialog />
        </div>

        {/* Today's Usage Card */}
        <Card className="shadow-energy animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <UsageProgressRing
                value={todayUsage}
                max={recommendedDailyUsage}
                status={usageStatus}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {todayUsage.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">kWh today</p>
                </div>
              </UsageProgressRing>

              <div className="mt-4 flex items-center gap-2">
                <StatusBadge status={usageStatus} />
              </div>

              <div className="mt-4 w-full grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-foreground">
                    {recommendedDailyUsage.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended kWh
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.max(0, recommendedDailyUsage - todayUsage).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Remaining kWh</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Monthly Progress</span>
              <span className="text-sm font-normal text-muted-foreground">
                {remainingDays} days left
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {currentCycleUsage.toFixed(0)} kWh used
                </span>
                <span className="font-medium">
                  {settings.monthlyLimit} kWh limit
                </span>
              </div>
              <Progress value={Math.min(monthlyProgress, 100)} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Day {daysElapsed} of billing cycle
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <Link to="/guidance">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Daily Guidance</p>
                  <p className="text-xs text-muted-foreground">View tips</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/prediction">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Predictions</p>
                  <p className="text-xs text-muted-foreground">View forecast</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Energy Saving Tips */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <EnergySavingTips />
        </div>

        {/* Energy Badges */}
        <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <EnergyBadges />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-semibold text-foreground">Recent Alerts</h3>
            {alerts.slice(0, 2).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={markAlertAsRead}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
