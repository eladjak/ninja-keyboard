'use client'

import Image from 'next/image'
import { Keyboard } from 'lucide-react'
import { SHORTCUT_LESSONS } from '@/lib/content/shortcuts'
import { ShortcutsClient } from './shortcuts-client'
import { CharacterIdleWrapper } from '@/components/characters/character-idle-wrapper'

export default function ShortcutsPage() {
  return (
    <div className="relative mx-auto max-w-3xl space-y-6 p-4">
      <Image src="/images/backgrounds/cyber-lab-bg.jpg" alt="" fill className="object-cover opacity-10 pointer-events-none fixed inset-0 -z-10" />
      <div className="flex items-center gap-3">
        <Keyboard className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">קיצורי מקלדת</h1>
          <p className="text-sm text-muted-foreground">
            למדו 40+ קיצורים חיוניים ל-Windows - מבסיסי ועד מתקדם
          </p>
        </div>
      </div>

      {/* Mika companion character */}
      <div className="flex justify-center">
        <CharacterIdleWrapper character="mika" intensity="energetic" entryAnimation>
          <Image
            src="/images/characters/heroes/mika-hero.jpg"
            alt="מיקה - מומחית קיצורי המקלדת"
            width={220}
            height={220}
            className="rounded-2xl object-cover drop-shadow-[0_0_28px_rgba(255,107,107,0.5)]"
          />
        </CharacterIdleWrapper>
      </div>

      <ShortcutsClient lessons={SHORTCUT_LESSONS} />
    </div>
  )
}
