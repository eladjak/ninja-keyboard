/**
 * Keyboard heatmap utilities.
 * Computes per-key accuracy data for visual heatmap display.
 */

export interface KeyHeatmapData {
  char: string
  accuracy: number
  total: number
  correct: number
}

export type HeatLevel = 'excellent' | 'good' | 'fair' | 'weak' | 'critical' | 'none'

/** Aggregate key accuracy from multiple practice sessions */
export function aggregateKeyAccuracy(
  sessions: Array<{ keyAccuracy: Record<string, { correct: number; total: number }> }>,
): KeyHeatmapData[] {
  const aggregated: Record<string, { correct: number; total: number }> = {}

  for (const session of sessions) {
    for (const [char, data] of Object.entries(session.keyAccuracy)) {
      const existing = aggregated[char] ?? { correct: 0, total: 0 }
      existing.correct += data.correct
      existing.total += data.total
      aggregated[char] = existing
    }
  }

  return Object.entries(aggregated)
    .map(([char, data]) => ({
      char,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 100,
      total: data.total,
      correct: data.correct,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
}

/** Get heat level for a given accuracy percentage */
export function getHeatLevel(accuracy: number, total: number): HeatLevel {
  if (total < 3) return 'none'
  if (accuracy >= 95) return 'excellent'
  if (accuracy >= 85) return 'good'
  if (accuracy >= 75) return 'fair'
  if (accuracy >= 60) return 'weak'
  return 'critical'
}

/** CSS classes for each heat level */
export const HEAT_COLORS: Record<HeatLevel, string> = {
  excellent: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  good: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  fair: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  weak: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  none: 'bg-muted/30 text-muted-foreground border-muted',
}

/** Hebrew labels for heat levels */
export const HEAT_LABELS: Record<HeatLevel, string> = {
  excellent: 'מצוין',
  good: 'טוב',
  fair: 'סביר',
  weak: 'חלש',
  critical: 'דורש תרגול',
  none: 'אין מידע',
}

/** Get the top N weakest keys from heatmap data */
export function getWeakestKeys(data: KeyHeatmapData[], count: number): KeyHeatmapData[] {
  return data
    .filter((k) => k.total >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, count)
}

/** Get the top N strongest keys from heatmap data */
export function getStrongestKeys(data: KeyHeatmapData[], count: number): KeyHeatmapData[] {
  return data
    .filter((k) => k.total >= 3)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, count)
}
