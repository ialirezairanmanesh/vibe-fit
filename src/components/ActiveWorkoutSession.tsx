import React, { useState, useEffect, useRef, memo } from 'react';
import confetti from 'canvas-confetti';
import { RoutineDay, WorkoutSession, ExerciseLog, SetLog, Exercise, ActiveWorkoutState } from '../types';
import { RestTimer } from './RestTimer';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { isExerciseBodyweightByKeywords } from '../utils/workoutTextParser';
import {
  Check,
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  Info,
  User,
  Minimize2,
  X,
  AlertTriangle
} from 'lucide-react';

interface ActiveWorkoutSessionProps {
  routine: RoutineDay;
  pastSessions: WorkoutSession[];
  initialState?: ActiveWorkoutState | null;
  onFinishWorkout: (session: WorkoutSession) => void;
  onMinimizeWorkout: (currentState: ActiveWorkoutState) => void;
  onCancelWorkout: () => void;
  onUpdateSessionState?: (state: ActiveWorkoutState) => void;
  onUpdateExerciseMedia?: (exerciseId: string, customMediaUrl: string | undefined) => void;
}

/** Isolated clock so the set list does not re-render every second. */
function WorkoutElapsedClock({
  initialSeconds,
  elapsedRef
}: {
  initialSeconds: number;
  elapsedRef: React.MutableRefObject<number>;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [elapsedRef]);

  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  return (
    <span className="flex items-center gap-1 text-emerald-400 font-mono">
      <Clock className="w-3.5 h-3.5" />
      {`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`}
    </span>
  );
}

type SessionActions = {
  toggleBodyweight: (exIdx: number) => void;
  adjustWeight: (exIdx: number, setIdx: number, delta: number) => void;
  updateSet: (exIdx: number, setIdx: number, field: keyof SetLog, value: number | boolean | string) => void;
  removeSet: (exIdx: number, setIdx: number) => void;
  addSet: (exIdx: number) => void;
  openDetail: (exercise: Exercise) => void;
};

