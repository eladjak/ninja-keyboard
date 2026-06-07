'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/sync/sync-user'

export type AuthStatus = 'loading' | 'authenticated' | 'guest'

export interface CurrentUser {
  user: User | null
  status: AuthStatus
}

/**
 * Single source of truth on the client for "are we logged in".
 *
 * When Supabase env is absent the hook immediately reports `guest` and never
 * touches the network — guest play works with zero configuration.
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured() ? 'loading' : 'guest',
  )

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setStatus('guest')
      return
    }

    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(data.user)
      setStatus(data.user ? 'authenticated' : 'guest')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const nextUser = session?.user ?? null
      setUser(nextUser)
      setStatus(nextUser ? 'authenticated' : 'guest')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, status }
}
