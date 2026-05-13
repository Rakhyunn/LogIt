'use client'

import { useState } from 'react'
import ReviewCard from './review-card'
import ReviewForm from './review-form'
import { type Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row']
type ReviewWithUsername = Review & { username: string }

interface ReviewListClientProps {
  reviews: ReviewWithUsername[]
  currentUserId: string | null
  contentId: string
}

export default function ReviewListClient({
  reviews,
  currentUserId,
  contentId,
}: ReviewListClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const myReview = reviews.find((r) => r.user_id === currentUserId) ?? null

  return (
    <div className="space-y-4">
      {/* 작성 폼: 본인 리뷰가 없고 수정 중이 아닐 때 */}
      {currentUserId && !myReview && editingId === null && (
        <ReviewForm contentId={contentId} />
      )}

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          아직 리뷰가 없습니다.
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review.id}>
              {editingId === review.id ? (
                <ReviewForm
                  contentId={contentId}
                  existingReview={review}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ReviewCard
                  review={review}
                  isOwner={review.user_id === currentUserId}
                  onEdit={() => setEditingId(review.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
