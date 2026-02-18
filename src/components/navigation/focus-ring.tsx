'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface FocusRingProps {
  /** The content to wrap with a focus ring. */
  children: React.ReactElement<{ className?: string }>
  /** Ring color class (Tailwind). Defaults to 'ring-ring'. */
  ringColor?: string
  /** Ring width class (Tailwind). Defaults to 'ring-2'. */
  ringWidth?: string
  /** Ring offset class. Defaults to 'ring-offset-2'. */
  ringOffset?: string
  /** Additional class names applied to the child. */
  className?: string
}

/**
 * Custom focus ring wrapper.
 * Shows a visible focus ring for keyboard navigation (:focus-visible).
 * Hidden for mouse clicks.
 * Configurable ring color, width, and offset.
 */
export function FocusRing({
  children,
  ringColor = 'ring-ring',
  ringWidth = 'ring-2',
  ringOffset = 'ring-offset-2',
  className,
}: FocusRingProps) {
  const child = React.Children.only(children)

  return React.cloneElement(child, {
    className: cn(
      child.props.className,
      'outline-none',
      `focus-visible:${ringWidth}`,
      `focus-visible:${ringColor}`,
      `focus-visible:${ringOffset}`,
      'focus-visible:ring-offset-background',
      className,
    ),
  })
}
