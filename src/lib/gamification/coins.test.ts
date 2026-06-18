import { describe, it, expect } from 'vitest'
import {
  COINS_PER_STAR,
  COSMETICS,
  DEFAULT_ACCENT_ID,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_FRAME_ID,
  DEFAULT_TITLE_ID,
  accentColorFor,
  coinBalance,
  coinsFromStars,
  cosmeticsByCategory,
  equippedFrameFor,
  equippedTitleFor,
  evaluatePurchase,
  frameDecoration,
  getCosmetic,
  isUnlocked,
} from './coins'

describe('coinsFromStars', () => {
  it('grants COINS_PER_STAR per star', () => {
    expect(coinsFromStars(3)).toBe(3 * COINS_PER_STAR)
  })
  it('returns 0 for zero or negative stars', () => {
    expect(coinsFromStars(0)).toBe(0)
    expect(coinsFromStars(-5)).toBe(0)
  })
  it('floors fractional stars', () => {
    expect(coinsFromStars(2.9)).toBe(2 * COINS_PER_STAR)
  })
})

describe('coinBalance', () => {
  it('is earned minus spent', () => {
    expect(coinBalance(10, 30)).toBe(10 * COINS_PER_STAR - 30)
  })
  it('never goes negative', () => {
    expect(coinBalance(1, 9999)).toBe(0)
  })
  it('clamps negative spent to zero', () => {
    expect(coinBalance(2, -50)).toBe(2 * COINS_PER_STAR)
  })
})

