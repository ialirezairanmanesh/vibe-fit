import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RoutineDay, WorkoutSession, ExerciseLog, SetLog, Exercise, ActiveWorkoutState } from '../types';
import { RestTimer } from './RestTimer';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { isExerciseBodyweightByKeywords } from '../utils/workoutTextParser';
import { 
  Check, 
  Clock, 
  Flame, 
  Dumbbell, 
  Plus, 
  Trash2, 
  Info, 
  ChevronRight, 
  Sparkles,
  Trophy,
  Save,
  RotateCcw,
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
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialState?.elapsedSeconds || 0);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(initialState?.activeExerciseIndex || 0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(initialState?.exerciseLogs || []);
  
  // Confirmation state for cancel workout
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState<boolean>(false);

  // Timer state
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(false);
  const [currentRestDuration, setCurrentRestDuration] = useState<number>(60);
  
  // Modal state
  const [selectedModalExercise, setSelectedModalExercise] = useState<Exercise | null>(null);

  // Initialize exercise logs from routine if not present
  useEffect(() => {
    if (initialState && initialState.exerciseLogs.length > 0) {
      setExerciseLogs(initialState.exerciseLogs);
      setElapsedSeconds(initialState.elapsedSeconds);
      setActiveExerciseIndex(initialState.activeExerciseIndex);
      return;
    }

    // Find latest previous session for this routine to fetch last session weights!
    const previousRoutineSession = pastSessions
      .filter((s) => s.routineId === routine.id && s.isCompleted)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

    const initialLogs: ExerciseLog[] = routine.exercises.map((ex) => {
      // Check if previous session had logs for this exercise
      const prevExLog = previousRoutineSession?.exercises.find((e) => e.exerciseId === ex.id);
      const isBodyweight = ex.isBodyweight !== undefined
        ? ex.isBodyweight
        : isExerciseBodyweightByKeywords(ex.nameFa, ex.equipmentFa);

      // Parse target reps (e.g. "12-10-8" or "10")
      let repArray: number[] = [];
      if (ex.targetReps.includes('-')) {
        repArray = ex.targetReps.split('-').map((r) => parseInt(r.trim(), 10) || 10);
      } else {
        const singleRep = parseInt(ex.targetReps, 10) || 10;
        repArray = Array(ex.targetSets).fill(singleRep);
      }

      const sets: SetLog[] = Array.from({ length: Math.max(ex.targetSets, repArray.length) }).map((_, idx) => {
        const prevSet = prevExLog?.sets[idx];
        const defaultWeight = isBodyweight ? 0 : (prevSet?.actualWeight || 20);
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
  }, [routine, pastSessions, initialState]);

  // Sync state changes to parent listener
  useEffect(() => {
    if (onUpdateSessionState && exerciseLogs.length > 0) {
      onUpdateSessionState({
        routine,
        startTime: initialState?.startTime || new Date().toISOString(),
        elapsedSeconds,
        exerciseLogs,
        activeExerciseIndex
      });
    }
  }, [exerciseLogs, elapsedSeconds, activeExerciseIndex]);

  // Toggle bodyweight vs weight mode for an exercise
  const toggleExerciseBodyweight = (exIdx: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIdx] };
      const newIsBodyweight = !targetEx.isBodyweight;
      targetEx.isBodyweight = newIsBodyweight;
      targetEx.sets = targetEx.sets.map((s) => ({
        ...s,
        isBodyweight: newIsBodyweight,
        actualWeight: newIsBodyweight ? 0 : (s.actualWeight || 20)
      }));
      updated[exIdx] = targetEx;
      return updated;
    });
  };

  // Workout duration ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format active workout timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to get previous performance hint string
  const getPreviousPerformance = (exerciseId: string, setIdx: number) => {
    const prevSession = pastSessions
      .filter((s) => s.routineId === routine.id && s.isCompleted)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

    if (!prevSession) return null;
    const prevEx = prevSession.exercises.find((e) => e.exerciseId === exerciseId);
    if (!prevEx || !prevEx.sets[setIdx]) return null;

    const set = prevEx.sets[setIdx];
    return `جلسه قبل: ${set.actualWeight} کیلو × ${set.actualReps}`;
  };

  // Update set details
  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: keyof SetLog,
    value: number | boolean | string
  ) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIdx] };
      const updatedSets = [...targetEx.sets];
      
      const setItem = { ...updatedSets[setIdx], [field]: value };
      
      // Auto trigger timer if checking set as completed!
      if (field === 'isCompleted' && value === true) {
        const exConfig = routine.exercises.find((e) => e.id === targetEx.exerciseId);
        setCurrentRestDuration(exConfig?.defaultRestSeconds || 60);
        setIsRestTimerOpen(true);
      }

      updatedSets[setIdx] = setItem;
      targetEx.sets = updatedSets;
      updated[exIdx] = targetEx;
      return updated;
    });
  };

  // Quick weight adjuster buttons
  const adjustWeight = (exIdx: number, setIdx: number, delta: number) => {
    const currentWeight = exerciseLogs[exIdx].sets[setIdx].actualWeight || 0;
    const newWeight = Math.max(0, currentWeight + delta);
    updateSet(exIdx, setIdx, 'actualWeight', newWeight);
  };

  // Add extra set
  const addSet = (exIdx: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIdx] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      
      const newSet: SetLog = {
        setNumber: targetEx.sets.length + 1,
        targetReps: lastSet ? lastSet.targetReps : 10,
        targetWeight: lastSet ? lastSet.actualWeight : 20,
        actualReps: lastSet ? lastSet.actualReps : 10,
        actualWeight: lastSet ? lastSet.actualWeight : 20,
        isCompleted: false,
        type: 'normal'
      };

      targetEx.sets = [...targetEx.sets, newSet];
      updated[exIdx] = targetEx;
      return updated;
    });
  };

  // Remove last set
  const removeSet = (exIdx: number, setIdx: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIdx] };
      if (targetEx.sets.length <= 1) return prev; // Keep at least 1 set

      targetEx.sets = targetEx.sets.filter((_, idx) => idx !== setIdx);
      // Re-number
      targetEx.sets = targetEx.sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      updated[exIdx] = targetEx;
      return updated;
    });
  };

  // Calculate totals
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

  // Finish session
  const handleFinish = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const finishedSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      routineId: routine.id,
      routineTitleFa: routine.titleFa,
      startTime: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exercises: exerciseLogs,
      isCompleted: true,
      totalVolumeKg
    };

    onFinishWorkout(finishedSession);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMinimizeWorkout({ routine, startTime: initialState?.startTime || new Date().toISOString(), elapsedSeconds, exerciseLogs, activeExerciseIndex })}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-xs font-semibold"
              title="مینیمایز و بازگشت به برنامه (تمرین فعال می‌ماند)"
            >
              <Minimize2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">بازگشت</span>
            </button>

            <button
              onClick={() => setIsConfirmCancelOpen(true)}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
              title="انصراف و لغو کامل تمرین"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 leading-tight">{routine.titleFa}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(elapsedSeconds)}
                </span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">
                  {completedSetsCount} ست تکمیل شده
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            ثبت و پایان
          </button>
        </div>
      </div>

      {/* Routine Exercise Quick Stepper Carousel */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 py-2 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {routine.exercises.map((ex, idx) => {
            const exLog = exerciseLogs[idx];
            const isAllCompleted = exLog?.sets.length > 0 && exLog.sets.every((s) => s.isCompleted);
            const isActive = activeExerciseIndex === idx;

            return (
              <button
                key={ex.id}
                onClick={() => setActiveExerciseIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105'
                    : isAllCompleted
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{idx + 1}. {ex.nameFa}</span>
                {isAllCompleted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Exercises List */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
        {routine.exercises.map((exercise, exIdx) => {
          const exLog = exerciseLogs[exIdx];
          if (!exLog) return null;

          const isFocused = activeExerciseIndex === exIdx;
          const isBodyweight = !!exLog.isBodyweight;

          return (
            <div
              key={exercise.id}
              className={`rounded-3xl border transition-all duration-300 ${
                isFocused
                  ? 'bg-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/5'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              {/* Exercise Card Header */}
              <div className="p-4 border-b border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5">
                    {exIdx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-100">{exercise.nameFa}</h3>
                      
                      {/* Bodyweight Toggle Button */}
                      <button
                        onClick={() => toggleExerciseBodyweight(exIdx)}
                        className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
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
                      <span>هدف: {exercise.targetSets} ست × {exercise.targetReps}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedModalExercise(exercise)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-medium transition"
                  title="نمایش فیلم و نحوه حرکت"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">گیف و آموزش</span>
                </button>
              </div>

              {/* Sets Table */}
              <div className="p-3 sm:p-4 space-y-3">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 px-2">
                  <span className="col-span-2 text-center">ست</span>
                  <span className="col-span-4 text-center">{isBodyweight ? 'حالت' : 'وزنه (کیلوگرم)'}</span>
                  <span className="col-span-3 text-center">تکرار</span>
                  <span className="col-span-3 text-center">انجام شد</span>
                </div>

                {exLog.sets.map((set, setIdx) => {
                  const prevHint = getPreviousPerformance(exercise.id, setIdx);

                  return (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl transition ${
                        set.isCompleted
                          ? 'bg-emerald-950/20 border border-emerald-500/30'
                          : 'bg-slate-800/40 border border-slate-800/60'
                      }`}
                    >
                      {/* Set Number */}
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

                      {/* Weight Control or Bodyweight Pill */}
                      <div className="col-span-4 flex items-center justify-center">
                        {isBodyweight ? (
                          <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-[#D1FF00] flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#D1FF00]" />
                            <span>وزن بدن</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => adjustWeight(exIdx, setIdx, -2.5)}
                              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs flex items-center justify-center shrink-0"
                              title="۲.۵- کیلو"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              value={set.actualWeight || ''}
                              onChange={(e) =>
                                updateSet(exIdx, setIdx, 'actualWeight', parseFloat(e.target.value) || 0)
                              }
                              className="w-14 h-9 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 dir-ltr"
                              placeholder="0"
                            />

                            <button
                              onClick={() => adjustWeight(exIdx, setIdx, 2.5)}
                              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs flex items-center justify-center shrink-0"
                              title="۲.۵+ کیلو"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-3 flex justify-center">
                        <input
                          type="number"
                          value={set.actualReps || ''}
                          onChange={(e) =>
                            updateSet(exIdx, setIdx, 'actualReps', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-14 h-9 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500 dir-ltr"
                          placeholder="0"
                        />
                      </div>

                      {/* Completed Checkbox */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateSet(exIdx, setIdx, 'isCompleted', !set.isCompleted)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                            set.isCompleted
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </button>

                        {exLog.sets.length > 1 && (
                          <button
                            onClick={() => removeSet(exIdx, setIdx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition"
                            title="حذف ست"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Set Button */}
                <button
                  onClick={() => addSet(exIdx)}
                  className="w-full py-2.5 rounded-2xl border border-dashed border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  افزودن ست جدید
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Workout Confirmation Modal */}
      {isConfirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
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
                onClick={() => setIsConfirmCancelOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                ادامه تمرین
              </button>
              <button
                onClick={onCancelWorkout}
                className="py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-red-500/20"
              >
                بله، لغو شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Modal */}
      <RestTimer
        isOpen={isRestTimerOpen}
        initialSeconds={currentRestDuration}
        onClose={() => setIsRestTimerOpen(false)}
      />

      {/* Exercise Details & Video GIF Modal */}
      <ExerciseDetailModal
        exercise={selectedModalExercise}
        pastSessions={pastSessions}
        onClose={() => setSelectedModalExercise(null)}
        onUpdateExerciseMedia={(exerciseId, mediaUrl) => {
          if (selectedModalExercise && selectedModalExercise.id === exerciseId) {
            setSelectedModalExercise({
              ...selectedModalExercise,
              gifUrl: mediaUrl
            });
          }
          if (onUpdateExerciseMedia) {
            onUpdateExerciseMedia(exerciseId, mediaUrl);
          }
        }}
      />
    </div>
  );
};
