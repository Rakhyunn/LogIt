# 공통 네비게이션 설계 스펙

**Goal:** `(main)` 레이아웃에 상단 고정 헤더를 추가해 홈, 콘텐츠 등록, 내 프로필, 로그아웃에 접근할 수 있게 한다.

**Date:** 2026-05-14

---

## 아키텍처

### 신규 파일
| 파일 | 역할 |
|------|------|
| `frontend/app/(main)/_components/header.tsx` | Server Component — user + profile 조회, 헤더 렌더 |
| `frontend/app/(main)/_components/sign-out-button.tsx` | Client Component — signOut form action |

### 수정 파일
| 파일 | 변경 내용 |
|------|-----------|
| `frontend/app/(main)/layout.tsx` | `<Header />` + `<main>` 래핑 추가 |

---

## Header (Server Component)

```tsx
// frontend/app/(main)/_components/header.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { SignOutButton } from './sign-out-button'

export async function Header() {
  const supabase = await createClient()
  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('username').eq('id', user!.id).single(),
  ])
  // ...
}
```

**데이터 조회:**
- `Promise.all`로 `auth.getUser()` + `profiles.select('username')` 병렬 조회
- 미들웨어가 비로그인·프로필 미설정 사용자를 사전 차단하므로 user/profile null 처리 불필요

**렌더링 구조:**
```
<header> (sticky top-0 z-50 bg-background border-b)
  <nav> (container mx-auto px-4 h-14 flex items-center justify-between)
    좌측: <Link href="/">로고 텍스트</Link>
    우측: 
      <Link href="/contents/new">+ 등록</Link>
      <Link href="/profile/[username]">
        <UserCircle /> {username}
      </Link>
      <SignOutButton />
```

**아바타:** `avatar_url` 미구현 — lucide-react `UserCircle` 아이콘 사용. 추후 `<Image>` 교체 가능.

---

## SignOutButton (Client Component)

```tsx
// frontend/app/(main)/_components/sign-out-button.tsx
'use client'
import { signOut } from '@/actions/auth'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit">로그아웃</button>
    </form>
  )
}
```

- `signOut`은 `actions/auth.ts`에 기구현
- `<form action>` 패턴으로 Server Action 호출 — 별도 `useTransition` 불필요
- `signOut` 완료 후 미들웨어가 `/login`으로 리다이렉트

---

## Layout 수정

```tsx
// frontend/app/(main)/layout.tsx
import { Header } from './_components/header'

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
```

---

## 스타일

| 요소 | Tailwind 클래스 |
|------|----------------|
| `<header>` | `sticky top-0 z-50 bg-background border-b` |
| `<nav>` | `container mx-auto px-4 h-14 flex items-center justify-between` |
| 우측 메뉴 영역 | `flex items-center gap-4` |
| 프로필 링크 | `flex items-center gap-1.5 text-sm` |
| + 등록 버튼 | `buttonVariants({ size: 'sm' })` (shadcn/ui) |
| 로그아웃 버튼 | `text-sm text-muted-foreground hover:text-foreground` |