const ExerciseCard = memo(
  function ExerciseCard({
    exercise,
    exIdx,
    exLog,
    isFocused,
    prevHints,
    actions
  }: {
    exercise: Exercise;
    exIdx: number;
    exLog: ExerciseLog;
    isFocused: boolean;
    prevHints: (string | null)[];
    actions: SessionActions;
  }) {
    const isBodyweight = !!exLog.isBodyweight;

    return (
      <div
        className={`rounded-3xl border transition-[border-color,background-color,box-shadow] duration-200 ${
          isFocused
            ? 'bg-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/5'
            : 'bg-slate-900/60 border-slate-800/80'
        }`}
        style={
          isFocused
            ? undefined
            : { contentVisibility: 'auto', containIntrinsicSize: 'auto 280px' }
        }
      >
        <div className="p-4 border-b border-slate-800/80 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5">
              {exIdx + 1}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-100">{exercise.nameFa}</h3>
                <button
                  type="button"
                  onClick={() => actions.toggleBodyweight(exIdx)}
                  className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                    isBodyweight
                      ? 'bg-[#D1FF00]/15 border-[#D1FF00]/40 text-[#D1FF00]'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title="کلیک برای تغییر حالت (با وزنه / وزن بدن بدون وزنه)"
                >
                  {isBodyweight ? (
                    <>
                      <User className="w-3 h-3 text-[#D1FF00]" />
                      <span>وزن بدن (بدون وزنه)</span>
                    </>
                  ) : (
                    <>
                      <Dumbbell className="w-3 h-3" />
                      <span>با وزنه</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300 font-medium">
                  {exercise.targetMuscleFa}
                </span>
                <span>•</span>
                <span>
                  هدف: {exercise.targetSets} ست × {exercise.targetReps}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => actions.openDetail(exercise)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-medium transition-colors"
            title="نمایش فیلم و نحوه حرکت"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">گیف و آموزش</span>
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 px-2">
            <span className="col-span-2 text-center">ست</span>
            <span className="col-span-4 text-center">{isBodyweight ? 'حالت' : 'وزنه (کیلوگرم)'}</span>
            <span className="col-span-3 text-center">تکرار</span>
            <span className="col-span-3 text-center">انجام شد</span>
          </div>

          {exLog.sets.map((set, setIdx) => {
            const prevHint = prevHints[setIdx];
            return (
              <div
                key={set.setNumber}
                className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl ${
                  set.isCompleted
                    ? 'bg-emerald-950/20 border border-emerald-500/30'
                    : 'bg-slate-800/40 border border-slate-800/60'
                }`}
              >
                <div className="col-span-2 flex flex-col items-center">
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center">
                    {set.setNumber}
                  </span>
                  {prevHint && (
                    <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full" title={prevHint}>
                      {prevHint}
                    </span>
                  )}
                </div>

                <div className="col-span-4 flex items-center justify-center">
                  {isBodyweight ? (
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-[#D1FF00] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#D1FF00]" />
                      <span>وزن بدن</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => actions.adjustWeight(exIdx, setIdx, -2.5)}
                        className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 font-bold text-xs flex items-center justify-center shrink-0 transition-transform"
                        title="۲.۵- کیلو"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={set.actualWeight || ''}
                        onChange={(e) =>
                          actions.updateSet(exIdx, setIdx, 'actualWeight', parseFloat(e.target.value) || 0)
                        }
                        className="w-14 h-9 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 dir-ltr"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => actions.adjustWeight(exIdx, setIdx, 2.5)}
                        className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 font-bold text-xs flex items-center justify-center shrink-0 transition-transform"
                        title="۲.۵+ کیلو"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-span-3 flex justify-center">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={set.actualReps || ''}
                    onChange={(e) =>
                      actions.updateSet(exIdx, setIdx, 'actualReps', parseInt(e.target.value, 10) || 0)
                    }
                    className="w-14 h-9 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500 dir-ltr"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-3 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => actions.updateSet(exIdx, setIdx, 'isCompleted', !set.isCompleted)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${
                      set.isCompleted
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                  </button>
                  {exLog.sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => actions.removeSet(exIdx, setIdx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="حذف ست"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => actions.addSet(exIdx)}
            className="w-full py-2.5 rounded-2xl border border-dashed border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            افزودن ست جدید
          </button>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.exLog === next.exLog &&
    prev.isFocused === next.isFocused &&
    prev.exercise === next.exercise &&
    prev.exIdx === next.exIdx
);

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  routine,
  pastSessions,
  initialState,
  onFinishWorkout,
  onMinimizeWorkout,
  onCancelWorkout,
  onUpdateSessionState,
  onUpdateExerciseMedia
}) => {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(initialState?.activeExerciseIndex || 0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(initialState?.exerciseLogs || []);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [currentRestDuration, setCurrentRestDuration] = useState(60);
  const [selectedModalExercise, setSelectedModalExercise] = useState<Exercise | null>(null);

  const startTimeRef = useRef(initialState?.startTime || new Date().toISOString());
  const elapsedRef = useRef(initialState?.elapsedSeconds || 0);
  const exerciseLogsRef = useRef(exerciseLogs);
  const activeExerciseIndexRef = useRef(activeExerciseIndex);
  exerciseLogsRef.current = exerciseLogs;
  activeExerciseIndexRef.current = activeExerciseIndex;

  const buildSnapshot = (): ActiveWorkoutState => ({
    routine,
    startTime: startTimeRef.current,
    elapsedSeconds: elapsedRef.current,
    exerciseLogs: exerciseLogsRef.current,
    activeExerciseIndex: activeExerciseIndexRef.current
  });

  const implRef = useRef<SessionActions>(null!);
  const actions = useRef<SessionActions>({
    toggleBodyweight: (exIdx) => implRef.current.toggleBodyweight(exIdx),
    adjustWeight: (exIdx, setIdx, delta) => implRef.current.adjustWeight(exIdx, setIdx, delta),
    updateSet: (exIdx, setIdx, field, value) => implRef.current.updateSet(exIdx, setIdx, field, value),
    removeSet: (exIdx, setIdx) => implRef.current.removeSet(exIdx, setIdx),
    addSet: (exIdx) => implRef.current.addSet(exIdx),
    openDetail: (exercise) => implRef.current.openDetail(exercise)
  }).current;

  implRef.current = {
    toggleBodyweight: (exIdx) => {
      setExerciseLogs((prev) => {
        const updated = [...prev];
        const targetEx = { ...updated[exIdx] };
        const newIsBodyweight = !targetEx.isBodyweight;
        targetEx.isBodyweight = newIsBodyweight;
        targetEx.sets = targetEx.sets.map((s) => ({
          ...s,
          isBodyweight: newIsBodyweight,
          actualWeight: newIsBodyweight ? 0 : s.actualWeight || 20
        }));
        updated[exIdx] = targetEx;
        return updated;
      });
    },
    adjustWeight: (exIdx, setIdx, delta) => {
      setExerciseLogs((prev) => {
        const updated = [...prev];
        const targetEx = { ...updated[exIdx] };
        const updatedSets = [...targetEx.sets];
        const currentWeight = updatedSets[setIdx].actualWeight || 0;
        updatedSets[setIdx] = {
          ...updatedSets[setIdx],
          actualWeight: Math.max(0, currentWeight + delta)
        };
        targetEx.sets = updatedSets;
        updated[exIdx] = targetEx;
        return updated;
      });
    },
    updateSet: (exIdx, setIdx, field, value) => {
      if (field === 'isCompleted' && value === true) {
        const exConfig = routine.exercises[exIdx];
        setCurrentRestDuration(exConfig?.defaultRestSeconds || 60);
        setIsRestTimerOpen(true);
      }
      setExerciseLogs((prev) => {
        const updated = [...prev];
        const targetEx = { ...updated[exIdx] };
        const updatedSets = [...targetEx.sets];
        updatedSets[setIdx] = { ...updatedSets[setIdx], [field]: value };
        targetEx.sets = updatedSets;
        updated[exIdx] = targetEx;
        return updated;
      });
    },
    removeSet: (exIdx, setIdx) => {
      setExerciseLogs((prev) => {
        const updated = [...prev];
        const targetEx = { ...updated[exIdx] };
        if (targetEx.sets.length <= 1) return prev;
        targetEx.sets = targetEx.sets
          .filter((_, idx) => idx !== setIdx)
          .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        updated[exIdx] = targetEx;
        return updated;
      });
    },
    addSet: (exIdx) => {
      setExerciseLogs((prev) => {
        const updated = [...prev];
        const targetEx = { ...updated[exIdx] };
        const lastSet = targetEx.sets[targetEx.sets.length - 1];
        targetEx.sets = [
          ...targetEx.sets,
          {
            setNumber: targetEx.sets.length + 1,
            targetReps: lastSet ? lastSet.targetReps : 10,
            targetWeight: lastSet ? lastSet.actualWeight : 20,
            actualReps: lastSet ? lastSet.actualReps : 10,
            actualWeight: lastSet ? lastSet.actualWeight : 20,
            isCompleted: false,
            type: 'normal'
          }
        ];
        updated[exIdx] = targetEx;
        return updated;
      });
    },
    openDetail: (exercise) => setSelectedModalExercise(exercise)
  };

  useEffect(() => {
    if (initialState && initialState.exerciseLogs.length > 0) {
      startTimeRef.current = initialState.startTime;
      return;
    }

    const previousRoutineSession = pastSessions
      .filter((s) => s.routineId === routine.id && s.isCompleted)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

    const initialLogs: ExerciseLog[] = routine.exercises.map((ex) => {
      const prevExLog = previousRoutineSession?.exercises.find((e) => e.exerciseId === ex.id);
      const isBodyweight =
        ex.isBodyweight !== undefined
          ? ex.isBodyweight
          : isExerciseBodyweightByKeywords(ex.nameFa, ex.equipmentFa);

      let repArray: number[] = [];
      if (ex.targetReps.includes('-')) {
        repArray = ex.targetReps.split('-').map((r) => parseInt(r.trim(), 10) || 10);
      } else {
        const singleRep = parseInt(ex.targetReps, 10) || 10;
        repArray = Array(ex.targetSets).fill(singleRep);
      }

      const sets: SetLog[] = Array.from({ length: Math.max(ex.targetSets, repArray.length) }).map((_, idx) => {
        const prevSet = prevExLog?.sets[idx];
        const defaultWeight = isBodyweight ? 0 : prevSet?.actualWeight || 20;
        const defaultReps = repArray[idx] || repArray[0] || 10;
        return {
          setNumber: idx + 1,
          targetReps: defaultReps,
          targetWeight: defaultWeight,
          actualReps: defaultReps,
          actualWeight: defaultWeight,
          isCompleted: false,
          type: 'normal',
          isBodyweight
        };
      });

      return {
        exerciseId: ex.id,
        exerciseNameFa: ex.nameFa,
        category: ex.category,
        isBodyweight,
        sets
      };
    });

    setExerciseLogs(initialLogs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only init
  }, []);

  useEffect(() => {
    if (!onUpdateSessionState || exerciseLogs.length === 0) return;
    const t = setTimeout(() => onUpdateSessionState(buildSnapshot()), 400);
    return () => clearTimeout(t);
  }, [exerciseLogs, activeExerciseIndex]);

  useEffect(() => {
    if (!onUpdateSessionState) return;
    const flush = () => {
      if (exerciseLogsRef.current.length === 0) return;
      onUpdateSessionState(buildSnapshot());
    };
    const interval = setInterval(flush, 10000);
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [onUpdateSessionState, routine]);

  const previousRoutineSession = pastSessions
    .filter((s) => s.routineId === routine.id && s.isCompleted)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

  let completedSetsCount = 0;
  let totalVolumeKg = 0;
  exerciseLogs.forEach((ex) => {
    ex.sets.forEach((set) => {
      if (set.isCompleted) {
        completedSetsCount++;
        totalVolumeKg += set.actualWeight * set.actualReps;
      }
    });
  });

  const handleFinish = () => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    const elapsedSeconds = elapsedRef.current;
    onFinishWorkout({
      id: `session-${Date.now()}`,
      routineId: routine.id,
      routineTitleFa: routine.titleFa,
      startTime: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exercises: exerciseLogs,
      isCompleted: true,
      totalVolumeKg
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMinimizeWorkout(buildSnapshot())}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="مینیمایز و بازگشت به برنامه (تمرین فعال می‌ماند)"
            >
              <Minimize2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">بازگشت</span>
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmCancelOpen(true)}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="انصراف و لغو کامل تمرین"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 leading-tight">{routine.titleFa}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <WorkoutElapsedClock
                  initialSeconds={initialState?.elapsedSeconds || 0}
                  elapsedRef={elapsedRef}
                />
                <span>•</span>
                <span className="text-amber-400 font-semibold">{completedSetsCount} ست تکمیل شده</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-transform"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            ثبت و پایان
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border-b border-slate-800/60 py-2 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {routine.exercises.map((ex, idx) => {
            const exLog = exerciseLogs[idx];
            const isAllCompleted = !!exLog?.sets.length && exLog.sets.every((s) => s.isCompleted);
            const isActive = activeExerciseIndex === idx;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => setActiveExerciseIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : isAllCompleted
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>
                  {idx + 1}. {ex.nameFa}
                </span>
                {isAllCompleted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
        {routine.exercises.map((exercise, exIdx) => {
          const exLog = exerciseLogs[exIdx];
          if (!exLog) return null;
          const prevEx = previousRoutineSession?.exercises.find((e) => e.exerciseId === exercise.id);
          const prevHints = exLog.sets.map((_, setIdx) => {
            const set = prevEx?.sets[setIdx];
            return set ? `جلسه قبل: ${set.actualWeight} کیلو × ${set.actualReps}` : null;
          });
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exIdx={exIdx}
              exLog={exLog}
              isFocused={activeExerciseIndex === exIdx}
              prevHints={prevHints}
              actions={actions}
            />
          );
        })}
      </div>

      {isConfirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">لغو کامل تمرین؟</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                آیا مطمئن هستید که می‌خواهید تمرین جاری را لغو کنید؟ کلیه ست‌های ثبت شده پاک خواهند شد.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmCancelOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                ادامه تمرین
              </button>
              <button
                type="button"
                onClick={onCancelWorkout}
                className="py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                بله، لغو شود
              </button>
            </div>
          </div>
        </div>
      )}

      <RestTimer
        isOpen={isRestTimerOpen}
        initialSeconds={currentRestDuration}
        onClose={() => setIsRestTimerOpen(false)}
      />

      {selectedModalExercise && (
        <ExerciseDetailModal
          exercise={selectedModalExercise}
          pastSessions={pastSessions}
          onClose={() => setSelectedModalExercise(null)}
          onUpdateExerciseMedia={(exerciseId, mediaUrl) => {
            if (selectedModalExercise.id === exerciseId) {
              setSelectedModalExercise({ ...selectedModalExercise, gifUrl: mediaUrl });
            }
            onUpdateExerciseMedia?.(exerciseId, mediaUrl);
          }}
        />
      )}
    </div>
  );
};
