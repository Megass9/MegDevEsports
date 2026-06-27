import { useEffect, useState } from 'react';
import { Megaphone, X, Volume2 } from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/format';

interface Announcement {
  id: number;
  user: { name: string };
  message: string;
  is_pinned: boolean;
  created_at: string;
}

function playSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

const DISMISSED_KEY = 'megdev_dismissed_announcements';

function loadDismissed(): Set<number> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<number>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {}
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(loadDismissed);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    const fetch = () => {
      api.get('/announcements').then((res) => {
        const list = res.data?.announcements || [];
        setAnnouncements(list);
        if (list.length > lastCount && lastCount > 0) {
          playSound();
        }
        setLastCount(list.length);
      }).catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [lastCount]);

  const dismiss = (id: number) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
  };

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visible.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-valorant/15 to-transparent border border-valorant/20 rounded-xl animate-fade-in"
        >
          <Megaphone className="w-5 h-5 text-valorant flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-valorant/70">
              <span className="font-medium">Admin Duyurusu</span>
              <span>•</span>
              <span>{formatDate(a.created_at)}</span>
            </div>
            <p className="text-sm text-gray-200 mt-0.5">{a.message}</p>
          </div>
          <button
            onClick={() => dismiss(a.id)}
            className="p-1 text-gray-500 hover:text-white hover:bg-surface-400 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
