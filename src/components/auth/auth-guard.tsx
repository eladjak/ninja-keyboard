import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface AuthGuardProps {
  children: React.ReactNode
}

export async function AuthGuard({ children }: AuthGuardProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
