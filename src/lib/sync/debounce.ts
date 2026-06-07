/**
 * Tiny per-key debounce for store write-throughs, to avoid write storms during
 * high-frequency mutations (xp gains, story beats). Each logical channel uses a
 * stable key so its timer coalesces rather than firing on every keystroke.
 */

const timers = new Map<string, ReturnType<typeof setTimeout>>()

const DEFAULT_DELAY_MS = 1500

export function debouncedPush(
  key: string,
  fn: () => void,
  delayMs: number = DEFAULT_DELAY_MS,
): void {
  const existing = timers.get(key)
  if (existing) clearTimeout(existing)
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key)
      fn()
    }, delayMs),
  )
}

/** Fire-and-forget a Result-returning push, logging (not throwing) on failure. */
export function fireAndForget(p: Promise<{ isErr: () => boolean }>): void {
  void p
    .then((r) => {
      if (r.isErr()) {
        // eslint-disable-next-line no-console
        console.warn('[sync] push failed', r)
      }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('[sync] push threw', e)
    })
}
