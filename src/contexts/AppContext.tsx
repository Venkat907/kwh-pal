import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  useUsageReadings,
  useUserSettings,
  useUpdateSettings,
  useUpsertReading,
  useUsageAlerts,
  useMarkAlertRead,
  seedUsageData,
} from '@/hooks/use-electricity-data';
import {
  DailyUsage,
  UsageAlert,
  getCurrentCycleUsage,
  getRemainingDaysInCycle,
  getDaysElapsedInCycle,
  getRecommendedDailyUsage,
  predictMonthlyUsage,
  generateMockAlerts,
} from '@/lib/electricity-data';

interface AppSettings {
  monthlyLimit: number;
  billingCycleStart: number;
  alertsEnabled: boolean;
  costPerKwh: number;
}

interface AppContextType {
  user: { name: string; consumerNumber: string; electricityPlan: string } | null;
  isAuthenticated: boolean;
  session: Session | null;
  authUser: User | null;
  costPerKwh: number;
  usageHistory: DailyUsage[];
  todayUsage: number;
  currentCycleUsage: number;
  remainingDays: number;
  daysElapsed: number;
  recommendedDailyUsage: number;
  predictedMonthlyUsage: number;
  alerts: UsageAlert[];
  settings: AppSettings;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => void;
  markAlertAsRead: (alertId: string) => void;
  simulateUsageUpdate: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const userId = authUser?.id;

  // Fetch data from database
  const { data: readings = [] } = useUsageReadings(userId);
  const { data: dbSettings } = useUserSettings(userId);
  const { data: dbAlerts = [] } = useUsageAlerts(userId);
  const updateSettingsMutation = useUpdateSettings();
  const upsertReadingMutation = useUpsertReading();
  const markAlertReadMutation = useMarkAlertRead();

  const queryClient = useQueryClient();

  // Seed data for new users
  useEffect(() => {
    if (userId && !seeded) {
      setSeeded(true);
      seedUsageData(userId);
    }
  }, [userId, seeded]);

  // Realtime subscription for usage_readings
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('usage_readings_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'usage_readings', filter: `user_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['usage_readings', userId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setAuthUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setAuthUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Derived electricity data
  const settings: AppSettings = {
    monthlyLimit: dbSettings ? Number(dbSettings.monthly_limit) : 300,
    billingCycleStart: dbSettings?.billing_cycle_start ?? 1,
    alertsEnabled: dbSettings?.alerts_enabled ?? true,
    costPerKwh: dbSettings ? Number(dbSettings.cost_per_kwh) : 8,
  };

  const usageHistory: DailyUsage[] = readings.map((r) => ({
    date: r.date,
    usage: Number(r.usage_kwh),
    cost: Number(r.cost),
  }));

  const todayUsage = usageHistory.length > 0 ? usageHistory[usageHistory.length - 1].usage : 0;
  const currentCycleUsage = getCurrentCycleUsage(usageHistory, settings.billingCycleStart);
  const remainingDays = getRemainingDaysInCycle(settings.billingCycleStart);
  const daysElapsed = getDaysElapsedInCycle(settings.billingCycleStart);
  const recommendedDailyUsage = getRecommendedDailyUsage(settings.monthlyLimit, currentCycleUsage, remainingDays);
  const predictedMonthlyUsage = predictMonthlyUsage(usageHistory);

  // Combine DB alerts with generated alerts
  const generatedAlerts = generateMockAlerts(todayUsage, recommendedDailyUsage, predictedMonthlyUsage, settings.monthlyLimit);
  const dbAlertsMapped: UsageAlert[] = dbAlerts.map((a) => ({
    id: a.id,
    type: a.type as 'warning' | 'danger' | 'info',
    title: a.title,
    message: a.message,
    timestamp: new Date(a.created_at),
    read: a.read,
  }));
  const alerts = [...dbAlertsMapped, ...generatedAlerts];

  const user = authUser
    ? {
        name: authUser.user_metadata?.name || authUser.email || 'User',
        consumerNumber: dbSettings?.consumer_number || 'EC-XXXX-XXXXX',
        electricityPlan: dbSettings?.electricity_plan || 'Standard Residential',
      }
    : null;

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name, first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' ') },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSeeded(false);
  };

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      if (!userId) return;
      const updates: any = {};
      if (newSettings.monthlyLimit !== undefined) updates.monthly_limit = newSettings.monthlyLimit;
      if (newSettings.billingCycleStart !== undefined) updates.billing_cycle_start = newSettings.billingCycleStart;
      if (newSettings.alertsEnabled !== undefined) updates.alerts_enabled = newSettings.alertsEnabled;
      if (newSettings.costPerKwh !== undefined) updates.cost_per_kwh = newSettings.costPerKwh;
      updateSettingsMutation.mutate({ userId, updates });
    },
    [userId, updateSettingsMutation]
  );

  const markAlertAsRead = useCallback(
    (alertId: string) => {
      markAlertReadMutation.mutate({ alertId });
    },
    [markAlertReadMutation]
  );

  const simulateUsageUpdate = useCallback(() => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const increment = Number((Math.random() * 0.5).toFixed(2));
    const currentToday = usageHistory.find((r) => r.date === today);
    const newUsage = Number(((currentToday?.usage || 0) + increment).toFixed(2));
    const costPerKwh = dbSettings ? Number(dbSettings.cost_per_kwh) : 0.12;
    upsertReadingMutation.mutate({
      userId,
      date: today,
      usage_kwh: newUsage,
      cost: Number((newUsage * costPerKwh).toFixed(2)),
    });
  }, [userId, usageHistory, dbSettings, upsertReadingMutation]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        costPerKwh: settings.costPerKwh,
        user,
        isAuthenticated: !!authUser,
        session,
        authUser,
        usageHistory,
        todayUsage,
        currentCycleUsage,
        remainingDays,
        daysElapsed,
        recommendedDailyUsage,
        predictedMonthlyUsage,
        alerts,
        settings,
        login,
        signup,
        logout,
        updateSettings,
        markAlertAsRead,
        simulateUsageUpdate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
