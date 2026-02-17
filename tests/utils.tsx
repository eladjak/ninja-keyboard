import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement } from 'react'

function RTLWrapper({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" lang="he">{children}</div>
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: RTLWrapper, ...options })
}

export { customRender as render }
export { screen, waitFor, within, act } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
