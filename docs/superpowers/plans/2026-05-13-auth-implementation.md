# Auth 도메인 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이메일/패스워드 + Google OAuth 인증, 비밀번호 재설정, 라우트 보호, 신규 유저 프로필 설정 흐름을 구현한다.

**Architecture:** 미들웨어에서 (main)/* 전체를 보호하고, 신규 유저는 `/profile/setup`으로 강제 이동한다. 모든 데이터 변경은 Server Actions(`actions/auth.ts`)를 통하며, OAuth 콜백은 `/auth/callback` Route Handler 단일 진입점으로 처리한다.

**Tech Stack:** Next.js 16 App Router, Supabase Auth (`@supabase/ssr`), shadcn/ui (button, input, label), TypeScript

---

## 파일 구조

| 파일 | 작업 | 역할 |
|------|------|------|
| `backend/supabase/migrations/20260513000001_add_is_profile_setup.sql` | 생성 | profiles 테이블에 is_profile_setup 컬럼 추가 |
| `frontend/types/database.ts` | 수정 | profiles 타입에 is_profile_setup 추가 |
| `frontend/.env.local` | 수정 | NEXT_PUBLIC_SITE_URL 추가 |
| `frontend/.env.example` | 수정 | NEXT_PUBLIC_SITE_URL 예시 추가 |
| `frontend/actions/auth.ts` | 생성 | 7개 Server Actions |
| `frontend/middleware.ts` | 수정 | 라우트 보호 + 프로필 미설정 리다이렉트 |
| `frontend/app/auth/callback/route.ts` | 생성 | OAuth 콜백 처리 |
| `frontend/app/(auth)/login/page.tsx` | 수정 | 이메일/패스워드 + Google 로그인 폼 |
| `frontend/app/(auth)/signup/page.tsx` | 수정 | 회원가입 폼 |
| `frontend/app/(auth)/forgot-password/page.tsx` | 생성 | 비밀번호 재설정 메일 발송 폼 |
| `frontend/app/(auth)/reset-password/page.tsx` | 생성 | 새 비밀번호 입력 폼 |
| `frontend/app/(main)/profile/setup/page.tsx` | 생성 | username 초기 설정 폼 |

---

## Task 1: DB 마이그레이션 — `is_profile_setup` 컬럼 추가

**Files:**
- Create: `backend/supabase/migrations/20260513000001_add_is_profile_setup.sql`

- [ ] **Step 1: 마이그레이션 파일 작성**

```sql
-- backend/supabase/migrations/20260513000001_add_is_profile_setup.sql
ALTER TABLE public.profiles
  ADD COLUMN is_profile_setup boolean NOT NULL DEFAULT false;
```

- [ ] **Step 2: Supabase Cloud에 마이그레이션 적용**

`frontend/` 디렉토리가 아닌 프로젝트 루트 또는 `backend/` 에서 실행:

```bash
cd backend
supabase db push
```

Expected output:
```
Applying migration 20260513000001_add_is_profile_setup.sql...
Done.
```

- [ ] **Step 3: Supabase 대시보드에서 확인**

Supabase 대시보드 → Table Editor → profiles 테이블에 `is_profile_setup` 컬럼(boolean, default false)이 추가됐는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add backend/supabase/migrations/20260513000001_add_is_profile_setup.sql
git commit -m "chore: add is_profile_setup column to profiles"
```

---

## Task 2: TypeScript 타입 업데이트

**Files:**
- Modify: `frontend/types/database.ts`

- [ ] **Step 1: profiles 타입에 `is_profile_setup` 추가**

`frontend/types/database.ts`의 profiles Row, Insert, Update 타입에 각각 추가:

```typescript
profiles: {
  Row: {
    id: string
    username: string
    avatar_url: string | null
    bio: string | null
    is_profile_setup: boolean   // 추가
    created_at: string
  }
  Insert: {
    id: string
    username: string
    avatar_url?: string | null
    bio?: string | null
    is_profile_setup?: boolean  // 추가
    created_at?: string
  }
  Update: {
    id?: string
    username?: string
    avatar_url?: string | null
    bio?: string | null
    is_profile_setup?: boolean  // 추가
    created_at?: string
  }
  Relationships: []
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
git add frontend/types/database.ts
git commit -m "chore: add is_profile_setup to profiles type"
```

---

## Task 3: 환경변수 및 shadcn 컴포넌트 추가

**Files:**
- Modify: `frontend/.env.local`
- Modify: `frontend/.env.example`

- [ ] **Step 1: `.env.local`에 `NEXT_PUBLIC_SITE_URL` 추가**

`frontend/.env.local` 파일 끝에 추가:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: `.env.example`에도 추가**

`frontend/.env.example` 파일 끝에 추가:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 3: shadcn input, label 컴포넌트 추가**

```bash
cd frontend
npx shadcn@latest add input label
```

Expected: `components/ui/input.tsx`, `components/ui/label.tsx` 생성됨

- [ ] **Step 4: 커밋**

```bash
git add frontend/.env.example frontend/components/ui/input.tsx frontend/components/ui/label.tsx
git commit -m "chore: add NEXT_PUBLIC_SITE_URL env and shadcn input/label"
```

> `.env.local`은 `.gitignore`에 포함되므로 커밋하지 않는다.

---

## Task 4: Server Actions 작성

**Files:**
- Create: `frontend/actions/auth.ts`

- [ ] **Step 1: `actions/auth.ts` 작성**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; message: string }

export async function signUpWithEmail(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '회원가입에 실패했습니다. 다시 시도해 주세요.' }
  }

  return { success: true, data: undefined }
}

export async function signInWithEmail(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }

  redirect('/')
}

export async function signInWithGoogle(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: 'Google 로그인에 실패했습니다.' }
  }

  redirect(data.url)
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '로그아웃에 실패했습니다.' }
  }

  redirect('/login')
}

export async function sendPasswordResetEmail(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '메일 발송에 실패했습니다. 다시 시도해 주세요.' }
  }

  return { success: true, data: undefined }
}

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '비밀번호 변경에 실패했습니다.' }
  }

  redirect('/')
}

export async function setupProfile(formData: FormData): Promise<ActionResult> {
  const username = (formData.get('username') as string).trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('profiles')
    .update({ username, is_profile_setup: true })
    .eq('id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    if (error.code === '23505') return { success: false, message: '이미 사용 중인 username입니다.' }
    return { success: false, message: '프로필 설정에 실패했습니다.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
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
git add frontend/actions/auth.ts
git commit -m "feat: add auth server actions"
```

---

## Task 5: 미들웨어 업데이트

**Files:**
- Modify: `frontend/middleware.ts`

- [ ] **Step 1: `middleware.ts` 전체 교체**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { type Database } from '@/types/database'

const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // OAuth 콜백은 미들웨어 보호 제외
  if (pathname.startsWith('/auth/callback')) return supabaseResponse

  // Auth 페이지: 로그인 상태면 홈으로
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // 보호 라우트: 비로그인 시 로그인 페이지로
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // 프로필 미설정 시 setup 페이지로 (무한 루프 방지)
  if (pathname !== '/profile/setup') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_profile_setup')
      .eq('id', user.id)
      .single()

    if (profile && !profile.is_profile_setup) {
      return NextResponse.redirect(new URL('/profile/setup', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 동작 확인 (dev 서버 실행 후)**

```bash
cd frontend
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → `/login`으로 리다이렉트되는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add frontend/middleware.ts
git commit -m "feat: add route protection and profile setup redirect to middleware"
```

---

## Task 6: OAuth 콜백 Route Handler

**Files:**
- Create: `frontend/app/auth/callback/route.ts`

> `/auth/callback`은 URL 경로가 `/auth/callback`이 되어야 하므로 route group 밖에 생성한다.
> `app/(auth)/callback/route.ts`는 URL이 `/callback`이 되므로 틀림.

- [ ] **Step 1: `app/auth/callback/route.ts` 작성**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

- [ ] **Step 2: Supabase 대시보드 설정 확인**

Supabase 대시보드 → Authentication → URL Configuration에서:
- Site URL: `http://localhost:3000`
- Redirect URLs에 `http://localhost:3000/auth/callback` 추가

- [ ] **Step 3: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add frontend/app/auth/callback/route.ts
git commit -m "feat: add OAuth callback route handler"
```

---

## Task 7: 로그인 페이지

**Files:**
- Modify: `frontend/app/(auth)/login/page.tsx`

- [ ] **Step 1: 로그인 페이지 작성**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail, signInWithGoogle } from '@/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleEmailSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await signInWithEmail(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    }
  }

  async function handleGoogle() {
    setPending(true)
    setError(null)
    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.message)
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">로그인</h1>

        <form action={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '로그인'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={pending}>
          Google로 로그인
        </Button>

        <div className="text-center text-sm space-y-1">
          <Link href="/forgot-password" className="text-muted-foreground hover:underline block">
            비밀번호를 잊으셨나요?
          </Link>
          <Link href="/signup" className="text-muted-foreground hover:underline block">
            계정이 없으신가요? 회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크 및 린트**

```bash
cd frontend
npx tsc --noEmit && npx eslint app/\(auth\)/login/page.tsx
```

Expected: 에러 없음

- [ ] **Step 3: 수동 테스트**

```bash
npm run dev
```

- `http://localhost:3000/login` 접속 → 로그인 폼 렌더링 확인
- 잘못된 이메일/비밀번호 입력 → 에러 메시지 표시 확인
- 올바른 이메일/비밀번호 입력 → `/`로 리다이렉트 확인 (단, 이 시점에 프로필 미설정이면 `/profile/setup`으로 감)

- [ ] **Step 4: 커밋**

```bash
git add frontend/app/\(auth\)/login/page.tsx
git commit -m "feat: implement login page"
```

---

## Task 8: 회원가입 페이지

**Files:**
- Modify: `frontend/app/(auth)/signup/page.tsx`

- [ ] **Step 1: 회원가입 페이지 작성**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithEmail } from '@/actions/auth'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setPending(true)
    setError(null)
    const result = await signUpWithEmail(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4 p-6 text-center">
          <h1 className="text-2xl font-bold">이메일을 확인해 주세요</h1>
          <p className="text-muted-foreground">
            가입하신 이메일로 인증 링크를 발송했습니다.
            이메일을 확인한 후 로그인해 주세요.
          </p>
          <Link href="/login" className="text-sm hover:underline">
            로그인으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">회원가입</h1>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">비밀번호 확인</Label>
            <Input id="confirm" name="confirm" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '가입하기'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크 및 린트**

```bash
cd frontend
npx tsc --noEmit && npx eslint app/\(auth\)/signup/page.tsx
```

Expected: 에러 없음

- [ ] **Step 3: 수동 테스트**

- `http://localhost:3000/signup` 접속 → 회원가입 폼 렌더링 확인
- 비밀번호 불일치 → 클라이언트 에러 메시지 확인
- 정상 가입 → 이메일 인증 안내 화면으로 전환 확인

- [ ] **Step 4: 커밋**

```bash
git add frontend/app/\(auth\)/signup/page.tsx
git commit -m "feat: implement signup page"
```

---

## Task 9: 비밀번호 재설정 페이지

**Files:**
- Create: `frontend/app/(auth)/forgot-password/page.tsx`
- Create: `frontend/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: `forgot-password/page.tsx` 작성**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendPasswordResetEmail } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await sendPasswordResetEmail(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4 p-6 text-center">
          <h1 className="text-2xl font-bold">이메일을 확인해 주세요</h1>
          <p className="text-muted-foreground">
            비밀번호 재설정 링크를 발송했습니다.
          </p>
          <Link href="/login" className="text-sm hover:underline">
            로그인으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">비밀번호 재설정</h1>
        <p className="text-sm text-muted-foreground text-center">
          가입한 이메일을 입력하면 재설정 링크를 보내드립니다.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '재설정 링크 보내기'}
          </Button>
        </form>

        <p className="text-center text-sm">
          <Link href="/login" className="text-muted-foreground hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `reset-password/page.tsx` 작성**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/actions/auth'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setPending(true)
    setError(null)
    const result = await updatePassword(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">새 비밀번호 설정</h1>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">새 비밀번호</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">비밀번호 확인</Label>
            <Input id="confirm" name="confirm" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '비밀번호 변경'}
          </Button>
        </form>
      </div>
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
git add frontend/app/\(auth\)/forgot-password/page.tsx frontend/app/\(auth\)/reset-password/page.tsx
git commit -m "feat: implement forgot/reset password pages"
```

---

## Task 10: 프로필 설정 페이지

**Files:**
- Create: `frontend/app/(main)/profile/setup/page.tsx`

- [ ] **Step 1: `profile/setup/page.tsx` 작성**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setupProfile } from '@/actions/auth'

export default function ProfileSetupPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    const username = (formData.get('username') as string).trim()

    if (username.length < 2) {
      setError('username은 2자 이상이어야 합니다.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('username은 영문, 숫자, 밑줄(_)만 사용 가능합니다.')
      return
    }

    setPending(true)
    setError(null)
    const result = await setupProfile(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">프로필 설정</h1>
          <p className="text-sm text-muted-foreground">
            사용할 username을 설정해 주세요. 나중에 변경할 수 있습니다.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="my_username"
              minLength={2}
              maxLength={30}
              required
            />
            <p className="text-xs text-muted-foreground">영문, 숫자, 밑줄(_) 사용 가능 (2~30자)</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '저장 중...' : '시작하기'}
          </Button>
        </form>
      </div>
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

- [ ] **Step 3: 수동 테스트 — 전체 흐름**

```bash
npm run dev
```

**이메일 가입 전체 흐름:**
1. `http://localhost:3000` → `/login`으로 리다이렉트 확인
2. `/signup`에서 회원가입 → 이메일 인증 안내 화면 확인
3. 이메일 인증 링크 클릭 → `/auth/callback` → `/profile/setup`으로 이동 확인
4. username 입력 → `/`로 이동 확인
5. 다시 `/login`에 접근 → `/`로 리다이렉트 확인 (로그인 상태)
6. 로그아웃 후 `/` 접근 → `/login`으로 리다이렉트 확인

**Google 로그인 흐름 (Supabase 대시보드에 Google OAuth 설정 후):**
1. `/login`에서 Google 로그인 버튼 클릭 → Google 인증 페이지로 이동
2. Google 인증 완료 → `/auth/callback` → 신규 유저면 `/profile/setup`, 기존 유저면 `/`

**로그아웃 테스트 (헤더 미구현 상태):**

`frontend/app/(main)/page.tsx`에 임시로 로그아웃 버튼 추가:

```tsx
'use client'
import { signOut } from '@/actions/auth'

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">콘텐츠 리뷰 플랫폼</h1>
      <form action={signOut}>
        <button type="submit" className="text-sm text-red-500 hover:underline">
          로그아웃 (임시)
        </button>
      </form>
    </main>
  )
}
```

로그아웃 클릭 → `/login`으로 리다이렉트 확인.
Content 도메인 구현 시 헤더로 이동하고 이 코드는 제거한다.

- [ ] **Step 4: 커밋**

```bash
git add frontend/app/\(main\)/profile/setup/page.tsx
git commit -m "feat: implement profile setup page"
```

---

## Task 11: 문서 업데이트

**Files:**
- Modify: `docs/TODO-DONE.md`
- Modify: `docs/TODO-BACKLOG.md`
- Modify: `docs/CONTEXT.md`

- [ ] **Step 1: `TODO-DONE.md`에 완료 항목 추가**

`## 2026-05-13` 섹션에 추가:
```
- [x] Auth 도메인 구현 (이메일/패스워드 + Google OAuth, 비밀번호 재설정, 라우트 보호, 프로필 설정)
```

- [ ] **Step 2: `TODO-BACKLOG.md`에서 Auth 항목 완료 처리**

`## 인증 (Auth)` 섹션의 모든 항목을 `[x]`로 변경:
```
- [x] 회원가입 페이지 구현 (이메일/패스워드)
- [x] 로그인 페이지 구현
- [x] 로그아웃 기능
- [x] 인증 상태 기반 라우트 보호 (미들웨어 확장)
- [x] 프로필 초기 설정 페이지 (가입 후 username 변경)
```

- [ ] **Step 3: `CONTEXT.md` 업데이트**

현재 상태를 반영해 업데이트:
```markdown
## 현재 상태 (2026-05-13)

**Auth 도메인 구현 완료.** 다음 작업: Content 도메인 문서 작성 → 구현.

**스택:**
- Frontend: Next.js 16.2.6 (App Router, TypeScript, Tailwind v4, shadcn/ui)
- Backend: Supabase Cloud (Auth, DB, Storage, Realtime) — 마이그레이션 적용 완료

**환경변수 키 이름 (`frontend/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

**DB 스키마 핵심 사항:**
- `contents`: `created_by uuid` 소유권 컬럼 있음
- `profiles`: `is_profile_setup boolean DEFAULT false` — 미들웨어에서 setup 페이지 리다이렉트 기준
- `reviews`: `UNIQUE(user_id, content_id)` — 유저당 콘텐츠 1개 리뷰
- 전 테이블 RLS 활성화
```

- [ ] **Step 4: 커밋**

```bash
git add docs/TODO-DONE.md docs/TODO-BACKLOG.md docs/CONTEXT.md
git commit -m "docs: update auth domain completion status"
```
