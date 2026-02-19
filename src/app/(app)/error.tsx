'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-4 pt-16" dir="rtl">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <AlertTriangle className="size-12 text-amber-500" />
          <h1 className="text-xl font-bold">אופס! משהו השתבש</h1>
          <p className="text-sm text-muted-foreground">
            קרתה שגיאה לא צפויה. אפשר לנסות שוב או לחזור לדף הבית.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground/60">
              קוד: {error.digest}
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={reset} variant="default" size="sm" className="gap-2">
              <RotateCcw className="size-4" />
              נסה שוב
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/home">
                <Home className="size-4" />
                דף הבית
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
