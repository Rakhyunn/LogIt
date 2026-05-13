'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import StarRating from './star-rating'
import { createReview, updateReview } from '@/actions/reviews'
import { REVIEW_TAGS } from '@/constants/review-tags'
import { type Database } from '@/types/database'
import { cn } from '@/lib/utils'

type Review = Database['public']['Tables']['reviews']['Row']

interface ReviewFormProps {
  contentId: string
  existingReview?: Review
  onCancel?: () => void
}

export default function ReviewForm({
  contentId,
  existingReview,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingReview?.tags ?? []
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [formKey, setFormKey] = useState(0)

  function handleRatingChange(v: number) {
    setRating(v)
    setError(null)
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
    setError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rating) {
      setError('별점을 선택해 주세요.')
      return
    }
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('rating', String(rating))
    formData.set('tags', JSON.stringify(selectedTags))
    formData.set('content_id', contentId)

    startTransition(async () => {
      const result = existingReview
        ? await updateReview(existingReview.id, formData)
        : await createReview(contentId, formData)

      if (!result.success) {
        setError(result.message ?? '오류가 발생했습니다.')
      } else {
        if (existingReview) {
          onCancel?.()
        } else {
          setRating(0)
          setSelectedTags([])
          setFormKey((k) => k + 1)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <h3 className="font-medium text-sm">
        {existingReview ? '리뷰 수정' : '리뷰 작성'}
      </h3>

      {/* 별점 */}
      <div className="space-y-1">
        <Label className="text-xs">별점</Label>
        <StarRating value={rating} onChange={handleRatingChange} />
      </div>

      {/* 태그 */}
      <div className="space-y-1">
        <Label className="text-xs">태그 (선택)</Label>
        <div className="flex gap-1.5 flex-wrap">
          {REVIEW_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-input hover:border-primary'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 본문 */}
      <div className="space-y-1">
        <Label htmlFor="body" className="text-xs">본문 (선택)</Label>
        <Textarea
          key={formKey}
          id="body"
          name="body"
          placeholder="이 콘텐츠에 대한 생각을 자유롭게 적어주세요."
          defaultValue={existingReview?.body ?? ''}
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? '저장 중...' : existingReview ? '수정 완료' : '등록'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            취소
          </Button>
        )}
      </div>
    </form>
  )
}
