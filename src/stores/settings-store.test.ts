import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settings-store'
import {
  DEFAULT_ACCENT_ID,
  DEFAULT_FRAME_ID,
  DEFAULT_TITLE_ID,
  cosmeticsByCategory,
} from '@/lib/gamification/coins'

const initial = useSettingsStore.getState()

function resetCosmetics() {
  useSettingsStore.setState({
    coinsSpent: 0,
    unlockedCosmetics: [],
    equippedAccent: DEFAULT_ACCENT_ID,
    equippedTitle: DEFAULT_TITLE_ID,
    equippedFrame: DEFAULT_FRAME_ID,
  })
}

describe('settings-store cosmetics (category-aware purchase + equip)', () => {
  beforeEach(() => {
    useSettingsStore.setState(initial)
    resetCosmetics()
  })

  const accent = cosmeticsByCategory('accent').find((c) => c.cost > 0)!
  const title = cosmeticsByCategory('title').find((c) => c.cost > 0)!
  const frame = cosmeticsByCategory('frame').find((c) => c.cost > 0)!

  it('starts with the default frame equipped', () => {
    expect(useSettingsStore.getState().equippedFrame).toBe(DEFAULT_FRAME_ID)
  })

  it('purchasing a frame unlocks it, spends coins, and auto-equips it into the frame slot only', () => {
    useSettingsStore.getState().purchaseCosmetic(frame.id, frame.cost)
    const s = useSettingsStore.getState()
    expect(s.unlockedCosmetics).toContain(frame.id)
    expect(s.coinsSpent).toBe(frame.cost)
    expect(s.equippedFrame).toBe(frame.id)
    // No cross-slot leakage — accent/title untouched.
    expect(s.equippedAccent).toBe(DEFAULT_ACCENT_ID)
    expect(s.equippedTitle).toBe(DEFAULT_TITLE_ID)
  })

  it('routes each category to its own equip slot', () => {
    const store = useSettingsStore.getState()
    store.purchaseCosmetic(accent.id, accent.cost)
    store.purchaseCosmetic(title.id, title.cost)
    store.purchaseCosmetic(frame.id, frame.cost)
    const s = useSettingsStore.getState()
    expect(s.equippedAccent).toBe(accent.id)
    expect(s.equippedTitle).toBe(title.id)
    expect(s.equippedFrame).toBe(frame.id)
    expect(s.coinsSpent).toBe(accent.cost + title.cost + frame.cost)
  })

  it('equipFrame swaps the equipped frame without re-spending', () => {
    const store = useSettingsStore.getState()
    store.purchaseCosmetic(frame.id, frame.cost)
    const spentAfterBuy = useSettingsStore.getState().coinsSpent
    // Equip the default ring back.
    store.equipFrame(DEFAULT_FRAME_ID)
    expect(useSettingsStore.getState().equippedFrame).toBe(DEFAULT_FRAME_ID)
    expect(useSettingsStore.getState().coinsSpent).toBe(spentAfterBuy)
  })

  it('is idempotent — re-buying an owned frame does not double-spend', () => {
    const store = useSettingsStore.getState()
    store.purchaseCosmetic(frame.id, frame.cost)
    store.purchaseCosmetic(frame.id, frame.cost)
    const s = useSettingsStore.getState()
    expect(s.coinsSpent).toBe(frame.cost)
    expect(s.unlockedCosmetics.filter((id) => id === frame.id)).toHaveLength(1)
  })
})
