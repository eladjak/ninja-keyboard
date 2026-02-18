'use client'

import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeGrid } from '@/components/gamification/badge-grid'

export default function BadgesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <Trophy className="size-6" />
            ההישגים שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeGrid />
        </CardContent>
      </Card>
    </div>
  )
}
