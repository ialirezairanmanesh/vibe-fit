---
name: user-data-storage
description: Implements and extends vibe-fit user data persistence across server JSON files (DATA_DIR volume), IndexedDB, and localStorage. Use when adding persisted state, storage keys, backup/sync, Docker volume, gitignore for data/, or debugging lost workout/chat data after container restart.
---

# User Data Storage

Persists workout routines, sessions, active workout, and AI chat across browser + server.

## When to Use

- Adding a new persisted app state (settings, profile, etc.)
- Fixing data loss after Docker restart or browser clear
- Extending export/import or server sync
- Touching `dbStorage.ts`, `serverSync.ts`, `server.ts` storage routes, or `docker-compose.production.yml` volumes

## Architecture

```
save → IndexedDB (+ localStorage fallback) → scheduleServerSync → PUT /api/storage/:key → data/{key}.json
load → GET /api/storage/:key → else IndexedDB → else localStorage → mirror to IndexedDB + sync
```

Media blobs stay in `IranFitnessMediaCache` (IndexedDB only). AI provider config (`custom_ai_config`) is localStorage-only unless explicitly extended.

## Allowed Storage Keys

| Key | Content |
| --- | --- |
| `fa_workout_routines_v1` | `RoutineDay[]` |
| `fa_workout_sessions_v1` | `WorkoutSession[]` |
| `fa_active_workout_session_v1` | `ActiveWorkoutState \| null` |
| `fa_workout_chat_history_v1` | Chat messages (legacy) |
| `fa_workout_chat_sessions_v2` | `ChatSession[]` |

## Add a New Persisted Key

1. Pick a versioned key name (`fa_*_v1`).
2. Add to `STORAGE_KEYS` in `server.ts` and `ALLOWED_KEYS` in `src/utils/serverSync.ts`.
3. In `src/utils/dbStorage.ts`:
   - `load*Persistent`: `loadFromServer` → `getItemDB` → `localStorage` fallback
   - `save*Persistent`: `setItemDB` + optional localStorage + `scheduleServerSync`
4. Keep debounce: 2s default; 10s for high-frequency keys (like active workout).
5. Do **not** commit `data/*.json`; keep `data/.gitkeep` only.
6. Verify `docker-compose.production.yml` still mounts `vibe_fit_data:/app/data` and sets `DATA_DIR`.

## Server API

```http
GET  /api/storage/:key   → 200 { data } | 404
PUT  /api/storage/:key   → body { data: ... } → 200 { success: true }
```

Writes use temp file + rename (`writeStorageValue` in `server.ts`). Body limit 50mb (custom media in routines).

## Deploy Checklist

- [ ] Named volume `vibe_fit_data` defined in compose `volumes:` section
- [ ] Service mounts `vibe_fit_data:/app/data` (not a host bind path)
- [ ] `DATA_DIR=/app/data` in production env
- [ ] `data/*` in `.gitignore`, `!data/.gitkeep` tracked (local dev)
- [ ] Health check: `GET /api/health` includes `dataDir`

Backup on server: `docker run --rm -v vibe_fit_data:/data -v $(pwd):/backup alpine tar czf /backup/vibe-fit-data.tgz -C /data .`

## Debug Lost Data

1. Inspect named volume: `docker volume inspect vibe_fit_data` then exec into container and `ls /app/data`
2. Check browser IndexedDB (`IranFitnessDB`) if server files empty — first load should migrate via `scheduleServerSync`.
3. Confirm new key is in **both** whitelists; missing key → silent no-op on client or 400 on server.
4. Settings → export JSON backup is the manual recovery path.

## Anti-patterns

- Saving user JSON outside `DATA_DIR`
- Committing `data/*.json` to git
- Removing Docker volume without migration plan
- Syncing every tick (e.g. 1s active workout timer) without debounce
- Adding server persistence without IndexedDB mirror (breaks offline PWA)
