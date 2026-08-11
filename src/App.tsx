import React, { useState, useEffect } from 'react';
import { ActiveTab, RoutineDay, WorkoutSession, Exercise, ActiveWorkoutState } from './types';
import { INITIAL_ROUTINES } from './data/initialPlan';
import { autoFixRoutinesMetadata } from './utils/workoutTextParser';
import { 
  saveRoutinesPersistent, 
  saveSessionsPersistent, 
  loadDataPersistent, 
  recoverAndMergeAllBrowserData,
  saveActiveWorkoutPersistent,
  loadActiveWorkoutPersistent
} from './utils/dbStorage';
import { RoutinesOverview } from './components/RoutinesOverview';
import { ActiveWorkoutSession } from './components/ActiveWorkoutSession';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutHistory } from './components/WorkoutHistory';
import { SettingsManager } from './components/SettingsManager';
import { AICoachManager } from './components/AICoachManager';
import { RawTextProgramModal } from './components/RawTextProgramModal';
import { Navigation } from './components/Navigation';
import { Dumbbell, ShieldAlert, Sparkles, ChevronLeft, Clock, Zap } from 'lucide-react';

const ROUTINES_STORAGE_KEY = 'fa_workout_routines_v1';
const SESSIONS_STORAGE_KEY = 'fa_workout_sessions_v1';
const ACTIVE_WORKOUT_STORAGE_KEY = 'fa_active_workout_session_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('routines');
  const [routines, setRoutines] = useState<RoutineDay[]>([]);
  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>([]);
  const [activeWorkoutState, setActiveWorkoutState] = useState<ActiveWorkoutState | null>(null);
  const [isViewingActiveWorkout, setIsViewingActiveWorkout] = useState<boolean>(false);
  const [isTextImporterOpen, setIsTextImporterOpen] = useState<boolean>(false);

  // Load from storage on mount (IndexedDB + localStorage fallback) with automatic legacy data recovery
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const { routines: loadedRoutines, sessions: loadedSessions } = await loadDataPersistent();
        const initialOrLoaded = loadedRoutines && loadedRoutines.length > 0 ? loadedRoutines : INITIAL_ROUTINES;

        // Auto recover and merge any custom media/links or data from older app versions
        const recovery = await recoverAndMergeAllBrowserData(initialOrLoaded, loadedSessions || []);

        if (isMounted) {
          const fixed = autoFixRoutinesMetadata(recovery.mergedRoutines);
          setRoutines(fixed);
          setPastSessions(recovery.mergedSessions);
        }

        // Restore active workout session if stored (IndexedDB + LocalStorage)
        const savedActive = await loadActiveWorkoutPersistent();
        if (savedActive && savedActive.routine && isMounted) {
          setActiveWorkoutState(savedActive);
          setIsViewingActiveWorkout(true);
        }
      } catch (err) {
        console.error('Error loading persistent data:', err);
        const fixed = autoFixRoutinesMetadata(INITIAL_ROUTINES);
        if (isMounted) setRoutines(fixed);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync active workout state to persistent DB whenever updated
  useEffect(() => {
    if (!activeWorkoutState) {
      saveActiveWorkoutPersistent(null);
      return;
    }

    saveActiveWorkoutPersistent(activeWorkoutState);

    // Save on tab exit or hide
    const handleFlushState = () => {
      saveActiveWorkoutPersistent(activeWorkoutState);
    };

    window.addEventListener('beforeunload', handleFlushState);
    document.addEventListener('visibilitychange', handleFlushState);

    return () => {
      window.removeEventListener('beforeunload', handleFlushState);
      document.removeEventListener('visibilitychange', handleFlushState);
    };
  }, [activeWorkoutState]);

  // Background ticker for active workout session
  useEffect(() => {
    if (!activeWorkoutState) return;

    const interval = setInterval(() => {
      setActiveWorkoutState((prev) => {
        if (!prev) return null;
        const nextState = {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        };
        saveActiveWorkoutPersistent(nextState);
        return nextState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkoutState]);

  // Handler for manual auto-recovery trigger from settings
  const handleAutoRecoverData = async () => {
    const recovery = await recoverAndMergeAllBrowserData(routines, pastSessions);
    const fixed = autoFixRoutinesMetadata(recovery.mergedRoutines);
    setRoutines(fixed);
    setPastSessions(recovery.mergedSessions);
    return {
      recoveredMediaCount: recovery.recoveredMediaCount,
      recoveredRoutinesCount: recovery.recoveredRoutinesCount,
      recoveredSessionsCount: recovery.recoveredSessionsCount
    };
  };

  // Save routines state to local storage and IndexedDB
  const saveRoutinesState = (newRoutines: RoutineDay[]) => {
    setRoutines(newRoutines);
    saveRoutinesPersistent(newRoutines);
  };

  // Save sessions state to local storage and IndexedDB
  const saveSessionsState = (newSessions: WorkoutSession[]) => {
    setPastSessions(newSessions);
    saveSessionsPersistent(newSessions);
  };

  // Handle completed workout
  const handleFinishWorkout = (newSession: WorkoutSession) => {
    const updatedSessions = [newSession, ...pastSessions];
    saveSessionsState(updatedSessions);
    setActiveWorkoutState(null);
    setIsViewingActiveWorkout(false);
    saveActiveWorkoutPersistent(null);
    setActiveTab('history');
  };

  // Handle cancel workout
  const handleCancelWorkout = () => {
    setActiveWorkoutState(null);
    setIsViewingActiveWorkout(false);
    saveActiveWorkoutPersistent(null);
  };

  // Handle minimize workout
  const handleMinimizeWorkout = (currentState: ActiveWorkoutState) => {
    setActiveWorkoutState(currentState);
    setIsViewingActiveWorkout(false);
    saveActiveWorkoutPersistent(currentState);
  };

  // Start new workout
  const handleStartWorkout = (routine: RoutineDay) => {
    // Check if there is already an active session for a different routine
    if (activeWorkoutState && activeWorkoutState.routine.id !== routine.id) {
      const confirmSwitch = window.confirm(
        `تمرین «${activeWorkoutState.routine.titleFa}» در حال اجراست. آیا مایلید آن را لغو کرده و تمرین «${routine.titleFa}» را شروع کنید؟`
      );
      if (!confirmSwitch) return;
    }

    const newState: ActiveWorkoutState = {
      routine,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
      exerciseLogs: [],
      activeExerciseIndex: 0
    };
    setActiveWorkoutState(newState);
    setIsViewingActiveWorkout(true);
    saveActiveWorkoutPersistent(newState);
  };

  // Handle reset routines plan
  const handleResetPlan = () => {
    saveRoutinesState(INITIAL_ROUTINES);
  };

  // Add custom exercise
  const handleAddCustomExercise = (newExercise: Exercise, dayId: string) => {
    const updated = routines.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: [...day.exercises, newExercise]
        };
      }
      return day;
    });
    saveRoutinesState(updated);
  };

  // Delete history session
  const handleDeleteSession = (sessionId: string) => {
    const updated = pastSessions.filter((s) => s.id !== sessionId);
    saveSessionsState(updated);
  };

  // Import JSON backup
  const handleImportData = (importedRoutines: RoutineDay[], importedSessions: WorkoutSession[]) => {
    saveRoutinesState(importedRoutines);
    saveSessionsState(importedSessions);
  };

  // Handle saving routines parsed from full raw text
  const handleSaveRoutinesFromText = (newRoutines: RoutineDay[], mode: 'replace' | 'append' = 'replace') => {
    if (mode === 'replace') {
      saveRoutinesState(newRoutines);
    } else {
      const combined = [...routines, ...newRoutines];
      saveRoutinesState(combined);
    }
  };

  // Update exercise custom image/GIF
  const handleUpdateExerciseMedia = (exerciseId: string, customMediaUrl: string | undefined) => {
    const updated = routines.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            gifUrl: customMediaUrl
          };
        }
        return ex;
      })
    }));
    saveRoutinesState(updated);

    if (activeWorkoutState) {
      setActiveWorkoutState({
        ...activeWorkoutState,
        routine: {
          ...activeWorkoutState.routine,
          exercises: activeWorkoutState.routine.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                gifUrl: customMediaUrl
              };
            }
            return ex;
          })
        }
      });
    }
  };

  // Format time for banner
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If viewing active workout full screen
  if (activeWorkoutState && isViewingActiveWorkout) {
    return (
      <ActiveWorkoutSession
        routine={activeWorkoutState.routine}
        pastSessions={pastSessions}
        initialState={activeWorkoutState}
        onFinishWorkout={handleFinishWorkout}
        onMinimizeWorkout={handleMinimizeWorkout}
        onCancelWorkout={handleCancelWorkout}
        onUpdateSessionState={(state) => setActiveWorkoutState(state)}
        onUpdateExerciseMedia={handleUpdateExerciseMedia}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex flex-col font-sans selection:bg-[#D1FF00] selection:text-[#0A0A0A]">
      {/* App Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#D1FF00] text-[#0A0A0A] flex items-center justify-center font-black shadow-lg shadow-[#D1FF00]/15">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-100 leading-tight">اپلیکیشن مدیریت تمرین و فیتنس</h1>
              <p className="text-[11px] text-[#D1FF00] font-medium">ویدیوهای متحرک و تصاویر اختصاصی تمرینات</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#D1FF00] animate-pulse"></span>
            <span>آفلاین / سریع</span>
          </div>
        </div>
      </header>

      {/* Floating Active Workout Banner (Visible when workout is running in background) */}
      {activeWorkoutState && !isViewingActiveWorkout && (
        <div className="sticky top-[57px] z-20 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-b border-emerald-500/40 px-4 py-2.5 shadow-xl animate-fadeIn">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <span className="font-extrabold text-[#D1FF00] block sm:inline">تمرین در حال انجام: {activeWorkoutState.routine.titleFa}</span>
                <span className="text-emerald-300 font-mono text-[11px] sm:mr-2">({formatTime(activeWorkoutState.elapsedSeconds)})</span>
              </div>
            </div>

            <button
              onClick={() => setIsViewingActiveWorkout(true)}
              className="py-1.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 flex items-center gap-1 transition active:scale-95 shrink-0"
            >
              <span>ادامه تمرین</span>
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'routines' && (
          <RoutinesOverview
            routines={routines}
            pastSessions={pastSessions}
            onStartWorkout={handleStartWorkout}
            onOpenTextImporter={() => setIsTextImporterOpen(true)}
            onUpdateRoutines={saveRoutinesState}
            onUpdateExerciseMedia={handleUpdateExerciseMedia}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressAnalytics routines={routines} pastSessions={pastSessions} />
        )}

        {activeTab === 'exercises' && (
          <ExerciseLibrary
            routines={routines}
            onAddCustomExercise={handleAddCustomExercise}
            onUpdateExerciseMedia={handleUpdateExerciseMedia}
          />
        )}

        {activeTab === 'ai_coach' && (
          <AICoachManager
            routines={routines}
            onApplyOptimizedRoutines={handleSaveRoutinesFromText}
          />
        )}

        {activeTab === 'history' && (
          <WorkoutHistory
            sessions={pastSessions}
            activeWorkoutState={activeWorkoutState}
            onDeleteSession={handleDeleteSession}
            onResumeWorkout={() => setIsViewingActiveWorkout(true)}
            onFinishWorkout={handleFinishWorkout}
            onCancelWorkout={handleCancelWorkout}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            routines={routines}
            pastSessions={pastSessions}
            onResetPlan={handleResetPlan}
            onImportData={handleImportData}
            onOpenTextImporter={() => setIsTextImporterOpen(true)}
            onAutoRecoverData={handleAutoRecoverData}
          />
        )}
      </main>

      {/* Raw Text Program Importer Modal */}
      <RawTextProgramModal
        isOpen={isTextImporterOpen}
        onClose={() => setIsTextImporterOpen(false)}
        onSaveRoutines={handleSaveRoutinesFromText}
      />

      {/* Mobile Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        hasActiveWorkout={!!activeWorkoutState}
        onOpenActiveWorkout={() => setIsViewingActiveWorkout(true)}
      />
    </div>
  );
}
