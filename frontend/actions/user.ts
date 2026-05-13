'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '@/actions/auth'

export async function checkUsername(
  username: string
): Promise<{ available: boolean; message?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { available: false, message: '로그인이 필요합니다.' }

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  return { available: !data }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const username = ((formData.get('username') as string) ?? '').trim()
  const bio = ((formData.get('bio') as string) ?? '').trim() || null

  if (!username || username.length < 2)
    return { success: false, message: 'username은 2자 이상이어야 합니다.' }
  if (username.length > 30)
    return { success: false, message: 'username은 30자 이하이어야 합니다.' }
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return { success: false, message: 'username은 영문, 숫자, 밑줄(_)만 사용 가능합니다.' }
  if (bio && bio.length > 200)
    return { success: false, message: '자기소개는 200자 이하이어야 합니다.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('profiles')
    .update({ username, bio })
    .eq('id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    if (error.code === '23505') return { success: false, message: '이미 사용 중인 username입니다.' }
    return { success: false, message: '프로필 수정에 실패했습니다.' }
  }

  revalidatePath(`/profile/${username}`, 'layout')
  redirect(`/profile/${username}`)
}
