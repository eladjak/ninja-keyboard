'use client'

import { CheckCircle2, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ShortcutDefinition } from '@/lib/content/shortcuts'

interface ShortcutCardProps {
  shortcut: ShortcutDefinition
  mastered: boolean
  onPractice: (shortcut: ShortcutDefinition) => void
}

/** Single visual key cap styled like a physical keyboard key */
function KeyCap({ label }: { label: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-9 items-center justify-center',
        'rounded-lg border border-border bg-muted px-2.5 py-1.5',
        'text-sm font-semibold shadow-sm',
        'select-none',
      )}
    >
      {label}
    </kbd>
  )
}

/** Renders a sequence of keys with + signs between them */
function KeyCombo({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      {keys.map((key, index) => (
        <span key={`${key}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              +
            </span>
          )}
          <KeyCap label={key} />
        </span>
      ))}
    </div>
  )
}

export function ShortcutCard({
  shortcut,
  mastered,
  onPractice,
}: ShortcutCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-150',
        mastered &&
          'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Key combo visual */}
        <div className="shrink-0">
          <KeyCombo keys={shortcut.keys} />
        </div>

        {/* Hebrew info */}
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{shortcut.hebrewName}</h3>
            {mastered && (
              <CheckCircle2
                className="size-4 text-green-500"
                aria-label="הושלם"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {shortcut.description}
          </p>
        </div>

        {/* Practice button */}
        <Button
          variant={mastered ? 'outline' : 'default'}
          size="sm"
          onClick={() => onPractice(shortcut)}
          aria-label={`תרגול ${shortcut.hebrewName}`}
        >
          <Play className="size-4" />
          <span>תרגול</span>
        </Button>
      </CardContent>
    </Card>
  )
}

export { KeyCap, KeyCombo }
