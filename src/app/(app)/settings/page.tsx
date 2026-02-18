'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings, Volume2, Keyboard, Hand, Monitor, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { useSettingsStore } from '@/stores/settings-store'
import type { KeyboardLayout, ThemePreference } from '@/stores/settings-store'
import { themes } from '@/styles/themes'
import type { AgeName } from '@/types/theme'
import { cn } from '@/lib/utils'

const KEYBOARD_LAYOUTS: { value: KeyboardLayout; label: string; description: string }[] = [
  { value: 'standard', label: 'תקנית', description: 'פריסת מקלדת עברית תקנית' },
  { value: 'dvorak', label: 'דבורק', description: 'פריסת דבורק עברית' },
]

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Monitor }[] = [
  { value: 'system', label: 'אוטומטי (מערכת)', icon: Monitor },
  { value: 'light', label: 'בהיר', icon: Sun },
  { value: 'dark', label: 'כהה', icon: Moon },
]

export default function SettingsPage() {
  const { ageName, setAgeName } = useThemeStore()

  const {
    soundEnabled,
    soundVolume,
    showFingerGuide,
    showKeyboardColors,
    keyboardLayout,
    themePreference,
    toggleSound,
    setVolume,
    toggleFingerGuide,
    toggleKeyboardColors,
    setKeyboardLayout,
    setThemePreference,
  } = useSettingsStore()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-6" />
            הגדרות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme preference (system/light/dark) */}
          <div className="space-y-3">
            <Label>מראה</Label>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setThemePreference(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors',
                      themePreference === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                    aria-pressed={themePreference === option.value}
                  >
                    <Icon className="size-5" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Theme selector (age) */}
          <div className="space-y-3">
            <Label>ערכת נושא (גיל)</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setAgeName(theme.name as AgeName)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3 text-start transition-colors',
                    ageName === theme.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-xl">{theme.emoji}</span>
                  <div>
                    <div className="font-medium">{theme.label}</div>
                    <div className="text-xs text-muted-foreground">
                      גילאי {theme.ageRange[0]}-{theme.ageRange[1]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sound settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="size-5" />
            צלילים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">אפקטי קול</Label>
            <Switch
              id="sound-enabled"
              checked={soundEnabled}
              onCheckedChange={toggleSound}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-volume">עוצמת קול</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
            <input
              id="sound-volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={soundVolume}
              disabled={!soundEnabled}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-primary disabled:opacity-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lesson display settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Keyboard className="size-5" />
            תצוגת שיעור
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="finger-guide" className="flex items-center gap-2">
                <Hand className="size-4" />
                מדריך אצבעות
              </Label>
              <p className="text-xs text-muted-foreground">
                הצג דיאגרמת ידיים עם הדגשת האצבע הפעילה
              </p>
            </div>
            <Switch
              id="finger-guide"
              checked={showFingerGuide}
              onCheckedChange={toggleFingerGuide}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboard-colors">צבעי אזורי מקלדת</Label>
              <p className="text-xs text-muted-foreground">
                הצג אזורי אצבעות בצבעים על המקלדת הוויזואלית
              </p>
            </div>
            <Switch
              id="keyboard-colors"
              checked={showKeyboardColors}
              onCheckedChange={toggleKeyboardColors}
            />
          </div>

          {/* Keyboard layout preference */}
          <div className="space-y-3">
            <Label>פריסת מקלדת</Label>
            <div className="grid grid-cols-2 gap-2">
              {KEYBOARD_LAYOUTS.map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => setKeyboardLayout(layout.value)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border p-3 text-start transition-colors',
                    keyboardLayout === layout.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                  aria-pressed={keyboardLayout === layout.value}
                >
                  <span className="font-medium">{layout.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {layout.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
