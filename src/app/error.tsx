'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center"
      dir="rtl"
    >
      <AlertTriangle className="size-12 text-destructive" />
      <h1 className="text-2xl font-bold">אופס! משהו השתבש</h1>
      <p className="max-w-md text-muted-foreground">
        קרתה שגיאה לא צפויה. אל דאגה, הנינג&apos;ה כבר מתקן את זה!
      </p>
      <button
        onClick={reset}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        נסה שוב
      </button>
    </div>
  )
}
