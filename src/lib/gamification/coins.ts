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

export type CosmeticCategory = 'accent' | 'title' | 'frame'

/**
 * The visual recipe for an avatar frame (a decorative ring around the avatar).
 * Frames are pure on-brand CSS — NO external/paid images. The ring color is the
 * equipped accent color, so frames and accents compose; `frameStyle` only
 * describes the ring's *shape/decoration*.
 */
export type FrameStyle =
  | 'none' // plain ring (the free default)
  | 'solid' // thick solid ring
  | 'double' // double ring
  | 'dashed' // dashed "ninja" ring
  | 'glow' // solid ring with a strong outer glow
  | 'gradient' // conic gradient ring (rainbow shimmer)

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
  /** For 'frame' cosmetics: the decorative ring recipe. */
  frameStyle?: FrameStyle
}

/**
 * Accent-color cosmetics the kid can equip on their profile.
 * The first item is free and acts as the default.
 */
const ACCENT_COSMETICS: readonly CosmeticItem[] = [
  { id: 'accent-purple', category: 'accent', nameHe: 'סגול נינג׳ה', cost: 0, color: '#6C5CE7', emoji: '🟣' },
  { id: 'accent-teal', category: 'accent', nameHe: 'טורקיז', cost: 50, color: '#00B894', emoji: '🟢' },
  { id: 'accent-rose', category: 'accent', nameHe: 'ורוד אש', cost: 80, color: '#E84393', emoji: '🌸' },
  { id: 'accent-amber', category: 'accent', nameHe: 'זהב', cost: 120, color: '#F5B301', emoji: '🟡' },
  { id: 'accent-sky', category: 'accent', nameHe: 'כחול שמיים', cost: 120, color: '#0984E3', emoji: '🔵' },
  { id: 'accent-crimson', category: 'accent', nameHe: 'אדום דרקון', cost: 180, color: '#D63031', emoji: '🔴' },
  { id: 'accent-mint', category: 'accent', nameHe: 'מנטה', cost: 180, color: '#55EFC4', emoji: '🍃' },
  { id: 'accent-cosmic', category: 'accent', nameHe: 'סגול קוסמי', cost: 250, color: '#A29BFE', emoji: '✨' },
] as const

/**
 * Title cosmetics — a fun Hebrew "rank flavour" the kid wears under their name
 * on the profile. The first is free (no title) and acts as the default.
 * The `nameHe` doubles as the equipped title text (empty for the default).
 */
const TITLE_COSMETICS: readonly CosmeticItem[] = [
  { id: 'title-none', category: 'title', nameHe: '', cost: 0, color: '#6C5CE7', emoji: '🚫' },
  { id: 'title-fast-fingers', category: 'title', nameHe: 'אצבעות ברק', cost: 40, color: '#F5B301', emoji: '⚡' },
  { id: 'title-shadow', category: 'title', nameHe: 'נינג׳ת הצללים', cost: 60, color: '#6C5CE7', emoji: '🥷' },
  { id: 'title-keyboard-master', category: 'title', nameHe: 'אלוף המקלדת', cost: 100, color: '#00B894', emoji: '⌨️' },
  { id: 'title-dragon-typist', category: 'title', nameHe: 'דרקון ההקלדה', cost: 150, color: '#D63031', emoji: '🐉' },
  { id: 'title-legend', category: 'title', nameHe: 'אגדה חיה', cost: 220, color: '#A29BFE', emoji: '🌟' },
] as const

/**
 * Avatar-frame cosmetics — a decorative ring style worn around the profile
 * avatar. The ring is tinted by the equipped accent color, so frames compose
 * with accents (the `color` here is only the shop-swatch hint). The first frame
 * is free (plain ring) and acts as the default. Pure CSS, no external images.
 */
