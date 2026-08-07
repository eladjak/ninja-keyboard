import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// Phase 1 (blueprint A5b): account-only routes. /lessons and /battle are public
// so guests can play with localStorage-only (low-friction onboarding). Auth is
// enforced only when Supabase env is present (see the env guard below).
//
// /home is the guest-first hub (the landing-page primary CTA "מתחילים לשחק — חינם"
// points here) and is entirely localStorage-driven — it must stay public, or
// activating Supabase env (anon key) would bounce every guest to /login, breaking
// the advertised no-registration flow.
//
// /progress, /profile and /settings were gated here on the assumption that they
// were "account-scoped". They are not: all three read exclusively from the
// Zustand/localStorage stores and contain no server-side account data. Gating
// them meant a guest who played a lesson and earned XP hit a login wall the
// moment they clicked "פרופיל" or "הגדרות" in the sidebar — links the sidebar
// shows to guests. That is the advertised no-registration flow breaking on the
// three surfaces where a child goes to admire their own progress.
//
// A route belongs here only when it renders data that lives behind auth. Add it
// back the moment such a surface exists (e.g. a teacher roster reading Supabase).
const PROTECTED_ROUTES: string[] = []
const AUTH_ROUTES = ['/login', '/register', '/join']

export async function middleware(request: NextRequest) {
  // Skip auth when Supabase is not configured (demo / local dev)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  const { supabase, response } = createMiddlewareClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users from protected routes to login
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes to home
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/home'
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
