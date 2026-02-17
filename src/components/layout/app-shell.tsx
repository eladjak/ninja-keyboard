'use client'

import { Sidebar } from './sidebar'
import { BottomTabs } from './bottom-tabs'
import { Header } from './header'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main id="main-content" className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>

        <BottomTabs />
      </div>
    </div>
  )
}
