import { ArrowLeft, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { getBillCategory, getWeeklySummary } from '@/lib/electricity-data';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const PredictionScreen = () => {
  const { predictedMonthlyUsage, currentCycleUsage, settings, usageHistory } =
    useApp();

  const billCategory = getBillCategory(predictedMonthlyUsage, settings.monthlyLimit);
  const estimatedCost = predictedMonthlyUsage * 0.12; // $0.12 per kWh
  const weeklyData = getWeeklySummary(usageHistory);

  // Generate comparison data
  const comparisonData = [
    {
      name: 'Last Month',
      usage: 285,
      fill: 'hsl(var(--muted-foreground))',
    },
    {
      name: 'Current',
      usage: currentCycleUsage,
      fill: 'hsl(var(--primary))',
    },
    {
      name: 'Predicted',
      usage: predictedMonthlyUsage,
      fill: 'hsl(var(--secondary))',
    },
    {
      name: 'Limit',
      usage: settings.monthlyLimit,
      fill: 'hsl(var(--energy-warning))',
    },
  ];

  // Daily trend data (last 14 days)
  const trendData = usageHistory.slice(-14).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    usage: d.usage,
  }));

  const billCategoryConfig = {
    low: {
      label: 'Low',
      color: 'text-energy-safe',
      bg: 'bg-energy-safe/10',
      description: 'Excellent! Your usage is well within limits.',
    },
    medium: {
      label: 'Medium',
      color: 'text-energy-warning',
      bg: 'bg-energy-warning/10',
      description: 'Good. Consider small reductions to save more.',
    },
    high: {
      label: 'High',
      color: 'text-energy-danger',
      bg: 'bg-energy-danger/10',
      description: 'Warning! Take action to reduce consumption.',
    },
  };

  const config = billCategoryConfig[billCategory];

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
          <h1 className="text-xl font-bold">Monthly Prediction</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Prediction Summary */}
        <Card className="shadow-energy animate-slide-up">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Predicted Usage</span>
              </div>

              <p className="text-5xl font-bold text-foreground">
                {predictedMonthlyUsage.toFixed(0)}
              </p>
              <p className="text-muted-foreground mt-1">kWh this month</p>

              <div
                className={cn(
                  'mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full',
                  config.bg
                )}
              >
                <span className={cn('font-semibold', config.color)}>
                  {config.label} Bill
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {config.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Cost */}
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-energy">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Estimated Bill</p>
              <p className="text-2xl font-bold">${estimatedCost.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="font-medium">$0.12/kWh</p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Comparison Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Usage Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 'auto']} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(0)} kWh`, 'Usage']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="usage" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              14-Day Usage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Usage']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((week, index) => (
                <div
                  key={week.week}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <span className="font-medium">{week.week}</span>
                  <span className="text-muted-foreground">
                    {week.usage.toFixed(1)} kWh
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};
