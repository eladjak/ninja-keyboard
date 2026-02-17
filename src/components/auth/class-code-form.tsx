'use client'

import { useCallback, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { joinClass } from '@/lib/auth/actions'

const CODE_LENGTH = 6
const ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function ClassCodeForm() {
  const [values, setValues] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSubmit = useCallback(
    async (code: string) => {
      setIsPending(true)
      setError(null)
      const result = await joinClass(code)
      setIsPending(false)

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.data) {
        const params = new URLSearchParams({
          classId: result.data.id,
          className: result.data.name,
        })
        window.location.href = `/student-setup?${params.toString()}`
      }
    },
    []
  )

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      const char = inputValue.slice(-1).toUpperCase()
      if (char && !ALLOWED_CHARS.includes(char)) return

      const next = [...values]
      next[index] = char
      setValues(next)

      if (char && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      if (char && index === CODE_LENGTH - 1) {
        const code = next.join('')
        if (code.length === CODE_LENGTH) {
          handleSubmit(code)
        }
      }
    },
    [values, handleSubmit]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [values]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').toUpperCase().slice(0, CODE_LENGTH)
      const next = [...values]
      for (let i = 0; i < pasted.length; i++) {
        if (ALLOWED_CHARS.includes(pasted[i])) {
          next[i] = pasted[i]
        }
      }
      setValues(next)

      const code = next.join('')
      if (code.length === CODE_LENGTH) {
        handleSubmit(code)
      }
    },
    [values, handleSubmit]
  )

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-muted-foreground text-sm text-center">
        {'\u05D4\u05DB\u05E0\u05E1 \u05D0\u05EA \u05E7\u05D5\u05D3 \u05D4\u05DB\u05D9\u05EA\u05D4 \u05E9\u05E7\u05D9\u05D1\u05DC\u05EA \u05DE\u05D4\u05DE\u05D5\u05E8\u05D4'}
      </p>

      <div className="flex gap-2" dir="ltr" onPaste={handlePaste}>
        {values.map((value, i) => (
          <Input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            type="text"
            inputMode="text"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isPending}
            className="size-14 text-center text-xl font-bold uppercase"
            aria-label={`\u05EA\u05D5 ${i + 1} \u05DE\u05EA\u05D5\u05DA 6`}
          />
        ))}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {isPending && (
        <p className="text-muted-foreground text-sm">{'\u05D1\u05D5\u05D3\u05E7...'}</p>
      )}

      <Button
        onClick={() => handleSubmit(values.join(''))}
        disabled={isPending || values.join('').length !== CODE_LENGTH}
        className="w-full"
      >
        {'\u05D4\u05E6\u05D8\u05E8\u05E3 \u05DC\u05DB\u05D9\u05EA\u05D4'}
      </Button>
    </div>
  )
}
