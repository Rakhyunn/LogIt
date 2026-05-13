import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface ReviewsTabProps {
  userId: string
}

export async function ReviewsTab({ userId }: ReviewsTabProps) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, body, tags, created_at, contents(id, title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!reviews || reviews.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        아직 작성한 리뷰가 없습니다.
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => {
        const content = Array.isArray(review.contents)
          ? review.contents[0]
          : review.contents
        return (
          <li key={review.id} className="rounded-lg border p-4">
            {content && (
              <Link
                href={`/contents/${content.id}`}
                className="font-medium hover:underline"
              >
                {content.title}
              </Link>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{'⭐'.repeat(review.rating)}</span>
              <span>{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            {review.body && (
              <p className="mt-2 line-clamp-2 text-sm">{review.body}</p>
            )}
            {review.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
