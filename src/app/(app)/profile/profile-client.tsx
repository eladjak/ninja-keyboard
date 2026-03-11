'use client'

import Image from 'next/image'
import { User } from 'lucide-react'
import { ProfileCard } from '@/components/profile/profile-card'
import { BadgeShowcase } from '@/components/profile/badge-showcase'
import { StatsChart } from '@/components/profile/stats-chart'

export function ProfileClient() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-6 p-4" dir="rtl">
      <Image src="/images/backgrounds/profile-background.jpg" alt="" fill className="object-cover opacity-10 pointer-events-none fixed inset-0 -z-10" />

      {/* Page header */}
      <div
        className="game-card-border flex items-center gap-3 p-4"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}
      >
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: 'oklch(0.495 0.205 292 / 20%)', boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)' }}
        >
          <User className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
        </div>
        <h1 className="text-2xl font-bold text-glow">הפרופיל שלי</h1>
      </div>

      <ProfileCard />
      <StatsChart />
      <BadgeShowcase />
    </div>
  )
}
