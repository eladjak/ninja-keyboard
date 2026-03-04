'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Keyboard, Swords, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { soundManager } from '@/lib/audio/sound-manager'
import { useSettingsStore } from '@/stores/settings-store'

const tabs = [
  { href: '/home', label: 'בית', icon: Home },
  { href: '/lessons', label: 'שיעורים', icon: BookOpen },
  { href: '/practice', label: 'תרגול', icon: Keyboard },
  { href: '/battle', label: 'קרב', icon: Swords },
  { href: '/profile', label: 'פרופיל', icon: User },
]

interface TabLinkProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}

function TabLink({ href, label, icon: Icon, isActive }: TabLinkProps) {
  const { soundEnabled } = useSettingsStore()

  function handleClick() {
    if (soundEnabled && !isActive) {
      soundManager.playNavigate()
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="active-tab"
          className="absolute -top-[5px] inset-x-1 h-1 rounded-full ninja-gradient"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Icon className={cn('size-5', isActive && 'text-primary')} />
      </motion.div>
      <span className={cn('font-medium', isActive && 'font-semibold')}>{label}</span>
    </Link>
  )
}

export function BottomTabs() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t bg-card/85 backdrop-blur-md md:hidden"
      aria-label="ניווט ראשי"
    >
      {/* Top gradient accent */}
      <div className="h-px ninja-gradient opacity-50" />

      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <TabLink
              key={tab.href}
              href={tab.href}
              label={tab.label}
              icon={tab.icon}
              isActive={isActive}
            />
          )
        })}
      </div>
    </nav>
  )
}
