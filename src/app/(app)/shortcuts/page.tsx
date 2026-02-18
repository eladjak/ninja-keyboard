import { Keyboard } from 'lucide-react'
import { SHORTCUT_LESSONS } from '@/lib/content/shortcuts'
import { ShortcutsClient } from './shortcuts-client'

export default function ShortcutsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Keyboard className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">קיצורי מקלדת</h1>
          <p className="text-sm text-muted-foreground">
            למדו 40+ קיצורים חיוניים ל-Windows - מבסיסי ועד מתקדם
          </p>
        </div>
      </div>

      <ShortcutsClient lessons={SHORTCUT_LESSONS} />
    </div>
  )
}
