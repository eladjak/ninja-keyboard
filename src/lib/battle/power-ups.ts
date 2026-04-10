/**
 * Battle Power-Up System — pure logic, no side effects.
 *
 * Power-ups are earned at combo milestones during a battle.
 * Each power-up modifies the battle in a distinct way:
 *   - speedBoost:  Player types 20% faster (visual indicator, 5 s)
 *   - shield:      Next 3 errors don't count (absorbed, not penalised)
 *   - freeze:      AI opponent paused for 3 s
 *   - doubleXp:    XP doubled for the next 10 s
 *
 * Earning rule: every 15-combo milestone grants 1 random power-up charge.
 *   e.g. combo 15 → 1 charge, combo 30 → another charge, etc.
 */

// ── Types ─────────────────────────────────────────────────────────────

export type PowerUpId = 'speedBoost' | 'shield' | 'freeze' | 'doubleXp'

export interface PowerUpDefinition {
  id: PowerUpId
  /** Hebrew display name */
  nameHe: string
  /** Hebrew description shown on hover / tooltip */
  descriptionHe: string
  /** Emoji icon used in the UI button */
  icon: string
  /** How long the power-up stays active (ms). 0 = instant/charge-based. */
  duration: number
  /** Cooldown after the power-up expires before it can be activated again (ms). */
  cooldown: number
}

/** Per-power-up runtime state tracked during a battle. */
export interface PowerUpSlot {
  /** Number of charges available (0 = none). */
  charges: number
  /** Remaining active time in ms. 0 = inactive. */
  activeMs: number
  /** Remaining cooldown in ms. 0 = ready. */
  cooldownMs: number
  /** For shield: how many errors are still absorbed. */
  shieldHits: number
}

export interface PowerUpState {
  slots: Record<PowerUpId, PowerUpSlot>
  /** Last combo milestone that granted a charge (prevents double-granting). */
  lastGrantedMilestone: number
}

// ── Definitions ───────────────────────────────────────────────────────

export const POWER_UP_DEFS: Readonly<Record<PowerUpId, PowerUpDefinition>> = {
  speedBoost: {
    id: 'speedBoost',
    nameHe: 'האצה',
    descriptionHe: 'הקלדה מהירה יותר ב-20% למשך 5 שניות',
    icon: '⚡',
    duration: 5_000,
    cooldown: 10_000,
  },
  shield: {
    id: 'shield',
    nameHe: 'מגן',
    descriptionHe: '3 הטעויות הבאות לא נספרות',
    icon: '🛡️',
    duration: 0, // charge-based — expires when all hits absorbed
    cooldown: 12_000,
  },
  freeze: {
    id: 'freeze',
    nameHe: 'הקפאה',
    descriptionHe: 'היריב קפוא למשך 3 שניות',
    icon: '❄️',
    duration: 3_000,
    cooldown: 15_000,
  },
  doubleXp: {
    id: 'doubleXp',
    nameHe: 'XP כפול',
    descriptionHe: 'הניקוד מוכפל למשך 10 שניות',
    icon: '✨',
    duration: 10_000,
    cooldown: 20_000,
  },
}

export const ALL_POWER_UP_IDS: readonly PowerUpId[] = [
  'speedBoost',
  'shield',
  'freeze',
  'doubleXp',
]

/** Combo count interval at which a power-up charge is awarded. */
const COMBO_MILESTONE = 15

/** Maximum charges a single power-up slot can hold. */
const MAX_CHARGES = 3

/** Number of shield hits per activation. */
const SHIELD_HITS = 3

// ── Factory ───────────────────────────────────────────────────────────

/** Create the initial power-up state at the start of a battle. */
export function createPowerUpState(): PowerUpState {
  const slots = {} as Record<PowerUpId, PowerUpSlot>
  for (const id of ALL_POWER_UP_IDS) {
    slots[id] = { charges: 0, activeMs: 0, cooldownMs: 0, shieldHits: 0 }
  }
  return { slots, lastGrantedMilestone: 0 }
}

// ── Pure Queries ──────────────────────────────────────────────────────

/**
 * Returns true when a power-up can be activated:
 * - has at least 1 charge
 * - is not already active
 * - is not on cooldown
 */
export function isPowerUpAvailable(
  state: PowerUpState,
  id: PowerUpId,
): boolean {
  const slot = state.slots[id]
  return slot.charges > 0 && slot.activeMs === 0 && slot.cooldownMs === 0
}

/** Returns true when a power-up is currently active. */
export function isPowerUpActive(state: PowerUpState, id: PowerUpId): boolean {
  const slot = state.slots[id]
  if (id === 'shield') return slot.shieldHits > 0
  return slot.activeMs > 0
}

/** Returns remaining active time in ms (0 if inactive). */
export function getPowerUpActiveMs(state: PowerUpState, id: PowerUpId): number {
  return state.slots[id].activeMs
}

