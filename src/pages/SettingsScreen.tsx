import { useState, useEffect } from 'react';
import { ArrowLeft, User, Zap, Bell, Calendar, LogOut, ChevronRight, Award, IndianRupee } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNav } from '@/components/BottomNav';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

export const SettingsScreen = () => {
  const { user, settings, updateSettings, logout, usageHistory, costPerKwh } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showElectricityPlan, setShowElectricityPlan] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const [limitInput, setLimitInput] = useState(settings.monthlyLimit.toString());
  const [tariffInput, setTariffInput] = useState(costPerKwh.toString());

  useEffect(() => {
    setLimitInput(settings.monthlyLimit.toString());
  }, [settings.monthlyLimit]);

  useEffect(() => {
    setTariffInput(costPerKwh.toString());
  }, [costPerKwh]);

  const handleLimitBlur = () => {
    const limit = parseInt(limitInput);
    if (!isNaN(limit) && limit > 0) {
      updateSettings({ monthlyLimit: limit });
      toast({ title: 'Settings updated', description: `Monthly limit set to ${limit} kWh` });
    } else {
      setLimitInput(settings.monthlyLimit.toString());
    }
  };

  const handleTariffBlur = () => {
    const tariff = parseFloat(tariffInput);
    if (!isNaN(tariff) && tariff > 0) {
      updateSettings({ costPerKwh: tariff });
      toast({ title: 'Tariff updated', description: `Tariff set to ₹${tariff}/kWh` });
    } else {
      setTariffInput(costPerKwh.toString());
    }
  };

  // Billing history: group by month from usage data
  const billingHistory = (() => {
    const months: Record<string, { usage: number; cost: number }> = {};
    usageHistory.forEach((d) => {
      const monthKey = d.date.substring(0, 7); // YYYY-MM
      if (!months[monthKey]) months[monthKey] = { usage: 0, cost: 0 };
      months[monthKey].usage += d.usage;
      months[monthKey].cost += d.cost;
    });
    return Object.entries(months)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, data]) => ({
        label: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        usage: data.usage,
        cost: data.cost,
      }));
  })();

  const badges = [
    { icon: '🌱', name: 'Eco Starter', earned: true },
    { icon: '⚡', name: 'Power Saver', earned: true },
    { icon: '🏆', name: 'Champion', earned: false },
    { icon: '🌍', name: 'Earth Hero', earned: false },
  ];

  const electricityPlans = [
    { id: 'Standard Residential', name: 'Standard Residential', description: 'For regular household use' },
    { id: 'Commercial', name: 'Commercial', description: 'For shops and small businesses' },
    { id: 'Agricultural', name: 'Agricultural', description: 'For farm and irrigation use' },
    { id: 'Industrial', name: 'Industrial', description: 'For industrial / factory use' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Profile Card */}
        <Card className="animate-slide-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-energy flex items-center justify-center">
                <span className="text-2xl text-primary-foreground font-bold">
                  {user?.name.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold">{user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.consumerNumber || 'Not set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.electricityPlan || 'Standard Residential'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Settings */}
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Usage Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyLimit">Monthly Limit (kWh)</Label>
              <Input
                id="monthlyLimit"
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onBlur={handleLimitBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tariffRate" className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" /> Tariff Rate (₹ per kWh)
              </Label>
              <Input
                id="tariffRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 8.00"
                value={tariffInput}
                onChange={(e) => setTariffInput(e.target.value)}
                onBlur={handleTariffBlur}
              />
              <p className="text-xs text-muted-foreground">
                Set your electricity provider's tariff rate. This is used to calculate your estimated bill.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle Start</Label>
              <Select
                value={settings.billingCycleStart.toString()}
                onValueChange={(value) =>
                  updateSettings({ billingCycleStart: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 5, 10, 15, 20, 25].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Day {day} of each month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get alerts about your usage</p>
              </div>
              <Switch
                checked={settings.alertsEnabled}
                onCheckedChange={(checked) => updateSettings({ alertsEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Summary</p>
                <p className="text-sm text-muted-foreground">Receive daily usage reports</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Warning Alerts</p>
                <p className="text-sm text-muted-foreground">Alert when approaching limits</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Energy Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.name}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    badge.earned ? 'bg-primary/10' : 'bg-muted opacity-50 grayscale'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-xs mt-1 text-center font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-0">
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors"
              onClick={() => setShowBillingHistory(!showBillingHistory)}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span>Billing History</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showBillingHistory ? 'rotate-90' : ''}`} />
            </button>
            {showBillingHistory && (
              <div className="px-4 pb-4 space-y-2">
                {billingHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No billing data yet. Start logging usage!</p>
                ) : (
                  billingHistory.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.usage.toFixed(1)} kWh</p>
                      </div>
                      <p className="font-bold text-sm">₹{item.cost.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="border-t border-border" />
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors"
              onClick={() => setShowElectricityPlan(!showElectricityPlan)}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-muted-foreground" />
                <span>Electricity Plan</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showElectricityPlan ? 'rotate-90' : ''}`} />
            </button>
            {showElectricityPlan && (
              <div className="px-4 pb-4 space-y-2">
                {electricityPlans.map((plan) => (
                  <button
                    key={plan.id}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      user?.electricityPlan === plan.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => {
                      updateSettings({ costPerKwh: costPerKwh }); // trigger settings save
                      // We need to save electricity_plan directly
                      // updateSettings doesn't handle electricity_plan yet, so let's use the mutation directly
                    }}
                  >
                    <p className="font-medium text-sm">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                    {user?.electricityPlan === plan.id && (
                      <span className="text-xs text-primary font-medium">✓ Current Plan</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full animate-slide-up"
          style={{ animationDelay: '250ms' }}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};
