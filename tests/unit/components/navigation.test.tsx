import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/home',
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, exit, transition, layoutId, ...rest } = props
      return <div {...rest}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

import { Sidebar } from '@/components/layout/sidebar'
import { BottomTabs } from '@/components/layout/bottom-tabs'

describe('Sidebar', () => {
  it('renders navigation with all main links', () => {
    render(<Sidebar />)
    const nav = screen.getByRole('navigation', { name: 'ניווט ראשי' })
    expect(nav).toBeInTheDocument()
  })

  it('includes practice link', () => {
    render(<Sidebar />)
    expect(screen.getByText('תרגול חופשי')).toBeInTheDocument()
  })

  it('includes speed test link', () => {
    render(<Sidebar />)
    expect(screen.getByText('מבחן מהירות')).toBeInTheDocument()
  })

  it('includes statistics link', () => {
    render(<Sidebar />)
    expect(screen.getByText('סטטיסטיקות')).toBeInTheDocument()
  })

  it('includes shortcuts link', () => {
    render(<Sidebar />)
    expect(screen.getByText('קיצורי מקלדת')).toBeInTheDocument()
  })

  it('includes leaderboard link', () => {
    render(<Sidebar />)
    expect(screen.getByText('טבלת מובילים')).toBeInTheDocument()
  })

  it('marks current page as active', () => {
    render(<Sidebar />)
    const homeLink = screen.getByText('בית').closest('a')
    expect(homeLink).toHaveAttribute('aria-current', 'page')
  })

  it('renders logout button', () => {
    render(<Sidebar />)
    expect(screen.getByText('התנתק')).toBeInTheDocument()
  })

  it('has correct number of nav links', () => {
    render(<Sidebar />)
    const nav = screen.getByRole('navigation', { name: 'ניווט ראשי' })
    const links = nav.querySelectorAll('a')
    expect(links).toHaveLength(12) // Home, Lessons, Practice, Speed Test, Battle, Games, Shortcuts, Leaderboard, Certificates, Statistics, Profile, Settings
  })
})

describe('BottomTabs', () => {
  it('renders mobile navigation', () => {
    render(<BottomTabs />)
    const nav = screen.getByRole('navigation', { name: 'ניווט ראשי' })
    expect(nav).toBeInTheDocument()
  })

  it('includes practice tab', () => {
    render(<BottomTabs />)
    expect(screen.getByText('תרגול')).toBeInTheDocument()
  })

  it('has 5 tabs', () => {
    render(<BottomTabs />)
    const nav = screen.getByRole('navigation', { name: 'ניווט ראשי' })
    const links = nav.querySelectorAll('a')
    expect(links).toHaveLength(5)
  })

  it('marks current page as active', () => {
    render(<BottomTabs />)
    const homeLink = screen.getByText('בית').closest('a')
    expect(homeLink).toHaveAttribute('aria-current', 'page')
  })
})
