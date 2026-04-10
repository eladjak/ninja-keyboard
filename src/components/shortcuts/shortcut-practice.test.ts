/**
 * Tests for the matchesShortcut key-detection logic used in ShortcutPractice.
 *
 * Verifies:
 * - Ctrl+C matches an event with ctrlKey=true and key='c'
 * - Ctrl+V matches with ctrlKey=true, key='v'
 * - Ctrl+Z matches with ctrlKey=true, key='z'
 * - Ctrl+Shift+T requires both ctrlKey AND shiftKey, key='t'
 * - Win+D (metaKey) matches correctly
 * - Alt+Tab matches with altKey=true, key='Tab'
 * - Alt+F4 matches with altKey=true, key='F4'
 * - Arrow keys: Ctrl+Shift+Arrow accepts ArrowLeft, ArrowRight, ArrowUp, ArrowDown
 * - Wrong key returns false (Ctrl+C does not match Ctrl+V)
 * - Missing modifier returns false (no ctrlKey for a Ctrl shortcut)
 * - Modifier-only keydown (pressing just Ctrl) never matches
 * - F-keys (F2, F5, F11) match correctly as single key shortcuts
 */

import { describe, it, expect } from 'vitest'

// ── Inline the matching function ─────────────────────────────────────────
// The function is defined inside shortcut-practice.tsx (not exported), so we
// duplicate it here. This keeps tests pure and fast without DOM overhead.

type MockShortcut = {
  keys: string[]
}

function matchesShortcut(
  event: Partial<KeyboardEvent> & { key: string },
  shortcut: MockShortcut,
): boolean {
  const keys = shortcut.keys.map((k) => k.toLowerCase())

  const needsCtrl = keys.includes('ctrl')
  const needsShift = keys.includes('shift')
  const needsAlt = keys.includes('alt')
  const needsWin = keys.includes('win')

  if ((event.ctrlKey ?? false) !== needsCtrl) return false
  if ((event.shiftKey ?? false) !== needsShift) return false
  if ((event.altKey ?? false) !== needsAlt) return false
  if ((event.metaKey ?? false) !== needsWin) return false

  const nonModifiers = keys.filter(
    (k) => !['ctrl', 'shift', 'alt', 'win'].includes(k),
  )

  if (nonModifiers.length === 0) return false

  const targetKey = nonModifiers[0] as string

  const keyMap: Record<string, string> = {
    tab: 'Tab',
    home: 'Home',
    end: 'End',
    arrow: 'ArrowRight',
    prtsc: 'PrintScreen',
    f2: 'F2',
    f4: 'F4',
    f5: 'F5',
    f11: 'F11',
    esc: 'Escape',
  }

  if (targetKey === 'arrow') {
    return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
      event.key,
    )
  }

  const expectedKey = keyMap[targetKey] ?? targetKey
  return event.key.toLowerCase() === expectedKey.toLowerCase()
}

// ── Helpers ───────────────────────────────────────────────────────────────

function makeEvent(
  key: string,
  modifiers: {
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
  } = {},
): Partial<KeyboardEvent> & { key: string } {
  return {
    key,
    ctrlKey: modifiers.ctrlKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    altKey: modifiers.altKey ?? false,
    metaKey: modifiers.metaKey ?? false,
  }
}

// ── Basic Ctrl shortcuts ──────────────────────────────────────────────────

describe('matchesShortcut — basic Ctrl combos', () => {
  it('Ctrl+C matches ctrlKey=true, key=c', () => {
    expect(matchesShortcut(makeEvent('c', { ctrlKey: true }), { keys: ['Ctrl', 'C'] })).toBe(true)
  })

  it('Ctrl+V matches ctrlKey=true, key=v', () => {
    expect(matchesShortcut(makeEvent('v', { ctrlKey: true }), { keys: ['Ctrl', 'V'] })).toBe(true)
  })

  it('Ctrl+Z matches ctrlKey=true, key=z', () => {
    expect(matchesShortcut(makeEvent('z', { ctrlKey: true }), { keys: ['Ctrl', 'Z'] })).toBe(true)
  })

  it('Ctrl+A matches ctrlKey=true, key=a', () => {
    expect(matchesShortcut(makeEvent('a', { ctrlKey: true }), { keys: ['Ctrl', 'A'] })).toBe(true)
  })

  it('Ctrl+S matches ctrlKey=true, key=s', () => {
    expect(matchesShortcut(makeEvent('s', { ctrlKey: true }), { keys: ['Ctrl', 'S'] })).toBe(true)
  })

  it('Ctrl+C does NOT match Ctrl+V event', () => {
    expect(matchesShortcut(makeEvent('v', { ctrlKey: true }), { keys: ['Ctrl', 'C'] })).toBe(false)
  })

  it('Ctrl+C does NOT match without ctrlKey', () => {
    expect(matchesShortcut(makeEvent('c'), { keys: ['Ctrl', 'C'] })).toBe(false)
  })
})

// ── Multi-modifier shortcuts ──────────────────────────────────────────────

