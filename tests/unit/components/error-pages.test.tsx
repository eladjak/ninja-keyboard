import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AppError from '@/app/(app)/error'
import GlobalError from '@/app/error'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: (props: Record<string, unknown>) => <div data-testid="alert-icon" {...props} />,
  RotateCcw: (props: Record<string, unknown>) => <div data-testid="rotate-icon" {...props} />,
  Home: (props: Record<string, unknown>) => <div data-testid="home-icon" {...props} />,
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('GlobalError', () => {
  it('renders error message in Hebrew', () => {
    const reset = vi.fn()
    render(<GlobalError error={new Error('test')} reset={reset} />)

    expect(screen.getByText('אופס! משהו השתבש')).toBeInTheDocument()
  })

  it('renders retry button', () => {
    const reset = vi.fn()
    render(<GlobalError error={new Error('test')} reset={reset} />)

    expect(screen.getByText('נסה שוב')).toBeInTheDocument()
  })

  it('calls reset on retry click', () => {
    const reset = vi.fn()
    render(<GlobalError error={new Error('test')} reset={reset} />)

    fireEvent.click(screen.getByText('נסה שוב'))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('is RTL-directed', () => {
    const reset = vi.fn()
    const { container } = render(<GlobalError error={new Error('test')} reset={reset} />)

    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl')
  })
})

describe('AppError', () => {
  it('renders error message in Hebrew', () => {
    const reset = vi.fn()
    render(<AppError error={new Error('test')} reset={reset} />)

    expect(screen.getByText('אופס! משהו השתבש')).toBeInTheDocument()
  })

  it('renders retry button and home link', () => {
    const reset = vi.fn()
    render(<AppError error={new Error('test')} reset={reset} />)

    expect(screen.getByText('נסה שוב')).toBeInTheDocument()
    expect(screen.getByText('דף הבית')).toBeInTheDocument()
  })

  it('calls reset on retry click', () => {
    const reset = vi.fn()
    render(<AppError error={new Error('test')} reset={reset} />)

    fireEvent.click(screen.getByText('נסה שוב'))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('links home button to /home', () => {
    const reset = vi.fn()
    render(<AppError error={new Error('test')} reset={reset} />)

    const homeLink = screen.getByText('דף הבית').closest('a')
    expect(homeLink).toHaveAttribute('href', '/home')
  })

  it('shows error digest when available', () => {
    const reset = vi.fn()
    const error = Object.assign(new Error('test'), { digest: 'abc123' })
    render(<AppError error={error} reset={reset} />)

    expect(screen.getByText(/abc123/)).toBeInTheDocument()
  })

  it('does not show digest when unavailable', () => {
    const reset = vi.fn()
    render(<AppError error={new Error('test')} reset={reset} />)

    expect(screen.queryByText(/קוד:/)).toBeNull()
  })

  it('is RTL-directed', () => {
    const reset = vi.fn()
    const { container } = render(<AppError error={new Error('test')} reset={reset} />)

    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl')
  })
})
