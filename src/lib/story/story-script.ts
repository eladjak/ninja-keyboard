import type { BossConfig, StoryBeat, StoryPhase } from '@/types/story'

/**
 * Act 1: "ההתעוררות" (The Awakening)
 * Lessons 1-7: Ki discovers the keyboard, makes allies, faces first villain
 */
const ACT_1_BEATS: StoryBeat[] = [
  // ── Lesson 1: Ki discovers the keyboard ──
  {
    lessonNumber: 1,
    phase: 'pre',
    speaker: 'ki',
    text: 'מצאתי מקלדת זוהרת... מה זה?!',
    mood: 'thinking',
    duration: 3000,
  },
  {
    lessonNumber: 1,
    phase: 'post',
    speaker: 'ki',
    text: 'האצבעות שלי מרגישות את המקשים!',
    mood: 'happy',
    duration: 2500,
  },

  // ── Lesson 2: Mika joins ──
  {
    lessonNumber: 2,
    phase: 'pre',
    speaker: 'mika',
    text: 'בוא ננסה ביחד, קי!',
    mood: 'excited',
    duration: 3000,
  },
  {
    lessonNumber: 2,
    phase: 'post',
    speaker: 'ki',
    text: 'ביחד אנחנו חזקים יותר!',
    mood: 'cheering',
    duration: 2500,
  },

  // ── Lesson 3: Home row practice ──
  {
    lessonNumber: 3,
    phase: 'pre',
    speaker: 'ki',
    text: 'האצבעות שלי מתחילות לזכור...',
    mood: 'thinking',
    duration: 2500,
  },
  {
    lessonNumber: 3,
    phase: 'post',
    speaker: 'mika',
    text: 'שורת הבית - הבסיס של כל נינג\'ה!',
    mood: 'happy',
    duration: 2500,
  },

  // ── Lesson 4: Getting faster ──
  {
    lessonNumber: 4,
    phase: 'pre',
    speaker: 'mika',
    text: 'הפעם - יותר מהר!',
    mood: 'excited',
    duration: 2000,
  },
  {
    lessonNumber: 4,
    phase: 'post',
    speaker: 'ki',
    text: 'אני מרגיש את המהירות!',
    mood: 'excited',
    duration: 2500,
  },

  // ── Lesson 5: Bug appears! ──
  {
    lessonNumber: 5,
    phase: 'pre',
    speaker: 'bug',
    text: 'הא הא! בלבלתי לכם את האותיות!',
    mood: 'mischievous',
    duration: 3000,
    condition: 'bugFirstAppearance',
  },
  {
    lessonNumber: 5,
    phase: 'post',
    speaker: 'ki',
    text: 'מי זה היה?! הוא בלבל הכל!',
    mood: 'surprised',
    duration: 3000,
  },

  // ── Lesson 6: Fighting back ──
  {
    lessonNumber: 6,
    phase: 'pre',
    speaker: 'mika',
    text: 'לא ניתן לבאג לנצח!',
    mood: 'excited',
    duration: 2500,
  },
  {
    lessonNumber: 6,
    phase: 'post',
    speaker: 'ki',
    text: 'אנחנו מתחזקים!',
    mood: 'cheering',
    duration: 2000,
  },

  // ── Lesson 7: MINI BOSS (Bug) ──
  {
    lessonNumber: 7,
    phase: 'pre',
    speaker: 'bug',
    text: 'עכשיו אני מבלבל עשר מילים שלמות!',
    mood: 'mischievous',
    duration: 3000,
  },
  {
    lessonNumber: 7,
    phase: 'post',
    speaker: 'ki',
    text: 'ניצחנו! אבל הוא ברח...',
    mood: 'cheering',
    duration: 3000,
    condition: 'bossDefeated',
  },
  {
    lessonNumber: 7,
    phase: 'post',
    speaker: 'bug',
    text: 'הא הא! אחזור מחר!',
    mood: 'mischievous',
    duration: 2500,
    condition: 'bossNotDefeated',
  },
]

/** All story beats across all acts (currently Act 1) */
const ALL_STORY_BEATS: StoryBeat[] = [...ACT_1_BEATS]

/**
 * Boss encounter configurations
 */
export const BOSS_CONFIGS: BossConfig[] = [
  {
    lessonNumber: 7,
    bossName: 'bug',
    nameHe: 'הבאג',
    health: 100,
    timeLimit: 60,
    description: 'הבאג מבלבל עשר מילים! הקלד אותן נכון לפני שהזמן נגמר!',
  },
]

/**
 * Retrieve the story beat for a specific lesson and phase.
 *
 * For lesson 7 post-phase, pass a condition string:
 * - 'bossDefeated' to get the win beat
 * - 'bossNotDefeated' to get the lose beat
 *
 * Returns null if no matching beat exists.
 */
export function getStoryBeat(
  lessonNumber: number,
  phase: StoryPhase,
  condition?: string,
): StoryBeat | null {
  const beats = ALL_STORY_BEATS.filter(
    (b) => b.lessonNumber === lessonNumber && b.phase === phase,
  )

  if (beats.length === 0) return null

  // If there are multiple beats for the same lesson+phase (e.g., boss win/lose),
  // find the one matching the condition
  if (beats.length > 1 && condition) {
    const match = beats.find((b) => b.condition === condition)
    return match ?? null
  }

  // Single beat or no condition needed
  const beat = beats.find((b) => !b.condition) ?? beats[0]
  return beat ?? null
}

/**
 * Get the boss config for a specific lesson number.
 * Returns null if the lesson is not a boss encounter.
 */
export function getBossConfig(lessonNumber: number): BossConfig | null {
  return BOSS_CONFIGS.find((b) => b.lessonNumber === lessonNumber) ?? null
}
