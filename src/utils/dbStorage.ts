import { RoutineDay, WorkoutSession, ActiveWorkoutState, UserProfile } from '../types';
import { loadFromServer, scheduleServerSync } from './serverSync';

const DB_NAME = 'IranFitnessDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

const ROUTINES_KEY = 'fa_workout_routines_v1';
const SESSIONS_KEY = 'fa_workout_sessions_v1';
const ACTIVE_WORKOUT_KEY = 'fa_active_workout_session_v1';
const CHAT_HISTORY_KEY = 'fa_workout_chat_history_v1';
const CHAT_SESSIONS_KEY = 'fa_workout_chat_sessions_v2';
const USERS_LIST_KEY = 'fa_workout_users_list_v1';
const ACTIVE_USER_ID_KEY = 'fa_active_user_id_v1';

export const DEFAULT_USER: UserProfile = {
  id: 'user_default',
  name: 'ورزشکار ۱',
  avatarColor: '#D1FF00',
  gender: 'male',
  goal: 'عضله‌سازی و هایپرتروفی',
  experienceLevel: 'متوسط',
  weightKg: 75,
  heightCm: 178,
  createdAt: new Date().toISOString()
};

export function getUserRoutinesKey(userId: string): string {
  return `fa_user_${userId}_routines_v1`;
}

export function getUserSessionsKey(userId: string): string {
  return `fa_user_${userId}_sessions_v1`;
}

export function getUserActiveWorkoutKey(userId: string): string {
  return `fa_user_${userId}_active_workout_v1`;
}

export function getUserChatSessionsKey(userId: string): string {
  return `fa_user_${userId}_chat_sessions_v2`;
}

export function getUserChatHistoryKey(userId: string): string {
  return `fa_user_${userId}_chat_history_v1`;
}

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
  scheduleServerSync(ROUTINES_KEY, routines);

  // Try updating localStorage as secondary fallback (ignoring quota errors)
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (e) {
    console.info('localStorage quota exceeded (normal when storing custom video/images), saved in IndexedDB instead.', e);
  }
}

export async function saveSessionsPersistent(sessions: WorkoutSession[]): Promise<void> {
  await setItemDB(SESSIONS_KEY, sessions);
  scheduleServerSync(SESSIONS_KEY, sessions);
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.info('localStorage quota exceeded for sessions, saved in IndexedDB instead.', e);
  }
}

