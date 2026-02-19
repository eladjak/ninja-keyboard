import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GamesPage from '@/app/(app)/games/page'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('GamesPage', () => {
  it('renders page title', () => {
    render(<GamesPage />)
    expect(screen.getByText('משחקי הקלדה')).toBeInTheDocument()
  })

  it('renders game cards', () => {
    render(<GamesPage />)
    expect(screen.getByText('גשם מילים')).toBeInTheDocument()
    expect(screen.getByText('זירת קרב')).toBeInTheDocument()
  })

  it('has correct links', () => {
    render(<GamesPage />)
    const wordRainLink = screen.getByText('גשם מילים').closest('a')
    expect(wordRainLink).toHaveAttribute('href', '/games/word-rain')

    const battleLink = screen.getByText('זירת קרב').closest('a')
    expect(battleLink).toHaveAttribute('href', '/battle')
  })

  it('shows game descriptions', () => {
    render(<GamesPage />)
    expect(screen.getByText('הקלד את המילים לפני שהן נופלות!')).toBeInTheDocument()
    expect(screen.getByText('התחרה נגד בינה מלאכותית!')).toBeInTheDocument()
  })

  it('is RTL-directed', () => {
    const { container } = render(<GamesPage />)
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl')
  })
})
