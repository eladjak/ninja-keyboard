'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/auth/actions'

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" className="gap-2">
        <LogOut className="size-4" />
        {'\u05D4\u05EA\u05E0\u05EA\u05E7'}
      </Button>
    </form>
  )
}
