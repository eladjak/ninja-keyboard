'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Laptop, Sparkles, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useTouchDevice } from '@/hooks/use-touch-device'
import { useConsentStore } from '@/stores/consent-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { getThemeForAge } from '@/styles/themes'
import type { AgeName } from '@/types/theme'

type OnboardingStep = 'intro' | 'name' | 'age'

export interface GuestOnboardingResult {
  playerName: string
  studentAge: number
  ageName: AgeName
}

interface GuestOnboardingProps {
  onComplete: (result: GuestOnboardingResult) => void
}

const STEPS: OnboardingStep[] = ['intro', 'name', 'age']
const AGES = Array.from({ length: 11 }, (_, index) => index + 6)

export function GuestOnboarding({ onComplete }: GuestOnboardingProps) {
  const reduceMotion = useReducedMotion()
  const isTouch = useTouchDevice()
  const savedName = useSettingsStore((state) => state.playerName)
  const savedAge = useConsentStore((state) => state.studentAge)
  const setAgeName = useThemeStore((state) => state.setAgeName)

  const [step, setStep] = useState<OnboardingStep>('intro')
  const [playerName, setPlayerName] = useState(savedName)
  const [studentAge, setStudentAge] = useState<number | null>(
    savedAge && savedAge >= 6 && savedAge <= 16 ? savedAge : null,
  )

  const stepIndex = STEPS.indexOf(step)
  const selectedTheme = useMemo(
    () => (studentAge === null ? null : getThemeForAge(studentAge)),
    [studentAge],
  )
  const trimmedName = playerName.trim()

  const selectAge = (age: number) => {
    const theme = getThemeForAge(age)
    setStudentAge(age)
    // Apply the preview immediately; Zustand persist keeps the chosen age theme.
    setAgeName(theme.name)
  }

  const finish = () => {
    if (!trimmedName || studentAge === null || !selectedTheme) return
    onComplete({
      playerName: trimmedName,
      studentAge,
      ageName: selectedTheme.name,
    })
  }

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.18 }

  return (
    <div
      className="mx-auto flex min-h-[calc(100dvh-10rem)] w-full max-w-2xl items-center px-2 py-6"
      dir="rtl"
    >
      <Card className="w-full overflow-hidden rounded-3xl shadow-lg">
        <CardHeader className="space-y-4 bg-primary/5 text-center">
          <div
            className="flex items-center justify-center gap-2"
            role="progressbar"
            aria-label={`שלב ${stepIndex + 1} מתוך ${STEPS.length}`}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={stepIndex + 1}
          >
            {STEPS.map((item, index) => (
              <span
                key={item}
                className={`h-2.5 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none ${
                  index === stepIndex
                    ? 'w-8 bg-primary'
                    : index < stepIndex
                      ? 'w-2.5 bg-primary/60'
                      : 'w-2.5 bg-muted'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-muted-foreground text-xs tabular-nums">
            שלב {stepIndex + 1} מתוך {STEPS.length}
          </p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <AnimatePresence initial={false} mode="wait">
            <motion.section
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={transition}
              className="space-y-6"
            >
              {step === 'intro' && (
                <>
                  <div className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-primary/10 shadow-sm">
                    <span className="text-5xl" aria-hidden="true">
                      🥷
                    </span>
                  </div>
                  <div className="space-y-3 text-center">
                    <CardTitle className="text-balance text-3xl">
                      ברוכים הבאים לנינג׳ה מקלדת
                    </CardTitle>
                    <p className="text-muted-foreground text-pretty text-lg leading-relaxed">
                      נכיר אותך בקצרה, נמצא את הרמה שמתאימה לך, ונצא ישר לשיעור
                      הראשון.
                    </p>
                  </div>
                  <div className="bg-muted/50 flex items-center gap-3 rounded-2xl p-4 text-start">
                    {isTouch ? (
                      <Tablet
                        className="size-6 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    ) : (
                      <Laptop
                        className="size-6 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <p className="font-semibold">
                        {isTouch
                          ? 'זיהינו מסך מגע'
                          : 'זיהינו מחשב עם מקלדת'}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        אפשר להשתמש גם במקלדת שעל המסך וגם במקלדת פיזית.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-11 w-full text-base transition-transform active:scale-[0.96] motion-reduce:transform-none"
                    onClick={() => setStep('name')}
                  >
                    מתחילים
                    <ArrowLeft aria-hidden="true" />
                  </Button>
                </>
              )}

              {step === 'name' && (
                <form
                  className="space-y-6"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (trimmedName) setStep('age')
                  }}
                >
                  <div className="space-y-2 text-center">
                    <CardTitle className="text-balance text-3xl">
                      איך קוראים לך?
                    </CardTitle>
                    <p className="text-muted-foreground text-pretty">
                      השם נשמר רק במכשיר הזה ומשמש לברכות ולהישגים.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-player-name" className="text-base">
                      השם שלך
                    </Label>
                    <Input
                      id="guest-player-name"
                      name="playerName"
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value)}
                      maxLength={30}
                      autoComplete="given-name"
                      autoFocus
                      className="h-12 text-lg"
                      placeholder="למשל: נועה"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="min-h-11 flex-1 transition-transform active:scale-[0.96] motion-reduce:transform-none"
                      onClick={() => setStep('intro')}
                    >
                      <ArrowRight aria-hidden="true" />
                      חזרה
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="min-h-11 flex-1 transition-transform active:scale-[0.96] motion-reduce:transform-none"
                      disabled={!trimmedName}
                    >
                      ממשיכים
                      <ArrowLeft aria-hidden="true" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 'age' && (
                <>
                  <div className="space-y-2 text-center">
                    <CardTitle className="text-balance text-3xl">
                      בני כמה אתם?
                    </CardTitle>
                    <p className="text-muted-foreground text-pretty">
                      נתאים את גודל הכפתורים, הקצב והעיצוב לגיל.
                    </p>
                  </div>
                  <div
                    className="grid grid-cols-4 gap-2 sm:grid-cols-6"
                    aria-label="בחירת גיל"
                  >
                    {AGES.map((age) => (
                      <button
                        key={age}
                        type="button"
                        aria-pressed={studentAge === age}
                        className={`min-h-11 rounded-xl px-3 py-2 text-lg font-bold tabular-nums shadow-sm transition-[box-shadow,background-color,color,scale] duration-150 active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none ${
                          studentAge === age
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                            : 'bg-card text-foreground ring-1 ring-border hover:bg-accent'
                        }`}
                        onClick={() => selectAge(age)}
                      >
                        {age}
                      </button>
                    ))}
                  </div>

                  {selectedTheme && studentAge !== null && (
                    <motion.div
                      key={selectedTheme.name}
                      data-testid="selected-age-theme"
                      data-theme-preview={selectedTheme.name}
                      initial={
                        reduceMotion ? false : { opacity: 0, scale: 0.96 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      transition={transition}
                      className="bg-primary/10 flex items-center gap-4 rounded-2xl p-4 shadow-sm"
                    >
                      <span className="text-4xl" aria-hidden="true">
                        {selectedTheme.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold">ערכת {selectedTheme.label}</p>
                        <p className="text-muted-foreground text-sm">
                          הותאמה לגיל {studentAge}. תמיד אפשר לשנות בהגדרות.
                        </p>
                      </div>
                      <Sparkles
                        className="me-auto size-5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="min-h-11 flex-1 transition-transform active:scale-[0.96] motion-reduce:transform-none"
                      onClick={() => setStep('name')}
                    >
                      <ArrowRight aria-hidden="true" />
                      חזרה
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      className="min-h-11 flex-1 transition-transform active:scale-[0.96] motion-reduce:transform-none"
                      disabled={studentAge === null}
                      onClick={finish}
                    >
                      למבחן המיקום
                      <ArrowLeft aria-hidden="true" />
                    </Button>
                  </div>
                </>
              )}
            </motion.section>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
