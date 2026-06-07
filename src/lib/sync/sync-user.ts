/**
 * Module-level current-user holder for the store sync boundary.
 *
 * Zustand store actions are plain functions (not React components), so they
 * cannot call React hooks to learn the current user. Instead, a single React
 * provider (SyncProvider) subscribes to Supabase auth and pushes the user id
 * here via `setSyncUser`. The store write-through helpers read it synchronously
 * via `getSyncUserId`.
 *
 * Guest mode = `currentUserId` is null OR Supabase env is absent. In that case
 * every sync push is a no-op and localStorage (Zustand persist) remains the
 * only store. The app stays fully playable as a guest without any live DB.
 */

let currentUserId: string | null = null

/**
 * True only when Supabase env is configured. Without it there is no client to
 * talk to, so all sync is disabled and the app runs guest-only on localStorage.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

/** Set (or clear) the authenticated user id. Called by SyncProvider only. */
export function setSyncUser(userId: string | null): void {
  currentUserId = userId
}

/**
 * The id to sync against, or null when sync should be skipped (guest, or no
 * env). Store helpers gate every push on a non-null return here.
 */
export function getSyncUserId(): string | null {
  if (!isSupabaseConfigured()) return null
  return currentUserId
}
