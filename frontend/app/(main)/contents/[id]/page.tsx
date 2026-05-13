import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deleteContent } from '@/actions/contents'
import { type ContentMeta, type MovieMeta, type DramaMeta, type BookMeta } from '@/types/content'

const TYPE_LABEL: Record<string, string> = {
  movie: '영화',
  drama: '드라마',
  book: '책',
}

function MetaInfo({ type, metadata }: { type: string; metadata: ContentMeta }) {
  if (type === 'movie') {
    const m = metadata as MovieMeta
    return (
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>감독: {m.director}</li>
        <li>개봉: {m.release_year}년</li>
        <li>장르: {m.genres.join(', ')}</li>
      </ul>
    )
  }
  if (type === 'drama') {
    const m = metadata as DramaMeta
    return (
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>감독: {m.director}</li>
        <li>방영: {m.air_year}년</li>
        <li>에피소드: {m.episodes}부작</li>
        <li>장르: {m.genres.join(', ')}</li>
      </ul>
    )
  }
  const m = metadata as BookMeta
  return (
    <ul className="text-sm text-muted-foreground space-y-1">
      <li>저자: {m.author}</li>
      <li>출판: {m.publish_year}년</li>
      <li>출판사: {m.publisher}</li>
    </ul>
  )
}

export default async function ContentDetailPage({
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

  const isOwner = !!user && user.id === content.created_by
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deleteWithId = deleteContent.bind(null, id) as any

  return (
    <main className="container mx-auto p-4 max-w-2xl space-y-6">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← 목록으로
      </Link>

      <div className="flex gap-6">
        {content.cover_image_url ? (
          <div className="relative w-32 h-44 flex-shrink-0 rounded overflow-hidden border">
            <Image
              src={content.cover_image_url}
              alt={content.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-44 flex-shrink-0 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
            이미지 없음
          </div>
        )}

        <div className="space-y-3 flex-1 min-w-0">
          <div>
            <span className="text-xs text-muted-foreground">
              {TYPE_LABEL[content.type]}
            </span>
            <h1 className="text-2xl font-bold">{content.title}</h1>
          </div>
          <MetaInfo
            type={content.type}
            metadata={content.metadata as ContentMeta}
          />
          {content.description && (
            <p className="text-sm text-muted-foreground">{content.description}</p>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="flex gap-2 pt-2 border-t">
          <Link
            href={`/contents/${id}/edit`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            수정
          </Link>
          <form action={deleteWithId}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              삭제
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
