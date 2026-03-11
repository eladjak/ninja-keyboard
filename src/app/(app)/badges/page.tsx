'use client'

import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeGrid } from '@/components/gamification/badge-grid'

export default function BadgesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <div className="flex size-8 items-center justify-center rounded-xl" style={{ background: 'oklch(0.495 0.205 292 / 20%)', boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)' }}>
              <Trophy className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
            </div>
            <span className="text-glow">ההישגים שלי</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeGrid />
        </CardContent>
      </Card>
    </div>
  )
}
