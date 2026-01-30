import React, { createContext, useContext, useState, useEffect } from 'react';
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
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
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
      user: null,
      isAuthenticated: false,
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
  });

  const login = async (userId: string, password: string): Promise<boolean> => {
    // Simulate login - accept any non-empty credentials
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (userId && password) {
      setState((prev) => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      user: null,
      isAuthenticated: false,
    }));
  };

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState((prev) => {
      const updatedSettings = { ...prev.settings, ...newSettings };
      const recommendedDailyUsage = getRecommendedDailyUsage(
        updatedSettings.monthlyLimit,
        prev.currentCycleUsage,
        prev.remainingDays
      );
      
      return {
        ...prev,
        settings: updatedSettings,
        recommendedDailyUsage,
      };
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
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
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
