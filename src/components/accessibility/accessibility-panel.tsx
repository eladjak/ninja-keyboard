'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accessibility,
  Eye,
  MonitorSmartphone,
  Keyboard,
  Type,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useAccessibilityStore,
  FONT_SIZE_VALUES,
  type FontSize,
} from '@/stores/accessibility-store'
import { useEffect, useRef } from 'react'

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'קטן' },
  { value: 'medium', label: 'בינוני' },
  { value: 'large', label: 'גדול' },
  { value: 'extra-large', label: 'גדול מאוד' },
]

function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  return mq.matches
}

export function AccessibilityPanel() {
  const {
    fontSize,
    highContrast,
    reducedMotion,
    screenReaderAnnouncements,
    keyboardOnlyMode,
    dyslexiaFont,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleScreenReaderAnnouncements,
    toggleKeyboardOnlyMode,
    toggleDyslexiaFont,
    resetAll,
  } = useAccessibilityStore()

  const liveRegionRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Sync reduced motion with system preference on mount
  useEffect(() => {
    if (prefersReducedMotion && !reducedMotion) {
      toggleReducedMotion()
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const announce = (message: string) => {
    if (screenReaderAnnouncements && liveRegionRef.current) {
      liveRegionRef.current.textContent = message
    }
  }

  const handleFontSizeChange = (value: string) => {
    const size = value as FontSize
    setFontSize(size)
    const label = FONT_SIZE_OPTIONS.find((o) => o.value === size)?.label ?? size
    announce(`גודל גופן שונה ל${label}`)
  }

  const handleToggleHighContrast = () => {
    toggleHighContrast()
    announce(highContrast ? 'ניגודיות גבוהה כובתה' : 'ניגודיות גבוהה הופעלה')
  }

  const handleToggleReducedMotion = () => {
    toggleReducedMotion()
    announce(reducedMotion ? 'הנפשות הופעלו' : 'הנפשות הופחתו')
  }

  const handleToggleScreenReader = () => {
    toggleScreenReaderAnnouncements()
    announce(
      screenReaderAnnouncements
        ? 'הכרזות קורא מסך כובו'
        : 'הכרזות קורא מסך הופעלו',
    )
  }

  const handleToggleKeyboardOnly = () => {
    toggleKeyboardOnlyMode()
    announce(
      keyboardOnlyMode
        ? 'מצב מקלדת בלבד כובה'
        : 'מצב מקלדת בלבד הופעל',
    )
  }

  const handleToggleDyslexiaFont = () => {
    toggleDyslexiaFont()
    announce(
      dyslexiaFont
        ? 'גופן ידידותי לדיסלקציה כובה'
        : 'גופן ידידותי לדיסלקציה הופעל',
    )
  }

  const handleReset = () => {
    resetAll()
    announce('כל ההגדרות אופסו לברירת מחדל')
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl space-y-6">
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="size-6" />
            הגדרות נגישות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="size-4 text-muted-foreground" />
              <Label htmlFor="font-size-select">גודל גופן</Label>
            </div>
            <div className="flex items-center gap-4">
              <Select value={fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger
                  id="font-size-select"
                  className="w-full"
                  aria-label="בחירת גודל גופן"
                >
                  <SelectValue placeholder="בחר גודל גופן" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({FONT_SIZE_VALUES[option.value]}px)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              שנה את גודל הטקסט בממשק
            </p>
          </div>

          <Separator />

          {/* High contrast */}
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-0.5">
              <Label
                htmlFor="high-contrast"
                className="flex items-center gap-2"
              >
                <Eye className="size-4 text-muted-foreground" />
                ניגודיות גבוהה
              </Label>
              <p className="text-xs text-muted-foreground">
                הגבר את הניגודיות בין הצבעים לשיפור הקריאות
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={handleToggleHighContrast}
              aria-label="הפעל ניגודיות גבוהה"
            />
          </div>

          <Separator />

          {/* Reduced motion */}
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-0.5">
              <Label
                htmlFor="reduced-motion"
                className="flex items-center gap-2"
              >
                <Sparkles className="size-4 text-muted-foreground" />
                הפחתת הנפשות
              </Label>
              <p className="text-xs text-muted-foreground">
                הפחת או בטל אנימציות ותנועות. מכבד את הגדרות המערכת.
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={handleToggleReducedMotion}
              aria-label="הפעל הפחתת הנפשות"
            />
          </div>

          <Separator />

          {/* Screen reader announcements */}
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-0.5">
              <Label
                htmlFor="screen-reader"
                className="flex items-center gap-2"
              >
                <MonitorSmartphone className="size-4 text-muted-foreground" />
                הכרזות קורא מסך
              </Label>
              <p className="text-xs text-muted-foreground">
                הפעל הודעות קוליות בעת שינוי הגדרות וביצוע פעולות
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={screenReaderAnnouncements}
              onCheckedChange={handleToggleScreenReader}
              aria-label="הפעל הכרזות קורא מסך"
            />
          </div>

          <Separator />

          {/* Keyboard-only mode */}
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-0.5">
              <Label
                htmlFor="keyboard-only"
                className="flex items-center gap-2"
              >
                <Keyboard className="size-4 text-muted-foreground" />
                מצב מקלדת בלבד
              </Label>
              <p className="text-xs text-muted-foreground">
                הצג את כל מחווני המיקוד לניווט מלא באמצעות מקלדת
              </p>
            </div>
            <Switch
              id="keyboard-only"
              checked={keyboardOnlyMode}
              onCheckedChange={handleToggleKeyboardOnly}
              aria-label="הפעל מצב מקלדת בלבד"
            />
          </div>

          <Separator />

          {/* Dyslexia-friendly font */}
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-0.5">
              <Label
                htmlFor="dyslexia-font"
                className="flex items-center gap-2"
              >
                <Type className="size-4 text-muted-foreground" />
                גופן ידידותי לדיסלקציה
              </Label>
              <p className="text-xs text-muted-foreground">
                השתמש בגופן שמקל על הקריאה עבור אנשים עם דיסלקציה
              </p>
            </div>
            <Switch
              id="dyslexia-font"
              checked={dyslexiaFont}
              onCheckedChange={handleToggleDyslexiaFont}
              aria-label="הפעל גופן ידידותי לדיסלקציה"
            />
          </div>

          <Separator />

          {/* Reset all */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
              aria-label="אפס את כל הגדרות הנגישות"
            >
              <RotateCcw className="size-4" />
              אפס הגדרות
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
