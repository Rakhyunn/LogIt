'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '@/actions/auth'
import { type ContentType } from '@/types/database'
import { type ContentMeta } from '@/types/content'

export async function createContent(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const title = (formData.get('title') as string).trim()
  const type = formData.get('type') as ContentType
  const description = ((formData.get('description') as string) ?? '').trim() || null
  const cover_image_url = (formData.get('cover_image_url') as string) || null
  const metadata = JSON.parse(formData.get('metadata') as string) as ContentMeta

  if (!title) return { success: false, message: '제목을 입력해 주세요.' }
  if (!['movie', 'drama', 'book'].includes(type)) {
    return { success: false, message: '올바른 콘텐츠 유형을 선택해 주세요.' }
  }

  const { data, error } = await supabase
    .from('contents')
    .insert({ title, type, description, cover_image_url, metadata, created_by: user.id })
    .select('id')
    .single()

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '콘텐츠 등록에 실패했습니다.' }
  }

  revalidatePath('/')
  return { success: true, data: { id: data.id } }
}

export async function updateContent(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const title = (formData.get('title') as string).trim()
  const description = ((formData.get('description') as string) ?? '').trim() || null
  const cover_image_url = (formData.get('cover_image_url') as string) || null
  const metadata = JSON.parse(formData.get('metadata') as string) as ContentMeta

  if (!title) return { success: false, message: '제목을 입력해 주세요.' }

  const { error } = await supabase
    .from('contents')
    .update({ title, description, cover_image_url, metadata })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '콘텐츠 수정에 실패했습니다.' }
  }

  revalidatePath('/')
  revalidatePath(`/contents/${id}`)
  redirect(`/contents/${id}`)
}

export async function deleteContent(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '콘텐츠 삭제에 실패했습니다.' }
  }

  revalidatePath('/')
  redirect('/')
}
