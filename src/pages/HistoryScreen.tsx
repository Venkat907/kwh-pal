import { ArrowLeft, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNav } from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { getWeeklySummary } from '@/lib/electricity-data';
import { cn } from '@/lib/utils';

export const HistoryScreen = () => {
  const { usageHistory } = useApp();
  const [selectedTab, setSelectedTab] = useState('daily');

  const weeklyData = getWeeklySummary(usageHistory);
  const totalMonthlyUsage = usageHistory.reduce((sum, d) => sum + d.usage, 0);
  const avgDailyUsage = totalMonthlyUsage / usageHistory.length;

  // Calculate trend (compare last 7 days vs previous 7 days)
  const recent7Days = usageHistory.slice(-7).reduce((sum, d) => sum + d.usage, 0);
  const previous7Days = usageHistory.slice(-14, -7).reduce((sum, d) => sum + d.usage, 0);
  const trend = ((recent7Days - previous7Days) / previous7Days) * 100;
  const isPositiveTrend = trend < 0; // Lower usage is positive

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
          <h1 className="text-xl font-bold">Usage History</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="animate-slide-up">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total (30 days)</p>
              <p className="text-2xl font-bold mt-1">
                {totalMonthlyUsage.toFixed(0)} kWh
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-2xl font-bold mt-1">
                {avgDailyUsage.toFixed(1)} kWh
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trend Card */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div
              className={cn(
                'p-3 rounded-xl',
                isPositiveTrend ? 'bg-energy-safe/10' : 'bg-energy-danger/10'
              )}
            >
              {isPositiveTrend ? (
                <TrendingDown className="w-6 h-6 text-energy-safe" />
              ) : (
                <TrendingUp className="w-6 h-6 text-energy-danger" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weekly Trend</p>
              <p
                className={cn(
                  'text-lg font-bold',
                  isPositiveTrend ? 'text-energy-safe' : 'text-energy-danger'
                )}
              >
                {isPositiveTrend ? '↓' : '↑'} {Math.abs(trend).toFixed(1)}%
              </p>
            </div>
            <p className="ml-auto text-sm text-muted-foreground">
              vs last week
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Daily Usage Log
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {[...usageHistory].reverse().map((day, index) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{day.cost.toFixed(2)} estimated
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{day.usage.toFixed(1)} kWh</p>
                        <p
                          className={cn(
                            'text-xs',
                            day.usage > avgDailyUsage
                              ? 'text-energy-danger'
                              : 'text-energy-safe'
                          )}
                        >
                          {day.usage > avgDailyUsage ? 'Above' : 'Below'} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyData.map((week, index) => (
                    <div
                      key={week.week}
                      className="p-4 rounded-lg bg-muted animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{week.week}</span>
                        <span className="text-xl font-bold">
                          {week.usage.toFixed(1)} kWh
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-energy transition-all duration-500"
                          style={{
                            width: `${(week.usage / 80) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Monthly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-muted-foreground">Current Month</p>
                    <p className="text-4xl font-bold mt-2">
                      {totalMonthlyUsage.toFixed(0)} kWh
                    </p>
                    <p className="text-muted-foreground mt-1">
                      ₹{usageHistory.reduce((s, d) => s + d.cost, 0).toFixed(2)} estimated
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-sm text-muted-foreground">
                        Previous Month
                      </p>
                      <p className="text-2xl font-bold mt-1">285 kWh</p>
                      <p className="text-xs text-muted-foreground">₹2,394.00</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-sm text-muted-foreground">
                        2 Months Ago
                      </p>
                      <p className="text-2xl font-bold mt-1">310 kWh</p>
                      <p className="text-xs text-muted-foreground">$37.20</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};