export async function loadDataPersistent(): Promise<{ routines: RoutineDay[] | null; sessions: WorkoutSession[] | null }> {
  let routines: RoutineDay[] | null = null;
  let sessions: WorkoutSession[] | null = null;

  // Prefer server storage when available (Docker volume)
  try {
    routines = await loadFromServer<RoutineDay[]>(ROUTINES_KEY);
    sessions = await loadFromServer<WorkoutSession[]>(SESSIONS_KEY);
  } catch (e) {
    console.warn('Could not read from server storage, falling back to browser storage', e);
  }

  // Try reading from IndexedDB first
  try {
    if (!routines) {
      routines = await getItemDB<RoutineDay[]>(ROUTINES_KEY);
    }
    if (!sessions) {
      sessions = await getItemDB<WorkoutSession[]>(SESSIONS_KEY);
    }
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

  if (routines) {
    await setItemDB(ROUTINES_KEY, routines);
    scheduleServerSync(ROUTINES_KEY, routines);
  }
  if (sessions) {
    await setItemDB(SESSIONS_KEY, sessions);
    scheduleServerSync(SESSIONS_KEY, sessions);
  }

  return { routines, sessions };
}

export async function saveChatHistoryPersistent<T>(messages: T): Promise<void> {
  await setItemDB(CHAT_HISTORY_KEY, messages);
  scheduleServerSync(CHAT_HISTORY_KEY, messages);
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (e) {
    console.info('localStorage quota exceeded for chat history, saved in IndexedDB.', e);
  }
}

export async function loadChatHistoryPersistent<T>(): Promise<T | null> {
  let history: T | null = null;
  try {
    history = await loadFromServer<T>(CHAT_HISTORY_KEY);
  } catch (e) {
    console.warn('Server chat history load error:', e);
  }
  try {
    if (!history) {
      history = await getItemDB<T>(CHAT_HISTORY_KEY);
    }
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
  scheduleServerSync(CHAT_SESSIONS_KEY, sessions);
  try {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.info('localStorage quota exceeded for chat sessions, saved in IndexedDB.', e);
  }
}

export async function loadChatSessionsPersistent(): Promise<ChatSession[] | null> {
  let sessions: ChatSession[] | null = null;
  try {
    sessions = await loadFromServer<ChatSession[]>(CHAT_SESSIONS_KEY);
  } catch (e) {
    console.warn('Server chat sessions load error:', e);
  }
  try {
    if (!sessions) {
      sessions = await getItemDB<ChatSession[]>(CHAT_SESSIONS_KEY);
    }
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
    scheduleServerSync(ACTIVE_WORKOUT_KEY, null);
    try {
      localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    } catch (e) {
      console.warn('localStorage clear active error:', e);
    }
  } else {
    await setItemDB(ACTIVE_WORKOUT_KEY, state);
    scheduleServerSync(ACTIVE_WORKOUT_KEY, state);
    try {
      localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('localStorage set active error:', e);
    }
  }
}

export async function loadActiveWorkoutPersistent(userId?: string): Promise<ActiveWorkoutState | null> {
  const targetKey = userId ? getUserActiveWorkoutKey(userId) : ACTIVE_WORKOUT_KEY;
  let state: ActiveWorkoutState | null = null;
  try {
    state = await loadFromServer<ActiveWorkoutState>(targetKey);
  } catch (e) {
    console.warn('Server active workout load error:', e);
  }
  try {
    if (!state) {
      state = await getItemDB<ActiveWorkoutState>(targetKey);
    }
  } catch (e) {
    console.warn('IndexedDB active workout load error:', e);
  }
  if (!state) {
    try {
      const saved = localStorage.getItem(targetKey);
      if (saved) state = JSON.parse(saved) as ActiveWorkoutState;
    } catch {
      state = null;
    }
  }
  return state;
}

// ==========================================
// Multi-User Profile & Isolated Device Storage
// ==========================================

export async function getUsersListPersistent(): Promise<UserProfile[]> {
  let users: UserProfile[] | null = null;
  try {
    users = await getItemDB<UserProfile[]>(USERS_LIST_KEY);
  } catch (e) {
    console.warn('IndexedDB users load error:', e);
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    try {
      const saved = localStorage.getItem(USERS_LIST_KEY);
      if (saved) users = JSON.parse(saved);
    } catch {
      users = null;
    }
  }

  if (users && Array.isArray(users) && users.length > 0) {
    return users;
  }

  // Initialize first user if none exists
  const initialUser: UserProfile = {
    ...DEFAULT_USER,
    id: 'user_default',
    createdAt: new Date().toISOString()
  };

  // Check if legacy data exists in ROUTINES_KEY or SESSIONS_KEY and migrate
  try {
    const legacyRoutines =
      (await getItemDB<RoutineDay[]>(ROUTINES_KEY)) ||
      (localStorage.getItem(ROUTINES_KEY) ? JSON.parse(localStorage.getItem(ROUTINES_KEY)!) : null);
    const legacySessions =
      (await getItemDB<WorkoutSession[]>(SESSIONS_KEY)) ||
      (localStorage.getItem(SESSIONS_KEY) ? JSON.parse(localStorage.getItem(SESSIONS_KEY)!) : null);

    if (legacyRoutines && Array.isArray(legacyRoutines) && legacyRoutines.length > 0) {
      await saveUserRoutinesPersistent(initialUser.id, legacyRoutines);
    }
    if (legacySessions && Array.isArray(legacySessions) && legacySessions.length > 0) {
      await saveUserSessionsPersistent(initialUser.id, legacySessions);
    }
  } catch (migErr) {
    console.warn('Legacy data migration notice:', migErr);
  }

  const initialList = [initialUser];
  await saveUsersListPersistent(initialList);
  await setActiveUserIdPersistent(initialUser.id);
  return initialList;
}

export async function saveUsersListPersistent(users: UserProfile[]): Promise<void> {
  await setItemDB(USERS_LIST_KEY, users);
  try {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('localStorage save users error:', e);
  }
}

export async function getActiveUserIdPersistent(): Promise<string> {
  let activeId: string | null = null;
  try {
    activeId = await getItemDB<string>(ACTIVE_USER_ID_KEY);
  } catch (e) {
    console.warn('getActiveUserId error:', e);
  }
  if (!activeId) {
    activeId = localStorage.getItem(ACTIVE_USER_ID_KEY);
  }
  return activeId || 'user_default';
}

export async function setActiveUserIdPersistent(userId: string): Promise<void> {
  await setItemDB(ACTIVE_USER_ID_KEY, userId);
  try {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  } catch (e) {
    console.warn('localStorage setActiveUserId error:', e);
  }
}

export async function saveUserRoutinesPersistent(userId: string, routines: RoutineDay[]): Promise<void> {
  const key = getUserRoutinesKey(userId);
  await setItemDB(key, routines);
  try {
    localStorage.setItem(key, JSON.stringify(routines));
  } catch (e) {
    console.info('localStorage quota note for user routines:', e);
  }

  // Also sync to legacy ROUTINES_KEY if this is the active user for fallback
  const activeId = await getActiveUserIdPersistent();
  if (activeId === userId) {
    await setItemDB(ROUTINES_KEY, routines);
    try {
      localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
    } catch {}
  }
}

export async function loadUserRoutinesPersistent(userId: string): Promise<RoutineDay[] | null> {
  const key = getUserRoutinesKey(userId);
  let routines: RoutineDay[] | null = null;
  try {
    routines = await getItemDB<RoutineDay[]>(key);
  } catch (e) {
    console.warn('IndexedDB load user routines error:', e);
  }
  if (!routines) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) routines = JSON.parse(saved);
    } catch {
      routines = null;
    }
  }
  return routines;
}

