import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ContentCard from './_components/content-card'
import ContentFilter from './_components/content-filter'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type ContentType } from '@/types/database'

interface HomePageProps {
  searchParams: Promise<{ type?: ContentType; q?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type, q } = await searchParams
  const supabase = await createClient()

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

  const { data: contents, error } = await query
  if (error) throw error

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">콘텐츠</h1>
        <Link href="/contents/new" className={cn(buttonVariants({ size: 'sm' }))}>
          + 등록
        </Link>
      </div>

      <Suspense>
        <ContentFilter />
      </Suspense>

      {contents && contents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
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
