'use client'

import { Sidebar } from './sidebar'
import { BottomTabs } from './bottom-tabs'
import { Header } from './header'
import { PageTransition } from '@/components/transitions/page-transition'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex flex-1 flex-col game-bg">
        <Header />
        <main id="main-content" className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <BottomTabs />
      </div>
    </div>
  )
}
