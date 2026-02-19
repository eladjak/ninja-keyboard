import { Skeleton } from '@/components/ui/skeleton'

export default function GamesLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </div>
  )
}
