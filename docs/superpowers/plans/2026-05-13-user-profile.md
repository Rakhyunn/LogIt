# User 프로필 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로필 조회(`/profile/[username]`), 수정(`/profile/[username]/edit`), username 중복 확인 기능 구현

**Architecture:** URL 기반 탭(`?tab=reviews|bookmarks`)과 Suspense 스트리밍으로 프로필 페이지를 구성한다. 프로필이 없으면 `ProfileNotFound` Client Component가 토스트 대신 메시지를 표시한 뒤 `router.back()`으로 이전 페이지로 이동한다. 수정 폼은 "중복 확인" 버튼으로 즉시 username 가용성을 확인한다.

**Tech Stack:** Next.js 15 App Router, Supabase SSR, TypeScript, Tailwind CSS, shadcn/ui

---

## 파일 구조

| 상태 | 경로 | 역할 |
|---|---|---|
| 수정 | `frontend/types/database.ts` | reviews·bookmarks Relationships 추가 |
| 신규 | `frontend/actions/user.ts` | checkUsername, updateProfile Server Actions |
| 신규 | `frontend/app/(main)/profile/[username]/page.tsx` | 프로필 조회 페이지 |
| 신규 | `frontend/app/(main)/profile/[username]/edit/page.tsx` | 프로필 수정 페이지 |
| 신규 | `frontend/app/(main)/profile/[username]/_components/profile-not-found.tsx` | 없는 유저 처리 |
| 신규 | `frontend/app/(main)/profile/[username]/_components/profile-header.tsx` | 프로필 헤더 |
| 신규 | `frontend/app/(main)/profile/[username]/_components/profile-tabs.tsx` | 탭 UI (Client) |
| 신규 | `frontend/app/(main)/profile/[username]/_components/reviews-tab.tsx` | 리뷰 탭 |
| 신규 | `frontend/app/(main)/profile/[username]/_components/bookmarks-tab.tsx` | 북마크 탭 |
| 신규 | `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx` | 수정 폼 (Client) |

---

## Task 1: database.ts Relationships 업데이트

리뷰·북마크 탭에서 Supabase join 쿼리 타입 추론을 위해 Relationships를 추가한다.

**Files:**
- Modify: `frontend/types/database.ts`

- [ ] **Step 1: reviews Relationships 추가**

`database.ts`에서 `reviews` 테이블의 `Relationships: []`를 아래로 교체한다.

```ts
Relationships: [
  {
    foreignKeyName: "reviews_content_id_fkey",
    columns: ["content_id"],
    isOneToOne: false,
    referencedRelation: "contents",
    referencedColumns: ["id"],
  },
  {
    foreignKeyName: "reviews_user_id_fkey",
    columns: ["user_id"],
    isOneToOne: false,
    referencedRelation: "profiles",
    referencedColumns: ["id"],
  },
]
```

- [ ] **Step 2: bookmarks Relationships 추가**

`bookmarks` 테이블의 `Relationships: []`를 아래로 교체한다.

```ts
Relationships: [
  {
    foreignKeyName: "bookmarks_content_id_fkey",
    columns: ["content_id"],
    isOneToOne: false,
    referencedRelation: "contents",
    referencedColumns: ["id"],
  },
  {
    foreignKeyName: "bookmarks_user_id_fkey",
    columns: ["user_id"],
    isOneToOne: false,
    referencedRelation: "profiles",
    referencedColumns: ["id"],
  },
]
```

- [ ] **Step 3: 타입 확인**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: Commit**

```bash
git add frontend/types/database.ts
git commit -m "chore: add Relationships to reviews and bookmarks types"
```

---

## Task 2: Server Actions (`actions/user.ts`)

**Files:**
- Create: `frontend/actions/user.ts`

- [ ] **Step 1: 파일 생성**

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '@/actions/auth'

