import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

// Plays a short beep using Web Audio API — no external files needed
const playBeep = (frequency = 880, duration = 300, type = 'sine') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (_) {}
};

const playCriticalAlert = () => {
  playBeep(880, 250);
  setTimeout(() => playBeep(660, 250), 300);
  setTimeout(() => playBeep(880, 400), 600);
};

const playHighAlert = () => {
  playBeep(660, 300);
};

const AlertNotifier = ({ riskLevel }) => {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('alertSound') !== 'false';
  });
  const prevLevel = useRef(null);
  const [lastAlert, setLastAlert] = useState(null);

  useEffect(() => {
    localStorage.setItem('alertSound', enabled);
  }, [enabled]);

  useEffect(() => {
    if (!riskLevel || !enabled) return;
    if (riskLevel === prevLevel.current) return;

    const prev = prevLevel.current;
    prevLevel.current = riskLevel;

    const RANK = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    const isEscalation = RANK[riskLevel] > (RANK[prev] ?? -1);

    if (riskLevel === 'CRITICAL' && isEscalation) {
      playCriticalAlert();
      setLastAlert({ level: 'CRITICAL', time: new Date().toLocaleTimeString() });
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 CRITICAL Landslide Risk Detected', {
          body: 'Risk score has reached CRITICAL level. Take immediate action.',
          icon: '/favicon.ico',
        });
      }
    } else if (riskLevel === 'HIGH' && isEscalation) {
      playHighAlert();
      setLastAlert({ level: 'HIGH', time: new Date().toLocaleTimeString() });
      if (Notification.permission === 'granted') {
        new Notification('⚠️ HIGH Landslide Risk', {
          body: 'Risk level elevated to HIGH. Monitor conditions closely.',
          icon: '/favicon.ico',
        });
      }
    }
  }, [riskLevel, enabled]);

  // Request browser notification permission once
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setEnabled(e => !e)}
        title={enabled ? 'Disable alert sounds' : 'Enable alert sounds'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
          enabled
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30'
            : 'bg-slate-700/40 border-slate-600 text-gray-400 hover:border-slate-500'
        }`}
      >
        {enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        {enabled ? 'Alerts On' : 'Alerts Off'}
      </button>
      {lastAlert && enabled && (
        <span className={`text-xs ${lastAlert.level === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>
          Last: {lastAlert.level} @ {lastAlert.time}
        </span>
      )}
    </div>
  );
};

export default AlertNotifier;
