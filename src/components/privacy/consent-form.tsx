'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useConsentStore } from '@/stores/consent-store'
import type { ConsentType } from '@/lib/privacy/consent-manager'

interface ConsentOption {
  type: ConsentType
  label: string
  description: string
  required: boolean
}

const CONSENT_OPTIONS: ConsentOption[] = [
  {
    type: 'data_collection',
    label: 'איסוף נתוני התקדמות',
    description: 'WPM, דיוק, שיעורים שהושלמו',
    required: true,
  },
  {
    type: 'analytics',
    label: 'ניתוח סטטיסטי אנונימי',
    description: 'נתונים אנונימיים לשיפור האפליקציה',
    required: false,
  },
  {
    type: 'progress_sharing',
    label: 'שיתוף התקדמות עם המורה',
    description: 'המורה יוכל לעקוב אחר התקדמות הילד/ה',
    required: false,
  },
  {
    type: 'teacher_view',
    label: 'צפייה בנתונים על ידי המורה',
    description: 'המורה יוכל לצפות בנתוני הסשנים',
    required: false,
  },
]

interface ConsentFormProps {
  onComplete?: () => void
}

export function ConsentForm({ onComplete }: ConsentFormProps) {
  const { grantConsent } = useConsentStore()

  const initialChecked = Object.fromEntries(
    CONSENT_OPTIONS.map((o) => [o.type, o.required]),
  ) as Record<ConsentType, boolean>

  const [checked, setChecked] = useState<Record<ConsentType, boolean>>(initialChecked)
  const [parentEmail, setParentEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const requiredAllChecked = CONSENT_OPTIONS.filter((o) => o.required).every(
    (o) => checked[o.type],
  )
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)
  const canSubmit = requiredAllChecked && emailValid

  function toggleType(type: ConsentType) {
    setChecked((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  function handleSubmit() {
    if (!canSubmit) return
    const grantedTypes = (Object.keys(checked) as ConsentType[]).filter(
      (k) => checked[k],
    )
    grantConsent(grantedTypes, parentEmail, 'parent')
    setSubmitted(true)
    onComplete?.()
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-lg" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Lock className="size-5" aria-hidden="true" />
            תודה! ההסכמה נרשמה
          </CardTitle>
          <CardDescription>
            ניתן לשנות את ההסכמה בכל עת מדף ההגדרות.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-lg" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-5 text-primary" aria-hidden="true" />
          הסכמת הורים
        </CardTitle>
        <CardDescription>
          כדי שהילד/ה יוכל/ה ללמוד הקלדה, אנחנו צריכים את הסכמתך.
          הנתונים מאובטחים ולא נמכרים לצדדים שלישיים.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Consent checkboxes */}
        <fieldset>
          <legend className="mb-3 font-semibold text-sm">מה אנחנו מבקשים לאסוף:</legend>
          <div className="space-y-4">
            {CONSENT_OPTIONS.map((option) => (
              <div
                key={option.type}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <Label
                    htmlFor={`consent-${option.type}`}
                    className="font-medium cursor-pointer"
                  >
                    {option.label}
                    {option.required && (
                      <span className="text-destructive me-1" aria-label="שדה חובה">
                        {' *'}
                      </span>
                    )}
                  </Label>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {option.description}
                  </p>
                </div>
                <Switch
                  id={`consent-${option.type}`}
                  checked={checked[option.type]}
                  onCheckedChange={() => toggleType(option.type)}
                  aria-label={option.label}
                />
              </div>
            ))}
          </div>
        </fieldset>

        {/* What we do NOT collect */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-2 font-semibold text-sm">מה אנחנו לא אוספים:</p>
          <ul className="text-muted-foreground space-y-1 text-sm list-none">
            <li>✗ כתובת IP או מיקום</li>
            <li>✗ הקלטות קול או וידאו</li>
            <li>✗ שם משפחה</li>
            <li>✗ נתוני בריאות או ביומטריה</li>
            <li>✗ פרטי תשלום</li>
          </ul>
        </div>

        {/* Parent email for verification */}
        <div className="space-y-2">
          <Label htmlFor="parent-email">אימייל להורה / אפוטרופוס (לאימות)</Label>
          <Input
            id="parent-email"
            type="email"
            placeholder="parent@example.com"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            dir="ltr"
            aria-required="true"
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          אני מאשר/ת את ההסכמה
        </Button>

        <p className="text-muted-foreground text-xs text-center">
          בלחיצה על הכפתור אתה/את מאשר/ת שקראת והסכמת ל
          <a
            href="/privacy-policy"
            className="underline underline-offset-2 text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            מדיניות הפרטיות
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  )
}
