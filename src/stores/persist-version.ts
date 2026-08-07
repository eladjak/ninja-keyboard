/**
 * A migration hook on every persisted store, so a future version bump cannot
 * silently zero a child.
 *
 * zustand's `persist` compares the stored `version` against the config's. On a
 * mismatch with NO `migrate`, it DISCARDS the persisted state and falls back to
 * defaults — no error, no console output, nothing the child or a parent could
 * notice. Every one of the 11 stores omitted both fields, so the first person
 * to bump a version (or reshape `completedLessons`) would have wiped every
 * returning child's progress on deploy day, silently.
 *
 * `version: 0` is what zustand already writes for a config that omits it
 * (verified against real stored values in a browser), so adopting this changes
 * nothing for existing data. It only installs the hook.
 *
 * The default `migrate` PRESERVES unknown-version state instead of dropping it.
 * That is the safe direction here: carrying a slightly stale shape forward can
 * be corrected later, while a wipe cannot be undone. When a real migration is
 * needed, bump `version` and pass a real `migrate` — do not delete this.
 */

/** Current persisted-shape version. Bump ONLY together with a real `migrate`. */
export const PERSIST_VERSION = 0

/**
 * Spread into a `persist` options object:
 *   persist(fn, { name: 'ninja-keyboard-xp', ...persistVersioning<State>() })
 */
export function persistVersioning<T>() {
  return {
    version: PERSIST_VERSION,
    /**
     * Keep whatever was stored rather than discarding it. Returning the state
     * unchanged is deliberate: it is the difference between "a returning child
     * sees a slightly old shape" and "a returning child sees zero XP".
     */
    migrate: (persistedState: unknown, _version: number): T =>
      persistedState as T,
  }
}
