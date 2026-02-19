import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('NotFound page', () => {
  it('renders 404 text', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders Hebrew message', () => {
    render(<NotFound />)
    expect(screen.getByText('הדף לא נמצא')).toBeInTheDocument()
  })

  it('renders descriptive text with ninja reference', () => {
    render(<NotFound />)
    expect(screen.getByText(/נינג'ה/)).toBeInTheDocument()
  })

  it('links back to home page', () => {
    render(<NotFound />)
    const link = screen.getByText('חזרה לדף הבית')
    expect(link.closest('a')).toHaveAttribute('href', '/home')
  })

  it('is RTL-directed', () => {
    const { container } = render(<NotFound />)
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl')
  })
})
