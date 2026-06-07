'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-current-user'
import { setSyncUser } from '@/lib/sync/sync-user'
import {
  hydrateFromSupabase,
  pushSnapshot,
} from '@/lib/sync/progress-sync'
import { mergeSnapshots } from '@/lib/sync/merge'
import { hasProgress, type ProgressSnapshot } from '@/lib/sync/snapshot'
import { useXpStore } from '@/stores/xp-store'
import { useBadgeStore } from '@/stores/badge-store'
import { useStoryStore } from '@/stores/story-store'
import { useDailyChallengeStore } from '@/stores/daily-challenge-store'

/** Read the current local (guest cache) state from the v1 stores. */
function readLocalSnapshot(): ProgressSnapshot {
  const xp = useXpStore.getState()
  const badges = useBadgeStore.getState()
  const story = useStoryStore.getState()
  const daily = useDailyChallengeStore.getState()
  return {
    totalXp: xp.totalXp,
    level: xp.level,
    streak: xp.streak,
    lastPracticeDate: xp.lastPracticeDate,
    completedLessons: xp.completedLessons,
    earnedBadges: badges.earnedBadges,
    story: {
      currentAct: story.currentAct,
      unlockedCharacters: story.unlockedCharacters,
      storyFlags: story.storyFlags,
      seenStoryBeats: story.seenStoryBeats,
      seenDialogBeats: story.seenDialogBeats,
      dialogChoices: story.dialogChoices,
      bossResults: story.bossResults,
      storyEnabled: story.storyEnabled,
    },
    dailyChallenges: daily.completedChallenges,
  }
}

/** Apply a (merged or server) snapshot back into the v1 stores. */
function applySnapshot(s: ProgressSnapshot): void {
  useXpStore.setState({
    totalXp: s.totalXp,
    level: s.level,
    streak: s.streak,
    lastPracticeDate: s.lastPracticeDate,
    completedLessons: s.completedLessons,
  })
  useBadgeStore.setState({ earnedBadges: s.earnedBadges })
  if (s.story) {
    useStoryStore.setState({
      currentAct: s.story.currentAct,
      unlockedCharacters: s.story.unlockedCharacters,
      storyFlags: s.story.storyFlags,
      seenStoryBeats: s.story.seenStoryBeats,
      seenDialogBeats: s.story.seenDialogBeats,
      dialogChoices: s.story.dialogChoices,
      bossResults: s.story.bossResults,
      storyEnabled: s.story.storyEnabled,
    })
  }
  useDailyChallengeStore.setState({ completedChallenges: s.dailyChallenges })
}

/**
 * Hydrates Supabase progress into the stores on login and handles the
 * guest -> account merge (blueprint Step B/C).
 *
 * Behaviour:
 *  - Guest / no env: never touches the network. Stores stay on localStorage.
 *  - On SIGNED_IN: read server snapshot. If the server account is empty, push
 *    the local guest progress up (merge-up). If the server already has progress,
 *    merge (max/union, server-wins-on-tie), apply to stores, push the merged
 *    result back, and show a small non-blocking toast. A `migratedAt` stamp on
 *    the merged snapshot prevents double-merge across re-login in the same load.
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useCurrentUser()
  const mergedForUser = useRef<string | null>(null)

  useEffect(() => {
    setSyncUser(user?.id ?? null)

    if (status !== 'authenticated' || !user) return
    if (mergedForUser.current === user.id) return
    mergedForUser.current = user.id

    let cancelled = false

    void (async () => {
      const result = await hydrateFromSupabase(user.id)
      if (cancelled || result.isErr()) {
        if (result.isErr()) {
          // eslint-disable-next-line no-console
          console.warn('[sync] hydrate failed', result.error)
        }
        return
      }

      const { snapshot: serverSnapshot, serverHadState } = result.value
      const localSnapshot = readLocalSnapshot()
      const localHasProgress = hasProgress(localSnapshot)

      if (!serverHadState) {
        // New/empty account: push local guest progress up (merge-up).
        if (localHasProgress) {
          const stamped: ProgressSnapshot = {
            ...localSnapshot,
            migratedAt: new Date().toISOString(),
          }
          await pushSnapshot(stamped)
        }
        return
      }

      if (!localHasProgress) {
        // Nothing local to merge; just hydrate the server state.
        applySnapshot(serverSnapshot)
        return
      }

      // Both sides have data -> merge, apply locally, push merged result back.
      const merged = mergeSnapshots(localSnapshot, serverSnapshot)
      applySnapshot(merged)
      await pushSnapshot(merged)
      toast.success('התקדמות מהמכשיר הזה אוחדה לחשבון שלך')
    })()

    return () => {
      cancelled = true
    }
  }, [user, status])

  return <>{children}</>
}
