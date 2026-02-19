'use client'

import Link from 'next/link'
import { Gamepad2, CloudRain, Swords } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
    id: 'battle',
    href: '/battle',
    nameHe: 'זירת קרב',
    descriptionHe: 'התחרה נגד בינה מלאכותית!',
    icon: Swords,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
]

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">משחקי הקלדה</h1>
          <p className="text-sm text-muted-foreground">תרגלו הקלדה בכיף!</p>
        </div>
        <Gamepad2 className="size-8 text-primary" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((game) => {
          const Icon = game.icon
          return (
            <Link key={game.id} href={game.href}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-4 px-4 py-5">
                  <div className={`flex size-12 items-center justify-center rounded-lg ${game.bgColor}`}>
                    <Icon className={`size-6 ${game.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold">{game.nameHe}</h3>
                    <p className="text-sm text-muted-foreground">{game.descriptionHe}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
