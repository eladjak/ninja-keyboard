'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateClassCode } from './class-code'

export async function loginWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/home')
}

export async function loginWithGoogle() {
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
  const displayName = formData.get('displayName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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
  const displayName = formData.get('displayName') as string
  const avatarId = formData.get('avatarId') as string
  const classId = formData.get('classId') as string

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
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
