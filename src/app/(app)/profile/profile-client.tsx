'use client'

import Image from 'next/image'
import { ProfileCard } from '@/components/profile/profile-card'
import { BadgeShowcase } from '@/components/profile/badge-showcase'
import { StatsChart } from '@/components/profile/stats-chart'

export function ProfileClient() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-6" dir="rtl">
      <Image src="/images/backgrounds/profile-background.jpg" alt="" fill className="object-cover opacity-10 pointer-events-none fixed inset-0 -z-10" />
      <h1 className="text-2xl font-bold">הפרופיל שלי</h1>
      <ProfileCard />
      <StatsChart />
      <BadgeShowcase />
    </div>
  )
}