describe('cosmetics catalog', () => {
  it('has a free default accent that is always first', () => {
    expect(COSMETICS[0].id).toBe(DEFAULT_ACCENT_ID)
    expect(COSMETICS[0].cost).toBe(0)
  })
  it('all cosmetics have unique ids', () => {
    const ids = COSMETICS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('getCosmetic finds by id and returns undefined for unknown', () => {
    expect(getCosmetic(DEFAULT_ACCENT_ID)?.cost).toBe(0)
    expect(getCosmetic('nope')).toBeUndefined()
  })
})

describe('isUnlocked', () => {
  it('free items are always unlocked', () => {
    expect(isUnlocked(DEFAULT_ACCENT_ID, [])).toBe(true)
  })
  it('paid items require ownership', () => {
    const paid = COSMETICS.find((c) => c.cost > 0)!
    expect(isUnlocked(paid.id, [])).toBe(false)
    expect(isUnlocked(paid.id, [paid.id])).toBe(true)
  })
  it('unknown ids are not unlocked', () => {
    expect(isUnlocked('nope', ['nope'])).toBe(false)
  })
})

describe('evaluatePurchase', () => {
  const paid = COSMETICS.find((c) => c.cost > 0)!

  it('rejects unknown item', () => {
    const r = evaluatePurchase({ itemId: 'nope', ownedIds: [], totalStars: 100, coinsSpent: 0 })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('not-found')
  })

  it('rejects an already-owned item', () => {
    const r = evaluatePurchase({ itemId: paid.id, ownedIds: [paid.id], totalStars: 100, coinsSpent: 0 })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('already-owned')
  })

  it('rejects a free item (already owned implicitly)', () => {
    const r = evaluatePurchase({ itemId: DEFAULT_ACCENT_ID, ownedIds: [], totalStars: 100, coinsSpent: 0 })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('already-owned')
  })

  it('rejects when funds are insufficient', () => {
    const r = evaluatePurchase({ itemId: paid.id, ownedIds: [], totalStars: 0, coinsSpent: 0 })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('insufficient-funds')
  })

  it('allows a purchase with enough balance and returns the cost to spend', () => {
    // Enough stars to comfortably afford the priciest item.
    const r = evaluatePurchase({ itemId: paid.id, ownedIds: [], totalStars: 1000, coinsSpent: 0 })
    expect(r.ok).toBe(true)
    expect(r.spend).toBe(paid.cost)
  })
})

describe('cosmetic categories', () => {
  it('cosmeticsByCategory splits accents, titles and frames', () => {
    const accents = cosmeticsByCategory('accent')
    const titles = cosmeticsByCategory('title')
    const frames = cosmeticsByCategory('frame')
    expect(accents.length).toBeGreaterThan(0)
    expect(titles.length).toBeGreaterThan(0)
    expect(frames.length).toBeGreaterThan(0)
    expect(accents.every((c) => c.category === 'accent')).toBe(true)
    expect(titles.every((c) => c.category === 'title')).toBe(true)
    expect(frames.every((c) => c.category === 'frame')).toBe(true)
    expect(accents.length + titles.length + frames.length).toBe(
      COSMETICS.length,
    )
  })

  it('each category has a free default first', () => {
    expect(cosmeticsByCategory('accent')[0].id).toBe(DEFAULT_ACCENT_ID)
    expect(cosmeticsByCategory('accent')[0].cost).toBe(0)
    expect(cosmeticsByCategory('title')[0].id).toBe(DEFAULT_TITLE_ID)
    expect(cosmeticsByCategory('title')[0].cost).toBe(0)
    expect(cosmeticsByCategory('frame')[0].id).toBe(DEFAULT_FRAME_ID)
    expect(cosmeticsByCategory('frame')[0].cost).toBe(0)
  })
})

describe('avatar frames', () => {
  it('every frame cosmetic declares a frameStyle', () => {
    const frames = cosmeticsByCategory('frame')
    expect(frames.every((c) => typeof c.frameStyle === 'string')).toBe(true)
  })

  it('the default frame is the plain "none" ring', () => {
    expect(getCosmetic(DEFAULT_FRAME_ID)?.frameStyle).toBe('none')
  })

  it('equippedFrameFor returns the style for a real frame', () => {
    const paidFrame = cosmeticsByCategory('frame').find((c) => c.cost > 0)!
    expect(equippedFrameFor(paidFrame.id)).toBe(paidFrame.frameStyle)
  })

  it('equippedFrameFor falls back to "none" for unknown / cross-slot ids', () => {
    expect(equippedFrameFor('frame-removed-long-ago')).toBe('none')
    // No cross-slot leakage from accent / title ids.
    expect(equippedFrameFor(DEFAULT_ACCENT_ID)).toBe('none')
    expect(equippedFrameFor(DEFAULT_TITLE_ID)).toBe('none')
  })

  it('a paid frame is purchasable with enough balance', () => {
    const paidFrame = cosmeticsByCategory('frame').find((c) => c.cost > 0)!
    const r = evaluatePurchase({
      itemId: paidFrame.id,
      ownedIds: [],
      totalStars: 1000,
      coinsSpent: 0,
    })
    expect(r.ok).toBe(true)
    expect(r.spend).toBe(paidFrame.cost)
  })
})

describe('frameDecoration', () => {
  const accent = '#123456'

  it('the default / none ring is a solid accent border', () => {
    expect(frameDecoration('none', accent).border).toBe(`4px solid ${accent}`)
  })

  it('the glow ring adds a boxShadow tinted by the accent', () => {
    const css = frameDecoration('glow', accent)
    expect(css.border).toContain(accent)
    expect(css.boxShadow).toContain(accent)
  })

  it('the gradient ring uses a transparent border + conic gradient', () => {
    const css = frameDecoration('gradient', accent)
    expect(css.border).toBe('4px solid transparent')
    expect(css.backgroundImage).toContain('conic-gradient')
    expect(css.backgroundImage).toContain(accent)
  })

  it('every frame style produces a border', () => {
    for (const style of ['none', 'solid', 'double', 'dashed', 'glow', 'gradient'] as const) {
      expect(frameDecoration(style, accent).border).toBeTruthy()
    }
  })
})

describe('equippedTitleFor', () => {
  it('returns empty strings for the default no-title', () => {
    expect(equippedTitleFor(DEFAULT_TITLE_ID)).toEqual({ textHe: '', emoji: '' })
  })

  it('returns text + emoji for a real title', () => {
    const title = cosmeticsByCategory('title').find((c) => c.cost > 0)!
    expect(equippedTitleFor(title.id)).toEqual({
      textHe: title.nameHe,
      emoji: title.emoji,
    })
  })

  it('returns empty for an accent id or unknown id (no cross-slot leakage)', () => {
    expect(equippedTitleFor(DEFAULT_ACCENT_ID)).toEqual({ textHe: '', emoji: '' })
    expect(equippedTitleFor('does-not-exist')).toEqual({ textHe: '', emoji: '' })
  })
})

describe('accentColorFor', () => {
  it('returns the catalog color for a known accent', () => {
    const teal = COSMETICS.find((c) => c.id === 'accent-teal')!
    expect(accentColorFor('accent-teal')).toBe(teal.color)
  })

  it('falls back to the default color for an unknown id', () => {
    expect(accentColorFor('accent-removed-long-ago')).toBe(DEFAULT_ACCENT_COLOR)
  })

  it('the default color matches the default accent', () => {
    expect(accentColorFor(DEFAULT_ACCENT_ID)).toBe(DEFAULT_ACCENT_COLOR)
  })
})
