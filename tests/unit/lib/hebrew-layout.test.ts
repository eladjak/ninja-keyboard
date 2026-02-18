import { describe, it, expect } from 'vitest'
import {
  TOP_ROW,
  HOME_ROW,
  BOTTOM_ROW,
  SPACE_KEY,
  ALL_KEYS,
  CHAR_TO_KEY,
  CODE_TO_KEY,
  KEYBOARD_ROWS,
  getFingerForChar,
  getKeysForFinger,
  HOME_POSITION,
} from '@/lib/typing-engine/keyboard-layout'

describe('keyboard layout structure', () => {
  it('has 10 keys in top row', () => {
    expect(TOP_ROW).toHaveLength(10)
  })

  it('has 10 keys in home row', () => {
    expect(HOME_ROW).toHaveLength(10)
  })

  it('has 10 keys in bottom row', () => {
    expect(BOTTOM_ROW).toHaveLength(10)
  })

  it('has 31 total keys (3 rows + space)', () => {
    expect(ALL_KEYS).toHaveLength(31)
  })

  it('KEYBOARD_ROWS has 3 rows', () => {
    expect(KEYBOARD_ROWS).toHaveLength(3)
  })
})

describe('key definitions', () => {
  it('all keys have unique characters', () => {
    const chars = ALL_KEYS.map((k) => k.char)
    const unique = new Set(chars)
    expect(unique.size).toBe(chars.length)
  })

  it('space key has correct code', () => {
    expect(SPACE_KEY.code).toBe('Space')
    expect(SPACE_KEY.char).toBe(' ')
    expect(SPACE_KEY.row).toBe('space')
  })

  it('all keys have valid finger assignments', () => {
    const validFingers = ['pinky', 'ring', 'middle', 'index']
    for (const key of ALL_KEYS) {
      expect(validFingers).toContain(key.finger)
    }
  })

  it('all keys have valid hand assignments', () => {
    for (const key of ALL_KEYS) {
      expect(['left', 'right']).toContain(key.hand)
    }
  })
})

describe('CHAR_TO_KEY map', () => {
  it('finds shin (ש) at KeyA', () => {
    const key = CHAR_TO_KEY.get('ש')
    expect(key).toBeDefined()
    expect(key!.code).toBe('KeyA')
  })

  it('finds alef (א) at KeyT', () => {
    const key = CHAR_TO_KEY.get('א')
    expect(key).toBeDefined()
    expect(key!.code).toBe('KeyT')
  })

  it('returns undefined for unknown character', () => {
    expect(CHAR_TO_KEY.get('ß')).toBeUndefined()
  })
})

describe('CODE_TO_KEY map', () => {
  it('finds KeyA → ש', () => {
    const key = CODE_TO_KEY.get('KeyA')
    expect(key).toBeDefined()
    expect(key!.char).toBe('ש')
  })
})

describe('getFingerForChar', () => {
  it('returns key definition for valid char', () => {
    const key = getFingerForChar('י')
    expect(key).toBeDefined()
    expect(key!.hand).toBe('right')
    expect(key!.finger).toBe('index')
  })

  it('returns undefined for invalid char', () => {
    expect(getFingerForChar('X')).toBeUndefined()
  })
})

describe('getKeysForFinger', () => {
  it('returns multiple keys for left index', () => {
    const keys = getKeysForFinger('index', 'left')
    expect(keys.length).toBeGreaterThan(1)
    for (const k of keys) {
      expect(k.hand).toBe('left')
      expect(k.finger).toBe('index')
    }
  })
})

describe('HOME_POSITION', () => {
  it('has 8 home position keys', () => {
    expect(Object.keys(HOME_POSITION)).toHaveLength(8)
  })

  it('includes both left and right hand keys', () => {
    expect(HOME_POSITION.leftIndex.hand).toBe('left')
    expect(HOME_POSITION.rightIndex.hand).toBe('right')
  })
})
