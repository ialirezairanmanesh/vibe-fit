import React, { useState, useEffect } from 'react';
import { ActiveTab, RoutineDay, WorkoutSession, Exercise, ActiveWorkoutState, UserProfile } from './types';
import { autoFixRoutinesMetadata } from './utils/workoutTextParser';
import { 
  getUsersListPersistent,
  saveUsersListPersistent,
  getActiveUserIdPersistent,
  setActiveUserIdPersistent,
  saveUserRoutinesPersistent,
  loadUserRoutinesPersistent,
  saveUserSessionsPersistent,
  loadUserSessionsPersistent,
  saveUserActiveWorkoutPersistent,
  loadUserActiveWorkoutPersistent,
  deleteUserPersistent,
  exportAllUsersFullDeviceData,
  importAllUsersFullDeviceData,
  DEFAULT_USER,
  FullDeviceExportData,
  recoverAndMergeAllBrowserData
} from './utils/dbStorage';
import { RoutinesOverview } from './components/RoutinesOverview';
import { ActiveWorkoutSession } from './components/ActiveWorkoutSession';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutHistory } from './components/WorkoutHistory';
import { SettingsManager } from './components/SettingsManager';
import { AICoachManager } from './components/AICoachManager';
import { RawTextProgramModal } from './components/RawTextProgramModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Navigation } from './components/Navigation';
import { Dumbbell, ShieldAlert, Sparkles, ChevronLeft, Clock, Zap, User, Users, ChevronDown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('routines');
  const [routines, setRoutines] = useState<RoutineDay[]>([]);
  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>([]);
  const [activeWorkoutState, setActiveWorkoutState] = useState<ActiveWorkoutState | null>(null);
  const [isViewingActiveWorkout, setIsViewingActiveWorkout] = useState<boolean>(false);
  const [isTextImporterOpen, setIsTextImporterOpen] = useState<boolean>(false);

  // Multi-User Profile State
  const [users, setUsers] = useState<UserProfile[]>([DEFAULT_USER]);
  const [activeUser, setActiveUser] = useState<UserProfile>(DEFAULT_USER);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  // Load active user and their personal data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const allUsers = await getUsersListPersistent();
        const activeId = await getActiveUserIdPersistent();
        const currentU = allUsers.find((u) => u.id === activeId) || allUsers[0] || DEFAULT_USER;

        if (isMounted) {
          setUsers(allUsers);
          setActiveUser(currentU);
        }

        const loadedRoutines = await loadUserRoutinesPersistent(currentU.id);
        const loadedSessions = await loadUserSessionsPersistent(currentU.id);

        // If the user's routines are the old stock default template, clear them so user has a clean slate as requested
        const isOldDefaultTemplate = 
          loadedRoutines && 
          loadedRoutines.length === 3 && 
          loadedRoutines.every((r) => ['day-1', 'day-2', 'day-3'].includes(r.id)) &&
          (!loadedSessions || loadedSessions.length === 0);

        const initialOrLoaded = isOldDefaultTemplate ? [] : (loadedRoutines || []);

        // Auto recover and merge any custom media/links or data from older app versions
        const recovery = await recoverAndMergeAllBrowserData(initialOrLoaded, loadedSessions || []);

        if (isMounted) {
          const fixed = autoFixRoutinesMetadata(recovery.mergedRoutines);
          setRoutines(fixed);
          setPastSessions(recovery.mergedSessions);
          if (isOldDefaultTemplate) {
            await saveUserRoutinesPersistent(currentU.id, []);
          }
        }

        // Restore active workout session if stored for this user
        const savedActive = await loadUserActiveWorkoutPersistent(currentU.id);
        if (savedActive && savedActive.routine && isMounted) {
          setActiveWorkoutState(savedActive);
          setIsViewingActiveWorkout(true);
        }
      } catch (err) {
        console.error('Error loading persistent user data:', err);
        if (isMounted) setRoutines([]);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync active workout state to persistent DB for active user whenever updated
  useEffect(() => {
    if (!activeUser?.id) return;

    if (!activeWorkoutState) {
      saveUserActiveWorkoutPersistent(activeUser.id, null);
      return;
    }

    saveUserActiveWorkoutPersistent(activeUser.id, activeWorkoutState);

    // Save on tab exit or hide
    const handleFlushState = () => {
      saveUserActiveWorkoutPersistent(activeUser.id, activeWorkoutState);
    };

    window.addEventListener('beforeunload', handleFlushState);
    document.addEventListener('visibilitychange', handleFlushState);

    return () => {
      window.removeEventListener('beforeunload', handleFlushState);
      document.removeEventListener('visibilitychange', handleFlushState);
    };
  }, [activeWorkoutState, activeUser?.id]);

  // Background ticker for active workout session
  useEffect(() => {
    if (!activeWorkoutState || !activeUser?.id) return;

    const interval = setInterval(() => {
      setActiveWorkoutState((prev) => {
        if (!prev) return null;
        const nextState = {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        };
        saveUserActiveWorkoutPersistent(activeUser.id, nextState);
        return nextState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkoutState, activeUser?.id]);

  // Save routines state to local storage and IndexedDB for active user
  const saveRoutinesState = (newRoutines: RoutineDay[]) => {
    setRoutines(newRoutines);
    if (activeUser?.id) {
      saveUserRoutinesPersistent(activeUser.id, newRoutines);
    }
  };

  // Save sessions state to local storage and IndexedDB for active user
  const saveSessionsState = (newSessions: WorkoutSession[]) => {
    setPastSessions(newSessions);
    if (activeUser?.id) {
      saveUserSessionsPersistent(activeUser.id, newSessions);
    }
  };

  // Switch User Profile
  const handleSelectUser = async (userId: string) => {
    if (userId === activeUser.id) {
      setIsUserModalOpen(false);
      return;
    }

    // Flush current user's data before switching
    if (activeUser?.id) {
      await saveUserRoutinesPersistent(activeUser.id, routines);
      await saveUserSessionsPersistent(activeUser.id, pastSessions);
      await saveUserActiveWorkoutPersistent(activeUser.id, activeWorkoutState);
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    await setActiveUserIdPersistent(userId);
    setActiveUser(targetUser);

    // Load new user's routines
    const userRoutines = (await loadUserRoutinesPersistent(userId)) || [];
    setRoutines(autoFixRoutinesMetadata(userRoutines));

    // Load new user's sessions
    const userSessions = await loadUserSessionsPersistent(userId);
    setPastSessions(userSessions || []);

    // Load new user's active workout
    const userActiveWorkout = await loadUserActiveWorkoutPersistent(userId);
    setActiveWorkoutState(userActiveWorkout);
    setIsViewingActiveWorkout(false);

    setIsUserModalOpen(false);
  };

  // Add New User Profile
  const handleAddUser = async (
    newUserFields: Omit<UserProfile, 'id' | 'createdAt'>,
    routineOption: 'empty' | 'copy'
  ) => {
    // Flush current user first
    if (activeUser?.id) {
      await saveUserRoutinesPersistent(activeUser.id, routines);
      await saveUserSessionsPersistent(activeUser.id, pastSessions);
      await saveUserActiveWorkoutPersistent(activeUser.id, activeWorkoutState);
    }

    const newId = 'user_' + Date.now();
    const newUser: UserProfile = {
      ...newUserFields,
      id: newId,
      createdAt: new Date().toISOString()
    };

    let initialNewRoutines: RoutineDay[] = [];
    if (routineOption === 'copy') {
      initialNewRoutines = JSON.parse(JSON.stringify(routines));
    } else {
      initialNewRoutines = [];
    }

    const fixed = autoFixRoutinesMetadata(initialNewRoutines);
    await saveUserRoutinesPersistent(newId, fixed);
    await saveUserSessionsPersistent(newId, []);
    await saveUserActiveWorkoutPersistent(newId, null);

    const updatedUsers = [...users, newUser];
    await saveUsersListPersistent(updatedUsers);
    await setActiveUserIdPersistent(newId);

    setUsers(updatedUsers);
    setActiveUser(newUser);
    setRoutines(fixed);
    setPastSessions([]);
    setActiveWorkoutState(null);
    setIsViewingActiveWorkout(false);
    setIsUserModalOpen(false);
  };

  // Update Existing User Profile
  const handleUpdateUser = async (updatedUser: UserProfile) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    await saveUsersListPersistent(updatedUsers);
    setUsers(updatedUsers);
    if (activeUser.id === updatedUser.id) {
      setActiveUser(updatedUser);
    }
  };

  // Delete User Profile
  const handleDeleteUser = async (userId: string) => {
    await deleteUserPersistent(userId);
    const remaining = users.filter((u) => u.id !== userId);
    await saveUsersListPersistent(remaining);
    setUsers(remaining);

    if (activeUser.id === userId && remaining.length > 0) {
      await handleSelectUser(remaining[0].id);
    }
  };

  // Export all users full device backup
  const handleExportAllUsers = async () => {
    try {
      // Flush current in-memory data first
      if (activeUser?.id) {
        await saveUserRoutinesPersistent(activeUser.id, routines);
        await saveUserSessionsPersistent(activeUser.id, pastSessions);
      }

      const fullData = await exportAllUsersFullDeviceData();
      const jsonString = JSON.stringify(fullData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = `workout-all-users-device-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      alert(`فایل پشتیبان کامل همه کاربران دستگاه (${fullData.users.length} کاربر) دانلود شد.`);
    } catch (err) {
      console.error('Export all users error:', err);
      alert('خطا در دریافت فایل پشتیبان چندکاربره.');
    }
  };

  // Import full device backup
  const handleImportAllUsers = async (data: FullDeviceExportData): Promise<number> => {
    const count = await importAllUsersFullDeviceData(data);
    const updatedUsers = await getUsersListPersistent();
    const activeId = await getActiveUserIdPersistent();
    const currentU = updatedUsers.find((u) => u.id === activeId) || updatedUsers[0];

    setUsers(updatedUsers);
    setActiveUser(currentU);

    const userRoutines = (await loadUserRoutinesPersistent(currentU.id)) || [];
    const userSessions = (await loadUserSessionsPersistent(currentU.id)) || [];
    setRoutines(autoFixRoutinesMetadata(userRoutines));
    setPastSessions(userSessions);

    return count;
  };

  // Handler for manual auto-recovery trigger from settings
  const handleAutoRecoverData = async () => {
    const recovery = await recoverAndMergeAllBrowserData(routines, pastSessions);
    const fixed = autoFixRoutinesMetadata(recovery.mergedRoutines);
    saveRoutinesState(fixed);
    saveSessionsState(recovery.mergedSessions);
    return {
      recoveredMediaCount: recovery.recoveredMediaCount,
      recoveredRoutinesCount: recovery.recoveredRoutinesCount,
      recoveredSessionsCount: recovery.recoveredSessionsCount
    };
  };

  // Handle completed workout
  const handleFinishWorkout = (newSession: WorkoutSession) => {
    const updatedSessions = [newSession, ...pastSessions];
    saveSessionsState(updatedSessions);
    setActiveWorkoutState(null);
    setIsViewingActiveWorkout(false);
    if (activeUser?.id) {
      saveUserActiveWorkoutPersistent(activeUser.id, null);
    }
    setActiveTab('history');
  };

  // Handle cancel workout
  const handleCancelWorkout = () => {
    setActiveWorkoutState(null);
    setIsViewingActiveWorkout(false);
    if (activeUser?.id) {
      saveUserActiveWorkoutPersistent(activeUser.id, null);
    }
  };

  // Handle minimize workout
  const handleMinimizeWorkout = (currentState: ActiveWorkoutState) => {
    setActiveWorkoutState(currentState);
    setIsViewingActiveWorkout(false);
    if (activeUser?.id) {
      saveUserActiveWorkoutPersistent(activeUser.id, currentState);
    }
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
    if (activeUser?.id) {
      saveUserActiveWorkoutPersistent(activeUser.id, newState);
    }
  };

  // Handle reset routines plan
  const handleResetPlan = () => {
    saveRoutinesState([]);
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
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[#D1FF00] text-[#0A0A0A] flex items-center justify-center font-black shadow-lg shadow-[#D1FF00]/15 shrink-0">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-neutral-100 leading-tight truncate">اپلیکیشن مدیریت تمرین و فیتنس</h1>
              <p className="text-[11px] text-[#D1FF00] font-medium truncate">ویدیوهای متحرک و تصاویر اختصاصی تمرینات</p>
            </div>
          </div>

          {/* Active User Switcher / Profile Quick Access */}
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-[#D1FF00]/50 text-xs transition shadow-sm shrink-0"
            title="تغییر کاربر یا افزودن حساب کاربری جدید"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950 shadow-sm shrink-0"
              style={{ backgroundColor: activeUser?.avatarColor || '#D1FF00' }}
            >
              <User className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="text-right hidden sm:block">
              <span className="font-extrabold text-neutral-200 block text-xs leading-none">
                {activeUser?.name || 'کاربر'}
              </span>
              <span className="text-[10px] text-[#D1FF00] font-medium">سوییچ کاربر</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          </button>
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
            activeUser={activeUser}
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
            users={users}
            activeUser={activeUser}
            onOpenUserModal={() => setIsUserModalOpen(true)}
            onExportAllUsers={handleExportAllUsers}
            onImportAllUsers={handleImportAllUsers}
          />
        )}
      </main>

      {/* Raw Text Program Importer Modal */}
      <RawTextProgramModal
        isOpen={isTextImporterOpen}
        onClose={() => setIsTextImporterOpen(false)}
        onSaveRoutines={handleSaveRoutinesFromText}
      />

      {/* User Profile & Multi-User Switcher Modal */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
        activeUser={activeUser}
        onSelectUser={handleSelectUser}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
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
