'use server'

import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '@/actions/auth'

export async function addBookmark(contentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: user.id, content_id: contentId })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '북마크 추가에 실패했습니다.' }
  }

  return { success: true, data: undefined }
}

export async function removeBookmark(contentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('content_id', contentId)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '북마크 제거에 실패했습니다.' }
  }

  return { success: true, data: undefined }
}
