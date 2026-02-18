/** Feedback engine - generates adaptive Hebrew feedback messages. Pure functions, no side effects. */

import type { SessionStats } from '@/lib/typing-engine/types'
import type { EmotionalState } from './emotional-detector'

export type FeedbackType = 'encourage' | 'celebrate' | 'calm' | 'hint' | 'summary'

export interface FeedbackMessage {
  /** Hebrew message text */
  text: string
  /** Message category */
  type: FeedbackType
  /** Optional emoji */
  emoji?: string
  /** Priority: 1 = highest */
  priority: number
}

// ---------------------------------------------------------------------------
// Emotional feedback messages
// ---------------------------------------------------------------------------

const EMOTIONAL_FEEDBACK: Record<EmotionalState, FeedbackMessage> = {
  frustrated: {
    text: 'בוא ניקח נשימה. אין לחץ. נתחיל מהמילה האחרונה',
    type: 'calm',
    emoji: '🌬️',
    priority: 1,
  },
  confused: {
    text: 'צריך עזרה? הנה רמז: האצבע האמצעית שמאל',
    type: 'hint',
    emoji: '💡',
    priority: 1,
  },
  perfectionist: {
    text: 'אין בעיה לטעות! טעויות = למידה. המשך הלאה',
    type: 'encourage',
    emoji: '💪',
    priority: 2,
  },
  bored: {
    text: 'בוא נעלה הילוך! נסה ללחוץ קצת יותר מהר',
    type: 'encourage',
    emoji: '⚡',
    priority: 2,
  },
  flow: {
    text: 'וואו, אתה על גל!',
    type: 'celebrate',
    emoji: '🔥',
    priority: 1,
  },
  improving: {
    text: 'יש שיפור! אתה הולך ומשתפר בכל מקש',
    type: 'encourage',
    emoji: '📈',
    priority: 2,
  },
  neutral: {
    text: 'יאללה, נמשיך! כל מקש שתלחץ מקרב אותך להצלחה',
    type: 'encourage',
    emoji: '👍',
    priority: 3,
  },
}

/**
 * Get feedback message for an emotional state.
 */
export function getEmotionalFeedback(state: EmotionalState): FeedbackMessage {
  return EMOTIONAL_FEEDBACK[state]
}

// ---------------------------------------------------------------------------
// Keystroke milestone feedback
// ---------------------------------------------------------------------------

const STREAK_MILESTONES: Record<number, FeedbackMessage> = {
  10: {
    text: 'עשרה ברצף! מרשים!',
    type: 'celebrate',
    emoji: '✨',
    priority: 2,
  },
  20: {
    text: 'עשרים ברצף! אתה בוער!',
    type: 'celebrate',
    emoji: '🔥',
    priority: 1,
  },
  50: {
    text: 'חמישים ברצף! אתה על גל!',
    type: 'celebrate',
    emoji: '🌊',
    priority: 1,
  },
  100: {
    text: 'מאה ברצף!! בלתי נתפס!',
    type: 'celebrate',
    emoji: '💯',
    priority: 1,
  },
}

/**
 * Get feedback for a single keystroke event.
 * Returns null if no special feedback is needed.
 */
export function getKeystrokeFeedback(
  isCorrect: boolean,
  streakLength: number,
): FeedbackMessage | null {
  if (!isCorrect) return null

  // Check streak milestones
  const milestone = STREAK_MILESTONES[streakLength]
  if (milestone) return milestone

  return null
}

// ---------------------------------------------------------------------------
// Word complete feedback (rotating)
// ---------------------------------------------------------------------------

const WORD_COMPLETE_MESSAGES: string[] = ['יופי!', 'מצוין!', 'בול!', 'נהדר!', 'כל הכבוד!']

/**
 * Get rotating feedback message for word completion.
 * Cycles through messages based on word index.
 */
export function getWordCompleteFeedback(wordIndex: number): FeedbackMessage {
  const text = WORD_COMPLETE_MESSAGES[wordIndex % WORD_COMPLETE_MESSAGES.length]
  return {
    text,
    type: 'celebrate',
    emoji: '⭐',
    priority: 3,
  }
}

