/**
 * Share utilities for Ninja Keyboard.
 * Generates shareable text and handles Web Share API / clipboard fallback.
 */

export interface SpeedTestShareData {
  wpm: number
  accuracy: number
  rank: string
  rankLabel: string
}

export interface CertificateShareData {
  level: string
  levelLabel: string
  wpm: number
  accuracy: number
}

export interface StreakShareData {
  days: number
  totalXp: number
  level: number
}

/** Generate share text for speed test results */
export function generateSpeedTestShareText(data: SpeedTestShareData): string {
  return [
    `🥷 נינג'ה מקלדת - מבחן מהירות`,
    `⌨️ ${data.wpm} מילים לדקה`,
    `🎯 ${data.accuracy}% דיוק`,
    `🏆 דרגה: ${data.rankLabel}`,
    '',
    'נסו גם אתם! ninja-keyboard.app',
  ].join('\n')
}

/** Generate share text for certificate earned */
export function generateCertificateShareText(data: CertificateShareData): string {
  return [
    `🏅 קיבלתי תעודת ${data.levelLabel}!`,
    `⌨️ ${data.wpm} מילים לדקה | 🎯 ${data.accuracy}% דיוק`,
    '',
    `נינג'ה מקלדת - לימוד הקלדה בעברית`,
    'ninja-keyboard.app',
  ].join('\n')
}

/** Generate share text for streak milestone */
export function generateStreakShareText(data: StreakShareData): string {
  return [
    `🔥 ${data.days} ימי רצף בנינג'ה מקלדת!`,
    `⭐ רמה ${data.level} | ⚡ ${data.totalXp} XP`,
    '',
    'ninja-keyboard.app',
  ].join('\n')
}

/** Check if Web Share API is available */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/** Check if clipboard API is available */
export function canCopyToClipboard(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.clipboard !== 'undefined'
}

export interface ShareResult {
  success: boolean
  method: 'share' | 'clipboard' | 'none'
}

/** Share text via Web Share API, falling back to clipboard */
export async function shareText(text: string, title?: string): Promise<ShareResult> {
  if (canShare()) {
    try {
      await navigator.share({ text, title: title ?? 'נינג\'ה מקלדת' })
      return { success: true, method: 'share' }
    } catch {
      // User cancelled or share failed, try clipboard
    }
  }

  if (canCopyToClipboard()) {
    try {
      await navigator.clipboard.writeText(text)
      return { success: true, method: 'clipboard' }
    } catch {
      return { success: false, method: 'none' }
    }
  }

  return { success: false, method: 'none' }
}
