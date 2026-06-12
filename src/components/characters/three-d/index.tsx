'use client'

import dynamic from 'next/dynamic'

export const Ki3DViewer = dynamic(
  () => import('./ki-model').then((mod) => ({ default: mod.Ki3DViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-muted/30">
        <div className="flex flex-col items-center gap-2 text-center font-heebo">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">טוען תצוגת 3D...</p>
        </div>
      </div>
    ),
  }
)
