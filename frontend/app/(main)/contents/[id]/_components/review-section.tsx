import { createClient } from '@/lib/supabase/server'
import { type Database } from '@/types/database'
import ReviewListClient from './review-list-client'

type Review = Database['public']['Tables']['reviews']['Row']
type ReviewWithUsername = Review & { username: string }

export default async function ReviewSection({ contentId }: { contentId: string }) {
  const supabase = await createClient()

  const [{ data: reviews }, { data: { user } }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ])

  const safeReviews = reviews ?? []

  const userIds = [...new Set(safeReviews.map((r) => r.user_id))]
  const { data: profiles } = userIds.length > 0
    ? await supabase.from('profiles').select('id, username').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.username])
  )

  const reviewsWithUsername: ReviewWithUsername[] = safeReviews.map((r) => ({
    ...r,
    username: profileMap[r.user_id] ?? '알 수 없음',
  }))

  const avgRating =
    safeReviews.length > 0
      ? (
          safeReviews.reduce((sum, r) => sum + r.rating, 0) / safeReviews.length
        ).toFixed(1)
      : null

  return (
    <section className="space-y-4 pt-6 border-t">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">리뷰</h2>
        {avgRating && (
          <span className="text-sm text-muted-foreground">
            ⭐ {avgRating} ({safeReviews.length}개)
          </span>
        )}
      </div>

      <ReviewListClient
        reviews={reviewsWithUsername}
        currentUserId={user?.id ?? null}
        contentId={contentId}
      />
    </section>
  )
}
