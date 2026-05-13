'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '@/actions/auth'

export async function createReview(
  contentId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const rating = Number(formData.get('rating'))
  const body = ((formData.get('body') as string) ?? '').trim() || null
  const tags = JSON.parse((formData.get('tags') as string) || '[]') as string[]

  if (!rating || rating < 1 || rating > 5) {
    return { success: false, message: '별점을 선택해 주세요.' }
  }

  const { error } = await supabase.from('reviews').insert({
    content_id: contentId,
    user_id: user.id,
    rating,
    body,
    tags,
  })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    if (error.code === '23505') {
      return { success: false, message: '이미 이 콘텐츠에 리뷰를 작성했습니다.' }
    }
    return { success: false, message: '리뷰 등록에 실패했습니다.' }
  }

  revalidatePath(`/contents/${contentId}`)
  return { success: true, data: undefined }
}

export async function updateReview(
  reviewId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const rating = Number(formData.get('rating'))
  const body = ((formData.get('body') as string) ?? '').trim() || null
  const tags = JSON.parse((formData.get('tags') as string) || '[]') as string[]
  const contentId = formData.get('content_id') as string

  if (!rating || rating < 1 || rating > 5) {
    return { success: false, message: '별점을 선택해 주세요.' }
  }

  const { error } = await supabase
    .from('reviews')
    .update({ rating, body, tags })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '리뷰 수정에 실패했습니다.' }
  }

  revalidatePath(`/contents/${contentId}`)
  return { success: true, data: undefined }
}

export async function deleteReview(
  reviewId: string,
  contentId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '리뷰 삭제에 실패했습니다.' }
  }

  revalidatePath(`/contents/${contentId}`)
  return { success: true, data: undefined }
}
