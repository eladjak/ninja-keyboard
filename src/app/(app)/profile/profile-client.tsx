'use client'

import { ProfileCard } from '@/components/profile/profile-card'
import { BadgeShowcase } from '@/components/profile/badge-showcase'
import { StatsChart } from '@/components/profile/stats-chart'

export function ProfileClient() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">הפרופיל שלי</h1>
      <ProfileCard />
      <StatsChart />
      <BadgeShowcase />
    </div>
  )
}