describe('matchesShortcut — multi-modifier combos', () => {
  it('Ctrl+Shift+T requires both ctrl and shift', () => {
    // Both modifiers present
    expect(
      matchesShortcut(makeEvent('t', { ctrlKey: true, shiftKey: true }), {
        keys: ['Ctrl', 'Shift', 'T'],
      }),
    ).toBe(true)
  })

  it('Ctrl+Shift+T fails if only ctrl pressed', () => {
    expect(
      matchesShortcut(makeEvent('t', { ctrlKey: true }), {
        keys: ['Ctrl', 'Shift', 'T'],
      }),
    ).toBe(false)
  })

  it('Ctrl+Shift+T fails if only shift pressed', () => {
    expect(
      matchesShortcut(makeEvent('t', { shiftKey: true }), {
        keys: ['Ctrl', 'Shift', 'T'],
      }),
    ).toBe(false)
  })

  it('Ctrl+Shift+Esc matches correctly', () => {
    expect(
      matchesShortcut(makeEvent('Escape', { ctrlKey: true, shiftKey: true }), {
        keys: ['Ctrl', 'Shift', 'Esc'],
      }),
    ).toBe(true)
  })
})

// ── Alt shortcuts ─────────────────────────────────────────────────────────

describe('matchesShortcut — Alt combos', () => {
  it('Alt+Tab matches altKey=true, key=Tab', () => {
    expect(
      matchesShortcut(makeEvent('Tab', { altKey: true }), {
        keys: ['Alt', 'Tab'],
      }),
    ).toBe(true)
  })

  it('Alt+F4 matches altKey=true, key=F4', () => {
    expect(
      matchesShortcut(makeEvent('F4', { altKey: true }), {
        keys: ['Alt', 'F4'],
      }),
    ).toBe(true)
  })

  it('Alt+Tab fails without altKey', () => {
    expect(
      matchesShortcut(makeEvent('Tab'), { keys: ['Alt', 'Tab'] }),
    ).toBe(false)
  })
})

// ── Win (Meta) shortcuts ─────────────────────────────────────────────────

describe('matchesShortcut — Win/Meta combos', () => {
  it('Win+D matches metaKey=true, key=d', () => {
    expect(
      matchesShortcut(makeEvent('d', { metaKey: true }), {
        keys: ['Win', 'D'],
      }),
    ).toBe(true)
  })

  it('Win+E matches metaKey=true, key=e', () => {
    expect(
      matchesShortcut(makeEvent('e', { metaKey: true }), {
        keys: ['Win', 'E'],
      }),
    ).toBe(true)
  })

  it('Win+D fails without metaKey', () => {
    expect(
      matchesShortcut(makeEvent('d'), { keys: ['Win', 'D'] }),
    ).toBe(false)
  })
})

// ── Arrow keys ────────────────────────────────────────────────────────────

describe('matchesShortcut — Arrow key combos', () => {
  const arrowShortcut = { keys: ['Ctrl', 'Shift', 'Arrow'] }
  const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

  for (const arrowKey of arrows) {
    it(`Ctrl+Shift+Arrow accepts ${arrowKey}`, () => {
      expect(
        matchesShortcut(
          makeEvent(arrowKey, { ctrlKey: true, shiftKey: true }),
          arrowShortcut,
        ),
      ).toBe(true)
    })
  }

  it('Ctrl+Shift+Arrow rejects a non-arrow key (e.g. Enter)', () => {
    expect(
      matchesShortcut(
        makeEvent('Enter', { ctrlKey: true, shiftKey: true }),
        arrowShortcut,
      ),
    ).toBe(false)
  })
})

// ── Function keys ─────────────────────────────────────────────────────────

describe('matchesShortcut — Function keys', () => {
  it('F2 matches key=F2 with no modifiers', () => {
    expect(matchesShortcut(makeEvent('F2'), { keys: ['F2'] })).toBe(true)
  })

  it('F5 matches key=F5 with no modifiers', () => {
    expect(matchesShortcut(makeEvent('F5'), { keys: ['F5'] })).toBe(true)
  })

  it('F11 matches key=F11 with no modifiers', () => {
    expect(matchesShortcut(makeEvent('F11'), { keys: ['F11'] })).toBe(true)
  })

  it('F5 does NOT match if ctrlKey is also pressed (shortcut has no ctrl)', () => {
    expect(matchesShortcut(makeEvent('F5', { ctrlKey: true }), { keys: ['F5'] })).toBe(false)
  })
})

// ── Modifier-only events ──────────────────────────────────────────────────

describe('matchesShortcut — modifier-only keydown', () => {
  it('pressing just Control key does not match Ctrl+C', () => {
    // key='Control', ctrlKey=true — there is no non-modifier key
    // Our function checks nonModifiers.length === 0 → return false
    // But 'control' is not in our modifier list, so it would try to match key 'Control'
    // against 'C' → case-insensitive: 'control' !== 'c' → false
    expect(
      matchesShortcut(makeEvent('Control', { ctrlKey: true }), {
        keys: ['Ctrl', 'C'],
      }),
    ).toBe(false)
  })

  it('pressing just Shift key does not match any two-key shortcut', () => {
    expect(
      matchesShortcut(makeEvent('Shift', { shiftKey: true }), {
        keys: ['Ctrl', 'S'],
      }),
    ).toBe(false)
  })
})
