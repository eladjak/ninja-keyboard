'use client'

import { useState, useCallback } from 'react'
import { Share2, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shareText } from '@/lib/sharing/share-utils'

interface ShareButtonProps {
  /** The text to share */
  text: string
  /** Optional title for the share dialog */
  title?: string
  /** Button label */
  label?: string
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Additional className */
  className?: string
}

export function ShareButton({
  text,
  title,
  label = 'שתף',
  variant = 'outline',
  size = 'sm',
  className,
}: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  const handleShare = useCallback(async () => {
    const result = await shareText(text, title)
    if (result.success) {
      setStatus(result.method === 'clipboard' ? 'copied' : 'shared')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }, [text, title])

  const Icon = status === 'copied' ? Check : status === 'shared' ? Check : Share2
  const displayLabel =
    status === 'copied' ? 'הועתק!' : status === 'shared' ? 'שותף!' : label

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      aria-label={displayLabel}
    >
      <Icon className="size-4" />
      {size !== 'icon' && <span>{displayLabel}</span>}
    </Button>
  )
}