export async function saveUserSessionsPersistent(userId: string, sessions: WorkoutSession[]): Promise<void> {
  const key = getUserSessionsKey(userId);
  await setItemDB(key, sessions);
  try {
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch (e) {
    console.info('localStorage quota note for user sessions:', e);
  }

  const activeId = await getActiveUserIdPersistent();
  if (activeId === userId) {
    await setItemDB(SESSIONS_KEY, sessions);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch {}
  }
}

export async function loadUserSessionsPersistent(userId: string): Promise<WorkoutSession[] | null> {
  const key = getUserSessionsKey(userId);
  let sessions: WorkoutSession[] | null = null;
  try {
    sessions = await getItemDB<WorkoutSession[]>(key);
  } catch (e) {
    console.warn('IndexedDB load user sessions error:', e);
  }
  if (!sessions) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) sessions = JSON.parse(saved);
    } catch {
      sessions = null;
    }
  }
  return sessions;
}

export async function saveUserActiveWorkoutPersistent(userId: string, state: ActiveWorkoutState | null): Promise<void> {
  const key = getUserActiveWorkoutKey(userId);
  if (state === null) {
    await setItemDB(key, null);
    try {
      localStorage.removeItem(key);
    } catch {}
  } else {
    await setItemDB(key, state);
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }
}

export async function loadUserActiveWorkoutPersistent(userId: string): Promise<ActiveWorkoutState | null> {
  return loadActiveWorkoutPersistent(userId);
}

