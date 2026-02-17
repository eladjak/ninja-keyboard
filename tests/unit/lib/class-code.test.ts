import { describe, it, expect } from 'vitest'
import { generateClassCode, validateClassCode } from '@/lib/auth/class-code'

describe('generateClassCode', () => {
  it('generates a 6-character code', () => {
    const code = generateClassCode()
    expect(code).toHaveLength(6)
  })

  it('generates uppercase characters only', () => {
    const code = generateClassCode()
    expect(code).toBe(code.toUpperCase())
  })

  it('does not contain ambiguous characters (O, 0, I, 1, l)', () => {
    const ambiguous = ['O', '0', 'I', '1', 'l']
    for (let i = 0; i < 100; i++) {
      const code = generateClassCode()
      for (const char of ambiguous) {
        expect(code).not.toContain(char)
      }
    }
  })

  it('generates unique codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) {
      codes.add(generateClassCode())
    }
    expect(codes.size).toBeGreaterThan(90)
  })
})

describe('validateClassCode', () => {
  it('validates a correct code', () => {
    const result = validateClassCode('ABCDEF')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe('ABCDEF')
    }
  })

  it('converts lowercase to uppercase', () => {
    const result = validateClassCode('abcdef')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe('ABCDEF')
    }
  })

  it('rejects empty code', () => {
    const result = validateClassCode('')
    expect(result.isErr()).toBe(true)
  })

  it('rejects code shorter than 6 characters', () => {
    const result = validateClassCode('ABC')
    expect(result.isErr()).toBe(true)
  })

  it('rejects code longer than 6 characters', () => {
    const result = validateClassCode('ABCDEFG')
    expect(result.isErr()).toBe(true)
  })

  it('rejects code with ambiguous characters', () => {
    const result = validateClassCode('ABCDO0')
    expect(result.isErr()).toBe(true)
  })

  it('rejects code with special characters', () => {
    const result = validateClassCode('ABC!@#')
    expect(result.isErr()).toBe(true)
  })
})
