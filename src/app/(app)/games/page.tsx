'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Gamepad2, CloudRain, Swords, Sword, Brain } from 'lucide-react'
import { GameCard } from '@/components/ui/game-card'

const GAMES = [
  {
    id: 'word-rain',
    href: '/games/word-rain',
    nameHe: 'גשם מילים',
    descriptionHe: 'הקלד את המילים לפני שהן נופלות!',
    icon: CloudRain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'letter-memory',
    href: '/games/letter-memory',
    nameHe: 'זיכרון אותיות',
    descriptionHe: 'הקלד אות כדי לגלות קלף – מצא את הזוגות!',
    icon: Brain,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    id: 'battle',
    href: '/battle',
    nameHe: 'זירת קרב',
    descriptionHe: 'התחרה נגד בינה מלאכותית!',
    icon: Swords,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 'ninja-slice',
    href: '/games/ninja-slice',
    nameHe: 'חיתוך נינג\'ה',
    descriptionHe: 'חתכו אותיות ומילים לפני שהן בורחות!',
    icon: Sword,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
]

export default function GamesPage() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-4 overflow-hidden p-4" dir="rtl">
      <Image src="/images/backgrounds/games-bg.jpg" alt="" fill className="object-cover opacity-15 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/images/characters/model-sheets/rex-dino.jpg"
            alt="Rex"
            width={48}
            height={48}
            className="rounded-full border-2 border-purple-500/30 shadow-lg shadow-purple-500/10"
          />
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">משחקי הקלדה</h1>
            <p className="text-sm text-muted-foreground">תרגלו הקלדה בכיף!</p>
          </div>
        </div>
        <Gamepad2 className="size-8 text-primary" />
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((game, i) => {
          const Icon = game.icon
          return (
            <Link key={game.id} href={game.href}>
              <GameCard delay={i * 0.08}>
                <div className="flex items-center gap-4">
                  <div className={`flex size-12 items-center justify-center rounded-lg ${game.bgColor}`}>
                    <Icon className={`size-6 ${game.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold">{game.nameHe}</h3>
                    <p className="text-sm text-muted-foreground">{game.descriptionHe}</p>
                  </div>
                </div>
              </GameCard>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
