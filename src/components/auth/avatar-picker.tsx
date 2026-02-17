'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { AVATARS, type AvatarId } from '@/types/auth'

interface AvatarPickerProps {
  onSelect: (avatarId: AvatarId) => void
  defaultValue?: AvatarId
}

export function AvatarPicker({ onSelect, defaultValue = 'fox' }: AvatarPickerProps) {
  const [selected, setSelected] = useState<AvatarId>(defaultValue)

  const handleSelect = useCallback(
    (id: AvatarId) => {
      setSelected(id)
      onSelect(id)
    },
    [onSelect]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = index
      const cols = 4

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = index > 0 ? index - 1 : AVATARS.length - 1
          break
        case 'ArrowLeft':
          nextIndex = index < AVATARS.length - 1 ? index + 1 : 0
          break
        case 'ArrowUp':
          nextIndex = index - cols >= 0 ? index - cols : index
          break
        case 'ArrowDown':
          nextIndex = index + cols < AVATARS.length ? index + cols : index
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleSelect(AVATARS[index].id)
          return
        default:
          return
      }

      e.preventDefault()
      const buttons = e.currentTarget.parentElement?.querySelectorAll('button')
      if (buttons?.[nextIndex]) {
        ;(buttons[nextIndex] as HTMLButtonElement).focus()
      }
    },
    [handleSelect]
  )

  return (
    <div
      className="grid grid-cols-4 gap-4"
      role="radiogroup"
      aria-label={'\u05D1\u05D7\u05E8 \u05D3\u05DE\u05D5\u05EA'}
    >
      {AVATARS.map((avatar, index) => (
        <button
          key={avatar.id}
          type="button"
          role="radio"
          aria-checked={selected === avatar.id}
          aria-label={avatar.label}
          tabIndex={selected === avatar.id ? 0 : -1}
          onClick={() => handleSelect(avatar.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl p-3 transition-shadow',
            'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            selected === avatar.id &&
              'ring-2 ring-primary bg-primary/10 shadow-sm'
          )}
        >
          <span className="text-4xl" aria-hidden="true">
            {avatar.emoji}
          </span>
          <span className="text-xs font-medium">{avatar.label}</span>
        </button>
      ))}
    </div>
  )
}
