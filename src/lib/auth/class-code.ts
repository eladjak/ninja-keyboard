import { Result, TaggedError } from 'better-result'

const ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

class InvalidClassCodeError extends TaggedError('InvalidClassCodeError')<{
  message: string
  code: string
}>() {}

export function generateClassCode(): string {
  const chars: string[] = []
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = Math.floor(Math.random() * ALLOWED_CHARS.length)
    chars.push(ALLOWED_CHARS[index])
  }
  return chars.join('')
}

export function validateClassCode(
  code: string
): Result<string, InvalidClassCodeError> {
  const normalized = code.trim().toUpperCase()

  if (normalized.length !== CODE_LENGTH) {
    return Result.err(
      new InvalidClassCodeError({
        message: `Class code must be ${CODE_LENGTH} characters`,
        code,
      })
    )
  }

  for (const char of normalized) {
    if (!ALLOWED_CHARS.includes(char)) {
      return Result.err(
        new InvalidClassCodeError({
          message: `Class code contains invalid character: ${char}`,
          code,
        })
      )
    }
  }

  return Result.ok(normalized)
}

export { InvalidClassCodeError }
