'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Moon, Sun, Settings, Zap, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme-store'
import { useXpStore } from '@/stores/xp-store'
import { useClickSound, useNavigateSound } from '@/hooks/use-sound-effect'
import { useCoinBalance } from '@/hooks/use-coin-balance'
import { AnimatedWordmark } from '@/components/layout/animated-wordmark'
import { useHydrated } from '@/hooks/use-hydrated'
import { accentColorFor, DEFAULT_ACCENT_ID } from '@/lib/gamification/coins'

export function Header() {
  // Persisted stores (theme/xp/coins) render their defaults during SSR; hold
  // those defaults through the first client render so hydration matches, then
  // switch to the rehydrated values after mount.
  const hydrated = useHydrated()
  const { colorScheme, toggleDarkMode } = useThemeStore()
  const isDark =
    hydrated &&
    (colorScheme === 'dark' || colorScheme === 'dark-high-contrast')
  const xp = useXpStore()
  const level = hydrated ? xp.level : 1
  const totalXp = hydrated ? xp.totalXp : 0
  const coins = useCoinBalance()
  const balance = hydrated ? coins.balance : 0
  const accentColor = hydrated
    ? coins.accentColor
    : accentColorFor(DEFAULT_ACCENT_ID)
  const playClick = useClickSound()
  const playNavigate = useNavigateSound()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--game-border)] bg-[var(--game-bg-primary)]/90 backdrop-blur-md">
      {/* Gradient accent line — tinted by the equipped accent */}
      <div
        className="h-0.5"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, var(--game-secondary, #00B894))`,
        }}
      />

      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Mobile brand — mascot pop + letter bounce (logo-animation-pattern.md) */}
        <div className="ninja-brand flex items-center gap-2 md:hidden">
          <Image
            src="/images/characters/ki-mascot.jpg"
            alt="Ki"
            width={32}
            height={32}
            className="logo-mascot-anim rounded-lg"
          />
          <span className="font-bold text-foreground">
            <AnimatedWordmark />
          </span>
        </div>

        {/* Desktop: XP + coins indicators */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className="game-stat-badge badge-pulse"
            style={{ borderColor: `${accentColor}55` }}
          >
            <Zap className="size-3.5" style={{ color: accentColor }} />
            <span className="text-xs font-semibold" style={{ color: accentColor }}>
              {totalXp} XP
            </span>
            <span className="text-[10px] text-muted-foreground">רמה {level}</span>
          </div>
          <Link
            href="/shop"
            onClick={playNavigate}
            className="game-stat-badge transition-opacity hover:opacity-80"
            aria-label={`${balance} מטבעות — לחנות`}
            title="מטבעות נינ׳ה — לחנות"
          >
            <Coins className="size-3.5 text-[#F5B301]" />
            <span className="text-xs font-semibold tabular-nums text-[#F5B301]">{balance}</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile coin badge */}
          <Link
            href="/shop"
            onClick={playNavigate}
            className="game-stat-badge me-0.5 md:hidden transition-opacity hover:opacity-80"
            aria-label={`${balance} מטבעות — לחנות`}
          >
            <Coins className="size-3 text-[#F5B301]" />
            <span className="text-[10px] font-semibold tabular-nums text-[#F5B301]">{balance}</span>
          </Link>
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
