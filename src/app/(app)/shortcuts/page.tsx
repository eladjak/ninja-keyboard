import Image from 'next/image'
import { Keyboard } from 'lucide-react'
import { SHORTCUT_LESSONS } from '@/lib/content/shortcuts'
import { ShortcutsClient } from './shortcuts-client'

export default function ShortcutsPage() {
  return (
    <div className="relative mx-auto max-w-3xl space-y-6 p-4">
      <Image src="/images/backgrounds/cyber-lab-bg.jpg" alt="" fill className="object-cover opacity-10 pointer-events-none fixed inset-0 -z-10" />
      <div className="flex items-center gap-3">
        <Image
          src="/images/characters/model-sheets/mika-girl.jpg"
          alt="Mika"
          width={48}
          height={48}
          className="rounded-full border-2 border-purple-500/30 shadow-lg shadow-purple-500/10"
        />
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
