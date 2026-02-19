import { Skeleton } from '@/components/ui/skeleton'

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      {/* Podium */}
      <div className="flex items-end justify-center gap-4 py-4">
        <Skeleton className="h-24 w-20 rounded-lg" />
        <Skeleton className="h-32 w-20 rounded-lg" />
        <Skeleton className="h-20 w-20 rounded-lg" />
      </div>
      {/* List */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  )
}
