import { Skeleton } from '@/components/ui/skeleton'

export default function SpeedTestLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-12 w-40 rounded-lg" />
    </div>
  )
}
