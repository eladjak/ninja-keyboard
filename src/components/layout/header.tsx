'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Moon, Sun, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme-store'
import { useXpStore } from '@/stores/xp-store'
import { useClickSound, useNavigateSound } from '@/hooks/use-sound-effect'

export function Header() {
  const { colorScheme, toggleDarkMode } = useThemeStore()
  const isDark = colorScheme === 'dark' || colorScheme === 'dark-high-contrast'
  const { level, totalXp } = useXpStore()
  const playClick = useClickSound()
  const playNavigate = useNavigateSound()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--game-border)] bg-[var(--game-bg-primary)]/90 backdrop-blur-md">
      {/* Gradient accent line */}
      <div className="h-0.5 ninja-gradient" />

      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 md:hidden">
          <Image
            src="/images/characters/ki-mascot.jpg"
            alt="Ki"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-foreground">נינג&apos;ה מקלדת</span>
        </div>

        {/* Desktop: XP indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className="game-stat-badge badge-pulse">
            <Zap className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{totalXp} XP</span>
            <span className="text-[10px] text-muted-foreground">רמה {level}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile XP badge */}
          <div className="game-stat-badge me-1 md:hidden badge-pulse">
            <Zap className="size-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">{totalXp}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="הגדרות"
          >
            <Link href="/settings" onClick={playNavigate}>
              <Settings className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { playClick(); toggleDarkMode() }}
            aria-label={isDark ? 'מצב בהיר' : 'מצב כהה'}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
