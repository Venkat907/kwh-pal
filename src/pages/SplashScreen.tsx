import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        navigate(isAuthenticated ? '/dashboard' : '/auth');
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center gradient-energy transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative mb-8">
        {/* Glowing background */}
        <div className="absolute inset-0 blur-3xl bg-primary-foreground/20 rounded-full scale-150" />
        
        {/* Icon container */}
        <div className="relative bg-primary-foreground/10 backdrop-blur-sm p-8 rounded-full border border-primary-foreground/20">
          <div className="relative">
            <Zap className="w-20 h-20 text-primary-foreground animate-pulse-glow" />
            <Leaf className="w-8 h-8 text-primary-foreground absolute -bottom-1 -right-1" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-primary-foreground mb-2">
        EnergyWise
      </h1>
      <p className="text-primary-foreground/80 text-lg">
        Smart Electricity Monitor
      </p>

      {/* Loading indicator */}
      <div className="mt-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>

      <p className="absolute bottom-8 text-primary-foreground/60 text-sm">
        Reduce • Monitor • Save
      </p>
    </div>
  );
};
