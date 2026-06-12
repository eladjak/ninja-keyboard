'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateClassCode } from './class-code'
import { loginSchema, registerSchema, studentProfileSchema } from './schemas'

// Guest-mode guard: when Supabase env is missing (v1 guest-first deploy),
// auth actions degrade gracefully instead of crashing the server action.
function isAuthEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

const GUEST_MODE_MESSAGE =
  'החשבונות עוד לא נפתחו — בינתיים משחקים כאורחים, וכל ההתקדמות נשמרת על המכשיר הזה 🥷'

export async function loginWithEmail(formData: FormData) {
  if (!isAuthEnabled()) {
    return { error: GUEST_MODE_MESSAGE }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/home')
}

export async function loginWithGoogle() {
  if (!isAuthEnabled()) {
    return { error: GUEST_MODE_MESSAGE }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function registerParent(formData: FormData) {
  const parsed = registerSchema.safeParse({
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { displayName, email, password } = parsed.data

  if (!isAuthEnabled()) {
    return { error: GUEST_MODE_MESSAGE }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      role: 'parent',
      display_name: displayName,
      auth_method: 'email',
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  redirect('/home')
}

export async function joinClass(code: string) {
  const validationResult = validateClassCode(code)
  if (validationResult.isErr()) {
    return { error: validationResult.error.message }
  }

  const normalizedCode = validationResult.value

  if (!isAuthEnabled()) {
    return { error: GUEST_MODE_MESSAGE }
  }

  const supabase = await createClient()
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id, name, teacher_id')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .single()

  if (classError || !classData) {
    return { error: '\u05E7\u05D5\u05D3 \u05DB\u05D9\u05EA\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0' }
  }

  return { data: classData }
}

export async function createStudentProfile(formData: FormData) {
  const parsed = studentProfileSchema.safeParse({
    displayName: formData.get('displayName'),
    avatarId: formData.get('avatarId'),
    classId: formData.get('classId') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { displayName, avatarId, classId } = parsed.data

  if (!isAuthEnabled()) {
    return { error: GUEST_MODE_MESSAGE }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '\u05DC\u05D0 \u05DE\u05D7\u05D5\u05D1\u05E8' }
  }

  const { error: profileError } = await supabase.from('users').insert({
    id: user.id,
    role: 'student',
    display_name: displayName,
    avatar_id: avatarId,
    auth_method: 'class_code',
  })

  if (profileError) {
    return { error: profileError.message }
  }

  if (classId) {
    const { error: memberError } = await supabase.from('class_members').insert({
      class_id: classId,
      user_id: user.id,
      role: 'student',
    })

    if (memberError) {
      return { error: memberError.message }
    }
  }

  const { error: gamError } = await supabase.from('gamification').insert({
    user_id: user.id,
  })

  if (gamError) {
    return { error: gamError.message }
  }

  redirect('/home')
}

export async function logout() {
  if (!isAuthEnabled()) {
    redirect('/home')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
