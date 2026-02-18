'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Keyboard, Swords, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const tabs = [
  { href: '/home', label: 'בית', icon: Home },
  { href: '/lessons', label: 'שיעורים', icon: BookOpen },
  { href: '/practice', label: 'תרגול', icon: Keyboard },
  { href: '/battle', label: 'קרב', icon: Swords },
  { href: '/profile', label: 'פרופיל', icon: User },
]

export function BottomTabs() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around border-t bg-card md:hidden"
      aria-label="ניווט ראשי"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute -top-px inset-x-0 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="size-5" />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
