'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import StarRating from './star-rating'
import { deleteReview } from '@/actions/reviews'
import { type Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row']

const BODY_LIMIT = 100

interface ReviewCardProps {
  review: Review & { username: string }
  isOwner: boolean
  onEdit: () => void
}

export default function ReviewCard({ review, isOwner, onEdit }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const needsTruncation = !!review.body && review.body.length > BODY_LIMIT
  const displayBody = needsTruncation && !expanded
    ? review.body!.slice(0, BODY_LIMIT) + '...'
    : review.body

  const formattedDate = new Date(review.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  function handleDelete() {
    if (!confirm('리뷰를 삭제할까요?')) return
    startTransition(async () => {
      const result = await deleteReview(review.id, review.content_id)
      if (!result.success) {
        setDeleteError(result.message)
      }
    })
  }

  return (
    <div className="space-y-2 py-4 border-b last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{review.username}</span>
          <StarRating value={review.rating} readOnly size="sm" />
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={isPending}
              className="h-7 text-xs"
            >
              수정
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              삭제
            </Button>
          </div>
        )}
        {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
      </div>

      {(review.tags?.length ?? 0) > 0 && (
        <div className="flex gap-1 flex-wrap">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {displayBody && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{displayBody}</p>
          {needsTruncation && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline"
            >
              {expanded ? '다시 축약' : '더보기'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