export async function checkUsername(
  username: string
): Promise<{ available: boolean; message?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { available: false, message: '로그인이 필요합니다.' }

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  return { available: !data }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const username = ((formData.get('username') as string) ?? '').trim()
  const bio = ((formData.get('bio') as string) ?? '').trim() || null

  if (!username || username.length < 2)
    return { success: false, message: 'username은 2자 이상이어야 합니다.' }
  if (username.length > 30)
    return { success: false, message: 'username은 30자 이하이어야 합니다.' }
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return { success: false, message: 'username은 영문, 숫자, 밑줄(_)만 사용 가능합니다.' }
  if (bio && bio.length > 200)
    return { success: false, message: '자기소개는 200자 이하이어야 합니다.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('profiles')
    .update({ username, bio })
    .eq('id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    if (error.code === '23505') return { success: false, message: '이미 사용 중인 username입니다.' }
    return { success: false, message: '프로필 수정에 실패했습니다.' }
  }

  revalidatePath(`/profile/${username}`, 'layout')
  redirect(`/profile/${username}`)
}
```

- [ ] **Step 2: 타입 확인**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
git add frontend/actions/user.ts
git commit -m "feat: add checkUsername and updateProfile server actions"
```

---

## Task 3: ProfileNotFound 컴포넌트

존재하지 않는 username 접근 시 메시지 표시 후 이전 페이지로 이동한다.

**Files:**
- Create: `frontend/app/(main)/profile/[username]/_components/profile-not-found.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileNotFoundProps {
  username: string
}

export function ProfileNotFound({ username }: ProfileNotFoundProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.back(), 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">
        @{username} 유저를 찾을 수 없습니다. 이전 페이지로 돌아갑니다...
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/_components/profile-not-found.tsx"
git commit -m "feat: add ProfileNotFound component"
```

---

## Task 4: ProfileHeader 컴포넌트

**Files:**
- Create: `frontend/app/(main)/profile/[username]/_components/profile-header.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { type Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileHeaderProps {
  profile: Profile
  isOwner: boolean
}

export function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">@{profile.username}</h1>
        {profile.bio && (
          <p className="text-muted-foreground">{profile.bio}</p>
        )}
        <p className="text-sm text-muted-foreground">
          가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
      {isOwner && (
        <Button asChild variant="outline" size="sm">
          <Link href={`/profile/${profile.username}/edit`}>프로필 수정</Link>
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/_components/profile-header.tsx"
git commit -m "feat: add ProfileHeader component"
```

---

## Task 5: ProfileTabs 컴포넌트

URL `?tab=` 파라미터를 변경해 탭을 전환한다.

**Files:**
- Create: `frontend/app/(main)/profile/[username]/_components/profile-tabs.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ProfileTabsProps {
  username: string
}

const TABS = [
  { key: 'reviews', label: '리뷰' },
  { key: 'bookmarks', label: '북마크' },
] as const

export function ProfileTabs({ username }: ProfileTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'reviews'

  return (
    <div className="flex gap-6 border-b">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => router.push(`/profile/${username}?tab=${key}`)}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === key
              ? 'border-b-2 border-foreground text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/_components/profile-tabs.tsx"
git commit -m "feat: add ProfileTabs component"
```

---

## Task 6: ReviewsTab 컴포넌트

**Files:**
- Create: `frontend/app/(main)/profile/[username]/_components/reviews-tab.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/_components/reviews-tab.tsx"
git commit -m "feat: add ReviewsTab component"
```

---

## Task 7: BookmarksTab 컴포넌트

**Files:**
- Create: `frontend/app/(main)/profile/[username]/_components/bookmarks-tab.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/_components/bookmarks-tab.tsx"
git commit -m "feat: add BookmarksTab component"
```

---

## Task 8: 프로필 조회 페이지

**Files:**
- Create: `frontend/app/(main)/profile/[username]/page.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from './_components/profile-header'
import { ProfileTabs } from './_components/profile-tabs'
import { ReviewsTab } from './_components/reviews-tab'
import { BookmarksTab } from './_components/bookmarks-tab'
import { ProfileNotFound } from './_components/profile-not-found'

interface ProfilePageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params
  const { tab = 'reviews' } = await searchParams

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return <ProfileNotFound username={username} />
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <ProfileHeader profile={profile} isOwner={isOwner} />
      <div className="space-y-4">
        <ProfileTabs username={username} />
        <Suspense
          fallback={
            <p className="py-8 text-center text-sm text-muted-foreground">
              로딩 중...
            </p>
          }
        >
          {tab === 'bookmarks' ? (
            <BookmarksTab userId={profile.id} />
          ) : (
            <ReviewsTab userId={profile.id} />
          )}
        </Suspense>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 확인**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/page.tsx"
git commit -m "feat: add profile view page"
```

---

## Task 9: ProfileEditForm 컴포넌트

**Files:**
- Create: `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx`

- [ ] **Step 1: `@/components/ui/textarea` 존재 여부 확인**

```bash
ls frontend/components/ui/textarea.tsx 2>/dev/null || echo "NOT FOUND"
```

없으면 설치:
```bash
cd frontend && npx shadcn@latest add textarea
```

- [ ] **Step 2: 파일 생성**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { checkUsername, updateProfile } from '@/actions/user'
import { type Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileEditFormProps {
  profile: Profile
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [usernameValue, setUsernameValue] = useState(profile.username)
  const [checkResult, setCheckResult] = useState<{
    available: boolean
    message: string
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isUsernameChanged = usernameValue !== profile.username

  async function handleCheckUsername() {
    setIsChecking(true)
    setCheckResult(null)
    const result = await checkUsername(usernameValue)
    setCheckResult({
      available: result.available,
      message: result.available
        ? '사용 가능한 username입니다.'
        : (result.message ?? '이미 사용 중인 username입니다.'),
    })
    setIsChecking(false)
  }

  function handleSubmit(formData: FormData) {
    const username = (formData.get('username') as string).trim()

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('username은 영문, 숫자, 밑줄(_)만 사용 가능합니다.')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (!result.success) setError(result.message)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex gap-2">
          <Input
            id="username"
            name="username"
            value={usernameValue}
            onChange={(e) => {
              setUsernameValue(e.target.value)
              setCheckResult(null)
            }}
            minLength={2}
            maxLength={30}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCheckUsername}
            disabled={isChecking || !isUsernameChanged}
          >
            {isChecking ? '확인 중...' : '중복 확인'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          영문, 숫자, 밑줄(_) 사용 가능 (2~30자)
        </p>
        {checkResult && (
          <p
            className={`text-sm ${
              checkResult.available ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {checkResult.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">자기소개</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ''}
          maxLength={200}
          rows={3}
          placeholder="자기소개를 입력해 주세요. (선택, 200자 이내)"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx"
git commit -m "feat: add ProfileEditForm component with username duplicate check"
```

---

## Task 10: 프로필 수정 페이지

**Files:**
- Create: `frontend/app/(main)/profile/[username]/edit/page.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileEditForm } from '../_components/profile-edit-form'

interface ProfileEditPageProps {
  params: Promise<{ username: string }>
}

export default async function ProfileEditPage({ params }: ProfileEditPageProps) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile || profile.id !== user.id) {
    redirect(`/profile/${username}`)
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">프로필 수정</h1>
        <p className="text-sm text-muted-foreground">
          username과 자기소개를 수정할 수 있습니다.
        </p>
      </div>
      <ProfileEditForm profile={profile} />
    </div>
  )
}
```

- [ ] **Step 2: 타입 확인**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(main)/profile/[username]/edit/page.tsx"
git commit -m "feat: add profile edit page"
```

---

## Task 11: 최종 검증

- [ ] **Step 1: 타입 전체 확인**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 2: 린트 확인**

```bash
cd frontend && npx next lint
```

Expected: No ESLint warnings or errors

- [ ] **Step 3: 수동 검증 체크리스트**

브라우저에서 다음을 직접 확인한다:

1. `/profile/존재하는username` — 프로필 헤더, 리뷰 탭(기본) 정상 표시
2. `?tab=bookmarks` — 북마크 탭 전환 확인
3. `/profile/없는username` — 메시지 표시 후 2초 뒤 이전 페이지 이동
4. 본인 프로필 — "프로필 수정" 버튼 표시, 타인 프로필 — 버튼 없음
5. `/profile/[username]/edit` 타인 URL 직접 접근 — 프로필 조회 페이지로 리다이렉트
6. 수정 폼: username 변경 후 "중복 확인" → 결과 즉시 표시
7. username 변경 후 저장 → `/profile/[newUsername]`으로 이동
8. 중복 username 저장 시도 → 에러 메시지 표시

- [ ] **Step 4: TODO-DONE 업데이트**

`docs/TODO-DONE.md`에 완료 항목 추가

- [ ] **Step 5: CONTEXT.md 업데이트**

다음 작업으로 업데이트: Bookmark 도메인 문서 작성 → 구현
