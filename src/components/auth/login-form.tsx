'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginWithEmail, loginWithGoogle } from '@/lib/auth/actions'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return loginWithEmail(formData)
    },
    undefined
  )

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{'\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC'}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            dir="ltr"
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{'\u05E1\u05D9\u05E1\u05DE\u05D4'}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            dir="ltr"
            autoComplete="current-password"
          />
        </div>

        {state?.error && (
          <p className="text-destructive text-sm">{state.error}</p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? '\u05DE\u05EA\u05D7\u05D1\u05E8...' : '\u05DB\u05E0\u05D9\u05E1\u05D4'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            {'\u05D0\u05D5'}
          </span>
        </div>
      </div>

      <form action={async () => { await loginWithGoogle() }}>
        <Button type="submit" variant="outline" className="w-full gap-2">
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {'\u05DB\u05E0\u05D9\u05E1\u05D4 \u05E2\u05DD Google'}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href="/register" className="text-primary hover:underline">
          {'\u05D0\u05D9\u05DF \u05DC\u05DA \u05D7\u05E9\u05D1\u05D5\u05DF? \u05D4\u05D9\u05E8\u05E9\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5'}
        </Link>
        <Link href="/join" className="text-primary hover:underline">
          {'\u05D9\u05E9 \u05DC\u05D9 \u05E7\u05D5\u05D3 \u05DB\u05D9\u05EA\u05D4'}
        </Link>
      </div>
    </div>
  )
}
