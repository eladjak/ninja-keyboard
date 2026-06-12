import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CERTIFICATE_NAME,
  buildCertificateData,
  certificateFileName,
  formatCertificateDate,
  starString,
} from './certificate-canvas'

describe('formatCertificateDate', () => {
  it('formats as dd.MM.yyyy', () => {
    // 2026-06-12 (month is 0-indexed in Date)
    const ts = new Date(2026, 5, 12).getTime()
    expect(formatCertificateDate(ts)).toBe('12.06.2026')
  })

  it('zero-pads single-digit days and months', () => {
    const ts = new Date(2026, 0, 3).getTime()
    expect(formatCertificateDate(ts)).toBe('03.01.2026')
  })
})

describe('certificateFileName', () => {
  it('builds a teudat-ninja-* png name', () => {
    expect(certificateFileName('דניאל')).toBe('teudat-ninja-דניאל.png')
  })

  it('replaces spaces with dashes', () => {
    expect(certificateFileName('נועה כהן')).toBe('teudat-ninja-נועה-כהן.png')
  })

  it('strips filesystem-illegal characters', () => {
    expect(certificateFileName('a/b:c*?')).toBe('teudat-ninja-abc.png')
  })

  it('falls back to ninja when empty', () => {
    expect(certificateFileName('')).toBe('teudat-ninja-ninja.png')
    expect(certificateFileName('   ')).toBe('teudat-ninja-ninja.png')
  })
})

describe('starString', () => {
  it('renders filled then empty stars', () => {
    expect(starString(0)).toBe('☆☆☆')
    expect(starString(1)).toBe('★☆☆')
    expect(starString(3)).toBe('★★★')
  })

  it('clamps out-of-range values', () => {
    expect(starString(5)).toBe('★★★')
    expect(starString(-2)).toBe('☆☆☆')
  })
})

describe('buildCertificateData', () => {
  it('maps a known level to its Hebrew title + emoji', () => {
    const data = buildCertificateData({
      name: 'קי',
      level: 'gold',
      issuedAt: 0,
    })
    expect(data.titleHe).toBe('תעודת זהב')
    expect(data.emoji).toBe('🥇')
    expect(data.name).toBe('קי')
  })

  it('uses the default name when blank', () => {
    const data = buildCertificateData({ name: '   ', level: 'bronze' })
    expect(data.name).toBe(DEFAULT_CERTIFICATE_NAME)
  })

  it('defaults to 3 stars and clamps overrides', () => {
    expect(buildCertificateData({ name: 'x', level: 'bronze' }).stars).toBe(3)
    expect(
      buildCertificateData({ name: 'x', level: 'bronze', stars: 9 }).stars,
    ).toBe(3)
    expect(
      buildCertificateData({ name: 'x', level: 'bronze', stars: -1 }).stars,
    ).toBe(0)
  })

  it('falls back to the highest cert for the ninja-master level', () => {
    const data = buildCertificateData({
      name: 'x',
      level: 'ninja-master',
    })
    expect(data.titleHe).toBe('מאסטר נינג׳ה')
    expect(data.emoji).toBe('🥷')
  })
})
