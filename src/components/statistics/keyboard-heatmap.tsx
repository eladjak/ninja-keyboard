'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { TOP_ROW, HOME_ROW, BOTTOM_ROW } from '@/lib/typing-engine/keyboard-layout'
import {
  aggregateKeyAccuracy,
  getHeatLevel,
  HEAT_COLORS,
  HEAT_LABELS,
} from '@/lib/statistics/keyboard-heatmap'
import type { HeatLevel } from '@/lib/statistics/keyboard-heatmap'
import { cn } from '@/lib/utils'

export function KeyboardHeatmap() {
  const { results } = usePracticeHistoryStore()

  const keyData = useMemo(
    () => aggregateKeyAccuracy(results),
    [results],
  )

  const keyMap = useMemo(() => {
    const map = new Map<string, { accuracy: number; total: number }>()
    for (const k of keyData) {
      map.set(k.char, { accuracy: k.accuracy, total: k.total })
    }
    return map
  }, [keyData])

  const rows = [
    { label: 'עליונה', keys: TOP_ROW },
    { label: 'בית', keys: HOME_ROW },
    { label: 'תחתונה', keys: BOTTOM_ROW },
  ]

  // Legend levels
  const legendLevels: HeatLevel[] = ['excellent', 'good', 'fair', 'weak', 'critical', 'none']

  return (
    <Card dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">מפת חום מקלדת</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            תרגלו כדי לראות את מפת החום שלכם!
          </p>
        ) : (
          <>
            {/* Keyboard rows */}
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-center gap-1">
                  {row.keys.map((keyDef) => {
                    const data = keyMap.get(keyDef.char)
                    const accuracy = data?.accuracy ?? 100
                    const total = data?.total ?? 0
                    const level = getHeatLevel(accuracy, total)

                    return (
                      <div
                        key={keyDef.code}
                        className={cn(
                          'flex size-9 items-center justify-center rounded border text-sm font-bold sm:size-10',
                          HEAT_COLORS[level],
                        )}
                        title={`${keyDef.char}: ${total > 0 ? `${accuracy}% דיוק (${total} הקשות)` : 'אין מידע'}`}
                        aria-label={`${keyDef.char}: ${HEAT_LABELS[level]}`}
                      >
                        {keyDef.char}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-2">
              {legendLevels.map((level) => (
                <div key={level} className="flex items-center gap-1">
                  <div className={cn('size-3 rounded', HEAT_COLORS[level])} />
                  <span className="text-xs text-muted-foreground">{HEAT_LABELS[level]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