export async function saveUserChatSessionsPersistent(userId: string, sessions: ChatSession[]): Promise<void> {
  const key = getUserChatSessionsKey(userId);
  await setItemDB(key, sessions);
  try {
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch {}
}

export async function loadUserChatSessionsPersistent(userId: string): Promise<ChatSession[] | null> {
  const key = getUserChatSessionsKey(userId);
  let sessions: ChatSession[] | null = null;
  try {
    sessions = await getItemDB<ChatSession[]>(key);
  } catch (e) {
    console.warn('IndexedDB sessions load error:', e);
  }
  if (!sessions) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) sessions = JSON.parse(saved);
    } catch {
      sessions = null;
    }
  }
  return sessions;
}

export async function clearUserChatHistoryPersistent(userId: string): Promise<void> {
  const keySessions = getUserChatSessionsKey(userId);
  const keyHistory = getUserChatHistoryKey(userId);
  await setItemDB(keySessions, null);
  await setItemDB(keyHistory, null);
  try {
    localStorage.removeItem(keySessions);
    localStorage.removeItem(keyHistory);
  } catch {}
}

export async function deleteUserPersistent(userId: string): Promise<void> {
  const keys = [
    getUserRoutinesKey(userId),
    getUserSessionsKey(userId),
    getUserActiveWorkoutKey(userId),
    getUserChatSessionsKey(userId),
    getUserChatHistoryKey(userId)
  ];
  for (const k of keys) {
    try {
      await setItemDB(k, null);
      localStorage.removeItem(k);
    } catch {}
  }
  const users = await getUsersListPersistent();
  const filtered = users.filter((u) => u.id !== userId);
  await saveUsersListPersistent(filtered);
}

export interface FullDeviceExportData {
  version: '2.0_multi_user';
  deviceExportedAt: string;
  activeUserId: string;
  users: Array<{
    profile: UserProfile;
    routines: RoutineDay[];
    pastSessions: WorkoutSession[];
    chatSessions?: ChatSession[];
  }>;
}

export async function exportAllUsersFullDeviceData(): Promise<FullDeviceExportData> {
  const users = await getUsersListPersistent();
  const activeId = await getActiveUserIdPersistent();

  const exportedUsers = [];
  for (const u of users) {
    const userRoutines = (await loadUserRoutinesPersistent(u.id)) || [];
    const userSessions = (await loadUserSessionsPersistent(u.id)) || [];
    const userChatSessions = (await loadUserChatSessionsPersistent(u.id)) || [];

    exportedUsers.push({
      profile: u,
      routines: userRoutines,
      pastSessions: userSessions,
      chatSessions: userChatSessions
    });
  }

  return {
    version: '2.0_multi_user',
    deviceExportedAt: new Date().toISOString(),
    activeUserId: activeId,
    users: exportedUsers
  };
}

export async function importAllUsersFullDeviceData(data: FullDeviceExportData): Promise<number> {
  if (!data || !data.users || !Array.isArray(data.users)) {
    throw new Error('قالب فایل پشتیبان چندکاربره نامعتبر است.');
  }

  const existingUsers = await getUsersListPersistent();
  const existingMap = new Map(existingUsers.map((u) => [u.id, u]));

  for (const item of data.users) {
    if (!item.profile || !item.profile.id) continue;
    existingMap.set(item.profile.id, item.profile);

    if (item.routines && Array.isArray(item.routines)) {
      await saveUserRoutinesPersistent(item.profile.id, item.routines);
    }
    if (item.pastSessions && Array.isArray(item.pastSessions)) {
      await saveUserSessionsPersistent(item.profile.id, item.pastSessions);
    }
    if (item.chatSessions && Array.isArray(item.chatSessions)) {
      await saveUserChatSessionsPersistent(item.profile.id, item.chatSessions);
    }
  }

  const mergedUsers = Array.from(existingMap.values());
  await saveUsersListPersistent(mergedUsers);

  if (data.activeUserId && existingMap.has(data.activeUserId)) {
    await setActiveUserIdPersistent(data.activeUserId);
  }

  return data.users.length;
}
