'use client'

import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CharacterGallery } from '@/components/characters/character-gallery'

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <Card
        className="game-card-border"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{
                background: 'oklch(0.495 0.205 292 / 20%)',
                boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)',
              }}
            >
              <Users className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
            </div>
            <span className="text-glow">גלריית הדמויות</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CharacterGallery />
        </CardContent>
      </Card>
    </div>
  )
}
