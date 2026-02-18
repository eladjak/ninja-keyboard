/**
 * Offline Sync Manager
 *
 * Manages lesson caching and pending result syncing for PWA offline support.
 * Uses localStorage for persistence so lessons work without network.
 *
 * Design:
 * - Pure functions where possible (no side effects in helpers)
 * - SSR-safe: all localStorage access checks `typeof window`
 * - Immutable: never mutates cached data structures
 */

import type { LessonDefinition, SessionStats } from '@/lib/typing-engine/types'

// ── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY_LESSONS = 'ninja:offline:lessons'
const STORAGE_KEY_PENDING = 'ninja:offline:pending-results'

// ── Types ────────────────────────────────────────────────────────────────────

export interface LessonCacheEntry {
  /** Lesson definition data */
  lesson: LessonDefinition
  /** ISO date string when the lesson was cached */
  cachedAt: string
}

export interface PendingLessonResult {
  /** Unique ID for deduplication */
  id: string
  /** Lesson that was completed */
  lessonId: string
  /** Session stats from the completed lesson */
  stats: SessionStats
  /** ISO date string when the lesson was completed */
  completedAt: string
}

export interface SyncManagerState {
  /** Cached lessons keyed by lesson ID */
  lessonCache: Record<string, LessonCacheEntry>
  /** Results waiting to be synced when back online */
  pendingResults: PendingLessonResult[]
}

// ── SSR Guard ────────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// ── Pure Helpers ─────────────────────────────────────────────────────────────

/** Generate a simple unique ID for pending results */
export function generateResultId(): string {
  return `result-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Create a cache entry from a lesson (pure) */
export function createCacheEntry(lesson: LessonDefinition): LessonCacheEntry {
  return {
    lesson,
    cachedAt: new Date().toISOString(),
  }
}

/** Create a pending result (pure) */
export function createPendingResult(
  lessonId: string,
  stats: SessionStats,
): PendingLessonResult {
  return {
    id: generateResultId(),
    lessonId,
    stats,
    completedAt: new Date().toISOString(),
  }
}

// ── Storage IO ───────────────────────────────────────────────────────────────

function readLessonCache(): Record<string, LessonCacheEntry> {
  if (!isBrowser()) return {}

  const raw = localStorage.getItem(STORAGE_KEY_LESSONS)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as Record<string, LessonCacheEntry>
  } catch {
    return {}
  }
}

function writeLessonCache(cache: Record<string, LessonCacheEntry>): void {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(cache))
}

function readPendingResults(): PendingLessonResult[] {
  if (!isBrowser()) return []

  const raw = localStorage.getItem(STORAGE_KEY_PENDING)
  if (!raw) return []

  try {
    return JSON.parse(raw) as PendingLessonResult[]
  } catch {
    return []
  }
}

function writePendingResults(results: PendingLessonResult[]): void {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(results))
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true when the browser reports an active network connection.
 * Always returns false on the server (SSR).
 */
export function isOnline(): boolean {
  if (!isBrowser()) return false
  return navigator.onLine
}

/**
 * Cache a lesson for offline use.
 * Overwrites any existing cache entry for the same lesson ID.
 */
export function cacheLesson(lesson: LessonDefinition): void {
  const cache = readLessonCache()
  const updated = { ...cache, [lesson.id]: createCacheEntry(lesson) }
  writeLessonCache(updated)
}

/**
 * Retrieve a cached lesson by ID.
 * Returns undefined on cache miss or when running on the server.
 */
export function getCachedLesson(id: string): LessonDefinition | undefined {
  const cache = readLessonCache()
  return cache[id]?.lesson
}

/**
 * Get all cached lesson entries (for inspection / UI).
 */
export function getAllCachedLessons(): Record<string, LessonCacheEntry> {
  return readLessonCache()
}

/**
 * Save a lesson result that could not be synced (offline).
 * Appends to the pending results array without mutating existing entries.
 */
export function savePendingResult(lessonId: string, stats: SessionStats): PendingLessonResult {
  const existing = readPendingResults()
  const result = createPendingResult(lessonId, stats)
  writePendingResults([...existing, result])
  return result
}

/**
 * Get all pending results waiting to be synced.
 */
export function getPendingResults(): PendingLessonResult[] {
  return readPendingResults()
}

/**
 * Get the count of pending results.
 */
export function getPendingResultCount(): number {
  return readPendingResults().length
}

/**
 * Sync all pending results. In a real implementation this would POST
 * each result to the backend. For now it calls the provided callback
 * for each result and clears them on success.
 *
 * Returns the number of results synced, or 0 if offline / nothing to sync.
 */
export async function syncPendingResults(
  onSync: (result: PendingLessonResult) => Promise<void>,
): Promise<number> {
  if (!isOnline()) return 0

  const results = readPendingResults()
  if (results.length === 0) return 0

  const synced: PendingLessonResult[] = []
  const failed: PendingLessonResult[] = []

  for (const result of results) {
    try {
      await onSync(result)
      synced.push(result)
    } catch {
      failed.push(result)
    }
  }

  // Keep only the failed results for retry
  writePendingResults(failed)

  return synced.length
}

/**
 * Clear all cached lessons and pending results.
 */
export function clearCache(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY_LESSONS)
  localStorage.removeItem(STORAGE_KEY_PENDING)
}

/**
 * Clear only the lesson cache (keep pending results).
 */
export function clearLessonCache(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY_LESSONS)
}

/**
 * Clear only the pending results (keep lesson cache).
 */
export function clearPendingResults(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY_PENDING)
}

/**
 * Get a snapshot of the full sync manager state.
 */
export function getState(): SyncManagerState {
  return {
    lessonCache: readLessonCache(),
    pendingResults: readPendingResults(),
  }
}