const FRAME_COSMETICS: readonly CosmeticItem[] = [
  { id: 'frame-none', category: 'frame', nameHe: 'טבעת רגילה', cost: 0, color: '#6C5CE7', emoji: '⭕', frameStyle: 'none' },
  { id: 'frame-solid', category: 'frame', nameHe: 'טבעת מלאה', cost: 40, color: '#00B894', emoji: '🟢', frameStyle: 'solid' },
  { id: 'frame-double', category: 'frame', nameHe: 'טבעת כפולה', cost: 70, color: '#0984E3', emoji: '🔵', frameStyle: 'double' },
  { id: 'frame-dashed', category: 'frame', nameHe: 'טבעת נינג׳ה', cost: 110, color: '#A29BFE', emoji: '🥷', frameStyle: 'dashed' },
  { id: 'frame-glow', category: 'frame', nameHe: 'הילה זוהרת', cost: 160, color: '#F5B301', emoji: '✨', frameStyle: 'glow' },
  { id: 'frame-gradient', category: 'frame', nameHe: 'קשת קסם', cost: 240, color: '#E84393', emoji: '🌈', frameStyle: 'gradient' },
] as const

/** Full cosmetic catalog across all categories. */
export const COSMETICS: readonly CosmeticItem[] = [
  ...ACCENT_COSMETICS,
  ...TITLE_COSMETICS,
  ...FRAME_COSMETICS,
] as const

/** Cosmetics of a single category, in catalog order. */
export function cosmeticsByCategory(
  category: CosmeticCategory,
): readonly CosmeticItem[] {
  return COSMETICS.filter((c) => c.category === category)
}

/** The default cosmetic that is always unlocked and equipped initially. */
export const DEFAULT_ACCENT_ID = 'accent-purple'

/** The default (empty) title that is always unlocked and equipped initially. */
export const DEFAULT_TITLE_ID = 'title-none'

/** The default avatar frame (plain ring), always unlocked and equipped initially. */
export const DEFAULT_FRAME_ID = 'frame-none'

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

/** The default accent color (purple) — used as a safe fallback. */
export const DEFAULT_ACCENT_COLOR =
  getCosmetic(DEFAULT_ACCENT_ID)?.color ?? '#6C5CE7'

/**
 * Resolve the hex color for an equipped accent id, falling back to the default
 * if the id is unknown (e.g. a persisted id from a removed cosmetic).
 */
export function accentColorFor(equippedAccentId: string): string {
  return getCosmetic(equippedAccentId)?.color ?? DEFAULT_ACCENT_COLOR
}

export interface EquippedTitle {
  /** Hebrew title text ('' when the default/no-title is equipped). */
  textHe: string
  /** Emoji prefix for the title ('' for the default). */
  emoji: string
}

/**
 * Resolve the equipped title (text + emoji). Returns empty strings for the
 * default "no title" cosmetic or an unknown id.
 */
export function equippedTitleFor(equippedTitleId: string): EquippedTitle {
  const item = getCosmetic(equippedTitleId)
  if (!item || item.category !== 'title' || item.id === DEFAULT_TITLE_ID) {
    return { textHe: '', emoji: '' }
  }
  return { textHe: item.nameHe, emoji: item.emoji }
}

/**
 * Resolve the equipped avatar-frame style. Falls back to the plain default ring
 * ('none') for an unknown id, a non-frame id (no cross-slot leakage), or the
 * default frame. Pure — the consumer turns the style into CSS.
 */
export function equippedFrameFor(equippedFrameId: string): FrameStyle {
  const item = getCosmetic(equippedFrameId)
  if (!item || item.category !== 'frame') return 'none'
  return item.frameStyle ?? 'none'
}

/**
 * Concrete inline CSS for an avatar frame, derived from a style + the accent
 * color. A plain string-keyed record (no React dependency) that spreads directly
 * onto an element's `style`. Pure and image-free, so the shop swatch and the
 * profile avatar render an identical ring.
 */
export function frameDecoration(
  style: FrameStyle,
  accentColor: string,
): Record<string, string> {
  switch (style) {
    case 'solid':
      return { border: `6px solid ${accentColor}` }
    case 'double':
      return {
        border: `4px double ${accentColor}`,
        outline: `2px solid ${accentColor}`,
        outlineOffset: '2px',
      }
    case 'dashed':
      return { border: `4px dashed ${accentColor}` }
    case 'glow':
      return {
        border: `4px solid ${accentColor}`,
        boxShadow: `0 0 18px ${accentColor}, 0 0 6px ${accentColor}`,
      }
    case 'gradient':
      return {
        border: '4px solid transparent',
        backgroundImage: `conic-gradient(from 0deg, ${accentColor}, #E84393, #F5B301, #00B894, ${accentColor})`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'border-box',
      }
    default:
      return { border: `4px solid ${accentColor}` }
  }
}
