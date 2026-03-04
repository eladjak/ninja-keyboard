'use client'

import Link from 'next/link'
import { Moon, Sun, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme-store'
import { useXpStore } from '@/stores/xp-store'

export function Header() {
  const { colorScheme, toggleDarkMode } = useThemeStore()
  const isDark = colorScheme === 'dark' || colorScheme === 'dark-high-contrast'
  const { level, totalXp } = useXpStore()

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
      {/* Gradient accent line */}
      <div className="h-0.5 ninja-gradient" />

      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg ninja-gradient">
            <span className="text-base leading-none">🥷</span>
          </div>
          <span className="font-bold text-foreground">נינג&apos;ה מקלדת</span>
        </div>

        {/* Desktop: XP indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 badge-pulse">
            <Zap className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{totalXp} XP</span>
            <span className="text-[10px] text-muted-foreground">רמה {level}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile XP badge */}
          <div className="flex md:hidden items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 me-1 badge-pulse">
            <Zap className="size-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">{totalXp}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="הגדרות"
          >
            <Link href="/settings">
              <Settings className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label={isDark ? 'מצב בהיר' : 'מצב כהה'}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
