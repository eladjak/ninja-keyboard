'use client'

import { cn } from '@/lib/utils'

interface SkipLinkProps {
  /** The ID of the main content element to skip to. Defaults to 'main-content'. */
  targetId?: string
  /** Custom class names. */
  className?: string
}

/**
 * Accessibility skip link - hidden until focused via keyboard.
 * Allows keyboard users to skip navigation and jump to main content.
 * Text: "דלג לתוכן הראשי" (Skip to main content).
 */
export function SkipLink({ targetId = 'main-content', className }: SkipLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (typeof document === 'undefined') return

    const target = document.getElementById(targetId)
    if (!target) return

    target.focus({ preventScroll: false })
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Hidden by default, shown on focus
        'fixed start-4 top-4 z-[9999]',
        'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
        'outline-none ring-2 ring-ring ring-offset-2 ring-offset-background',
        // sr-only until focused
        'opacity-0 -translate-y-full pointer-events-none',
        'focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:pointer-events-auto',
        'transition-all duration-150',
        className,
      )}
    >
      דלג לתוכן הראשי
    </a>
  )
}
