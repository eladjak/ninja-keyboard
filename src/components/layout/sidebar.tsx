'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Keyboard,
  Timer,
  Swords,
  Gamepad2,
  Command,
  Trophy,
  Award,
  BarChart3,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Flame,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useXpStore } from '@/stores/xp-store'

const navGroups = [
  {
    label: 'למידה',
    items: [
      { href: '/home', label: 'בית', icon: Home },
      { href: '/lessons', label: 'שיעורים', icon: BookOpen },
      { href: '/practice', label: 'תרגול חופשי', icon: Keyboard },
      { href: '/speed-test', label: 'מבחן מהירות', icon: Timer },
    ],
  },
  {
    label: 'משחק',
    items: [
      { href: '/battle', label: 'זירת קרב', icon: Swords },
      { href: '/games', label: 'משחקים', icon: Gamepad2 },
      { href: '/shortcuts', label: 'קיצורי מקלדת', icon: Command },
    ],
  },
  {
    label: 'הישגים',
    items: [
      { href: '/leaderboard', label: 'טבלת מובילים', icon: Trophy },
      { href: '/certificates', label: 'תעודות', icon: Award },
      { href: '/statistics', label: 'סטטיסטיקות', icon: BarChart3 },
    ],
  },
  {
    label: 'אישי',
    items: [
      { href: '/profile', label: 'פרופיל', icon: User },
      { href: '/settings', label: 'הגדרות', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { level, streak, totalXp, levelProgress } = useXpStore()
  const progress = levelProgress()

  return (
    <aside className="hidden md:flex md:w-[280px] md:flex-col border-ie border-[oklch(0.25_0.04_292)] h-dvh sticky top-0 bg-[#080618]">
      {/* Brand Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <Image src="/images/characters/ki-mascot.jpg" alt="Ki" width={44} height={44} className="rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-foreground" style={{ textShadow: '0 0 10px oklch(0.72 0.15 292 / 40%)' }}>נינג&apos;ה מקלדת</h1>
            <p className="text-xs text-muted-foreground">אימון הקלדה בעברית</p>
          </div>
        </div>

        {/* XP & Level Bar */}
        <div className="mt-4 rounded-lg border border-[oklch(0.25_0.04_292)] bg-[#0c0a20] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-primary" />
              <span className="font-semibold">רמה {level}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-orange-500" />
              <span className="font-medium">{streak} ימים</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[#1a1530] overflow-hidden">
            <div
              className="h-full rounded-full ninja-gradient xp-bar-shimmer transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-xs text-muted-foreground">
            {totalXp} XP
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4" aria-label="ניווט ראשי">
        {navGroups.map((group) => (
          <div key={group.label}>
            <span className="mb-1 block px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70" style={{ textShadow: '0 0 8px oklch(0.72 0.15 292 / 25%)' }}>
              {group.label}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 hover:translate-x-0.5',
                      isActive
                        ? 'bg-primary/15 border-s-2 border-primary text-primary shadow-[inset_0_0_12px_oklch(0.72_0.15_292_/_10%)]'
                        : 'text-muted-foreground hover:bg-[oklch(0.72_0.15_292_/_0.06)] hover:text-accent-foreground'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn('size-[18px]', isActive && 'text-primary')} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 pt-0">
        <div className="rounded-lg border border-[oklch(0.25_0.04_292)] p-2">
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" type="submit">
              <LogOut className="size-4" />
              <span className="text-sm">התנתק</span>
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
