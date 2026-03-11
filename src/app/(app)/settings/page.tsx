'use client'

import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings, Volume2, Music, Keyboard, Hand, Monitor, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useMusicStore } from '@/stores/music-store'
import type { KeyboardLayout, ThemePreference } from '@/stores/settings-store'
import { themes } from '@/styles/themes'
import type { AgeName } from '@/types/theme'
import { cn } from '@/lib/utils'
import { useClickSound } from '@/hooks/use-sound-effect'

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
  const playClick = useClickSound()

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

  const musicEnabled = useMusicStore((s) => s.musicEnabled)
  const musicVolume = useMusicStore((s) => s.musicVolume)
  const musicMuted = useMusicStore((s) => s.musicMuted)
  const toggleMusicEnabled = useMusicStore((s) => s.toggleMusicEnabled)
  const setMusicVolume = useMusicStore((s) => s.setMusicVolume)
  const toggleMusicMute = useMusicStore((s) => s.toggleMusicMute)

  const gameCardStyle = { borderColor: 'oklch(0.495 0.205 292 / 30%)' }
  const selectedBtnStyle = {
    borderColor: 'oklch(0.495 0.205 292 / 60%)',
    background: 'oklch(0.495 0.205 292 / 15%)',
    color: 'var(--game-accent-purple)',
  }
  const unselectedBtnStyle = {
    borderColor: 'var(--game-border)',
    background: 'transparent',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4">
      {/* Page header */}
      <div className="game-card-border flex items-center gap-3 p-4" style={gameCardStyle}>
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: 'oklch(0.495 0.205 292 / 20%)', boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)' }}
        >
          <Settings className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
        </div>
        <h1 className="text-2xl font-bold text-glow">הגדרות</h1>
      </div>

      {/* Appearance section */}
      <div className="game-card-border space-y-5 p-5" style={gameCardStyle}>
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--game-border)' }}>
          <Monitor className="size-4" style={{ color: 'var(--game-accent-purple)' }} />
          <h2 className="game-section-title text-sm">מראה</h2>
        </div>

        {/* Theme preference (system/light/dark) */}
        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">ערכת צבעים</Label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              const isActive = themePreference === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => { playClick(); setThemePreference(option.value) }}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-sm transition-all"
                  style={isActive ? selectedBtnStyle : { ...unselectedBtnStyle, border: '1.5px solid var(--game-border)' }}
                  aria-pressed={isActive}
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
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">ערכת נושא (גיל)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {themes.map((theme) => {
              const isActive = ageName === theme.name
              return (
                <button
                  key={theme.name}
                  onClick={() => { playClick(); setAgeName(theme.name as AgeName) }}
                  className="flex items-center gap-2 rounded-xl p-3 text-start transition-all"
                  style={isActive ? { ...selectedBtnStyle, border: '1.5px solid oklch(0.495 0.205 292 / 60%)' } : { border: '1.5px solid var(--game-border)', background: 'transparent' }}
                >
                  <span className="text-xl">{theme.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{theme.label}</div>
                    <div className="text-xs text-muted-foreground">
                      גילאי {theme.ageRange[0]}-{theme.ageRange[1]}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sound settings */}
      <div className="game-card-border space-y-5 p-5" style={{ borderColor: 'oklch(0.672 0.148 168 / 30%)' }}>
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--game-border)' }}>
          <Volume2 className="size-4" style={{ color: 'var(--game-accent-green)' }} />
          <h2 className="game-section-title text-sm">צלילים</h2>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled" className="font-medium">אפקטי קול</Label>
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={toggleSound}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-volume" className="text-sm text-muted-foreground">עוצמת קול</Label>
            <span
              className="game-stat-badge tabular-nums"
              style={{ borderColor: 'oklch(0.672 0.148 168 / 30%)' }}
            >
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
      </div>

      {/* Music settings */}
      <div className="game-card-border space-y-5 p-5" style={{ borderColor: 'oklch(0.55 0.2 292 / 30%)' }}>
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--game-border)' }}>
          <Music className="size-4" style={{ color: 'var(--game-accent-purple)' }} />
          <h2 className="game-section-title text-sm">מוזיקה</h2>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="music-enabled" className="font-medium">מוזיקת רקע</Label>
          <Switch
            id="music-enabled"
            checked={musicEnabled}
            onCheckedChange={() => { playClick(); toggleMusicEnabled() }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="music-muted" className="font-medium">השתק מוזיקה</Label>
          <Switch
            id="music-muted"
            checked={musicMuted}
            onCheckedChange={() => { playClick(); toggleMusicMute() }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="music-volume" className="text-sm text-muted-foreground">עוצמת מוזיקה</Label>
            <span className="game-stat-badge tabular-nums">
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
          <input
            id="music-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={musicVolume}
            disabled={!musicEnabled || musicMuted}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            className="w-full accent-primary disabled:opacity-40"
          />
        </div>

        <Link
          href="/jukebox"
          className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: 'var(--game-accent-purple)' }}
        >
          <Music className="size-4" />
          {"פתח את הג'וקבוקס"}
        </Link>
      </div>

      {/* Lesson display settings */}
      <div className="game-card-border space-y-5 p-5" style={{ borderColor: 'oklch(0.495 0.205 292 / 30%)' }}>
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--game-border)' }}>
          <Keyboard className="size-4" style={{ color: 'var(--game-accent-purple)' }} />
          <h2 className="game-section-title text-sm">תצוגת שיעור</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="finger-guide" className="flex items-center gap-2 font-medium">
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
            onCheckedChange={() => { playClick(); toggleFingerGuide() }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="keyboard-colors" className="font-medium">צבעי אזורי מקלדת</Label>
            <p className="text-xs text-muted-foreground">
              הצג אזורי אצבעות בצבעים על המקלדת הוויזואלית
            </p>
          </div>
          <Switch
            id="keyboard-colors"
            checked={showKeyboardColors}
            onCheckedChange={() => { playClick(); toggleKeyboardColors() }}
          />
        </div>

        {/* Keyboard layout preference */}
        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">פריסת מקלדת</Label>
          <div className="grid grid-cols-2 gap-2">
            {KEYBOARD_LAYOUTS.map((layout) => {
              const isActive = keyboardLayout === layout.value
              return (
                <button
                  key={layout.value}
                  onClick={() => { playClick(); setKeyboardLayout(layout.value) }}
                  className="flex flex-col items-start rounded-xl p-3 text-start transition-all"
                  style={isActive ? { ...selectedBtnStyle, border: '1.5px solid oklch(0.495 0.205 292 / 60%)' } : { border: '1.5px solid var(--game-border)', background: 'transparent' }}
                  aria-pressed={isActive}
                >
                  <span className="font-medium">{layout.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {layout.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
