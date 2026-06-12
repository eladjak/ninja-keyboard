'use client'

import { useState } from 'react'
import { Ki3DViewer } from '@/components/characters/three-d'
import Image from 'next/image'

type KiMood = 'idle' | 'typing' | 'celebrate' | 'error'

const MOODS: { value: KiMood; label: string; emoji: string }[] = [
  { value: 'idle', label: 'ניטרלי', emoji: '😊' },
  { value: 'typing', label: 'מקליד', emoji: '⌨️' },
  { value: 'celebrate', label: 'חוגג', emoji: '🎉' },
  { value: 'error', label: 'טעות', emoji: '😅' },
]

export default function ThreeDPocPage() {
  const [mood, setMood] = useState<KiMood>('idle')
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6" dir="rtl">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-primary">🥷 Ki 3D POC</h1>
        <p className="mt-2 text-muted-foreground">
          הוכחת היתכנות — קי (Ki) במודל תלת-ממדי
        </p>
      </header>

      {/* 3D Viewer */}
      <section className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-background to-muted/30 shadow-xl">
        <Ki3DViewer
          mood={mood}
          autoRotate={autoRotate}
          enableZoom
          height={500}
          showControls
        />
      </section>

      {/* Controls */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Mood Selector */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">מצב רוח</h2>
          <div className="grid grid-cols-2 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  mood === m.value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span className="me-1">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">הגדרות תצוגה</h2>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-muted px-4 py-3">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span className="text-sm font-medium">סיבוב אוטומטי</span>
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            גרור עם העכבר לסובב. גלגלת לזום.
          </p>
        </div>
      </section>

      {/* Reference Image */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold">מודל שיט מקורי (2D)</h2>
        <div className="flex justify-center">
          <Image
            src="/images/characters/model-sheets/ki-boy.jpg"
            alt="Ki model sheet - front, side, back, 3/4 view"
            width={600}
            height={400}
            className="rounded-lg"
          />
        </div>
      </section>

      {/* Generation Guide */}
      <section className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6">
        <h2 className="mb-4 text-xl font-bold text-primary">📋 מדריך: יצירת מודל 3D</h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-bold">אפשרות 1: Tripo3D (חינם, מהיר)</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              <li>
                גש ל-{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">tripo3d.ai</code>
              </li>
              <li>העלה את תמונת ה-model sheet של קי</li>
              <li>בחר סגנון &quot;Cartoon&quot; או &quot;Chibi&quot;</li>
              <li>הורד את הקובץ בפורמט GLB</li>
              <li>
                שמור בנתיב:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  public/characters/3d/ki.glb
                </code>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="mb-2 font-bold">אפשרות 2: Meshy AI (חינם, 200 קרדיטים/חודש)</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              <li>
                גש ל-{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">meshy.ai</code>
              </li>
              <li>בחר &quot;Image to 3D&quot;</li>
              <li>העלה את תמונת ה-model sheet</li>
              <li>הורד כ-GLB</li>
              <li>
                שמור בנתיב:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  public/characters/3d/ki.glb
                </code>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="mb-2 font-bold">אפשרות 3: Sloyd AI (חינם ללא הגבלה)</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              <li>
                גש ל-{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  sloyd.ai/image-to-3d
                </code>
              </li>
              <li>העלה תמונה + הפעל auto-rigging</li>
              <li>הורד GLB</li>
              <li>
                שמור בנתיב:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  public/characters/3d/ki.glb
                </code>
              </li>
            </ol>
          </div>

          <div className="rounded-lg bg-background p-4 text-sm">
            <p className="font-bold">💡 טיפ:</p>
            <p className="text-muted-foreground">
              נסה את כל שלושת הכלים עם אותה תמונה ובחר את התוצאה הכי טובה. הם כולם חינמיים!
              ברגע שתשמור קובץ GLB בנתיב הנכון, העמוד הזה יטען אותו אוטומטית.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
