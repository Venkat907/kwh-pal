import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  UserProfile,
  DailyUsage,
  UsageAlert,
  mockUser,
  generateMockUsageHistory,
  getCurrentCycleUsage,
  getRemainingDaysInCycle,
  getDaysElapsedInCycle,
  getRecommendedDailyUsage,
  predictMonthlyUsage,
  generateMockAlerts,
} from '@/lib/electricity-data';

interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  session: Session | null;
  authUser: User | null;
  usageHistory: DailyUsage[];
  todayUsage: number;
  currentCycleUsage: number;
  remainingDays: number;
  daysElapsed: number;
  recommendedDailyUsage: number;
  predictedMonthlyUsage: number;
  alerts: UsageAlert[];
  settings: {
    monthlyLimit: number;
    billingCycleStart: number;
    alertsEnabled: boolean;
  };
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
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

const buildElectricityState = () => {
  const history = generateMockUsageHistory();
  const todayUsage = history[history.length - 1]?.usage || 0;
  const currentCycleUsage = getCurrentCycleUsage(history, mockUser.billingCycleStart);
  const remainingDays = getRemainingDaysInCycle(mockUser.billingCycleStart);
  const daysElapsed = getDaysElapsedInCycle(mockUser.billingCycleStart);
  const recommendedDailyUsage = getRecommendedDailyUsage(
    mockUser.monthlyLimit,
    currentCycleUsage,
    remainingDays
  );
  const predictedMonthlyUsage = predictMonthlyUsage(history);
  const alerts = generateMockAlerts(
    todayUsage,
    recommendedDailyUsage,
    predictedMonthlyUsage,
    mockUser.monthlyLimit
  );

  return {
    usageHistory: history,
    todayUsage,
    currentCycleUsage,
    remainingDays,
    daysElapsed,
    recommendedDailyUsage,
    predictedMonthlyUsage,
    alerts,
    settings: {
      monthlyLimit: mockUser.monthlyLimit,
      billingCycleStart: mockUser.billingCycleStart,
      alertsEnabled: true,
    },
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppState>(() => ({
    user: null,
    isAuthenticated: false,
    session: null,
    authUser: null,
    ...buildElectricityState(),
  }));

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setAuthUser(newSession?.user ?? null);
        setState((prev) => ({
          ...prev,
          session: newSession,
          authUser: newSession?.user ?? null,
          isAuthenticated: !!newSession?.user,
          user: newSession?.user
            ? {
                ...mockUser,
                name: newSession.user.user_metadata?.name || newSession.user.email || 'User',
                email: newSession.user.email || '',
              }
            : null,
        }));
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setAuthUser(initialSession?.user ?? null);
      setState((prev) => ({
        ...prev,
        session: initialSession,
        authUser: initialSession?.user ?? null,
        isAuthenticated: !!initialSession?.user,
        user: initialSession?.user
          ? {
              ...mockUser,
              name: initialSession.user.user_metadata?.name || initialSession.user.email || 'User',
              email: initialSession.user.email || '',
            }
          : null,
      }));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string) => {
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { name },
      },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState((prev) => {
      const updatedSettings = { ...prev.settings, ...newSettings };
      const recommendedDailyUsage = getRecommendedDailyUsage(
        updatedSettings.monthlyLimit,
        prev.currentCycleUsage,
        prev.remainingDays
      );
      return { ...prev, settings: updatedSettings, recommendedDailyUsage };
    });
  };

  const markAlertAsRead = (alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      ),
    }));
  };

  const simulateUsageUpdate = () => {
    setState((prev) => {
      const increment = Number((Math.random() * 0.5).toFixed(2));
      const newTodayUsage = Number((prev.todayUsage + increment).toFixed(1));
      return {
        ...prev,
        todayUsage: newTodayUsage,
        currentCycleUsage: Number((prev.currentCycleUsage + increment).toFixed(1)),
      };
    });
  };

  // Simulate real-time usage updates
  useEffect(() => {
    if (!state.isAuthenticated) return;
    const interval = setInterval(() => {
      simulateUsageUpdate();
    }, 10000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

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
        ...state,
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
