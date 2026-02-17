'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" dir="rtl" richColors />
    </ThemeProvider>
  )
}
