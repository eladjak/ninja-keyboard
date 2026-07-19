/**
 * Tests for the on-screen keyboard AS TOUCH INPUT (the #1 audience gap fix).
 *
 * The visual keyboard (`HebrewKeyboard` + `Key`) must, when given an
 * `onKeyInput` handler, feed `(char, code)` into the SAME typing pipeline a
 * physical keystroke uses — so a touch-only child (tablet/Chromebook) can type.
 * When `onKeyInput` is omitted, the keyboard stays a purely-visual indicator
 * (backward-compatible with every existing caller).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { HebrewKeyboard } from './hebrew-keyboard'
import { Key } from './key'
import { HOME_ROW, SPACE_KEY } from '@/lib/typing-engine/keyboard-layout'

// Render framer-motion elements as plain DOM so buttons are queryable and
// their handlers fire without animation machinery interfering.
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  const passthrough = new Proxy(
    {},
    {
      get:
        () =>
        ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          // Strip framer-only props that would warn on a native element.
          const { ...rest } = props as Record<string, unknown>
          delete rest.animate
          delete rest.initial
          delete rest.exit
          delete rest.whileTap
          return <button {...(rest as React.HTMLAttributes<HTMLButtonElement>)}>{children}</button>
        },
    },
  )
  return { ...actual, motion: passthrough, AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</> }
})

describe('Key (interactive)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fires onInput(char, code) on pointer-down when interactive', () => {
    const onInput = vi.fn()
    render(
      <Key
        char="ש"
        code="KeyA"
        enLabel="A"
        isActive={false}
        isPressed={false}
        isCorrect={null}
        finger="pinky"
        hand="left"
        fingerColor="#000"
        onInput={onInput}
      />,
    )
    const btn = screen.getByRole('button', { name: /הקש ש/ })
    fireEvent.pointerDown(btn)
    expect(onInput).toHaveBeenCalledWith('ש', 'KeyA')
  })

  it('is a real, enabled, tab-reachable button when interactive', () => {
    const onInput = vi.fn()
    render(
      <Key
        char="ש"
        code="KeyA"
        enLabel="A"
        isActive={false}
        isPressed={false}
        isCorrect={null}
        finger="pinky"
        hand="left"
        fingerColor="#000"
        onInput={onInput}
      />,
    )
    const btn = screen.getByRole('button', { name: /הקש ש/ })
    expect(btn).toBeEnabled()
    // Interactive keys are NOT aria-hidden and NOT removed from the tab order.
    expect(btn).not.toHaveAttribute('aria-hidden', 'true')
    expect(btn).not.toHaveAttribute('tabindex', '-1')
  })

  it('activates on Enter and Space keys (keyboard/switch users)', () => {
    const onInput = vi.fn()
    render(
      <Key
        char="ג"
        code="KeyD"
        enLabel="D"
        isActive={false}
        isPressed={false}
        isCorrect={null}
        finger="middle"
        hand="left"
        fingerColor="#000"
        onInput={onInput}
      />,
    )
    const btn = screen.getByRole('button', { name: /הקש ג/ })
    fireEvent.keyDown(btn, { key: 'Enter' })
    fireEvent.keyDown(btn, { key: ' ' })
    expect(onInput).toHaveBeenCalledTimes(2)
    expect(onInput).toHaveBeenCalledWith('ג', 'KeyD')
  })

  it('does NOT fire input and is hidden/disabled when non-interactive (visual only)', () => {
    render(
      <Key
        char="ש"
        code="KeyA"
        enLabel="A"
        isActive
        isPressed={false}
        isCorrect={null}
        finger="pinky"
        hand="left"
        fingerColor="#000"
      />,
    )
    // Visual-only key is aria-hidden, so not in the accessibility tree.
    const btn = screen.getByLabelText('מקש ש', { selector: 'button' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-hidden', 'true')
    expect(btn).toHaveAttribute('tabindex', '-1')
  })
})

describe('HebrewKeyboard (as input)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exposes a group of real buttons and routes taps to (char, code)', () => {
    const onKeyInput = vi.fn()
    render(<HebrewKeyboard onKeyInput={onKeyInput} />)

    const group = screen.getByRole('group', {
      name: /הקישו על המקשים/,
    })
    expect(group).toBeInTheDocument()

    // Tap the first home-row key (ש / KeyA)
    const first = HOME_ROW[0]
    const btn = within(group).getByRole('button', {
      name: new RegExp(`הקש ${first.char}`),
    })
    fireEvent.pointerDown(btn)
    expect(onKeyInput).toHaveBeenCalledWith(first.char, first.code)
  })

  it('routes the space bar to (" ", "Space")', () => {
    const onKeyInput = vi.fn()
    render(<HebrewKeyboard onKeyInput={onKeyInput} />)
    const spaceBtn = screen.getByRole('button', { name: /הקש רווח/ })
    fireEvent.pointerDown(spaceBtn)
    expect(onKeyInput).toHaveBeenCalledWith(SPACE_KEY.char, 'Space')
  })

  it('is a decorative image (role="img") with no tappable input when onKeyInput is omitted', () => {
    const onKeyInput = vi.fn()
    render(<HebrewKeyboard />)
    // Backward-compatible: still an image, not a group.
    expect(screen.getByRole('img', { name: /מקלדת עברית ויזואלית/ })).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    // No interactive keys are exposed to AT.
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(onKeyInput).not.toHaveBeenCalled()
  })
})
