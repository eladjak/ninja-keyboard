/**
 * Spendable currency ("מטבעות נינג׳ה") — a cosmetic-only coin economy.
 *
 * Coins are EARNED deterministically from the stars a kid has collected, so the
 * lifetime-earned total can always be re-derived from progress (no payments, no
 * gambling). Only the amount SPENT is persisted; the live balance is
 * `earned - spent`. Pure functions, no side effects.
 */

/** Coins granted per star earned. */
export const COINS_PER_STAR = 10

export type CosmeticCategory = 'accent'

export interface CosmeticItem {
  /** Stable id, persisted in the unlocked set. */
  id: string
  /** What this cosmetic changes. */
  category: CosmeticCategory
  /** Hebrew display name. */
  nameHe: string
  /** Coin cost. 0 = free / default, always unlocked. */
  cost: number
  /** Primary color (hex) used for the accent + swatch. */
  color: string
  /** Emoji shown on the shop card. */
  emoji: string
}

/**
 * Cosmetic catalog — accent colors the kid can equip on their profile.
 * The first item is free and acts as the default.
 */
export const COSMETICS: readonly CosmeticItem[] = [
  { id: 'accent-purple', category: 'accent', nameHe: 'סגול נינג׳ה', cost: 0, color: '#6C5CE7', emoji: '🟣' },
  { id: 'accent-teal', category: 'accent', nameHe: 'טורקיז', cost: 50, color: '#00B894', emoji: '🟢' },
  { id: 'accent-rose', category: 'accent', nameHe: 'ורוד אש', cost: 80, color: '#E84393', emoji: '🌸' },
  { id: 'accent-amber', category: 'accent', nameHe: 'זהב', cost: 120, color: '#F5B301', emoji: '🟡' },
  { id: 'accent-sky', category: 'accent', nameHe: 'כחול שמיים', cost: 120, color: '#0984E3', emoji: '🔵' },
  { id: 'accent-crimson', category: 'accent', nameHe: 'אדום דרקון', cost: 180, color: '#D63031', emoji: '🔴' },
  { id: 'accent-mint', category: 'accent', nameHe: 'מנטה', cost: 180, color: '#55EFC4', emoji: '🍃' },
  { id: 'accent-cosmic', category: 'accent', nameHe: 'סגול קוסמי', cost: 250, color: '#A29BFE', emoji: '✨' },
] as const

/** The default cosmetic that is always unlocked and equipped initially. */
export const DEFAULT_ACCENT_ID = 'accent-purple'

/** Lifetime coins earned from a star total. */
export function coinsFromStars(totalStars: number): number {
  if (totalStars <= 0) return 0
  return Math.floor(totalStars) * COINS_PER_STAR
}

/** Live spendable balance given lifetime earnings and what was already spent. */
export function coinBalance(totalStars: number, coinsSpent: number): number {
  return Math.max(0, coinsFromStars(totalStars) - Math.max(0, coinsSpent))
}

/** Look up a cosmetic by id. */
export function getCosmetic(id: string): CosmeticItem | undefined {
  return COSMETICS.find((c) => c.id === id)
}

export type PurchaseError = 'already-owned' | 'not-found' | 'insufficient-funds'

export interface PurchaseResult {
  ok: boolean
  /** Coins to ADD to the persisted spent total (the item cost) when ok. */
  spend: number
  /** Reason when not ok. */
  error?: PurchaseError
}

/**
 * Evaluate whether a purchase is allowed. Pure — the caller applies the result
 * to the store (adds `spend` to coinsSpent and the id to the unlocked set).
 */
export function evaluatePurchase(params: {
  itemId: string
  ownedIds: readonly string[]
  totalStars: number
  coinsSpent: number
}): PurchaseResult {
  const item = getCosmetic(params.itemId)
  if (!item) return { ok: false, spend: 0, error: 'not-found' }
  if (item.cost === 0 || params.ownedIds.includes(params.itemId)) {
    return { ok: false, spend: 0, error: 'already-owned' }
  }
  const balance = coinBalance(params.totalStars, params.coinsSpent)
  if (balance < item.cost) {
    return { ok: false, spend: 0, error: 'insufficient-funds' }
  }
  return { ok: true, spend: item.cost }
}

/** Whether a cosmetic is unlocked (free items are always unlocked). */
export function isUnlocked(itemId: string, ownedIds: readonly string[]): boolean {
  const item = getCosmetic(itemId)
  if (!item) return false
  return item.cost === 0 || ownedIds.includes(itemId)
}
