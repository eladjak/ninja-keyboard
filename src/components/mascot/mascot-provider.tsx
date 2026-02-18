'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MascotMood, MascotMessage } from '@/lib/mascot/mascot-reactions'
import { getMascotReaction } from '@/lib/mascot/mascot-reactions'

interface MascotContextValue {
  mood: MascotMood
  message: string
  messageDuration: number
  triggerReaction: (event: string) => void
}

const MascotContext = createContext<MascotContextValue | null>(null)

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [currentState, setCurrentState] = useState<MascotMessage>({
    mood: 'idle',
    text: '',
    duration: 0,
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerReaction = useCallback((event: string) => {
    const reaction = getMascotReaction(event)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setCurrentState(reaction)

    if (reaction.duration > 0) {
      timerRef.current = setTimeout(() => {
        setCurrentState({ mood: 'idle', text: '', duration: 0 })
        timerRef.current = null
      }, reaction.duration)
    }
  }, [])

  const value = useMemo<MascotContextValue>(
    () => ({
      mood: currentState.mood,
      message: currentState.text,
      messageDuration: currentState.duration,
      triggerReaction,
    }),
    [currentState.mood, currentState.text, currentState.duration, triggerReaction],
  )

  return (
    <MascotContext.Provider value={value}>
      {children}
    </MascotContext.Provider>
  )
}

export function useMascot(): MascotContextValue {
  const context = useContext(MascotContext)
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider')
  }
  return context
}
