import { Trophy, Flame, Shield, Star, Leaf, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

interface Badge {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  earned: boolean;
  color: string;
}

export const EnergyBadges = () => {
  const { usageHistory, recommendedDailyUsage, currentCycleUsage, settings } = useApp();

  // Calculate streaks and achievements
  const daysUnderLimit = usageHistory.filter((d) => d.usage <= recommendedDailyUsage).length;
  const consecutiveDaysUnder = (() => {
    let streak = 0;
    for (let i = usageHistory.length - 1; i >= 0; i--) {
      if (usageHistory[i].usage <= recommendedDailyUsage) streak++;
      else break;
    }
    return streak;
  })();
  const underMonthlyBudget = currentCycleUsage < settings.monthlyLimit * 0.8;

  const badges: Badge[] = [
    {
      id: 'first-day',
      icon: Star,
      label: 'First Step',
      description: 'Stayed under limit for 1 day',
      earned: daysUnderLimit >= 1,
      color: 'text-yellow-500',
    },
    {
      id: 'streak-3',
      icon: Flame,
      label: '3-Day Streak',
      description: '3 consecutive days under limit',
      earned: consecutiveDaysUnder >= 3,
      color: 'text-orange-500',
    },
    {
      id: 'streak-7',
      icon: Trophy,
      label: 'Week Warrior',
      description: '7 consecutive days under limit',
      earned: consecutiveDaysUnder >= 7,
      color: 'text-amber-500',
    },
    {
      id: 'saver',
      icon: Shield,
      label: 'Budget Keeper',
      description: 'Under 80% of monthly limit',
      earned: underMonthlyBudget,
      color: 'text-blue-500',
    },
    {
      id: 'eco',
      icon: Leaf,
      label: 'Eco Champion',
      description: '10+ days under daily limit',
      earned: daysUnderLimit >= 10,
      color: 'text-green-500',
    },
    {
      id: 'power',
      icon: Zap,
      label: 'Power Master',
      description: '20+ days under daily limit',
      earned: daysUnderLimit >= 20,
      color: 'text-purple-500',
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Energy Badges
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {earnedCount}/{badges.length} earned
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                  badge.earned
                    ? 'bg-muted/50 border-primary/20 shadow-sm'
                    : 'bg-muted/20 border-transparent opacity-40 grayscale'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-full',
                    badge.earned ? 'bg-primary/10' : 'bg-muted'
                  )}
                >
                  <Icon className={cn('w-5 h-5', badge.earned ? badge.color : 'text-muted-foreground')} />
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight">{badge.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{badge.description}</p>
              </div>
            );
          })}
        </div>
        {consecutiveDaysUnder > 0 && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-xs text-foreground">
              <span className="font-bold">{consecutiveDaysUnder}-day streak!</span>{' '}
              Keep going to unlock more badges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
