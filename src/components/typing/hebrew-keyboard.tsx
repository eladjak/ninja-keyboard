'use client'

import { cn } from '@/lib/utils'
import {
  TOP_ROW,
  HOME_ROW,
  BOTTOM_ROW,
  SPACE_KEY,
  FINGER_COLORS,
} from '@/lib/typing-engine/keyboard-layout'
import type { KeyDefinition } from '@/lib/typing-engine/types'
import { Key } from './key'

interface HebrewKeyboardProps {
  /** Currently expected Hebrew character */
  activeKey?: string
  /** Currently pressed key (by Hebrew char or ' ' for space) */
  pressedKey?: string
  /** Whether the last keypress was correct — drives the flash */
  lastCorrect?: boolean | null
  /** Show finger-zone colour coding (default true) */
  showFingerColors?: boolean
  /** Optional extra class names */
  className?: string
}

/** Offsets (in rem) that push each row to mimic a staggered keyboard layout. */
const ROW_OFFSETS: Record<'top' | 'home' | 'bottom', string> = {
  top: '1.5rem',    // slightly indented from start
  home: '0rem',     // home row is the reference
  bottom: '2.5rem', // bottom row is further indented
}

export function HebrewKeyboard({
  activeKey,
  pressedKey,
  lastCorrect = null,
  showFingerColors = true,
  className,
}: HebrewKeyboardProps) {
  /** Render a single KeyDefinition as a <Key /> */
  function renderKey(keyDef: KeyDefinition) {
    const colorKey = `${keyDef.hand}-${keyDef.finger}` as const
    const fingerColor = showFingerColors
      ? FINGER_COLORS[colorKey]
      : 'var(--muted)'

    const isActive = activeKey !== undefined && keyDef.char === activeKey
    const isPressed = pressedKey !== undefined && keyDef.char === pressedKey

    // Only pass lastCorrect on the key that was just pressed, so only that
    // key flashes — others stay neutral.
    const isCorrect = isPressed ? lastCorrect : null

    return (
      <Key
        key={keyDef.code}
        char={keyDef.char}
        enLabel={keyDef.enLabel}
        isActive={isActive}
        isPressed={isPressed}
        isCorrect={isCorrect}
        finger={keyDef.finger}
        hand={keyDef.hand}
        width={keyDef.width ?? 1}
        fingerColor={fingerColor}
      />
    )
  }

  /** Render one keyboard row (array of KeyDefinition) with an RTL-safe start offset */
  function renderRow(
    keys: readonly KeyDefinition[],
    rowName: 'top' | 'home' | 'bottom',
  ) {
    return (
      <div
        key={rowName}
        className="flex flex-row gap-1"
        style={{ paddingInlineStart: ROW_OFFSETS[rowName] }}
      >
        {keys.map(renderKey)}
      </div>
    )
  }

  /** Space bar row — centred */
  function renderSpaceRow() {
    const colorKey =
      `${SPACE_KEY.hand}-${SPACE_KEY.finger}` as const
    const fingerColor = showFingerColors
      ? FINGER_COLORS[colorKey]
      : 'var(--muted)'

    const isActive =
      activeKey !== undefined && SPACE_KEY.char === activeKey
    const isPressed =
      pressedKey !== undefined && SPACE_KEY.char === pressedKey
    const isCorrect = isPressed ? lastCorrect : null

    return (
      <div key="space" className="flex flex-row justify-center gap-1">
        <Key
          char={SPACE_KEY.char}
          enLabel={SPACE_KEY.enLabel}
          isActive={isActive}
          isPressed={isPressed}
          isCorrect={isCorrect}
          finger={SPACE_KEY.finger}
          hand={SPACE_KEY.hand}
          width={SPACE_KEY.width ?? 6}
          fingerColor={fingerColor}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1.5 p-3',
        'rounded-xl bg-card border border-border shadow-md',
        'select-none',
        className,
      )}
      role="img"
      aria-label="מקלדת עברית ויזואלית"
    >
      {renderRow(TOP_ROW, 'top')}
      {renderRow(HOME_ROW, 'home')}
      {renderRow(BOTTOM_ROW, 'bottom')}
      {renderSpaceRow()}
    </div>
  )
}
