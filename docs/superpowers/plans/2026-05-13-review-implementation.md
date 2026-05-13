# Review 도메인 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 콘텐츠 상세 페이지에 리뷰 작성/수정/삭제, 별점, preset 태그, 더보기/축약, 평균별점을 구현한다.

**Architecture:** `ReviewSection` 서버 컴포넌트를 `<Suspense>`로 감싸 콘텐츠 정보와 리뷰를 스트리밍 분리한다. 리뷰 목록과 사용자의 기존 리뷰 여부를 서버에서 판단해 작성 폼 또는 수정 UI를 내려준다. 평균별점은 리뷰 목록에서 JavaScript로 실시간 계산한다.

**Tech Stack:** Next.js 16 App Router, Supabase DB (reviews + profiles), shadcn/ui (button, input, textarea), lucide-react (Star 아이콘), TypeScript

---

## 파일 구조

| 파일 | 작업 | 역할 |
|------|------|------|
| `frontend/constants/review-tags.ts` | 생성 | preset 태그 상수 |
| `frontend/actions/reviews.ts` | 생성 | createReview, updateReview, deleteReview |
| `frontend/app/(main)/contents/[id]/_components/star-rating.tsx` | 생성 | 별점 입력/표시 컴포넌트 |
| `frontend/app/(main)/contents/[id]/_components/review-card.tsx` | 생성 | 리뷰 카드 (더보기/축약, 삭제) |
| `frontend/app/(main)/contents/[id]/_components/review-form.tsx` | 생성 | 리뷰 작성/수정 폼 |
| `frontend/app/(main)/contents/[id]/_components/review-section.tsx` | 생성 | 리뷰 목록 서버 컴포넌트 |
| `frontend/app/(main)/contents/[id]/page.tsx` | 수정 | ReviewSection + Suspense 추가 |

---

## Task 1: Preset 태그 상수

**Files:**
- Create: `frontend/constants/review-tags.ts`

- [ ] **Step 1: `frontend/constants/review-tags.ts` 작성**

```typescript
export const REVIEW_TAGS = [
  '명작',
  '감동적인',
  '재관할만한',
  '독창적인',
  '웃긴',
  '무서운',
  '생각할거리',
  'OST가 좋은',
  '지루한',
  '실망스러운',
] as const

export type ReviewTag = (typeof REVIEW_TAGS)[number]
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add frontend/constants/review-tags.ts
git commit -m "chore: add review preset tags constant"
```

---

## Task 2: Server Actions

**Files:**
- Create: `frontend/actions/reviews.ts`

- [ ] **Step 1: `frontend/actions/reviews.ts` 작성**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '@/actions/auth'

export async function createReview(
  contentId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const rating = Number(formData.get('rating'))
  const body = ((formData.get('body') as string) ?? '').trim() || null
  const tags = JSON.parse((formData.get('tags') as string) || '[]') as string[]

  if (!rating || rating < 1 || rating > 5) {
    return { success: false, message: '별점을 선택해 주세요.' }
  }

  const { error } = await supabase.from('reviews').insert({
    content_id: contentId,
    user_id: user.id,
    rating,
    body,
    tags,
  })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    if (error.code === '23505') {
      return { success: false, message: '이미 이 콘텐츠에 리뷰를 작성했습니다.' }
    }
    return { success: false, message: '리뷰 등록에 실패했습니다.' }
  }

  revalidatePath(`/contents/${contentId}`)
  return { success: true, data: undefined }
}

export async function updateReview(
  reviewId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const rating = Number(formData.get('rating'))
  const body = ((formData.get('body') as string) ?? '').trim() || null
  const tags = JSON.parse((formData.get('tags') as string) || '[]') as string[]
  const contentId = formData.get('content_id') as string

  if (!rating || rating < 1 || rating > 5) {
    return { success: false, message: '별점을 선택해 주세요.' }
  }

  const { error } = await supabase
    .from('reviews')
    .update({ rating, body, tags })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '리뷰 수정에 실패했습니다.' }
  }

  revalidatePath(`/contents/${contentId}`)
  return { success: true, data: undefined }
}

