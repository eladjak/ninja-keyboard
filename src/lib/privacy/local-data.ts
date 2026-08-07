/**
 * Erasing every trace of a child from this device.
 *
 * The deletion dialog used to promise "כל הנתונים של הילד/ה לרבות ההתקדמות, XP,
 * והסכמות", call only `revokeAllConsents()`, and then report "כל הנתונים נמחקו
 * בהצלחה". A privacy control that reports success without acting is worse than
 * no control at all: it converts a parent's deliberate act into a false belief,
 * and in a product for children that belief is the whole basis of the trust.
 *
 * So the list below is the WHOLE list, and it is derived from the two places
 * keys are actually created:
 *   - the `name:` of every `persist(...)` config in src/stores/*.ts (11)
 *   - the module-level key constants in src/lib/offline/sync-manager.ts (2)
 * `localDataKeys()` is exported so a test can assert that set against the
 * source rather than against this comment, which would rot.
 */

/** Every zustand `persist` store name. Must match src/stores/*.ts exactly. */
export const PERSISTED_STORE_KEYS = [
  'ninja-keyboard-accessibility',
  'ninja-keyboard-badges',
  'ninja-keyboard-cert-celebrations',
  'ninja-keyboard-consent',
  'ninja-keyboard-daily-challenges',
  'ninja-keyboard-music',
  'ninja-keyboard-practice-history',
  'ninja-keyboard-settings',
  'ninja-keyboard-story',
  'ninja-keyboard-theme',
  'ninja-keyboard-xp',
] as const

/** Offline caches written directly through localStorage. */
export const OFFLINE_KEYS = [
  'ninja:offline:lessons',
  'ninja:offline:pending-results',
] as const

/** The complete set of keys this app writes for a child. */
export function localDataKeys(): string[] {
  return [...PERSISTED_STORE_KEYS, ...OFFLINE_KEYS]
}

export interface ClearResult {
  /** Keys that existed and were removed. */
  removed: string[]
  /** Any key we failed to remove, with the reason. */
  failed: Array<{ key: string; reason: string }>
  /**
   * Keys present under our namespaces that we did not know about. Non-empty
   * means this module has drifted from the code and the dialog must NOT claim
   * a complete deletion.
   */
  unknownRemaining: string[]
}

/**
 * Remove every known key, then sweep the namespace for anything left behind.
 *
 * Deliberately does NOT reset the in-memory zustand stores: clearing storage
 * while live stores still hold the values would leave a child's XP on screen
 * after a "deleted successfully" message — the same lie in a new costume. The
 * caller reloads instead, which is the one thing guaranteed to rehydrate every
 * store from the now-empty storage.
 */
export function clearAllLocalData(): ClearResult {
  const removed: string[] = []
  const failed: Array<{ key: string; reason: string }> = []

  if (typeof window === 'undefined' || !window.localStorage) {
    return { removed, failed: [{ key: '*', reason: 'no localStorage' }], unknownRemaining: [] }
  }

  for (const key of localDataKeys()) {
    try {
      const existed = window.localStorage.getItem(key) !== null
      window.localStorage.removeItem(key)
      if (window.localStorage.getItem(key) !== null) {
        failed.push({ key, reason: 'still present after removeItem' })
      } else if (existed) {
        removed.push(key)
      }
    } catch (e) {
      failed.push({ key, reason: e instanceof Error ? e.message : String(e) })
    }
  }

  // Anything still sitting under our namespaces that the list above missed.
  const unknownRemaining: string[] = []
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (!k) continue
      if (k.startsWith('ninja-keyboard-') || k.startsWith('ninja:')) {
        unknownRemaining.push(k)
      }
    }
  } catch {
    // Enumeration failing is itself a reason not to claim completeness.
    unknownRemaining.push('<enumeration failed>')
  }

  return { removed, failed, unknownRemaining }
}

/** True only when nothing of ours remains and nothing failed. */
export function isCompleteErasure(r: ClearResult): boolean {
  return r.failed.length === 0 && r.unknownRemaining.length === 0
}
