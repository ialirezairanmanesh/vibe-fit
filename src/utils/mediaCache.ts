import { RoutineDay } from '../types';

const MEDIA_DB_NAME = 'IranFitnessMediaCache';
const MEDIA_STORE_NAME = 'media_blobs';
const MEDIA_DB_VERSION = 1;

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME);
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

export async function setMediaInDB(url: string, blob: Blob): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.put(blob, url);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Media DB save error:', err);
  }
}

export async function getMediaFromDB(url: string): Promise<Blob | null> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.get(url);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Media DB load error:', err);
    return null;
  }
}

// In-memory ObjectURL cache to avoid recreating blobs repeatedly
const objectUrlMap = new Map<string, string>();

/**
 * Ensures a media URL (GIF, image, MP4) is loaded, stored offline, and returned as a playable/displayable URL.
 */
export async function getOfflineCachedMediaUrl(originalUrl: string): Promise<string> {
  if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;

  // Data URLs are already self-contained
  if (originalUrl.startsWith('data:')) return originalUrl;

  // Local static relative asset paths or local proxy endpoints starting with / don't need blob URLs when online
  if (originalUrl.startsWith('/exercises/') || originalUrl.startsWith('/public/') || originalUrl.startsWith('/api/proxy-media')) {
    // Optionally pre-fetch in background for IndexedDB offline persistence, but return originalUrl for immediate display
    if (navigator.onLine) {
      getMediaFromDB(originalUrl).then((existing) => {
        if (!existing) {
          fetch(originalUrl)
            .then((res) => (res.ok ? res.blob() : null))
            .then((blob) => {
              if (blob) setMediaInDB(originalUrl, blob);
            })
            .catch(() => {});
        }
      });
      return originalUrl;
    }
  }

  // Check in-memory object URL cache
  if (objectUrlMap.has(originalUrl)) {
    return objectUrlMap.get(originalUrl)!;
  }

  // 1. Try reading from IndexedDB (for offline mode)
  try {
    const cachedBlob = await getMediaFromDB(originalUrl);
    if (cachedBlob && cachedBlob.size > 2000) {
      const blobUrl = URL.createObjectURL(cachedBlob);
      objectUrlMap.set(originalUrl, blobUrl);
      return blobUrl;
    }
  } catch {
    // continue
  }

  // 2. Try CacheStorage (PWA SW cache)
  if ('caches' in window) {
    try {
      const cacheResponse = await caches.match(originalUrl);
      if (cacheResponse) {
        const blob = await cacheResponse.blob();
        if (blob && blob.size > 0) {
          await setMediaInDB(originalUrl, blob);
          const blobUrl = URL.createObjectURL(blob);
          objectUrlMap.set(originalUrl, blobUrl);
          return blobUrl;
        }
      }
    } catch {
      // continue
    }
  }

  // 3. If online, fetch and save to cache
  if (navigator.onLine) {
    try {
      const resp = await fetch(originalUrl, { mode: 'cors' });
      if (resp.ok) {
        const blob = await resp.blob();
        if (blob && blob.size > 0) {
          // Save in IndexedDB for 100% offline persistence
          await setMediaInDB(originalUrl, blob);

          // Save in SW CacheStorage if available
          if ('caches' in window) {
            caches.open('workout-app-v3').then((c) => c.put(originalUrl, resp.clone())).catch(() => {});
          }

          // Return originalUrl if relative or blobUrl if external
          if (originalUrl.startsWith('/')) {
            return originalUrl;
          }
          const blobUrl = URL.createObjectURL(blob);
          objectUrlMap.set(originalUrl, blobUrl);
          return blobUrl;
        }
      }
    } catch (err) {
      console.warn('Network fetch error for offline media caching:', originalUrl, err);
    }
  }

  // Fallback to original URL
  return originalUrl;
}

/**
 * Downloads and caches all exercise media across routines for 100% offline usage.
 */
export async function cacheAllRoutinesMedia(
  routines: RoutineDay[],
  onProgress?: (cachedCount: number, totalCount: number, currentName: string) => void
): Promise<{ total: number; cached: number; failed: number }> {
  const mediaUrlsToCache: Array<{ url: string; name: string }> = [];

  routines.forEach((day) => {
    day.exercises.forEach((ex) => {
      if (ex.gifUrl && !ex.gifUrl.startsWith('data:')) {
        if (!mediaUrlsToCache.some((item) => item.url === ex.gifUrl)) {
          mediaUrlsToCache.push({ url: ex.gifUrl, name: ex.nameFa });
        }
      }
    });
  });

  const total = mediaUrlsToCache.length;
  let cached = 0;
  let failed = 0;

  for (let i = 0; i < mediaUrlsToCache.length; i++) {
    const item = mediaUrlsToCache[i];
    if (onProgress) {
      onProgress(i, total, item.name);
    }

    try {
      const cachedUrl = await getOfflineCachedMediaUrl(item.url);
      if (cachedUrl) {
        cached++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  if (onProgress) {
    onProgress(total, total, 'تکمیل شد');
  }

  return { total, cached, failed };
}
