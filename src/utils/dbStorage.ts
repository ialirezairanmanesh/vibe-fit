import { RoutineDay, WorkoutSession, ActiveWorkoutState } from '../types';

const DB_NAME = 'IranFitnessDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

const ROUTINES_KEY = 'fa_workout_routines_v1';
const SESSIONS_KEY = 'fa_workout_sessions_v1';
const ACTIVE_WORKOUT_KEY = 'fa_active_workout_session_v1';
const CHAT_HISTORY_KEY = 'fa_workout_chat_history_v1';
const CHAT_SESSIONS_KEY = 'fa_workout_chat_sessions_v2';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function setItemDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB setItem error:', err);
  }
}

export async function getItemDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getItem error:', err);
    return null;
  }
}

export async function recoverAndMergeAllBrowserData(
  currentRoutines?: RoutineDay[] | null,
  currentSessions?: WorkoutSession[] | null
): Promise<{
  recoveredMediaCount: number;
  recoveredRoutinesCount: number;
  recoveredSessionsCount: number;
  mergedRoutines: RoutineDay[];
  mergedSessions: WorkoutSession[];
}> {
  let mediaRecovered = 0;
  let sessionsRecovered = 0;

  // Map to hold legacy custom media and metadata by exercise ID, Persian name, and English name
  const legacyMediaMap = new Map<string, { gifUrl?: string; notes?: string }>();
  const legacyCustomExercisesByDay = new Map<string, any[]>();
  const allFoundSessionsMap = new Map<string, WorkoutSession>();

  // Add existing sessions if provided
  if (currentSessions && Array.isArray(currentSessions)) {
    currentSessions.forEach((s) => {
      if (s && s.id) allFoundSessionsMap.set(s.id, s);
    });
  }

  // Candidate keys in localStorage
  const knownKeys = [
    ROUTINES_KEY,
    SESSIONS_KEY,
    'workout_routines',
    'workout_sessions',
    'routines',
    'sessions',
    'fa_workout_routines',
    'fa_workout_sessions'
  ];

  // Collect all localStorage keys
  const allLsKeys = new Set<string>(knownKeys);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allLsKeys.add(k);
    }
  } catch (e) {
    console.warn('Error reading localStorage keys:', e);
  }

  // Helper to inspect parsed data
  const processParsedData = (parsed: any) => {
    if (!parsed) return;

    // Check routines array
    const routinesArr = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.routines)
      ? parsed.routines
      : null;

    if (routinesArr) {
      routinesArr.forEach((day: any) => {
        if (!day || !Array.isArray(day.exercises)) return;

        const dayId = day.id || day.dayName;
        if (!legacyCustomExercisesByDay.has(dayId)) {
          legacyCustomExercisesByDay.set(dayId, []);
        }

        day.exercises.forEach((ex: any) => {
          if (!ex) return;

          // Store custom media/gifUrl
          if (ex.gifUrl && typeof ex.gifUrl === 'string' && ex.gifUrl.trim().length > 0) {
            const entry = { gifUrl: ex.gifUrl, notes: ex.notes };
            if (ex.id) legacyMediaMap.set(`id:${ex.id}`, entry);
            if (ex.name) legacyMediaMap.set(`name:${ex.name.trim().toLowerCase()}`, entry);
            if (ex.nameEn) legacyMediaMap.set(`nameEn:${ex.nameEn.trim().toLowerCase()}`, entry);
          }

          // Check custom added exercise
          if (ex.isCustom || (ex.id && ex.id.startsWith('custom_'))) {
            const existingList = legacyCustomExercisesByDay.get(dayId)!;
            if (!existingList.some((e) => e.id === ex.id || e.name === ex.name)) {
              existingList.push(ex);
            }
          }
        });
      });
    }

    // Check sessions array
    const sessionsArr = Array.isArray(parsed.pastSessions)
      ? parsed.pastSessions
      : Array.isArray(parsed.sessions)
      ? parsed.sessions
      : null;

    if (sessionsArr) {
      sessionsArr.forEach((s: any) => {
        if (s && s.id) {
          if (!allFoundSessionsMap.has(s.id)) {
            allFoundSessionsMap.set(s.id, s);
            sessionsRecovered++;
          }
        }
      });
    }
  };

  // 1. Scan LocalStorage
  allLsKeys.forEach((key) => {
    try {
      const val = localStorage.getItem(key);
      if (val && (val.includes('exercises') || val.includes('gifUrl') || val.includes('pastSessions') || val.includes('dayName'))) {
        const parsed = JSON.parse(val);
        processParsedData(parsed);
      }
    } catch {
      // ignore JSON parse errors for non-JSON items
    }
  });

  // 2. Scan IndexedDB
  try {
    const dbRoutines = await getItemDB<RoutineDay[]>(ROUTINES_KEY);
    if (dbRoutines) processParsedData(dbRoutines);

    const dbSessions = await getItemDB<WorkoutSession[]>(SESSIONS_KEY);
    if (dbSessions) processParsedData({ pastSessions: dbSessions });
  } catch (e) {
    console.warn('Error inspecting IndexedDB in recovery:', e);
  }

  // 3. Merge recovered media & custom exercises into target routines
  const baseRoutines: RoutineDay[] = currentRoutines && currentRoutines.length > 0 ? currentRoutines : [];

  const mergedRoutines = baseRoutines.map((day) => {
    const updatedExercises = day.exercises.map((ex) => {
      // Look up legacy media
      const byId = legacyMediaMap.get(`id:${ex.id}`);
      const byName = legacyMediaMap.get(`name:${ex.nameFa?.trim().toLowerCase()}`);
      const byNameEn = legacyMediaMap.get(`nameEn:${ex.nameEn?.trim().toLowerCase()}`);

      const matchedMedia = byId || byName || byNameEn;

      if (matchedMedia && matchedMedia.gifUrl) {
        if (!ex.gifUrl || ex.gifUrl !== matchedMedia.gifUrl) {
          mediaRecovered++;
        }
        return {
          ...ex,
          gifUrl: matchedMedia.gifUrl
        };
      }
      return ex;
    });

    // Append custom exercises from legacy if missing
    const dayId = day.id || (day as any).dayName;
    const legacyCustoms = legacyCustomExercisesByDay.get(dayId) || [];

    legacyCustoms.forEach((customEx: any) => {
      if (!updatedExercises.some((e) => e.id === customEx.id || e.nameFa === (customEx.nameFa || customEx.name))) {
        updatedExercises.push(customEx);
        if (customEx.gifUrl) mediaRecovered++;
      }
    });

    return {
      ...day,
      exercises: updatedExercises
    };
  });

  const mergedSessions = Array.from(allFoundSessionsMap.values());

  // Save merged state permanently
  await saveRoutinesPersistent(mergedRoutines);
  await saveSessionsPersistent(mergedSessions);

  return {
    recoveredMediaCount: mediaRecovered,
    recoveredRoutinesCount: mergedRoutines.length,
    recoveredSessionsCount: mergedSessions.length,
    mergedRoutines,
    mergedSessions
  };
}

