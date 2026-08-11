import React, { useState } from 'react';
import { WorkoutSession, ActiveWorkoutState } from '../types';
import { Calendar, Clock, Flame, ChevronDown, ChevronUp, Trash2, Dumbbell, Trophy, Play, CheckCircle2, Save, AlertCircle, ChevronLeft } from 'lucide-react';

interface WorkoutHistoryProps {
  sessions: WorkoutSession[];
  activeWorkoutState?: ActiveWorkoutState | null;
  onDeleteSession: (sessionId: string) => void;
  onResumeWorkout?: () => void;
  onFinishWorkout?: (session: WorkoutSession) => void;
  onCancelWorkout?: () => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  sessions,
  activeWorkoutState,
  onDeleteSession,
  onResumeWorkout,
  onFinishWorkout,
  onCancelWorkout
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Calculate active workout stats if present
  let activeCompletedSets = 0;
  let activeTotalSets = 0;
  let activeTotalVolume = 0;

  if (activeWorkoutState) {
    activeWorkoutState.exerciseLogs.forEach((ex) => {
      ex.sets.forEach((set) => {
        activeTotalSets++;
        if (set.isCompleted) {
          activeCompletedSets++;
          activeTotalVolume += (set.actualWeight || 0) * (set.actualReps || 0);
        }
      });
    });
  }

  // Sort sessions newest first
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Total statistics
  let totalVolumeKg = 0;
  let totalDurationSecs = 0;
  let totalCompletedSets = 0;

  sessions.forEach((s) => {
    totalVolumeKg += s.totalVolumeKg || 0;
    totalDurationSecs += s.durationSeconds || 0;
    s.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.isCompleted) totalCompletedSets++;
      });
    });
  });

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs} ساعت و ${mins % 60} دقیقه`;
    }
    return `${mins} دقیقه`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          سوابق و تقویم تمرینات
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          مشاهده جزئیات تمام جلسات تمرینی ثبت‌شده، وزنه و تکرارهای انجام‌شده
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <p className="text-[11px] text-slate-400">جلسات کامل‌شده</p>
          <p className="text-lg font-bold text-emerald-400 font-mono">{sessions.length} جلسه</p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <p className="text-[11px] text-slate-400">حجم کل جابجا شده</p>
          <p className="text-lg font-bold text-amber-300 font-mono">
            {totalVolumeKg > 1000 ? `${(totalVolumeKg / 1000).toFixed(1)} تن` : `${totalVolumeKg} کیلو`}
          </p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <p className="text-[11px] text-slate-400">زمان کل تمرینات</p>
          <p className="text-lg font-bold text-sky-400 font-mono">{formatDuration(totalDurationSecs)}</p>
        </div>
      </div>

      {/* Active / Draft Session Banner if Workout in Progress */}
      {activeWorkoutState && (
        <div className="p-5 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-indigo-950/90 border-2 border-emerald-500/50 rounded-3xl shadow-2xl relative overflow-hidden space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                تمرین در حال انجام / نیمه‌کاره
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onCancelWorkout && (
                <button
                  onClick={() => {
                    if (confirm('آیا از لغو این تمرین در حال انجام اطمینان دارید؟ اطلاعات ذخیره‌شده پاک خواهند شد.')) {
                      onCancelWorkout();
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-medium border border-red-800/40 transition"
                  title="لغو تمرین"
                >
                  لغو
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-[#D1FF00]">{activeWorkoutState.routine.titleFa}</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              شروع شده در: {formatDate(activeWorkoutState.startTime)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-emerald-500/20 text-center">
            <div>
              <p className="text-[10px] text-slate-400">زمان سپری‌شده</p>
              <p className="text-xs font-mono font-bold text-sky-400 mt-0.5">
                {formatDuration(activeWorkoutState.elapsedSeconds)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">ست‌های انجام‌شده</p>
              <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                {activeCompletedSets} از {activeTotalSets}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">حجم ثبت‌شده</p>
              <p className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                {activeTotalVolume} کیلو
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {onResumeWorkout && (
              <button
                onClick={onResumeWorkout}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] text-[#0A0A0A] font-black text-sm shadow-lg shadow-[#D1FF00]/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Play className="w-5 h-5 fill-current stroke-none" />
                <span>ادامه این تمرین</span>
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </button>
            )}

            {onFinishWorkout && (
              <button
                onClick={() => {
                  const finishedSession: WorkoutSession = {
                    id: `session-${Date.now()}`,
                    routineId: activeWorkoutState.routine.id,
                    routineTitleFa: activeWorkoutState.routine.titleFa,
                    startTime: activeWorkoutState.startTime,
                    endTime: new Date().toISOString(),
                    durationSeconds: activeWorkoutState.elapsedSeconds,
                    exercises: activeWorkoutState.exerciseLogs,
                    isCompleted: true,
                    totalVolumeKg: activeTotalVolume
                  };
                  onFinishWorkout(finishedSession);
                }}
                className="py-3 px-4 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 font-bold text-xs border border-emerald-500/40 flex items-center gap-1.5 transition active:scale-98 shrink-0"
                title="ثبت و خاتمه تمرین تا این لحظه"
              >
                <Save className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">ثبت و پایان تمرین</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {sortedSessions.length === 0 && !activeWorkoutState ? (
          <div className="py-16 bg-slate-900/50 border border-slate-800 rounded-3xl text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">هنوز سابقه تمرینی ثبت نشده است.</p>
            <p className="text-xs text-slate-500">
              اولین جلسه تمرین خود را از زبانه «برنامه من» آغاز کنید تا رکوردها و سوابق شما ثبت شوند.
            </p>
          </div>
        ) : (
          sortedSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;

            return (
              <div
                key={session.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg transition"
              >
                {/* Session Header */}
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="p-4 cursor-pointer hover:bg-slate-800/40 transition flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-100">{session.routineTitleFa}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        {formatDate(session.startTime)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        {formatDuration(session.durationSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">حجم تمرین</p>
                      <p className="text-sm font-bold text-amber-300 font-mono">
                        {session.totalVolumeKg} کیلوگرم
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('آیا از حذف این سابقه تمرین اطمینان دارید؟')) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 transition"
                      title="حذف سابقه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1.5 rounded-xl bg-slate-800 text-slate-300">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Breakdown */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-emerald-400" />
                      جزئیات حرکت‌ها و ست‌های انجام شده:
                    </h4>

                    <div className="space-y-3">
                      {session.exercises.map((exLog, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 border border-slate-800/80 rounded-2xl space-y-2">
                          <p className="text-xs font-bold text-slate-200">{exLog.exerciseNameFa}</p>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {exLog.sets.map((set, sIdx) => (
                              <span
                                key={sIdx}
                                className={`px-2.5 py-1 rounded-xl font-mono ${
                                  set.isCompleted
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                ست {set.setNumber}: {set.actualWeight}kg × {set.actualReps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
