# 공통 네비게이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `(main)` 레이아웃에 상단 고정 헤더(로고, 콘텐츠 등록, 내 프로필, 로그아웃)를 추가한다.

**Architecture:** Header는 Server Component로 user + profile을 병렬 조회해 username을 렌더링한다. 로그아웃 버튼은 `<form action={signOut}>`을 사용하는 별도 Client Component로 분리한다. `(main)/layout.tsx`에 Header를 삽입해 모든 보호 라우트에 공통 적용한다.

**Tech Stack:** Next.js 16 App Router, Supabase SSR, TypeScript, Tailwind CSS, shadcn/ui, lucide-react

---

## 파일 구조

| 상태 | 경로 | 역할 |
|------|------|------|
| 신규 | `frontend/app/(main)/_components/sign-out-button.tsx` | Client Component — signOut form action |
| 신규 | `frontend/app/(main)/_components/header.tsx` | Server Component — user/profile 조회, 헤더 렌더 |
| 수정 | `frontend/app/(main)/layout.tsx` | Header + main 래핑 |

---

## Task 1: SignOutButton 컴포넌트

**Files:**
- Create: `frontend/app/(main)/_components/sign-out-button.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
'use client'

import { signOut } from '@/actions/auth'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        로그아웃
      </button>
    </form>
  )
}
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/_components/sign-out-button.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add SignOutButton component"
```

---

## Task 2: Header 컴포넌트

**Files:**
- Create: `frontend/app/(main)/_components/header.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SignOutButton } from './sign-out-button'

export async function Header() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          프로필
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/contents/new"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            + 등록
          </Link>
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
          >
            <UserCircle className="h-5 w-5" />
            {profile.username}
          </Link>
          <SignOutButton />
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/_components/header.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add Header server component"
```

---

## Task 3: Layout 수정 및 검증

**Files:**
- Modify: `frontend/app/(main)/layout.tsx`

- [ ] **Step 1: Layout 수정**

현재 파일 전체를 아래로 교체한다:

```tsx
import { Header } from './_components/header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: eslint 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx eslint . --ext .ts,.tsx 2>&1"
```

Expected: 신규 오류/경고 없음

- [ ] **Step 4: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/layout.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add global navigation header to main layout"
```

- [ ] **Step 5: 수동 검증 체크리스트**

브라우저에서 `http://localhost:3000` 접속 후 확인:

1. 상단에 헤더 고정 표시 (스크롤해도 유지)
2. 로고 클릭 → 홈(`/`)으로 이동
3. `+ 등록` 클릭 → `/contents/new`로 이동
4. 프로필 아이콘 + username 클릭 → `/profile/[username]`으로 이동
5. `로그아웃` 클릭 → `/login`으로 리다이렉트
6. 콘텐츠 상세 페이지, 프로필 페이지 등 모든 (main) 라우트에서 헤더 표시

- [ ] **Step 6: 문서 업데이트**

`docs/AI-ACTION-LOGS.md` 최상단 `## 2026-05-14` 섹션에 추가:

```
### [26] 공통 네비게이션 구현 완료
- sign-out-button.tsx: form action={signOut} Client Component
- header.tsx: Server Component, user+profile 순차 조회, UserCircle 아이콘
- layout.tsx: Header + main 래핑
```

`docs/TODO-DONE.md`에 추가:

```
- [x] 공통 네비게이션 헤더 구현 (로고, + 등록, 내 프로필, 로그아웃)
```

`docs/CONTEXT.md` 현재 상태 업데이트:

```
**공통 네비게이션 구현 완료.** 다음 작업: 팔로우 도메인 문서 작성 → 구현.
```

`docs/TODO-READY.md`에서 완료 처리:

```
- [x] 글로벌 네비게이션 브레인스토밍 (홈 / 내 프로필 / 로그아웃 등)
- [x] `app/(main)/layout.tsx` 네비게이션 헤더 구현 (아바타 포함 여부 설계 시 결정)
```

- [ ] **Step 7: 문서 Commit**

```
git -C D:\Backend_Bootcamp\agent_project add docs/AI-ACTION-LOGS.md docs/TODO-DONE.md docs/CONTEXT.md docs/TODO-READY.md
git -C D:\Backend_Bootcamp\agent_project commit -m "docs: update docs for navigation completion"
```