export async function saveRoutinesPersistent(routines: RoutineDay[]): Promise<void> {
  // Always update IndexedDB (handles large media files smoothly)
  await setItemDB(ROUTINES_KEY, routines);

  // Try updating localStorage as secondary fallback (ignoring quota errors)
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (e) {
    console.info('localStorage quota exceeded (normal when storing custom video/images), saved in IndexedDB instead.', e);
  }
}

export async function saveSessionsPersistent(sessions: WorkoutSession[]): Promise<void> {
  await setItemDB(SESSIONS_KEY, sessions);
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.info('localStorage quota exceeded for sessions, saved in IndexedDB instead.', e);
  }
}

export async function loadDataPersistent(): Promise<{ routines: RoutineDay[] | null; sessions: WorkoutSession[] | null }> {
  let routines: RoutineDay[] | null = null;
  let sessions: WorkoutSession[] | null = null;

  // Try reading from IndexedDB first
  try {
    routines = await getItemDB<RoutineDay[]>(ROUTINES_KEY);
    sessions = await getItemDB<WorkoutSession[]>(SESSIONS_KEY);
  } catch (e) {
    console.warn('Could not read from IndexedDB, falling back to localStorage', e);
  }

  // Fallback to localStorage if IndexedDB had no data
  if (!routines) {
    try {
      const saved = localStorage.getItem(ROUTINES_KEY);
      if (saved) routines = JSON.parse(saved);
    } catch {
      routines = null;
    }
  }

  if (!sessions) {
    try {
      const saved = localStorage.getItem(SESSIONS_KEY);
      if (saved) sessions = JSON.parse(saved);
    } catch {
      sessions = null;
    }
  }

  return { routines, sessions };
}

