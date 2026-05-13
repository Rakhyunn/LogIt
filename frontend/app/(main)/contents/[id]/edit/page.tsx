import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContentForm from '../../../_components/content-form'

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: content }, { data: { user } }] = await Promise.all([
    supabase.from('contents').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!content) notFound()
  if (!user || content.created_by !== user.id) redirect(`/contents/${id}`)

  return <ContentForm content={content} />
}
