import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Plus, Minus, Volume2, Minimize2, Maximize2 } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  onFinish
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    setIsRunning(true);
    setIsMinimized(false);
  }, [initialSeconds, isOpen]);

  // Web Audio synth for offline timer chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            if (onFinish) onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, onFinish]);

  if (!isOpen) return null;

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const addTime = (secs: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + secs));
    setTotalSeconds((prev) => Math.max(1, prev + secs));
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 left-4 z-50 md:left-auto md:right-6 md:w-80 bg-slate-900/95 backdrop-blur-lg border border-emerald-500/40 rounded-2xl shadow-2xl p-3 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle cx="20" cy="20" r="16" stroke="rgba(51,65,85,0.5)" strokeWidth="3" fill="transparent" />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray={100}
                strokeDashoffset={100 - progressPercent}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <Timer className="w-4 h-4 text-emerald-400 absolute" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">زمان استراحت</p>
            <p className="text-lg font-bold tracking-tight text-emerald-400 font-mono">{formattedTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition"
          >
            {isRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-red-400 active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-6 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Timer className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold">تایمر استراحت بین ست</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="کوچک‌سازی"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Radial Timer Display */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="78"
              stroke="#1e293b"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="78"
              stroke={secondsLeft === 0 ? '#ef4444' : '#10b981'}
              strokeWidth="10"
              strokeDasharray={490}
              strokeDashoffset={490 - (490 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold tracking-tighter font-mono text-slate-100">
              {formattedTime}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1">
              {secondsLeft === 0 ? 'زمان تمام شد!' : 'استراحت کنید'}
            </span>
          </div>
        </div>

        {/* Quick Adjustment Pills */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => addTime(-10)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <Minus className="w-3 h-3" /> ۱۰ ثانیه
          </button>
          <button
            onClick={() => addTime(30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-500/30 text-xs font-medium text-emerald-300 transition"
          >
            <Plus className="w-3 h-3" /> ۳۰ ثانیه
          </button>
          <button
            onClick={() => addTime(60)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <Plus className="w-3 h-3" /> ۶۰ ثانیه
          </button>
        </div>

        {/* Play Pause Reset controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setSecondsLeft(initialSeconds);
              setTotalSeconds(initialSeconds);
              setIsRunning(true);
            }}
            className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition"
            title="بازنشانی"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-slate-950" /> توقف تایمر
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950" /> ادامه
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