export async function saveChatHistoryPersistent<T>(messages: T): Promise<void> {
  await setItemDB(CHAT_HISTORY_KEY, messages);
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (e) {
    console.info('localStorage quota exceeded for chat history, saved in IndexedDB.', e);
  }
}

export async function loadChatHistoryPersistent<T>(): Promise<T | null> {
  let history: T | null = null;
  try {
    history = await getItemDB<T>(CHAT_HISTORY_KEY);
  } catch (e) {
    console.warn('IndexedDB chat load error:', e);
  }
  if (!history) {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) history = JSON.parse(saved);
    } catch {
      history = null;
    }
  }
  return history;
}

export async function saveChatSessionsPersistent(sessions: ChatSession[]): Promise<void> {
  await setItemDB(CHAT_SESSIONS_KEY, sessions);
  try {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.info('localStorage quota exceeded for chat sessions, saved in IndexedDB.', e);
  }
}

export async function loadChatSessionsPersistent(): Promise<ChatSession[] | null> {
  let sessions: ChatSession[] | null = null;
  try {
    sessions = await getItemDB<ChatSession[]>(CHAT_SESSIONS_KEY);
  } catch (e) {
    console.warn('IndexedDB sessions load error:', e);
  }
  if (!sessions) {
    try {
      const saved = localStorage.getItem(CHAT_SESSIONS_KEY);
      if (saved) sessions = JSON.parse(saved);
    } catch {
      sessions = null;
    }
  }
  return sessions;
}

export async function clearChatHistoryPersistent(): Promise<void> {
  try {
    await setItemDB(CHAT_HISTORY_KEY, null);
    await setItemDB(CHAT_SESSIONS_KEY, null);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(CHAT_SESSIONS_KEY);
  } catch (e) {
    console.warn('Error clearing chat history:', e);
  }
}

export async function saveActiveWorkoutPersistent(state: ActiveWorkoutState | null): Promise<void> {
  if (state === null) {
    await setItemDB(ACTIVE_WORKOUT_KEY, null);
    try {
      localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    } catch (e) {
      console.warn('localStorage clear active error:', e);
    }
  } else {
    await setItemDB(ACTIVE_WORKOUT_KEY, state);
    try {
      localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('localStorage set active error:', e);
    }
  }
}

export async function loadActiveWorkoutPersistent(): Promise<ActiveWorkoutState | null> {
  let state: ActiveWorkoutState | null = null;
  try {
    state = await getItemDB<ActiveWorkoutState>(ACTIVE_WORKOUT_KEY);
  } catch (e) {
    console.warn('IndexedDB active workout load error:', e);
  }
  if (!state) {
    try {
      const saved = localStorage.getItem(ACTIVE_WORKOUT_KEY);
      if (saved) state = JSON.parse(saved) as ActiveWorkoutState;
    } catch {
      state = null;
    }
  }
  return state;
}
