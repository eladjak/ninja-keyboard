import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateSpeedTestShareText,
  generateCertificateShareText,
  generateStreakShareText,
  canShare,
  canCopyToClipboard,
  shareText,
} from '@/lib/sharing/share-utils'

describe('generateSpeedTestShareText', () => {
  it('includes WPM, accuracy, and rank', () => {
    const text = generateSpeedTestShareText({
      wpm: 35,
      accuracy: 92,
      rank: 'expert',
      rankLabel: 'מומחה',
    })

    expect(text).toContain('35')
    expect(text).toContain('92%')
    expect(text).toContain('מומחה')
    expect(text).toContain('נינג\'ה מקלדת')
  })

  it('includes call to action', () => {
    const text = generateSpeedTestShareText({
      wpm: 20,
      accuracy: 80,
      rank: 'beginner',
      rankLabel: 'מתחיל',
    })

    expect(text).toContain('ninja-keyboard.app')
  })
})

describe('generateCertificateShareText', () => {
  it('includes certificate level and stats', () => {
    const text = generateCertificateShareText({
      level: 'gold',
      levelLabel: 'זהב',
      wpm: 25,
      accuracy: 88,
    })

    expect(text).toContain('זהב')
    expect(text).toContain('25')
    expect(text).toContain('88%')
  })

  it('includes app name', () => {
    const text = generateCertificateShareText({
      level: 'bronze',
      levelLabel: 'ארד',
      wpm: 10,
      accuracy: 75,
    })

    expect(text).toContain('נינג\'ה מקלדת')
  })
})

describe('generateStreakShareText', () => {
  it('includes streak days and stats', () => {
    const text = generateStreakShareText({
      days: 14,
      totalXp: 2500,
      level: 10,
    })

    expect(text).toContain('14')
    expect(text).toContain('2500')
    expect(text).toContain('10')
  })

  it('includes fire emoji', () => {
    const text = generateStreakShareText({
      days: 7,
      totalXp: 1000,
      level: 5,
    })

    expect(text).toContain('🔥')
  })
})

describe('canShare', () => {
  it('returns true when navigator.share exists', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { share: vi.fn() },
      writable: true,
      configurable: true,
    })

    expect(canShare()).toBe(true)
  })

  it('returns false when navigator.share is undefined', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    })

    expect(canShare()).toBe(false)
  })
})

describe('canCopyToClipboard', () => {
  it('returns true when clipboard API exists', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: vi.fn() } },
      writable: true,
      configurable: true,
    })

    expect(canCopyToClipboard()).toBe(true)
  })

  it('returns false when clipboard API is missing', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    })

    expect(canCopyToClipboard()).toBe(false)
  })
})

describe('shareText', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('uses Web Share API when available', async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', {
      value: { share: shareFn },
      writable: true,
      configurable: true,
    })

    const result = await shareText('test text', 'Title')

    expect(shareFn).toHaveBeenCalledWith({ text: 'test text', title: 'Title' })
    expect(result).toEqual({ success: true, method: 'share' })
  })

  it('falls back to clipboard when share fails', async () => {
    const shareFn = vi.fn().mockRejectedValue(new Error('User cancelled'))
    const writeTextFn = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', {
      value: { share: shareFn, clipboard: { writeText: writeTextFn } },
      writable: true,
      configurable: true,
    })

    const result = await shareText('test text')

    expect(writeTextFn).toHaveBeenCalledWith('test text')
    expect(result).toEqual({ success: true, method: 'clipboard' })
  })

  it('returns failure when no share method available', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    })

    const result = await shareText('test text')

    expect(result).toEqual({ success: false, method: 'none' })
  })

  it('uses default title when none provided', async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', {
      value: { share: shareFn },
      writable: true,
      configurable: true,
    })

    await shareText('text')

    expect(shareFn).toHaveBeenCalledWith({
      text: 'text',
      title: "נינג'ה מקלדת",
    })
  })
})
