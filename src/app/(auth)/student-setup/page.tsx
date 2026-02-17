'use client'

import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { AvatarPicker } from '@/components/auth/avatar-picker'
import { createStudentProfile } from '@/lib/auth/actions'
import type { AvatarId } from '@/types/auth'

export default function StudentSetupPage() {
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId') ?? ''
  const className = searchParams.get('className') ?? ''

  const [step, setStep] = useState<1 | 2>(1)
  const [avatarId, setAvatarId] = useState<AvatarId>('fox')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleAvatarSelect = useCallback((id: AvatarId) => {
    setAvatarId(id)
  }, [])

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      setIsPending(true)
      setError(null)

      formData.set('avatarId', avatarId)
      formData.set('classId', classId)

      const result = await createStudentProfile(formData)
      setIsPending(false)

      if (result?.error) {
        setError(result.error)
      }
    },
    [avatarId, classId]
  )

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{'\u05D1\u05D7\u05E8 \u05D0\u05EA \u05D4\u05D3\u05DE\u05D5\u05EA \u05E9\u05DC\u05DA'}</CardTitle>
        <CardDescription>
          {className
            ? `\u05DE\u05E6\u05D8\u05E8\u05E3 \u05DC\u05DB\u05D9\u05EA\u05D4: ${className}`
            : '\u05E6\u05D5\u05E8 \u05D0\u05EA \u05D4\u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05E9\u05DC\u05DA'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <AvatarPicker onSelect={handleAvatarSelect} defaultValue={avatarId} />
            <Button onClick={() => setStep(2)} className="w-full">
              {'\u05D4\u05DE\u05E9\u05DA'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">{'\u05D0\u05D9\u05DA \u05E7\u05D5\u05E8\u05D0\u05D9\u05DD \u05DC\u05DA?'}</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                required
                placeholder={'\u05D4\u05E9\u05DD \u05E9\u05DC\u05DA'}
                autoComplete="given-name"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                {'\u05D7\u05D6\u05E8\u05D4'}
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? '\u05E0\u05DB\u05E0\u05E1...' : '\u05D9\u05D0\u05DC\u05DC\u05D4!'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
