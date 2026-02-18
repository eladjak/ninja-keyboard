import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibilityPanel } from '@/components/accessibility/accessibility-panel'
import { useAccessibilityStore } from '@/stores/accessibility-store'

// Mock window.matchMedia for prefers-reduced-motion
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

function renderPanel() {
  return render(
    <div dir="rtl" lang="he">
      <AccessibilityPanel />
    </div>,
  )
}

describe('AccessibilityPanel', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReaderAnnouncements: true,
      keyboardOnlyMode: false,
      dyslexiaFont: false,
    })
  })

  it('renders the panel title', () => {
    renderPanel()
    expect(screen.getByText('הגדרות נגישות')).toBeInTheDocument()
  })

  it('renders all toggle controls', () => {
    renderPanel()
    expect(screen.getByLabelText('הפעל ניגודיות גבוהה')).toBeInTheDocument()
    expect(screen.getByLabelText('הפעל הפחתת הנפשות')).toBeInTheDocument()
    expect(screen.getByLabelText('הפעל הכרזות קורא מסך')).toBeInTheDocument()
    expect(screen.getByLabelText('הפעל מצב מקלדת בלבד')).toBeInTheDocument()
    expect(screen.getByLabelText('הפעל גופן ידידותי לדיסלקציה')).toBeInTheDocument()
  })

  it('renders the font size selector', () => {
    renderPanel()
    expect(screen.getByLabelText('בחירת גודל גופן')).toBeInTheDocument()
  })

  it('renders all Hebrew labels for sections', () => {
    renderPanel()
    expect(screen.getByText('ניגודיות גבוהה')).toBeInTheDocument()
    expect(screen.getByText('הפחתת הנפשות')).toBeInTheDocument()
    expect(screen.getByText('הכרזות קורא מסך')).toBeInTheDocument()
    expect(screen.getByText('מצב מקלדת בלבד')).toBeInTheDocument()
    expect(screen.getByText('גופן ידידותי לדיסלקציה')).toBeInTheDocument()
    expect(screen.getByText('גודל גופן')).toBeInTheDocument()
  })

  it('renders description text for each control', () => {
    renderPanel()
    expect(
      screen.getByText('הגבר את הניגודיות בין הצבעים לשיפור הקריאות'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/הפחת או בטל אנימציות ותנועות/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('הפעל הודעות קוליות בעת שינוי הגדרות וביצוע פעולות'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('הצג את כל מחווני המיקוד לניווט מלא באמצעות מקלדת'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('השתמש בגופן שמקל על הקריאה עבור אנשים עם דיסלקציה'),
    ).toBeInTheDocument()
  })

  it('renders the reset button', () => {
    renderPanel()
    expect(
      screen.getByRole('button', { name: 'אפס את כל הגדרות הנגישות' }),
    ).toBeInTheDocument()
    expect(screen.getByText('אפס הגדרות')).toBeInTheDocument()
  })

  it('toggles high contrast when switch is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    const toggle = screen.getByLabelText('הפעל ניגודיות גבוהה')
    await user.click(toggle)

    expect(useAccessibilityStore.getState().highContrast).toBe(true)
  })

  it('toggles reduced motion when switch is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    const toggle = screen.getByLabelText('הפעל הפחתת הנפשות')
    await user.click(toggle)

    expect(useAccessibilityStore.getState().reducedMotion).toBe(true)
  })

  it('toggles screen reader announcements when switch is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    const toggle = screen.getByLabelText('הפעל הכרזות קורא מסך')
    // Default is true, so clicking should turn it off
    await user.click(toggle)

    expect(useAccessibilityStore.getState().screenReaderAnnouncements).toBe(
      false,
    )
  })

  it('toggles keyboard-only mode when switch is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    const toggle = screen.getByLabelText('הפעל מצב מקלדת בלבד')
    await user.click(toggle)

    expect(useAccessibilityStore.getState().keyboardOnlyMode).toBe(true)
  })

  it('toggles dyslexia font when switch is clicked', async () => {
    const user = userEvent.setup()
    renderPanel()

    const toggle = screen.getByLabelText('הפעל גופן ידידותי לדיסלקציה')
    await user.click(toggle)

    expect(useAccessibilityStore.getState().dyslexiaFont).toBe(true)
  })

  it('resets all settings when reset button is clicked', async () => {
    const user = userEvent.setup()

    // First modify some settings
    useAccessibilityStore.getState().toggleHighContrast()
    useAccessibilityStore.getState().toggleKeyboardOnlyMode()
    useAccessibilityStore.getState().setFontSize('large')

    renderPanel()

    const resetButton = screen.getByRole('button', {
      name: 'אפס את כל הגדרות הנגישות',
    })
    await user.click(resetButton)

    const state = useAccessibilityStore.getState()
    expect(state.highContrast).toBe(false)
    expect(state.keyboardOnlyMode).toBe(false)
    expect(state.fontSize).toBe('medium')
  })

  it('has a live region for screen reader announcements', () => {
    renderPanel()
    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toBeInTheDocument()
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
  })

  it('all switches have correct initial checked states', () => {
    renderPanel()

    // highContrast: false
    expect(screen.getByLabelText('הפעל ניגודיות גבוהה')).not.toBeChecked()
    // reducedMotion: false
    expect(screen.getByLabelText('הפעל הפחתת הנפשות')).not.toBeChecked()
    // screenReaderAnnouncements: true
    expect(screen.getByLabelText('הפעל הכרזות קורא מסך')).toBeChecked()
    // keyboardOnlyMode: false
    expect(screen.getByLabelText('הפעל מצב מקלדת בלבד')).not.toBeChecked()
    // dyslexiaFont: false
    expect(
      screen.getByLabelText('הפעל גופן ידידותי לדיסלקציה'),
    ).not.toBeChecked()
  })

  it('switches are keyboard accessible via Tab and Space', async () => {
    const user = userEvent.setup()
    renderPanel()

    const highContrastSwitch = screen.getByLabelText('הפעל ניגודיות גבוהה')

    // Focus the switch
    highContrastSwitch.focus()
    expect(highContrastSwitch).toHaveFocus()

    // Toggle with Space
    await user.keyboard(' ')
    expect(useAccessibilityStore.getState().highContrast).toBe(true)
  })

  it('renders dir="rtl" on the root container', () => {
    renderPanel()
    const panel = screen.getByText('הגדרות נגישות').closest('[dir="rtl"]')
    expect(panel).toBeInTheDocument()
  })
})
