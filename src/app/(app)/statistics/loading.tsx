import { Skeleton } from '@/components/ui/skeleton'

export default function StatisticsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="size-8 rounded-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Chart */}
      <Skeleton className="h-56 rounded-lg" />

      {/* Problematic keys */}
      <Skeleton className="h-40 rounded-lg" />
    </div>
  )
}
