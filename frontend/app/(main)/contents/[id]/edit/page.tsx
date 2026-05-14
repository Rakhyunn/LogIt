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

  return (
    <main className="container mx-auto p-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">콘텐츠 수정</h1>
      <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/40">
        <ContentForm content={content} />
      </div>
    </main>
  )
}