// ---------------------------------------------------------------------------
// Lesson end feedback
// ---------------------------------------------------------------------------

/**
 * Generate feedback messages for lesson completion.
 * Returns an array of messages sorted by priority.
 */
export function getLessonEndFeedback(
  stats: SessionStats,
  previousStats?: SessionStats,
): FeedbackMessage[] {
  const messages: FeedbackMessage[] = []

  // Summary message always present
  const durationSec = Math.round(stats.durationMs / 1000)
  const durationDisplay = durationSec >= 60 ? `${Math.floor(durationSec / 60)} דקות` : `${durationSec} שניות`
  messages.push({
    text: `סיימת! ${stats.wpm} מילים לדקה, דיוק ${stats.accuracy}%, זמן: ${durationDisplay}`,
    type: 'summary',
    priority: 1,
  })

  // Perfect accuracy celebration
  if (stats.accuracy === 100) {
    messages.push({
      text: 'מאה אחוז דיוק! מושלם לחלוטין!',
      type: 'celebrate',
      emoji: '💯',
      priority: 1,
    })
  } else if (stats.accuracy >= 95) {
    messages.push({
      text: 'דיוק מעולה! כמעט מושלם!',
      type: 'celebrate',
      emoji: '🌟',
      priority: 2,
    })
  }

  // Comparison with previous session
  if (previousStats) {
    const wpmDiff = stats.wpm - previousStats.wpm
    const pct = previousStats.wpm > 0
      ? Math.round(Math.abs(wpmDiff / previousStats.wpm) * 100)
      : 0

    if (wpmDiff > 0) {
      messages.push({
        text: `אתמול ${previousStats.wpm} מילות, היום ${stats.wpm}! עלייה של ${pct}%!`,
        type: 'celebrate',
        emoji: '📈',
        priority: 2,
      })
    } else if (wpmDiff < 0) {
      messages.push({
        text: 'לא נורא. לפעמים יש ירידות. חשוב להמשיך!',
        type: 'encourage',
        emoji: '💪',
        priority: 3,
      })
    } else {
      messages.push({
        text: 'קצב זהה לפעם הקודמת. בוא נשפר בסיבוב הבא!',
        type: 'encourage',
        emoji: '🎯',
        priority: 3,
      })
    }
  }

  // High WPM celebration
  if (stats.wpm >= 40) {
    messages.push({
      text: `${stats.wpm} מילות לדקה - מהיר כמו ברק!`,
      type: 'celebrate',
      emoji: '⚡',
      priority: 2,
    })
  }

  // Sort by priority ascending (1 = most important first)
  return messages.sort((a, b) => a.priority - b.priority)
}

// ---------------------------------------------------------------------------
// Return / re-engagement feedback
// ---------------------------------------------------------------------------

/**
 * Get feedback message for a returning user based on days since last visit.
 */
export function getReturnFeedback(daysSinceLastVisit: number): FeedbackMessage {
  if (daysSinceLastVisit === 0) {
    return {
      text: 'חזרת! בוא נמשיך מאיפה שעצרנו',
      type: 'encourage',
      emoji: '👋',
      priority: 2,
    }
  }

  if (daysSinceLastVisit === 1) {
    return {
      text: 'כל הכבוד! חזרת גם היום. עקביות היא המפתח להצלחה',
      type: 'encourage',
      emoji: '🌟',
      priority: 2,
    }
  }

  if (daysSinceLastVisit < 7) {
    return {
      text: `שמחתי שחזרת! בוא נתחיל ממשהו קל וכיף`,
      type: 'encourage',
      emoji: '😊',
      priority: 2,
    }
  }

  if (daysSinceLastVisit < 30) {
    return {
      text: 'ברוך שובך! חיכינו לך. בוא נרענן קצת ונמשיך הלאה',
      type: 'encourage',
      emoji: '🤗',
      priority: 2,
    }
  }

  // 30+ days
  return {
    text: 'הפתעה נעימה לראות אותך! בוא נתחיל מחדש, בלי לחץ',
    type: 'encourage',
    emoji: '🌱',
    priority: 2,
  }
}