/** Returns remaining cooldown in ms (0 if ready). */
export function getPowerUpCooldownMs(
  state: PowerUpState,
  id: PowerUpId,
): number {
  return state.slots[id].cooldownMs
}

// ── Pure Mutations (return new state) ─────────────────────────────────

/**
 * Activate a power-up. Consumes 1 charge and starts the active timer.
 * Returns the unchanged state if the power-up is not available.
 */
export function activatePowerUp(
  state: PowerUpState,
  id: PowerUpId,
): PowerUpState {
  if (!isPowerUpAvailable(state, id)) return state

  const def = POWER_UP_DEFS[id]
  const slot = state.slots[id]

  const updated: PowerUpSlot = {
    ...slot,
    charges: slot.charges - 1,
    activeMs: def.duration,
    shieldHits: id === 'shield' ? SHIELD_HITS : slot.shieldHits,
  }

  return {
    ...state,
    slots: { ...state.slots, [id]: updated },
  }
}

/**
 * Consume one shield hit (call when a typing error occurs while shield is active).
 * Returns the unchanged state if the shield is not active.
 */
export function consumeShieldHit(state: PowerUpState): PowerUpState {
  const slot = state.slots.shield
  if (slot.shieldHits === 0) return state

  const remaining = slot.shieldHits - 1
  const updated: PowerUpSlot = {
    ...slot,
    shieldHits: remaining,
    // When all hits are absorbed, start cooldown
    cooldownMs: remaining === 0 ? POWER_UP_DEFS.shield.cooldown : slot.cooldownMs,
  }

  return {
    ...state,
    slots: { ...state.slots, shield: updated },
  }
}

/**
 * Advance all power-up timers by deltaMs.
 * Should be called once per game-tick (e.g. every 100 ms).
 * Returns a new state with updated timers.
 */
export function tickPowerUps(
  state: PowerUpState,
  deltaMs: number,
): PowerUpState {
  const updatedSlots = { ...state.slots }

  for (const id of ALL_POWER_UP_IDS) {
    const slot = updatedSlots[id]
    const def = POWER_UP_DEFS[id]
    let { activeMs, cooldownMs, shieldHits } = slot

    if (id === 'shield') {
      // Shield is charge-based; cooldown ticks when all hits are consumed
      if (shieldHits === 0 && cooldownMs > 0) {
        cooldownMs = Math.max(0, cooldownMs - deltaMs)
      }
    } else {
      if (activeMs > 0) {
        activeMs = Math.max(0, activeMs - deltaMs)
        // Power-up expired → start cooldown
        if (activeMs === 0) {
          cooldownMs = def.cooldown
        }
      } else if (cooldownMs > 0) {
        cooldownMs = Math.max(0, cooldownMs - deltaMs)
      }
    }

    updatedSlots[id] = { ...slot, activeMs, cooldownMs, shieldHits }
  }

  return { ...state, slots: updatedSlots }
}

/**
 * Check the current combo count and grant a random power-up charge
 * if a new milestone has been reached.
 * Returns the new state (unchanged if no milestone was crossed).
 */
export function checkComboMilestone(
  state: PowerUpState,
  combo: number,
): PowerUpState {
  const milestone = Math.floor(combo / COMBO_MILESTONE) * COMBO_MILESTONE
  if (milestone === 0 || milestone <= state.lastGrantedMilestone) return state

  // Pick a random power-up that hasn't hit max charges
  const eligible = ALL_POWER_UP_IDS.filter(
    (id) => state.slots[id].charges < MAX_CHARGES,
  )
  if (eligible.length === 0) return state

  const chosen = eligible[Math.floor(Math.random() * eligible.length)]
  const slot = state.slots[chosen]

  return {
    ...state,
    lastGrantedMilestone: milestone,
    slots: {
      ...state.slots,
      [chosen]: { ...slot, charges: slot.charges + 1 },
    },
  }
}

// ── Battle Modifier Queries ───────────────────────────────────────────

/** Returns true when the AI should be paused (freeze power-up active). */
export function isAIFrozen(state: PowerUpState): boolean {
  return isPowerUpActive(state, 'freeze')
}

/** Returns true when XP should be doubled. */
export function isDoubleXpActive(state: PowerUpState): boolean {
  return isPowerUpActive(state, 'doubleXp')
}

/** Returns true when speed boost is active. */
export function isSpeedBoostActive(state: PowerUpState): boolean {
  return isPowerUpActive(state, 'speedBoost')
}

/** Returns true when the shield is absorbing errors. */
export function isShieldActive(state: PowerUpState): boolean {
  return state.slots.shield.shieldHits > 0
}

/** How many shield hits are remaining. */
export function getShieldHitsRemaining(state: PowerUpState): number {
  return state.slots.shield.shieldHits
}
