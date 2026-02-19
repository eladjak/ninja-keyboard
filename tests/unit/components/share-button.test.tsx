import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareButton } from '@/components/sharing/share-button'
import * as shareUtils from '@/lib/sharing/share-utils'

vi.mock('@/lib/sharing/share-utils', () => ({
  shareText: vi.fn(),
  canShare: vi.fn(() => true),
  canCopyToClipboard: vi.fn(() => true),
}))

describe('ShareButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(shareUtils.shareText).mockResolvedValue({
      success: true,
      method: 'share',
    })
  })

  it('renders with default label', () => {
    render(<ShareButton text="test" />)

    expect(screen.getByText('שתף')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<ShareButton text="test" label="שלח" />)

    expect(screen.getByText('שלח')).toBeInTheDocument()
  })

  it('calls shareText when clicked', async () => {
    render(<ShareButton text="share me" title="Title" />)

    fireEvent.click(screen.getByText('שתף'))

    await waitFor(() => {
      expect(shareUtils.shareText).toHaveBeenCalledWith('share me', 'Title')
    })
  })

  it('shows "שותף!" after successful share', async () => {
    vi.mocked(shareUtils.shareText).mockResolvedValue({
      success: true,
      method: 'share',
    })

    render(<ShareButton text="test" />)
    fireEvent.click(screen.getByText('שתף'))

    await waitFor(() => {
      expect(screen.getByText('שותף!')).toBeInTheDocument()
    })
  })

  it('shows "הועתק!" after clipboard copy', async () => {
    vi.mocked(shareUtils.shareText).mockResolvedValue({
      success: true,
      method: 'clipboard',
    })

    render(<ShareButton text="test" />)
    fireEvent.click(screen.getByText('שתף'))

    await waitFor(() => {
      expect(screen.getByText('הועתק!')).toBeInTheDocument()
    })
  })

  it('sets status back to idle after timeout', async () => {
    // After a successful share, status changes then reverts
    vi.mocked(shareUtils.shareText).mockResolvedValue({
      success: true,
      method: 'share',
    })

    render(<ShareButton text="test" />)
    fireEvent.click(screen.getByText('שתף'))

    // Verify it transitions to success state
    await waitFor(() => {
      expect(screen.getByText('שותף!')).toBeInTheDocument()
    })

    // Wait for the real setTimeout to revert (2s)
    await waitFor(
      () => {
        expect(screen.getByText('שתף')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('has accessible aria-label', () => {
    render(<ShareButton text="test" />)

    expect(screen.getByLabelText('שתף')).toBeInTheDocument()
  })
})
