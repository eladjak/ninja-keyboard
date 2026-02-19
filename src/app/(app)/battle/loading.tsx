import { Skeleton } from '@/components/ui/skeleton'

export default function BattleLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      <Skeleton className="h-14 rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
      <Skeleton className="h-48 rounded-lg" />
    </div>
  )
}
