import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UsageReading {
  id: string;
  user_id: string;
  date: string;
  usage_kwh: number;
  cost: number;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  monthly_limit: number;
  billing_cycle_start: number;
  alerts_enabled: boolean;
  electricity_plan: string;
  consumer_number: string | null;
  cost_per_kwh: number;
  created_at: string;
  updated_at: string;
}

export interface UsageAlertRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useUsageReadings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['usage_readings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_readings')
        .select('*')
        .eq('user_id', userId!)
        .order('date', { ascending: true });
      if (error) throw error;
      return (data as unknown as UsageReading[]) ?? [];
    },
    enabled: !!userId,
  });
};

export const useUserSettings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user_settings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as UserSettings | null;
    },
    enabled: !!userId,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Pick<UserSettings, 'monthly_limit' | 'billing_cycle_start' | 'alerts_enabled' | 'electricity_plan' | 'consumer_number' | 'cost_per_kwh'>> & { selected_state?: string };
    }) => {
      const { error } = await supabase
        .from('user_settings')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user_settings', userId] });
    },
  });
};

export const useUpsertReading = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      date,
      usage_kwh,
      cost,
    }: {
      userId: string;
      date: string;
      usage_kwh: number;
      cost: number;
    }) => {
      const { error } = await supabase
        .from('usage_readings')
        .upsert(
          { user_id: userId, date, usage_kwh, cost } as any,
          { onConflict: 'user_id,date' }
        );
      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['usage_readings', userId] });
    },
  });
};

export const useUsageAlerts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['usage_alerts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_alerts')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as UsageAlertRow[]) ?? [];
    },
    enabled: !!userId,
  });
};

export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ alertId }: { alertId: string }) => {
      const { error } = await supabase
        .from('usage_alerts')
        .update({ read: true } as any)
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage_alerts'] });
    },
  });
};

// Seed initial mock data for a new user
export const seedUsageData = async (userId: string, costPerKwh: number = 8) => {
  // Check if user already has data
  const { data: existing } = await supabase
    .from('usage_readings')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const readings: any[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseUsage = 8 + Math.random() * 5;
    const weekendBonus = [0, 6].includes(date.getDay()) ? 2 : 0;
    const usage = Number((baseUsage + weekendBonus + Math.random() * 2).toFixed(2));

    readings.push({
      user_id: userId,
      date: date.toISOString().split('T')[0],
      usage_kwh: usage,
      cost: Number((usage * costPerKwh).toFixed(2)),
    });
  }

  const { error } = await supabase.from('usage_readings').insert(readings);
  if (error) console.error('Error seeding usage data:', error);
};
