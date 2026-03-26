import { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const tips = [
  { title: 'Unplug Idle Devices', text: 'Standby power can account for 5-10% of your electricity bill. Unplug chargers and electronics when not in use.' },
  { title: 'Use LED Bulbs', text: 'LED bulbs use up to 75% less energy and last 25x longer than incandescent lighting.' },
  { title: 'Optimize AC Usage', text: 'Set your AC to 24-26 degrees. Every degree lower increases energy consumption by 3-5%.' },
  { title: 'Wash with Cold Water', text: 'About 90% of washing machine energy goes to heating water. Cold wash saves significantly.' },
  { title: 'Use Natural Light', text: 'Open curtains and blinds during the day to reduce reliance on artificial lighting.' },
  { title: 'Smart Power Strips', text: 'Use smart power strips to automatically cut power to devices in standby mode.' },
  { title: 'Run Full Loads', text: 'Run your dishwasher and washing machine only with full loads to maximize efficiency.' },
  { title: 'Seal Air Leaks', text: 'Seal gaps around doors and windows to prevent cool or warm air from escaping.' },
];

export const EnergySavingTips = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const tip = tips[currentTip];

  return (
    <Card className="bg-accent/30 border-accent">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent shrink-0">
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{tip.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.text}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex gap-1">
            {tips.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentTip ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentTip((prev) => (prev + 1) % tips.length)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
