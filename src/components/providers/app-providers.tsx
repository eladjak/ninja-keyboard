'use client'

import { useEffect } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'
import { soundManager } from '@/lib/audio/sound-manager'

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    soundManager.preload()
  }, [])

  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" dir="rtl" richColors />
    </ThemeProvider>
  )
}
