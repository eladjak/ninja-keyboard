import { describe, it, expect } from 'vitest'
import {
  COINS_PER_STAR,
  COSMETICS,
  DEFAULT_ACCENT_ID,
  coinBalance,
  coinsFromStars,
  evaluatePurchase,
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
