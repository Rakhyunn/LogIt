'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; message: string }

export async function signUpWithEmail(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '회원가입에 실패했습니다. 다시 시도해 주세요.' }
  }

  return { success: true, data: undefined }
}

export async function signInWithEmail(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }

  redirect('/')
}

export async function signInWithGoogle(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: 'Google 로그인에 실패했습니다.' }
  }

  redirect(data.url)
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '로그아웃에 실패했습니다.' }
  }

  redirect('/login')
}

export async function sendPasswordResetEmail(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '메일 발송에 실패했습니다. 다시 시도해 주세요.' }
  }

  return { success: true, data: undefined }
}

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '비밀번호 변경에 실패했습니다.' }
  }

  redirect('/')
}

export async function setupProfile(formData: FormData): Promise<ActionResult> {
  const username = (formData.get('username') as string).trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('profiles')
    .update({ username, is_profile_setup: true })
    .eq('id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    if (error.code === '23505') return { success: false, message: '이미 사용 중인 username입니다.' }
    return { success: false, message: '프로필 설정에 실패했습니다.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
