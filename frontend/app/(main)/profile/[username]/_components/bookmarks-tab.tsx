import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type ContentType } from '@/types/database'

interface BookmarksTabProps {
  userId: string
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  movie: '영화',
  drama: '드라마',
  book: '책',
}

export async function BookmarksTab({ userId }: BookmarksTabProps) {
  const supabase = await createClient()

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('content_id, created_at, contents(id, title, type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        북마크한 콘텐츠가 없습니다.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {bookmarks.map((bookmark) => {
        const content = Array.isArray(bookmark.contents)
          ? bookmark.contents[0]
          : bookmark.contents
        return (
          <li key={bookmark.content_id} className="rounded-lg border p-4">
            {content && (
              <div className="flex items-center justify-between">
                <Link
                  href={`/contents/${content.id}`}
                  className="font-medium hover:underline"
                >
                  {content.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {CONTENT_TYPE_LABELS[content.type]}
                </span>
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(bookmark.created_at).toLocaleDateString('ko-KR')}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
