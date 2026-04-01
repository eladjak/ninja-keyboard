import type { CharacterName } from '@/types/story'

interface SoundProfile {
  /** Web Audio oscillator type */
  oscillatorType: OscillatorType
  /** Frequency range [min, max] in Hz */
  frequencyRange: [number, number]
}

interface IdleAnimation {
  /** Framer Motion animate props for idle movement */
  y: number[]
  rotate: number[]
  transition: {
    duration: number
    repeat: number
    repeatType: 'reverse' | 'loop' | 'mirror'
    ease: string
  }
}

export interface CharacterConfig {
  /** Hebrew display name */
  nameHe: string
  /** Path to model sheet image */
  image: string
  /**
   * Path to the hero illustration image used on page headers.
   * Present for the 7 main characters that have a dedicated hero image in public/images/characters/heroes/.
   */
  heroImage?: string
  /** Alternate hero image for transformed/powered-up form (e.g. Kai fire warrior) */
  fireHeroImage?: string
  /**
   * Path to the expression sheet image (reference grid of multiple expressions).
   * These are multi-panel reference sheets, not individual mood images.
   * Present when a matching expressions file exists in public/images/characters/expressions/.
   */
  expressionSheet?: string
  /** CSS color for the character's glow effect */
  glowColor: string
  /** Web Audio synthesis profile for character sounds */
  soundProfile: SoundProfile
  /** Framer Motion props for idle bob/sway animation */
  idleAnimation: IdleAnimation
}

const INFINITE_REPEAT = Infinity

