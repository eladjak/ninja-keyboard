'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerParent } from '@/lib/auth/actions'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string

      if (password !== confirmPassword) {
        return { error: '\u05D4\u05E1\u05D9\u05E1\u05DE\u05D0\u05D5\u05EA \u05DC\u05D0 \u05EA\u05D5\u05D0\u05DE\u05D5\u05EA' }
      }

      if (password.length < 6) {
        return { error: '\u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05DB\u05D9\u05DC \u05DC\u05E4\u05D7\u05D5\u05EA 6 \u05EA\u05D5\u05D5\u05D9\u05DD' }
      }

      return registerParent(formData)
    },
    undefined
  )

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{'\u05D4\u05E8\u05E9\u05DE\u05D4'}</CardTitle>
        <CardDescription>
          {'\u05E6\u05D5\u05E8 \u05D7\u05E9\u05D1\u05D5\u05DF \u05D7\u05D3\u05E9 \u05DC\u05D4\u05D5\u05E8\u05D4'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">{'\u05E9\u05DD \u05DE\u05DC\u05D0'}</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              required
              autoComplete="name"
            />
          </div>

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
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">{'\u05D0\u05D9\u05DE\u05D5\u05EA \u05E1\u05D9\u05E1\u05DE\u05D4'}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              dir="ltr"
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          {state?.error && (
            <p className="text-destructive text-sm">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? '\u05E0\u05E8\u05E9\u05DD...' : '\u05D4\u05D9\u05E8\u05E9\u05DD'}
          </Button>

          <p className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              {'\u05DB\u05D1\u05E8 \u05D9\u05E9 \u05DC\u05DA \u05D7\u05E9\u05D1\u05D5\u05DF? \u05D4\u05D9\u05DB\u05E0\u05E1'}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
