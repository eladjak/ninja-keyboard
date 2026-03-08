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
  | 'virus'
  | 'phantom'
  | 'barak'

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

// ---------------------------------------------------------------------------
// Dialog System Types (used by DialogBox / StoryPlayer)
// ---------------------------------------------------------------------------

/** How a line of dialog is presented visually */
export type DialogType = 'dialog' | 'thought' | 'narration' | 'monologue'

/** Overall mood of a story moment — drives palette and atmosphere */
export type StoryMood =
  | 'happy'
  | 'tense'
  | 'sad'
  | 'epic'
  | 'funny'
  | 'mysterious'
  | 'heartwarming'

/** A single line of dialog in the story delivery system */
export interface DialogLine {
  /** Unique identifier for this line */
  id: string
  /** Character key (ki, yuki, mika, etc.) */
  character: CharacterName
  /** Hebrew text to display */
  text: string
  /** Visual presentation type */
  type: DialogType
  /** Overall mood (drives background / color cues) */
  mood?: StoryMood
  /** Expression key for portrait (maps to CharacterMood) */
  expression?: CharacterMood
  /** Path to voice audio clip */
  voiceClip?: string
  /** Auto-advance delay in ms (if set, line advances automatically) */
  duration?: number
  /** Interactive choices presented at the end of this line */
  choices?: DialogChoice[]
}

/** A player choice within dialog */
export interface DialogChoice {
  /** Unique identifier for this choice */
  id: string
  /** Hebrew text displayed on the button */
  text: string
  /** Relationship score effect when chosen */
  relationshipEffect?: { character: CharacterName; delta: number }
  /** Jump to a specific dialog line by id after choosing */
  nextDialogId?: string
}

/** A sequence of dialog lines triggered by a game event */
export interface DialogStoryBeat {
  /** Unique identifier for this beat */
  id: string
  /** What triggers this dialog sequence */
  trigger: StoryTrigger
  /** The dialog lines to play through */
  lines: DialogLine[]
  /** Called when the entire sequence completes */
  onComplete?: () => void
}

/** Events that can trigger a dialog story beat */
export type StoryTrigger =
  | { type: 'lesson-complete'; lessonId: string }
  | { type: 'wpm-milestone'; wpm: number }
  | { type: 'badge-earned'; badgeId: string }
  | { type: 'battle-result'; result: 'win' | 'lose' }
  | { type: 'streak'; days: number }
  | { type: 'manual' }
