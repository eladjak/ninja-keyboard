/**
 * Tests for ProfileCard — focused on the equipped avatar-frame cosmetic being
 * applied to the avatar ring. (The frame ring is tinted by the equipped accent
 * color, so frames + accents compose.)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileCard } from './profile-card'
import { useSettingsStore } from '@/stores/settings-store'
import {
  DEFAULT_ACCENT_ID,
  DEFAULT_FRAME_ID,
  DEFAULT_TITLE_ID,
  accentColorFor,
  cosmeticsByCategory,
} from '@/lib/gamification/coins'

// Render motion.div as a plain div so inline styles are inspectable.
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get:
          () =>
          ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
            <div {...props}>{children}</div>
          ),
      },
    ),
  }
})

// Force the hydrated branch so equipped cosmetics are read from the store.
vi.mock('@/hooks/use-hydrated', () => ({ useHydrated: () => true }))

function resetCosmetics() {
  useSettingsStore.setState({
    equippedAccent: DEFAULT_ACCENT_ID,
    equippedTitle: DEFAULT_TITLE_ID,
    equippedFrame: DEFAULT_FRAME_ID,
  })
}

describe('ProfileCard avatar frame', () => {
  beforeEach(() => {
    resetCosmetics()
  })

  it('applies the default ring (solid accent border) when no frame is bought', () => {
    render(<ProfileCard />)
    const avatar = screen.getByTestId('profile-avatar')
    expect(avatar.style.border).toContain('solid')
  })

  it('applies a glow frame (boxShadow) when the glow frame is equipped', () => {
    useSettingsStore.setState({ equippedFrame: 'frame-glow' })
    render(<ProfileCard />)
    const avatar = screen.getByTestId('profile-avatar')
    // The glow frame contributes a boxShadow tinted by the accent color.
    const accent = accentColorFor(DEFAULT_ACCENT_ID)
    expect(avatar.style.boxShadow).toContain(accent)
  })

  it('the equipped frame ring is tinted by the equipped accent color', () => {
    // accent-teal #00B894 → jsdom serializes the border color as rgb(0,184,148).
    const teal = cosmeticsByCategory('accent').find((c) => c.id === 'accent-teal')!
    useSettingsStore.setState({
      equippedAccent: teal.id,
      equippedFrame: 'frame-solid',
    })
    render(<ProfileCard />)
    const avatar = screen.getByTestId('profile-avatar')
    expect(avatar.style.border).toContain('solid')
    // The solid frame border carries the accent color, not the default purple.
    expect(avatar.style.border).toContain('rgb(0, 184, 148)')
    expect(avatar.style.border).not.toContain('108, 92, 231') // default #6C5CE7
  })
})