export const CHARACTER_CONFIGS: Record<CharacterName, CharacterConfig> = {
  ki: {
    nameHe: 'קי',
    image: '/images/characters/model-sheets/ki-boy.jpg',
    heroImage: '/images/characters/heroes/ki-hero.jpg',
    expressionSheet: '/images/characters/expressions/ki-expressions.jpg',
    glowColor: '#6C5CE7',
    soundProfile: {
      oscillatorType: 'sine',
      frequencyRange: [400, 600],
    },
    idleAnimation: {
      y: [0, -4, 0],
      rotate: [0, 1, 0],
      transition: {
        duration: 2.5,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  mika: {
    nameHe: 'מיקה',
    image: '/images/characters/model-sheets/mika-girl.jpg',
    heroImage: '/images/characters/heroes/mika-hero.jpg',
    expressionSheet: '/images/characters/expressions/mika-expressions.jpg',
    glowColor: '#FF6B6B',
    soundProfile: {
      oscillatorType: 'sine',
      frequencyRange: [500, 700],
    },
    idleAnimation: {
      y: [0, -3, 0],
      rotate: [0, -1.5, 0],
      transition: {
        duration: 2.2,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  yuki: {
    nameHe: 'יוקי',
    image: '/images/characters/model-sheets/yuki-girl.jpg',
    heroImage: '/images/characters/heroes/yuki-hero.jpg',
    expressionSheet: '/images/characters/expressions/yuki-expressions.jpg',
    glowColor: '#74B9FF',
    soundProfile: {
      oscillatorType: 'triangle',
      frequencyRange: [450, 650],
    },
    idleAnimation: {
      y: [0, -5, 0],
      rotate: [0, 2, 0],
      transition: {
        duration: 3.0,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  luna: {
    nameHe: 'לונה',
    image: '/images/characters/model-sheets/luna-girl.jpg',
    heroImage: '/images/characters/heroes/luna-hero.jpg',
    expressionSheet: '/images/characters/expressions/luna-expressions.jpg',
    glowColor: '#A29BFE',
    soundProfile: {
      oscillatorType: 'sine',
      frequencyRange: [350, 550],
    },
    idleAnimation: {
      y: [0, -3, 0],
      rotate: [0, -1, 0],
      transition: {
        duration: 2.8,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  noa: {
    nameHe: 'נועה',
    image: '/images/characters/model-sheets/noa-girl.jpg',
    heroImage: '/images/characters/heroes/noa-hero.jpg',
    expressionSheet: '/images/characters/expressions/noa-expressions.jpg',
    glowColor: '#00B894',
    soundProfile: {
      oscillatorType: 'sine',
      frequencyRange: [420, 620],
    },
    idleAnimation: {
      y: [0, -4, 0],
      rotate: [0, 1.5, 0],
      transition: {
        duration: 2.6,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  kai: {
    nameHe: 'קאי',
    image: '/images/characters/model-sheets/kai-boy.jpg',
    heroImage: '/images/characters/heroes/kai-hero.jpg',
    fireHeroImage: '/images/characters/heroes/kai-fire-hero.jpg',
    expressionSheet: '/images/characters/expressions/kai-expressions.jpg',
    glowColor: '#FDCB6E',
    soundProfile: {
      oscillatorType: 'square',
      frequencyRange: [300, 500],
    },
    idleAnimation: {
      y: [0, -3, 0],
      rotate: [0, -2, 0],
      transition: {
        duration: 2.4,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  senseiZen: {
    nameHe: 'סנסיי זן',
    image: '/images/characters/model-sheets/sensei-zen.jpg',
    heroImage: '/images/characters/heroes/sensei-zen-hero.jpg',
    expressionSheet: '/images/characters/expressions/zen-expressions.jpg',
    glowColor: '#FAD390',
    soundProfile: {
      oscillatorType: 'sine',
      frequencyRange: [200, 400],
    },
    idleAnimation: {
      y: [0, -2, 0],
      rotate: [0, 0.5, 0],
      transition: {
        duration: 3.5,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  pixel: {
    nameHe: 'פיקסל',
    image: '/images/characters/model-sheets/pixel-robot.jpg',
    heroImage: '/images/characters/heroes/pixel-hero.jpg',
    expressionSheet: '/images/characters/expressions/pixel-expressions.jpg',
    glowColor: '#00CEC9',
    soundProfile: {
      oscillatorType: 'square',
      frequencyRange: [600, 900],
    },
    idleAnimation: {
      y: [0, -2, 0],
      rotate: [0, 3, 0],
      transition: {
        duration: 1.8,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  rex: {
    nameHe: 'רקס',
    image: '/images/characters/model-sheets/rex-dino.jpg',
    heroImage: '/images/characters/heroes/rex-hero.jpg',
    expressionSheet: '/images/characters/expressions/rex-expressions.jpg',
    glowColor: '#E17055',
    soundProfile: {
      oscillatorType: 'sawtooth',
      frequencyRange: [150, 350],
    },
    idleAnimation: {
      y: [0, -3, 0],
      rotate: [0, -1, 0],
      transition: {
        duration: 2.0,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  bug: {
    nameHe: 'באג',
    image: '/images/characters/model-sheets/bug-creature.jpg',
    heroImage: '/images/characters/heroes/bug-hero.jpg',
    expressionSheet: '/images/characters/expressions/bug-expressions.jpg',
    glowColor: '#D63031',
    soundProfile: {
      oscillatorType: 'sawtooth',
      frequencyRange: [200, 500],
    },
    idleAnimation: {
      y: [0, -6, 0],
      rotate: [0, -4, 0],
      transition: {
        duration: 1.5,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  glitch: {
    nameHe: 'גליץ\'',
    image: '/images/characters/model-sheets/glitch-entity.jpg',
    heroImage: '/images/characters/heroes/glitch-hero.jpg',
    expressionSheet: '/images/characters/expressions/glitch-expressions.jpg',
    glowColor: '#E84393',
    soundProfile: {
      oscillatorType: 'sawtooth',
      frequencyRange: [300, 800],
    },
    idleAnimation: {
      y: [0, -5, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 1.2,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  shadow: {
    nameHe: 'שאדו',
    image: '/images/characters/model-sheets/shadow-cat.jpg',
    heroImage: '/images/characters/heroes/shadow-hero.jpg',
    expressionSheet: '/images/characters/expressions/shadow-expressions.jpg',
    glowColor: '#636E72',
    soundProfile: {
      oscillatorType: 'triangle',
      frequencyRange: [250, 450],
    },
    idleAnimation: {
      y: [0, -4, 0],
      rotate: [0, 2, 0],
      transition: {
        duration: 2.0,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  storm: {
    nameHe: 'סטורם',
    image: '/images/characters/model-sheets/storm-fox.jpg',
    heroImage: '/images/characters/heroes/storm-hero.jpg',
    expressionSheet: '/images/characters/expressions/storm-expressions.jpg',
    glowColor: '#0984E3',
    soundProfile: {
      oscillatorType: 'square',
      frequencyRange: [350, 600],
    },
    idleAnimation: {
      y: [0, -5, 0],
      rotate: [0, -3, 0],
      transition: {
        duration: 1.6,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  blaze: {
    nameHe: 'בלייז',
    image: '/images/characters/model-sheets/blaze-dragon.jpg',
    heroImage: '/images/characters/heroes/blaze-hero.jpg',
    expressionSheet: '/images/characters/expressions/blaze-expressions.jpg',
    glowColor: '#E55039',
    soundProfile: {
      oscillatorType: 'sawtooth',
      frequencyRange: [300, 700],
    },
    idleAnimation: {
      y: [0, -4, 0],
      rotate: [0, -2, 0],
      transition: {
        duration: 1.8,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  virus: {
    nameHe: 'וירוס',
    image: '/images/characters/model-sheets/virus-dual-form.jpg',
    heroImage: '/images/characters/heroes/virus-hero.jpg',
    expressionSheet: '/images/characters/expressions/virus-expressions.jpg',
    glowColor: '#D63031',
    soundProfile: {
      oscillatorType: 'sawtooth',
      frequencyRange: [200, 600],
    },
    idleAnimation: {
      y: [0, -6, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 1.0,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  phantom: {
    nameHe: 'פאנטום',
    image: '/images/characters/model-sheets/raz-phantom.jpg',
    heroImage: '/images/characters/heroes/phantom-hero.jpg',
    expressionSheet: '/images/characters/expressions/phantom-expressions.jpg',
    glowColor: '#9B59B6',
    soundProfile: {
      oscillatorType: 'triangle',
      frequencyRange: [200, 400],
    },
    idleAnimation: {
      y: [0, -3, 0],
      rotate: [0, 1, 0],
      transition: {
        duration: 3.0,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  barak: {
    nameHe: 'ברק',
    image: '/images/characters/model-sheets/barak-fox.jpg',
    heroImage: '/images/characters/heroes/barak-hero.jpg',
    expressionSheet: '/images/characters/expressions/barak-expressions.jpg',
    glowColor: '#F9CA24',
    soundProfile: {
      oscillatorType: 'square',
      frequencyRange: [400, 650],
    },
    idleAnimation: {
      y: [0, -5, 0],
      rotate: [0, -3, 0],
      transition: {
        duration: 1.4,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  masterBeat: {
    nameHe: 'מאסטר ביט',
    image: '/images/characters/model-sheets/master-beat.jpg',
    heroImage: '/images/characters/heroes/masterbeat-hero.jpg',
    expressionSheet: '/images/characters/expressions/masterbeat-expressions.jpg',
    glowColor: '#FFD700',
    soundProfile: {
      oscillatorType: 'sine',
      frequencyRange: [100, 300],
    },
    idleAnimation: {
      y: [0, -2, 0],
      rotate: [0, 0.5, 0],
      transition: {
        duration: 4.0,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  sakura: {
    nameHe: 'סאקורה',
    image: '/images/characters/model-sheets/sakura.jpg',
    heroImage: '/images/characters/heroes/sakura-hero.jpg',
    expressionSheet: '/images/characters/expressions/sakura-expressions.jpg',
    glowColor: '#FF69B4',
    soundProfile: {
      oscillatorType: 'sine',
      frequencyRange: [350, 550],
    },
    idleAnimation: {
      y: [0, -3, 0],
      rotate: [0, 1, 0],
      transition: {
        duration: 2.8,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  zara: {
    nameHe: 'זארה',
    image: '/images/characters/model-sheets/zara.jpg',
    heroImage: '/images/characters/heroes/zara-hero.jpg',
    expressionSheet: '/images/characters/expressions/zara-expressions.jpg',
    glowColor: '#FF1744',
    soundProfile: {
      oscillatorType: 'sawtooth',
      frequencyRange: [300, 600],
    },
    idleAnimation: {
      y: [0, -5, 0],
      rotate: [0, -3, 0],
      transition: {
        duration: 1.6,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  keres: {
    nameHe: 'קרס',
    image: '/images/characters/model-sheets/keres.jpg',
    heroImage: '/images/characters/heroes/keres-hero.jpg',
    expressionSheet: '/images/characters/expressions/keres-expressions.jpg',
    glowColor: '#880E4F',
    soundProfile: {
      oscillatorType: 'sawtooth',
      frequencyRange: [150, 400],
    },
    idleAnimation: {
      y: [0, -4, 0],
      rotate: [0, 2, 0],
      transition: {
        duration: 2.0,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  block: {
    nameHe: 'בלוק',
    image: '/images/characters/model-sheets/block.jpg',
    heroImage: '/images/characters/heroes/block-hero.jpg',
    expressionSheet: '/images/characters/expressions/block-expressions.jpg',
    glowColor: '#FF6D00',
    soundProfile: {
      oscillatorType: 'square',
      frequencyRange: [200, 450],
    },
    idleAnimation: {
      y: [0, -3, 0],
      rotate: [0, -2, 0],
      transition: {
        duration: 2.2,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },

  lens: {
    nameHe: 'לאנס',
    image: '/images/characters/model-sheets/lens.jpg',
    heroImage: '/images/characters/heroes/lens-hero.jpg',
    expressionSheet: '/images/characters/expressions/lens-expressions.jpg',
    glowColor: '#00BFA5',
    soundProfile: {
      oscillatorType: 'triangle',
      frequencyRange: [400, 650],
    },
    idleAnimation: {
      y: [0, -4, 0],
      rotate: [0, 1.5, 0],
      transition: {
        duration: 2.4,
        repeat: INFINITE_REPEAT,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },
}

/** Characters considered heroes (player allies) */
const HERO_CHARACTERS: CharacterName[] = [
  'ki',
  'mika',
  'yuki',
  'luna',
  'noa',
  'kai',
  'senseiZen',
  'pixel',
  'rex',
  'phantom',
  'masterBeat',
  'sakura',
]

/**
 * Check if a character is a hero (player ally).
 */
export function isHeroCharacter(name: CharacterName): boolean {
  return HERO_CHARACTERS.includes(name)
}
