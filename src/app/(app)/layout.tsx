import { AppShell } from '@/components/layout/app-shell'
import { EntrySplash } from '@/components/entry/entry-splash'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* First-visit-only entry choreography. Renders before the shell so the
          gate script runs before paint; removes itself and is never seen again.
          Scoped to (app) on purpose — the landing page and auth screens do not
          get it. See components/entry/entry-splash.tsx for the full contract. */}
      <EntrySplash />
      <AppShell>{children}</AppShell>
    </>
  )
}