export async function deleteReview(
  reviewId: string,
  contentId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '리뷰 삭제에 실패했습니다.' }
  }

  revalidatePath(`/contents/${contentId}`)
  return { success: true, data: undefined }
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add frontend/actions/reviews.ts
git commit -m "feat: add review server actions"
```

---

## Task 3: StarRating 컴포넌트

**Files:**
- Create: `frontend/app/(main)/contents/[id]/_components/star-rating.tsx`

- [ ] **Step 1: `_components/` 디렉토리 생성 후 `star-rating.tsx` 작성**

```tsx
'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md'
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const iconSize = size === 'sm' ? 'size-4' : 'size-5'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (readOnly ? value : (hover || value)) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={cn(
              'transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
            aria-label={`${star}점`}
          >
            <Star
              className={cn(
                iconSize,
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-muted-foreground'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add "frontend/app/(main)/contents/[id]/_components/star-rating.tsx"
git commit -m "feat: add star rating component"
```

---

## Task 4: ReviewCard 컴포넌트

**Files:**
- Create: `frontend/app/(main)/contents/[id]/_components/review-card.tsx`

- [ ] **Step 1: `review-card.tsx` 작성**

```tsx
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
      await deleteReview(review.id, review.content_id)
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
      </div>

      {review.tags.length > 0 && (
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
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add "frontend/app/(main)/contents/[id]/_components/review-card.tsx"
git commit -m "feat: add review card component with expand/collapse"
```

---

## Task 5: ReviewForm 컴포넌트

**Files:**
- Create: `frontend/app/(main)/contents/[id]/_components/review-form.tsx`

- [ ] **Step 1: `review-form.tsx` 작성**

```tsx
'use client'

import { useState } from 'react'
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
  const [pending, setPending] = useState(false)

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rating) {
      setError('별점을 선택해 주세요.')
      return
    }

    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('rating', String(rating))
    formData.set('tags', JSON.stringify(selectedTags))
    formData.set('content_id', contentId)

    const result = existingReview
      ? await updateReview(existingReview.id, formData)
      : await createReview(contentId, formData)

    if (!result.success) {
      setError(result.message)
    }
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <h3 className="font-medium text-sm">
        {existingReview ? '리뷰 수정' : '리뷰 작성'}
      </h3>

      {/* 별점 */}
      <div className="space-y-1">
        <Label className="text-xs">별점</Label>
        <StarRating value={rating} onChange={setRating} />
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
          id="body"
          name="body"
          placeholder="이 콘텐츠에 대한 생각을 자유롭게 적어주세요."
          defaultValue={existingReview?.body ?? ''}
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? '저장 중...' : existingReview ? '수정 완료' : '등록'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            취소
          </Button>
        )}
      </div>
    </form>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add "frontend/app/(main)/contents/[id]/_components/review-form.tsx"
git commit -m "feat: add review form component"
```

---

## Task 6: ReviewSection 서버 컴포넌트 + ReviewListClient

**Files:**
- Create: `frontend/app/(main)/contents/[id]/_components/review-section.tsx`
- Create: `frontend/app/(main)/contents/[id]/_components/review-list-client.tsx`

> 구조: `ReviewSection`(서버)이 DB에서 데이터를 fetch해서 `ReviewListClient`(클라이언트)에 props로 전달한다. 수정 상태(editingId)는 클라이언트에서 관리한다.

- [ ] **Step 1: `review-section.tsx` 작성 (서버 컴포넌트)**

```tsx
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
```

- [ ] **Step 2: `review-list-client.tsx` 작성 (클라이언트 래퍼)**

```tsx
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
```

- [ ] **Step 3: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add "frontend/app/(main)/contents/[id]/_components/review-section.tsx" "frontend/app/(main)/contents/[id]/_components/review-list-client.tsx"
git commit -m "feat: add review section server component and list client"
```

---

## Task 7: 콘텐츠 상세 페이지 업데이트

**Files:**
- Modify: `frontend/app/(main)/contents/[id]/page.tsx`

- [ ] **Step 1: `page.tsx`에 Suspense + ReviewSection 추가**

파일 상단 import에 추가:
```tsx
import { Suspense } from 'react'
import ReviewSection from './_components/review-section'
```

`</main>` 태그 닫기 전 마지막 섹션 뒤에 추가:

```tsx
      {/* 리뷰 섹션 — 스트리밍 */}
      <Suspense
        fallback={
          <div className="pt-6 border-t space-y-3">
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2 py-4 border-b">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        }
      >
        <ReviewSection contentId={id} />
      </Suspense>
```

최종 `page.tsx` 전체 내용:

```tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deleteContent } from '@/actions/contents'
import { type ContentMeta, type MovieMeta, type DramaMeta, type BookMeta } from '@/types/content'
import ReviewSection from './_components/review-section'

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

      {/* 리뷰 섹션 — 스트리밍 */}
      <Suspense
        fallback={
          <div className="pt-6 border-t space-y-3">
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2 py-4 border-b">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        }
      >
        <ReviewSection contentId={id} />
      </Suspense>
    </main>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: dev 서버에서 수동 테스트**

```bash
cd frontend && npm run dev
```

콘텐츠 상세 페이지 접속:
- 콘텐츠 정보가 먼저 표시, 리뷰 섹션은 Suspense fallback 후 로딩 확인
- 리뷰 없을 때 "아직 리뷰가 없습니다." 표시 확인
- 별점 선택 + 태그 클릭 + 본문 입력 → 등록 → 리뷰 목록에 표시 확인
- 본인 리뷰에 수정/삭제 버튼 표시, 타인 리뷰에 미표시 확인
- 100자 이상 본문 → 더보기/다시 축약 토글 확인
- 평균별점 표시 확인 (2개 이상 리뷰 작성 후)

- [ ] **Step 4: 커밋**

```bash
git add "frontend/app/(main)/contents/[id]/page.tsx"
git commit -m "feat: add review section to content detail page"
```

---

## Task 8: 문서 업데이트

**Files:**
- Modify: `docs/TODO-DONE.md`
- Modify: `docs/TODO-BACKLOG.md`
- Modify: `docs/CONTEXT.md`
- Modify: `docs/AI-ACTION-LOGS.md`

- [ ] **Step 1: `TODO-DONE.md`에 완료 항목 추가**

`## 2026-05-13` 섹션에 추가:
```
- [x] Review 도메인 구현 (리뷰 작성/수정/삭제, 별점, preset 태그, 더보기/축약, 평균별점, Suspense 스트리밍)
```

- [ ] **Step 2: `TODO-BACKLOG.md` — Review 항목 완료 처리**

`## 리뷰 (Review)` 섹션 전체를 `[x]`로 변경:
```
- [x] 콘텐츠 상세 페이지 내 리뷰 목록 표시
- [x] 리뷰 작성 폼 (별점, 태그, 본문)
- [x] 리뷰 수정/삭제 (본인만)
- [x] 리뷰 상세 페이지 (`/reviews/[id]`) → 제거됨 (더보기/축약으로 대체)
```

- [ ] **Step 3: `CONTEXT.md` 업데이트**

```markdown
# CONTEXT.md

현재 작업에 직접 필요한 정보만 저장한다. 불필요한 내용은 즉시 제거한다.

---

## 현재 상태 (2026-05-13)

**Review 도메인 구현 완료.** 다음 작업: User 도메인 문서 작성 → 구현.

**스택:**
- Frontend: Next.js 16.2.6 (App Router, TypeScript, Tailwind v4, shadcn/ui)
- Backend: Supabase Cloud (Auth, DB, Storage, Realtime)

**환경변수 키 이름 (`frontend/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

**DB 스키마 핵심 사항:**
- `contents`: `created_by uuid` 소유권, `metadata jsonb` 타입별 구조화
- `profiles`: `is_profile_setup boolean DEFAULT false` — 미들웨어 리다이렉트 기준
- `reviews`: `UNIQUE(user_id, content_id)` — 유저당 콘텐츠 1개 리뷰
- 전 테이블 RLS 활성화

**Storage:**
- 버킷: `covers` (public)
- 경로 (버킷 내): `{user_id}/{timestamp}-{random}.{ext}`
```

- [ ] **Step 4: `AI-ACTION-LOGS.md`에 추가**

`## 2026-05-13` 최상단에 추가:
```
### [19] Review 도메인 구현
- constants/review-tags.ts: preset 태그 10개
- actions/reviews.ts: createReview, updateReview, deleteReview
- StarRating: lucide-react Star 아이콘, hover/click 인터랙션
- ReviewCard: 더보기/축약 토글 (100자 기준), useTransition 삭제
- ReviewForm: 별점 + 태그 + 본문, create/edit 모드
- ReviewSection: 서버 컴포넌트, 평균별점 JS 계산, username 2-query join
- ReviewListClient: 수정 상태 관리 클라이언트 래퍼
- contents/[id]/page.tsx: Suspense fallback 추가
```

- [ ] **Step 5: 커밋**

```bash
git add docs/TODO-DONE.md docs/TODO-BACKLOG.md docs/CONTEXT.md docs/AI-ACTION-LOGS.md
git commit -m "docs: update review domain completion status"
```
