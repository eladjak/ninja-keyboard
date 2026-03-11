'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CHARACTER_SKILL_MAPS } from '@/lib/teacher/character-skills'
import { cn } from '@/lib/utils'

// ── Single Character Row ─────────────────────────────────────────

interface CharacterRowProps {
  char: (typeof CHARACTER_SKILL_MAPS)[number]
}

function CharacterRow({ char }: CharacterRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[var(--game-border)] last:border-0">
      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3 text-start transition-colors',
          'hover:bg-[var(--game-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`פרטי דמות: ${char.nameHe}`}
      >
        {/* Emoji + name */}
        <span className="text-2xl" aria-hidden>
          {char.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{char.nameHe}</span>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px]"
              style={{ borderColor: char.accentColor, color: char.accentColor }}
            >
              {char.skillCategoryHe}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{char.ageRange} שנים</p>
        </div>

        {/* Toggle icon */}
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              {/* Skills list */}
              <ul className="space-y-1.5" aria-label={`מיומנויות של ${char.nameHe}`}>
                {char.skills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-1 size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: char.accentColor }}
                      aria-hidden
                    />
                    {skill}
                  </li>
                ))}
              </ul>

              {/* Teacher note */}
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
                style={{
                  backgroundColor: `${char.accentColor}15`,
                  borderInlineStart: `2px solid ${char.accentColor}`,
                }}
              >
                <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="text-muted-foreground">{char.teacherNote}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function CharacterSkillMap() {
  return (
    <Card
      style={{ background: 'var(--game-bg-card)', borderColor: 'var(--game-border)' }}
      aria-labelledby="skill-map-title"
    >
      <CardHeader className="pb-2">
        <CardTitle id="skill-map-title" className="flex items-center gap-2 text-base">
          <span aria-hidden>🗺️</span>
          מפת מיומנויות — דמויות ותחומים
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          כל דמות מלמדת נושא שונה. לחצו על דמות לפרטים מלאים
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div role="list" aria-label="רשימת דמויות ומיומנויות">
          {CHARACTER_SKILL_MAPS.map((char) => (
            <div key={char.id} role="listitem">
              <CharacterRow char={char} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
