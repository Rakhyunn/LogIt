# 로딩/에러 상태 처리 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로필·폼 페이지에 로딩 스켈레톤을 추가하고 기존 에러 UI를 아이콘+메시지+버튼 구조로 개선한다.

**Architecture:** Next.js App Router의 `loading.tsx` / `error.tsx` 파일 규칙을 사용한다. 에러는 `AlertCircle` 아이콘 + 메시지 + "다시 시도" / "홈으로" 버튼 구조로 통일하고, 로딩은 프로필 페이지는 상세 스켈레톤, 폼 페이지들은 단순 카드 스켈레톤을 사용한다.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, lucide-react, shadcn/ui

---

## 파일 구조

| 상태 | 경로 |
|------|------|
| 수정 | `frontend/app/(main)/error.tsx` |
| 수정 | `frontend/app/(main)/contents/[id]/error.tsx` |
| 신규 | `frontend/app/(main)/profile/[username]/error.tsx` |
| 신규 | `frontend/app/(main)/profile/[username]/loading.tsx` |
| 신규 | `frontend/app/(main)/profile/[username]/edit/loading.tsx` |
| 신규 | `frontend/app/(main)/contents/new/loading.tsx` |
| 신규 | `frontend/app/(main)/contents/[id]/edit/loading.tsx` |

---

## Task 1: 에러 UI 개선 (3개 파일)

**Files:**
- Modify: `frontend/app/(main)/error.tsx`
- Modify: `frontend/app/(main)/contents/[id]/error.tsx`
- Create: `frontend/app/(main)/profile/[username]/error.tsx`

- [ ] **Step 1: `(main)/error.tsx` 교체**

```tsx
'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground">페이지를 불러오는데 실패했습니다.</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>다시 시도</Button>
        <Button asChild variant="ghost">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: `contents/[id]/error.tsx` 교체**

```tsx
'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="container mx-auto p-4 max-w-2xl min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground">콘텐츠를 불러오는데 실패했습니다.</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>다시 시도</Button>
        <Button asChild variant="ghost">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: `profile/[username]/error.tsx` 생성**

```tsx
'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="mx-auto max-w-2xl min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground">프로필을 불러오는데 실패했습니다.</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>다시 시도</Button>
        <Button asChild variant="ghost">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 5: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/error.tsx" "frontend/app/(main)/contents/[id]/error.tsx" "frontend/app/(main)/profile/[username]/error.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: improve error UI with icon and action buttons"
```

---

## Task 2: 프로필 페이지 로딩 스켈레톤

**Files:**
- Create: `frontend/app/(main)/profile/[username]/loading.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      {/* 프로필 헤더 스켈레톤 */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-36 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-6 border-b pb-2">
        <div className="h-5 w-10 bg-muted rounded animate-pulse" />
        <div className="h-5 w-14 bg-muted rounded animate-pulse" />
      </div>

      {/* 콘텐츠 목록 스켈레톤 */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/profile/[username]/loading.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add profile page loading skeleton"
```

---

## Task 3: 폼 페이지 로딩 스켈레톤 (3개)

**Files:**
- Create: `frontend/app/(main)/profile/[username]/edit/loading.tsx`
- Create: `frontend/app/(main)/contents/new/loading.tsx`
- Create: `frontend/app/(main)/contents/[id]/edit/loading.tsx`

- [ ] **Step 1: `profile/[username]/edit/loading.tsx` 생성**

```tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8">
      <div className="space-y-2">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="h-4 w-56 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-10 bg-muted rounded animate-pulse" />
    </div>
  )
}
```

- [ ] **Step 2: `contents/new/loading.tsx` 생성**

```tsx
export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="h-8 w-36 bg-muted rounded animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
    </div>
  )
}
```

- [ ] **Step 3: `contents/[id]/edit/loading.tsx` 생성**

```tsx
export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="h-8 w-36 bg-muted rounded animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
    </div>
  )
}
```

- [ ] **Step 4: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 5: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/profile/[username]/edit/loading.tsx" "frontend/app/(main)/contents/new/loading.tsx" "frontend/app/(main)/contents/[id]/edit/loading.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add loading skeletons for form pages"
```

---

## Task 4: 최종 검증 및 문서 정리

- [ ] **Step 1: tsc 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 2: eslint 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx eslint . --ext .ts,.tsx 2>&1"
```

Expected: 신규 오류/경고 없음

- [ ] **Step 3: 문서 업데이트**

`docs/AI-ACTION-LOGS.md`에 추가:
```
### [30] 로딩/에러 상태 처리 구현
- error.tsx 3개 개선: AlertCircle + 메시지 + 다시 시도/홈으로 버튼
- profile/[username]/loading.tsx: 프로필 헤더+탭+리스트 상세 스켈레톤
- edit/new 폼 3개 loading.tsx: 단순 카드 스켈레톤
```

`docs/TODO-DONE.md`에 추가:
```
- [x] 로딩/에러 상태 처리 (스켈레톤 UI, 에러 페이지 개선)
```

`docs/CONTEXT.md`:
```
**로딩/에러 상태 처리 완료.** 다음 작업: 전체적인 UI/UX 개선.
```

- [ ] **Step 4: 문서 Commit**

```
git -C D:\Backend_Bootcamp\agent_project add docs/AI-ACTION-LOGS.md docs/TODO-DONE.md docs/CONTEXT.md
git -C D:\Backend_Bootcamp\agent_project commit -m "docs: update docs for loading/error states"
```
