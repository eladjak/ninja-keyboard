'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PIN_LENGTH = 4

interface PinInputProps {
  onComplete: (pin: string) => void
}

export function PinInput({ onComplete }: PinInputProps) {
  const [pin, setPin] = useState('')

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= PIN_LENGTH) return
      const next = pin + digit
      setPin(next)
      if (next.length === PIN_LENGTH) {
        onComplete(next)
      }
    },
    [pin, onComplete]
  )

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
  }, [])

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-muted-foreground text-sm">
        {'\u05D4\u05DB\u05E0\u05E1 \u05E7\u05D5\u05D3 \u05E1\u05D5\u05D3\u05D9'}
      </p>

      <div className="flex gap-3" aria-label={`\u05E7\u05D5\u05D3 \u05E1\u05D5\u05D3\u05D9, ${pin.length} \u05DE\u05EA\u05D5\u05DA ${PIN_LENGTH} \u05E1\u05E4\u05E8\u05D5\u05EA`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'size-4 rounded-full transition-colors',
              i < pin.length ? 'bg-primary' : 'bg-muted'
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {digits.map((d, i) => {
          if (d === '') {
            return <div key={i} />
          }
          if (d === 'back') {
            return (
              <Button
                key={i}
                type="button"
                variant="ghost"
                onClick={handleBackspace}
                disabled={pin.length === 0}
                className="size-16 text-xl"
                aria-label={'\u05DE\u05D7\u05E7'}
              >
                {'\u232B'}
              </Button>
            )
          }
          return (
            <Button
              key={i}
              type="button"
              variant="outline"
              onClick={() => handleDigit(d)}
              disabled={pin.length >= PIN_LENGTH}
              className="size-16 text-xl font-bold"
            >
              {d}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
