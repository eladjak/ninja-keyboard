import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '../../utils'
import { Key } from '@/components/typing/key'
import { useSettingsStore } from '@/stores/settings-store'

function renderKey(overrides: Partial<React.ComponentProps<typeof Key>> = {}) {
  return render(
    <Key
      char="ש"
      enLabel="A"
      isActive={false}
      isPressed={false}
      isCorrect={null}
      finger="pinky"
      hand="right"
      fingerColor="#6C5CE7"
      {...overrides}
    />,
  )
}

describe('Key ripple', () => {
  beforeEach(() => {
    useSettingsStore.setState({ reducedMotion: false })
  })

  it('shows no ripple before the key is pressed', () => {
    renderKey({ isPressed: false })
    expect(screen.queryByTestId('key-ripple')).not.toBeInTheDocument()
  })

  it('spawns a ripple when the key becomes pressed', () => {
    const { rerender } = renderKey({ isPressed: false })
    expect(screen.queryByTestId('key-ripple')).not.toBeInTheDocument()
    rerender(
      <Key
        char="ש"
        enLabel="A"
        isActive={false}
        isPressed
        isCorrect={null}
        finger="pinky"
        hand="right"
        fingerColor="#6C5CE7"
      />,
    )
    expect(screen.getByTestId('key-ripple')).toBeInTheDocument()
  })

  it('does not spawn a ripple when reduced motion is enabled', () => {
    useSettingsStore.setState({ reducedMotion: true })
    const { rerender } = renderKey({ isPressed: false })
    rerender(
      <Key
        char="ש"
        enLabel="A"
        isActive={false}
        isPressed
        isCorrect={null}
        finger="pinky"
        hand="right"
        fingerColor="#6C5CE7"
      />,
    )
    expect(screen.queryByTestId('key-ripple')).not.toBeInTheDocument()
  })
})
