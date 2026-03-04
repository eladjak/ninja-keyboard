/** Character names in the Ninja Keyboard story world */
export type CharacterName =
  | 'ki'
  | 'mika'
  | 'yuki'
  | 'luna'
  | 'noa'
  | 'kai'
  | 'senseiZen'
  | 'pixel'
  | 'rex'
  | 'bug'
  | 'glitch'
  | 'shadow'
  | 'storm'
  | 'blaze'

/** Character emotional states for animations and expression */
export type CharacterMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sad'
  | 'cheering'
  | 'concerned'
  | 'mischievous'
  | 'sleeping'
  | 'surprised'

/** When a story beat plays relative to a lesson */
export type StoryPhase = 'pre' | 'during' | 'post'

/** A single narrative moment in the story */
export interface StoryBeat {
  /** Which lesson this beat belongs to */
  lessonNumber: number
  /** When this beat plays relative to the lesson */
  phase: StoryPhase
  /** Which character is speaking */
  speaker: CharacterName
  /** Hebrew text content */
  text: string
  /** Character's emotional state */
  mood: CharacterMood
  /** How long the beat displays (ms) */
  duration: number
  /** Optional condition key to check in story state */
  condition?: string
}

/** Configuration for a boss encounter */
export interface BossConfig {
  /** Lesson number where the boss appears */
  lessonNumber: number
  /** Character that serves as the boss */
  bossName: CharacterName
  /** Boss display name in Hebrew */
  nameHe: string
  /** Boss health points */
  health: number
  /** Time limit for the encounter in seconds */
  timeLimit: number
  /** Hebrew description of the encounter */
  description: string
}

/** Flags tracking major story milestones */
export interface StoryFlags {
  bugFirstAppearance: boolean
  mikaJoined: boolean
  senseiIntroduced: boolean
  noaJoined: boolean
  lunaJoined: boolean
  glitchRevealed: boolean
  finalBossDefeated: boolean
}
