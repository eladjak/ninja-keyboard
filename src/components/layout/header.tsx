'use client'

import Link from 'next/link'
import { Moon, Sun, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme-store'

export function Header() {
  const { colorScheme, toggleDarkMode } = useThemeStore()
  const isDark = colorScheme === 'dark' || colorScheme === 'dark-high-contrast'

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-xl">🥷</span>
        <span className="font-bold text-primary">נינג&apos;ה מקלדת</span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
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
    </header>
  )
}
