import { Skeleton } from '@/components/ui/skeleton'

export default function PracticeLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="size-8 rounded-full" />
      </div>

      {/* Text selector */}
      <Skeleton className="h-10 rounded-lg" />

      {/* Timer selector */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-md" />
        ))}
      </div>

      {/* Typing area */}
      <Skeleton className="h-48 rounded-lg" />

      {/* Keyboard */}
      <Skeleton className="h-36 rounded-lg" />
    </div>
  )
}
