const ALLOWED_KEYS = new Set([
  'fa_workout_routines_v1',
  'fa_workout_sessions_v1',
  'fa_active_workout_session_v1',
  'fa_workout_chat_history_v1',
  'fa_workout_chat_sessions_v2',
]);

const syncTimers = new Map<string, ReturnType<typeof setTimeout>>();
const ACTIVE_WORKOUT_SYNC_MS = 10000;
const DEFAULT_SYNC_MS = 2000;

export async function loadFromServer<T>(key: string): Promise<T | null> {
  if (!ALLOWED_KEYS.has(key)) {
    return null;
  }

  try {
    const res = await fetch(`/api/storage/${encodeURIComponent(key)}`);
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json.data as T) ?? null;
  } catch (err) {
    console.warn(`Server load failed for ${key}:`, err);
    return null;
  }
}

export function scheduleServerSync<T>(key: string, value: T): void {
  if (!ALLOWED_KEYS.has(key)) {
    return;
  }

  const delayMs = key === 'fa_active_workout_session_v1' ? ACTIVE_WORKOUT_SYNC_MS : DEFAULT_SYNC_MS;
  const existing = syncTimers.get(key);
  if (existing) {
    clearTimeout(existing);
  }

  syncTimers.set(
    key,
    setTimeout(() => {
      syncTimers.delete(key);
      void pushToServer(key, value);
    }, delayMs)
  );
}

async function pushToServer<T>(key: string, value: T): Promise<void> {
  try {
    await fetch(`/api/storage/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: value }),
    });
  } catch (err) {
    console.warn(`Server sync failed for ${key}:`, err);
  }
}
