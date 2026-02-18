'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Keyboard,
  Timer,
  Swords,
  Command,
  Trophy,
  BarChart3,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/home', label: 'בית', icon: Home },
  { href: '/lessons', label: 'שיעורים', icon: BookOpen },
  { href: '/practice', label: 'תרגול חופשי', icon: Keyboard },
  { href: '/speed-test', label: 'מבחן מהירות', icon: Timer },
  { href: '/battle', label: 'זירת קרב', icon: Swords },
  { href: '/shortcuts', label: 'קיצורי מקלדת', icon: Command },
  { href: '/leaderboard', label: 'טבלת מובילים', icon: Trophy },
  { href: '/statistics', label: 'סטטיסטיקות', icon: BarChart3 },
  { href: '/profile', label: 'פרופיל', icon: User },
  { href: '/settings', label: 'הגדרות', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-[280px] md:flex-col border-ie bg-card h-dvh sticky top-0">
      <div className="flex items-center gap-2 p-6">
        <span className="text-2xl">🥷</span>
        <h1 className="text-lg font-bold text-primary">נינג&apos;ה מקלדת</h1>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1" aria-label="ניווט ראשי">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <Separator className="mb-4" />
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" className="w-full justify-start gap-3" type="submit">
            <LogOut className="size-5" />
            התנתק
          </Button>
        </form>
      </div>
    </aside>
  )
}
