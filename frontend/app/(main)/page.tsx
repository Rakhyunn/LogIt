import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ContentCard from './_components/content-card'
import ContentFilter from './_components/content-filter'
import { BookmarkButton } from './_components/bookmark-button'
import { type ContentType } from '@/types/database'

interface HomePageProps {
  searchParams: Promise<{ type?: ContentType; q?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type, q } = await searchParams
  const supabase = await createClient()

  const [contentsResult, { data: { user } }] = await Promise.all([
    (() => {
      let query = supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false })
      if (type && ['movie', 'drama', 'book'].includes(type)) {
        query = query.eq('type', type)
      }
      if (q) {
        query = query.ilike('title', `%${q}%`)
      }
      return query
    })(),
    supabase.auth.getUser(),
  ])

  if (contentsResult.error) throw contentsResult.error
  const contents = contentsResult.data

  const bookmarkedIds = user
    ? new Set(
        (
          await supabase
            .from('bookmarks')
            .select('content_id')
            .eq('user_id', user.id)
        ).data?.map((b) => b.content_id) ?? []
      )
    : new Set<string>()

  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">콘텐츠</h1>

      <Suspense fallback={<div className="h-10 w-80 bg-muted rounded animate-pulse" />}>
        <ContentFilter />
      </Suspense>

      {contents && contents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              bookmarkSlot={
                <BookmarkButton
                  contentId={content.id}
                  initialBookmarked={bookmarkedIds.has(content.id)}
                  isLoggedIn={!!user}
                />
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-12 text-center">
          {q ? `"${q}"에 대한 검색 결과가 없습니다.` : '등록된 콘텐츠가 없습니다.'}
        </p>
      )}
    </main>
  )
}
