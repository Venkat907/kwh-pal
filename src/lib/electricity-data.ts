// Mock data and utilities for the electricity monitoring app

export interface UserProfile {
  id: string;
  name: string;
  consumerNumber: string;
  electricityPlan: string;
  monthlyLimit: number; // in kWh
  billingCycleStart: number; // day of month (1-28)
}

export interface DailyUsage {
  date: string;
  usage: number; // in kWh
  cost: number; // estimated cost
}

export interface UsageAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock user profile
export const mockUser: UserProfile = {
  id: 'user-001',
  name: 'Alex Johnson',
  consumerNumber: 'EC-2024-78542',
  electricityPlan: 'Standard Residential',
  monthlyLimit: 300, // kWh
  billingCycleStart: 1,
};

// Generate mock daily usage for the past 30 days
export const generateMockUsageHistory = (): DailyUsage[] => {
  const history: DailyUsage[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate varying usage (5-15 kWh per day with some randomness)
    const baseUsage = 8 + Math.random() * 5;
    const weekendBonus = [0, 6].includes(date.getDay()) ? 2 : 0;
    const usage = Number((baseUsage + weekendBonus + Math.random() * 2).toFixed(1));
    
    history.push({
      date: date.toISOString().split('T')[0],
      usage,
      cost: Number((usage * 0.12).toFixed(2)), // $0.12 per kWh
    });
  }
  
  return history;
};

// Get remaining days in billing cycle
export const getRemainingDaysInCycle = (billingCycleStart: number): number => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  if (currentDay >= billingCycleStart) {
    return daysInMonth - currentDay + billingCycleStart;
  }
  return billingCycleStart - currentDay;
};

// Get days elapsed in current billing cycle
export const getDaysElapsedInCycle = (billingCycleStart: number): number => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  if (currentDay >= billingCycleStart) {
    return currentDay - billingCycleStart + 1;
  }
  return daysInMonth - billingCycleStart + currentDay + 1;
};

// Calculate total usage in current billing cycle
export const getCurrentCycleUsage = (history: DailyUsage[], billingCycleStart: number): number => {
  const today = new Date();
  const cycleStartDate = new Date(today.getFullYear(), today.getMonth(), billingCycleStart);
  
  if (today.getDate() < billingCycleStart) {
    cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
  }
  
  return history
    .filter(d => new Date(d.date) >= cycleStartDate)
    .reduce((sum, d) => sum + d.usage, 0);
};

// Calculate recommended daily usage
export const getRecommendedDailyUsage = (
  monthlyLimit: number,
  currentCycleUsage: number,
  remainingDays: number
): number => {
  const remainingAllowance = monthlyLimit - currentCycleUsage;
  if (remainingDays <= 0) return 0;
  return Math.max(0, Number((remainingAllowance / remainingDays).toFixed(1)));
};

// Get usage status based on today's usage vs recommended
export const getUsageStatus = (
  todayUsage: number,
  recommendedUsage: number
): 'safe' | 'warning' | 'danger' => {
  const ratio = todayUsage / recommendedUsage;
  if (ratio <= 0.8) return 'safe';
  if (ratio <= 1.0) return 'warning';
  return 'danger';
};

// Predict monthly usage based on average
export const predictMonthlyUsage = (history: DailyUsage[]): number => {
  if (history.length === 0) return 0;
  
  const recentHistory = history.slice(-14); // Last 14 days
  const avgDaily = recentHistory.reduce((sum, d) => sum + d.usage, 0) / recentHistory.length;
  
  return Number((avgDaily * 30).toFixed(1));
};

// Get bill category based on predicted usage
export const getBillCategory = (
  predictedUsage: number,
  monthlyLimit: number
): 'low' | 'medium' | 'high' => {
  const ratio = predictedUsage / monthlyLimit;
  if (ratio <= 0.7) return 'low';
  if (ratio <= 1.0) return 'medium';
  return 'high';
};

// Generate mock alerts
export const generateMockAlerts = (
  todayUsage: number,
  recommendedUsage: number,
  predictedUsage: number,
  monthlyLimit: number
): UsageAlert[] => {
  const alerts: UsageAlert[] = [];
  
  if (todayUsage > recommendedUsage * 0.8) {
    alerts.push({
      id: 'alert-1',
      type: 'warning',
      title: 'Approaching Daily Limit',
      message: `You've used ${todayUsage.toFixed(1)} kWh today. Try to reduce usage to stay within your target.`,
      timestamp: new Date(),
      read: false,
    });
  }
  
  if (predictedUsage > monthlyLimit) {
    alerts.push({
      id: 'alert-2',
      type: 'danger',
      title: 'Monthly Limit Alert',
      message: `Predicted usage (${predictedUsage.toFixed(0)} kWh) may exceed your monthly limit of ${monthlyLimit} kWh.`,
      timestamp: new Date(),
      read: false,
    });
  }
  
  alerts.push({
    id: 'alert-3',
    type: 'info',
    title: 'Energy Saving Tip',
    message: 'Switch off appliances when not in use to reduce standby power consumption.',
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  });
  
  return alerts;
};

// Energy saving tips
export const energySavingTips = [
  { icon: '💡', tip: 'Replace incandescent bulbs with LED lights to save up to 80% energy.' },
  { icon: '🌡️', tip: 'Set your AC to 24°C instead of 20°C to reduce cooling costs by 25%.' },
  { icon: '🔌', tip: 'Unplug chargers and devices when not in use to eliminate phantom loads.' },
  { icon: '🧊', tip: 'Keep your refrigerator at 3-4°C and freezer at -18°C for optimal efficiency.' },
  { icon: '🌞', tip: 'Use natural light during the day and close curtains to insulate at night.' },
  { icon: '👕', tip: 'Wash clothes in cold water and air dry when possible.' },
];

// Weekly summary data
export const getWeeklySummary = (history: DailyUsage[]): { week: string; usage: number }[] => {
  const weeks: { week: string; usage: number }[] = [];
  
  for (let i = 0; i < 4; i++) {
    const weekStart = i * 7;
    const weekEnd = Math.min((i + 1) * 7, history.length);
    const weekData = history.slice(weekStart, weekEnd);
    const usage = weekData.reduce((sum, d) => sum + d.usage, 0);
    
    weeks.push({
      week: `Week ${4 - i}`,
      usage: Number(usage.toFixed(1)),
    });
  }
  
  return weeks.reverse();
};
