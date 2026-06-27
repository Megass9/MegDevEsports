import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate: string;
  onStart?: () => void;
}

export default function Countdown({ targetDate, onStart }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setStarted(true);
        setTimeLeft(null);
        onStart?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onStart]);

  if (started) {
    return (
      <div className="flex items-center gap-1.5 text-green-400 text-sm">
        <Clock className="w-4 h-4 animate-pulse" />
        Maç başladı!
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
      <Clock className="w-4 h-4" />
      <span className="text-white font-mono font-bold tabular-nums">
        {timeLeft.days > 0 && `${timeLeft.days}g `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-gray-500">kaldı</span>
    </div>
  );
}
