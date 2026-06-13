'use client'

import { Sidebar } from './sidebar'
import { BottomTabs } from './bottom-tabs'
import { Header } from './header'
import { PageTransition } from '@/components/transitions/page-transition'
import { FloatingParticles } from '@/components/effects/floating-particles'
import { CertificateCelebration } from '@/components/gamification/certificate-celebration'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Floating particles sit behind everything in the app shell */}
      <FloatingParticles />
      {/* Auto-surfaces a celebratory certificate modal on milestone completion */}
      <CertificateCelebration />
      <Sidebar />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col game-bg">
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
