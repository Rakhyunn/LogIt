# Next.js + Supabase 초기 환경 세팅 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 콘텐츠 리뷰 플랫폼을 위한 Next.js 15 (App Router, TypeScript) + Supabase Cloud 초기 환경을 설치하고 구성한다.

**Architecture:** `frontend/`에 Next.js 앱, `backend/supabase/`에 Supabase CLI 프로젝트를 분리 배치한다. Supabase 클라이언트는 서버/클라이언트 컨텍스트를 `@supabase/ssr`로 분리하고, DB 스키마는 마이그레이션 파일로 관리한다.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, @supabase/supabase-js, @supabase/ssr, Supabase CLI

---

## 파일 구조

```
agent_project/
├── docs/                                    # [생성] CLAUDE.md 규칙 문서들
│   ├── CONTEXT.md
│   ├── TODO-READY.md / TODO-DOING.md / TODO-BACKLOG.md / TODO-DONE.md
│   ├── ARCHITECTURE-CONSTITUTION.md / ARCHITECTURE-STATUTE.md
│   ├── DOMAIN-COMMON-CONSTITUTION.md / DOMAIN-COMMON-STATUTE.md
│   ├── AI-ACTION-LOGS.md / AI-MAJOR-EVENT.md / AI-MAJOR-EVENT-RECAP.md
│   └── superpowers/specs/ & plans/
│
├── frontend/                                # [생성] create-next-app
│   ├── app/
│   │   ├── layout.tsx                       # [생성] 루트 레이아웃
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx               # [생성] 로그인 페이지 플레이스홀더
│   │   │   └── signup/page.tsx              # [생성] 회원가입 페이지 플레이스홀더
│   │   └── (main)/
│   │       ├── layout.tsx                   # [생성] 공통 레이아웃 플레이스홀더
│   │       └── page.tsx                     # [생성] 홈 페이지 플레이스홀더
│   ├── lib/supabase/
│   │   ├── client.ts                        # [생성] 브라우저 클라이언트
│   │   ├── server.ts                        # [생성] 서버 클라이언트
│   │   └── middleware.ts                    # [생성] 세션 갱신 헬퍼
│   ├── types/
│   │   └── database.ts                      # [생성] DB 타입 정의
│   ├── middleware.ts                         # [생성] Next.js 미들웨어
│   ├── .env.local                           # [생성] 환경변수
│   └── .env.example                         # [생성] 환경변수 예시 (git 포함)
│
└── backend/supabase/
    ├── config.toml                           # [생성] supabase init
    └── migrations/
        └── 20260512000000_initial_schema.sql # [생성] 초기 스키마
```

---

## Task 1: docs/ 초기 문서 구조 생성

**Files:**
- Create: `docs/CONTEXT.md`
- Create: `docs/TODO-READY.md`
- Create: `docs/TODO-DOING.md`
- Create: `docs/TODO-BACKLOG.md`
- Create: `docs/TODO-DONE.md`
- Create: `docs/ARCHITECTURE-CONSTITUTION.md`
- Create: `docs/ARCHITECTURE-STATUTE.md`
- Create: `docs/DOMAIN-COMMON-CONSTITUTION.md`
- Create: `docs/DOMAIN-COMMON-STATUTE.md`
- Create: `docs/AI-ACTION-LOGS.md`
- Create: `docs/AI-MAJOR-EVENT.md`
- Create: `docs/AI-MAJOR-EVENT-RECAP.md`

- [ ] **Step 1: docs/ 디렉토리 생성**

```bash
mkdir -p D:/Backend_Bootcamp/agent_project/docs
```

- [ ] **Step 2: CONTEXT.md 생성**

`docs/CONTEXT.md`:
```markdown
# CONTEXT.md

현재 작업에 직접 필요한 정보만 저장한다. 불필요한 내용은 즉시 제거한다.

---
```

- [ ] **Step 3: TODO 문서 생성**

`docs/TODO-READY.md`:
```markdown
# TODO-READY — 바로 작업 가능한 목록

---
```

`docs/TODO-DOING.md`:
```markdown
# TODO-DOING — 현재 진행 중

---
```

`docs/TODO-BACKLOG.md`:
```markdown
# TODO-BACKLOG — 예정 작업

---
```

`docs/TODO-DONE.md`:
```markdown
# TODO-DONE — 완료된 작업

---
```

- [ ] **Step 4: ARCHITECTURE 문서 생성**

`docs/ARCHITECTURE-CONSTITUTION.md`:
```markdown
# ARCHITECTURE-CONSTITUTION — 아키텍처 핵심 원칙

---
```

`docs/ARCHITECTURE-STATUTE.md`:
```markdown
# ARCHITECTURE-STATUTE — 아키텍처 구현 규칙

---
```

- [ ] **Step 5: DOMAIN 문서 생성**

`docs/DOMAIN-COMMON-CONSTITUTION.md`:
```markdown
# DOMAIN-COMMON-CONSTITUTION — 공통 도메인 원칙

---
```

`docs/DOMAIN-COMMON-STATUTE.md`:
```markdown
# DOMAIN-COMMON-STATUTE — 공통 도메인 규칙

---
```

- [ ] **Step 6: AI 기록 문서 생성**

`docs/AI-ACTION-LOGS.md`:
```markdown
# AI-ACTION-LOGS — 최근 작업 로그 (최대 100개)

---
```

`docs/AI-MAJOR-EVENT.md`:
```markdown
# AI-MAJOR-EVENT — 주요 사건 및 의사결정

---
```

`docs/AI-MAJOR-EVENT-RECAP.md`:
```markdown
# AI-MAJOR-EVENT-RECAP — 주요 사건 요약

---
```

- [ ] **Step 7: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git init
git add docs/
git commit -m "chore: initialize docs structure per CLAUDE.md"
```

---

## Task 2: Next.js 15 앱 스캐폴딩

**Files:**
- Create: `frontend/` (create-next-app 전체 구조)

- [ ] **Step 1: create-next-app 실행**

`agent_project/` 루트에서 실행:
```bash
cd D:/Backend_Bootcamp/agent_project
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

프롬프트가 나타나면:
- Would you like to use Turbopack? → **Yes**
- 나머지는 기본값 엔터

- [ ] **Step 2: 생성 확인**

```bash
ls D:/Backend_Bootcamp/agent_project/frontend/
```

예상 출력: `app/`, `components/`, `public/`, `package.json`, `tsconfig.json`, `tailwind.config.ts` (또는 없음, v4는 config 파일 불필요) 등 확인

- [ ] **Step 3: 개발 서버 기동 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하여 Next.js 기본 페이지 확인 후 서버 종료 (Ctrl+C)

- [ ] **Step 4: 불필요한 보일러플레이트 정리**

`frontend/app/page.tsx`를 아래로 교체:
```tsx
export default function HomePage() {
  return (
    <main>
      <h1>콘텐츠 리뷰 플랫폼</h1>
    </main>
  )
}
```

`frontend/app/globals.css`의 기본 스타일을 Tailwind 디렉티브만 남기도록 정리. 파일 내용을 확인 후 커스텀 CSS 블록(`:root`, `body` 변수 등) 삭제하고 아래만 유지:
```css
@import "tailwindcss";
```

- [ ] **Step 5: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/
git commit -m "chore: scaffold Next.js 15 app with App Router and TypeScript"
```

---

## Task 3: Supabase 패키지 설치

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: 패키지 설치**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: 설치 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
node -e "const { createBrowserClient } = require('@supabase/ssr'); console.log('ok')"
```

예상 출력: `ok`

- [ ] **Step 3: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: install @supabase/supabase-js and @supabase/ssr"
```

---

## Task 4: shadcn/ui 초기화

**Files:**
- Create: `frontend/components/ui/` (shadcn 컴포넌트 경로)
- Modify: `frontend/package.json`, `frontend/tsconfig.json`

- [ ] **Step 1: shadcn 초기화**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npx shadcn@latest init
```

프롬프트 응답:
- Which style? → **Default**
- Which color? → **Slate**
- Would you like to use CSS variables? → **Yes**

- [ ] **Step 2: 샘플 컴포넌트 추가 및 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npx shadcn@latest add button
```

`frontend/components/ui/button.tsx` 파일 생성 확인:
```bash
ls frontend/components/ui/
```

예상 출력: `button.tsx`

- [ ] **Step 3: 개발 서버 재기동 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npm run dev
```

`http://localhost:3000` 접속하여 에러 없이 렌더링 확인 후 종료

- [ ] **Step 4: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/
git commit -m "chore: initialize shadcn/ui with default style and slate color"
```

---

## Task 5: .env.local 및 .env.example 생성

**Files:**
- Create: `frontend/.env.local`
- Create: `frontend/.env.example`
- Modify: `frontend/.gitignore` (`.env.local` 포함 확인)

- [ ] **Step 1: .env.local 생성**

`frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

> Supabase Cloud 프로젝트 생성 후 Project Settings → API에서 값을 복사해 채운다.

- [ ] **Step 2: .env.example 생성**

`frontend/.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

- [ ] **Step 3: .gitignore 확인**

`frontend/.gitignore`에 `.env.local`이 포함되어 있는지 확인:
```bash
grep ".env.local" D:/Backend_Bootcamp/agent_project/frontend/.gitignore
```

없으면 `frontend/.gitignore` 끝에 추가:
```
.env.local
```

- [ ] **Step 4: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/.env.example frontend/.gitignore
git commit -m "chore: add .env.example and verify .env.local is gitignored"
```

---

## Task 6: TypeScript DB 타입 정의

**Files:**
- Create: `frontend/types/database.ts`

- [ ] **Step 1: types/ 디렉토리 생성 및 타입 파일 작성**

`frontend/types/database.ts`:
```typescript
export type ContentType = 'movie' | 'drama' | 'book'

export interface Database {
  public: {
    Tables: {
      contents: {
        Row: {
          id: string
          type: ContentType
          title: string
          description: string | null
          cover_image_url: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          type: ContentType
          title: string
          description?: string | null
          cover_image_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          type?: ContentType
          title?: string
          description?: string | null
          cover_image_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          content_id: string
          rating: number
          body: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          rating: number
          body?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          rating?: number
          body?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          user_id: string
          content_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          content_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          content_id?: string
          created_at?: string
        }
      }
    }
  }
}
```

> **Note:** Supabase Cloud에 스키마를 적용한 후 `npx supabase gen types typescript --project-id <id>` 명령으로 이 파일을 자동 생성된 타입으로 교체한다.

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npx tsc --noEmit
```

예상 출력: 에러 없음

- [ ] **Step 3: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/types/
git commit -m "chore: add manual TypeScript database types"
```

---

## Task 7: Supabase 클라이언트 파일 작성

**Files:**
- Create: `frontend/lib/supabase/client.ts`
- Create: `frontend/lib/supabase/server.ts`
- Create: `frontend/lib/supabase/middleware.ts`

- [ ] **Step 1: lib/supabase/ 디렉토리 생성**

```bash
mkdir -p D:/Backend_Bootcamp/agent_project/frontend/lib/supabase
```

- [ ] **Step 2: 브라우저 클라이언트 작성**

`frontend/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

- [ ] **Step 3: 서버 클라이언트 작성**

`frontend/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서는 쿠키 쓰기 불가 — 무시
          }
        },
      },
    }
  )
}
```

- [ ] **Step 4: 미들웨어 세션 헬퍼 작성**

`frontend/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { type Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신 (중요: getUser()를 반드시 호출해야 세션이 갱신됨)
  await supabase.auth.getUser()

  return supabaseResponse
}
```

- [ ] **Step 5: TypeScript 컴파일 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npx tsc --noEmit
```

예상 출력: 에러 없음

- [ ] **Step 6: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/lib/
git commit -m "chore: add Supabase client, server, and middleware helpers"
```

---

## Task 8: Next.js middleware.ts 작성

**Files:**
- Create: `frontend/middleware.ts`

- [ ] **Step 1: middleware.ts 작성**

`frontend/middleware.ts`:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npx tsc --noEmit
```

예상 출력: 에러 없음

- [ ] **Step 3: 개발 서버 기동 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npm run dev
```

`http://localhost:3000` 접속하여 에러 없이 렌더링 확인 후 종료

- [ ] **Step 4: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/middleware.ts
git commit -m "chore: add Next.js middleware for Supabase session management"
```

---

## Task 9: 라우트 플레이스홀더 페이지 생성

**Files:**
- Create: `frontend/app/(auth)/login/page.tsx`
- Create: `frontend/app/(auth)/signup/page.tsx`
- Create: `frontend/app/(main)/layout.tsx`
- Create: `frontend/app/(main)/page.tsx`

- [ ] **Step 1: 루트 page.tsx 삭제**

Task 2에서 생성된 `frontend/app/page.tsx`를 삭제한다. `(main)/page.tsx`가 동일한 `/` 라우트를 담당하므로 중복된다.

```bash
rm D:/Backend_Bootcamp/agent_project/frontend/app/page.tsx
```

- [ ] **Step 2: auth 라우트 그룹 생성**

`frontend/app/(auth)/login/page.tsx`:
```tsx
export default function LoginPage() {
  return <div>로그인</div>
}
```

`frontend/app/(auth)/signup/page.tsx`:
```tsx
export default function SignupPage() {
  return <div>회원가입</div>
}
```

- [ ] **Step 3: main 라우트 그룹 생성**

`frontend/app/(main)/layout.tsx`:
```tsx
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

`frontend/app/(main)/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">콘텐츠 리뷰 플랫폼</h1>
    </main>
  )
}
```

- [ ] **Step 4: 개발 서버에서 라우트 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npm run dev
```

- `http://localhost:3000` → "콘텐츠 리뷰 플랫폼" 텍스트 확인
- `http://localhost:3000/login` → "로그인" 텍스트 확인
- `http://localhost:3000/signup` → "회원가입" 텍스트 확인

서버 종료

- [ ] **Step 5: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add frontend/app/
git commit -m "chore: add placeholder pages for auth and main route groups"
```

---

## Task 10: Supabase CLI 초기화 (backend/)

**Files:**
- Create: `backend/supabase/config.toml` (supabase init 생성)

- [ ] **Step 1: Supabase CLI 설치 확인**

```bash
supabase --version
```

설치되어 있지 않으면:
```bash
npm install -g supabase
```

- [ ] **Step 2: backend/ 안에서 supabase init**

```bash
cd D:/Backend_Bootcamp/agent_project/backend
supabase init
```

예상 출력: `Generated your project in supabase/`

- [ ] **Step 3: 생성 확인**

```bash
ls D:/Backend_Bootcamp/agent_project/backend/supabase/
```

예상 출력: `config.toml`

- [ ] **Step 4: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add backend/
git commit -m "chore: initialize Supabase CLI project in backend/"
```

---

## Task 11: 초기 DB 스키마 마이그레이션 작성

**Files:**
- Create: `backend/supabase/migrations/20260512000000_initial_schema.sql`

- [ ] **Step 1: migrations/ 디렉토리 생성**

```bash
mkdir -p D:/Backend_Bootcamp/agent_project/backend/supabase/migrations
```

- [ ] **Step 2: 마이그레이션 파일 작성**

`backend/supabase/migrations/20260512000000_initial_schema.sql`:
```sql
-- Contents
CREATE TABLE public.contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('movie', 'drama', 'book')),
  title text NOT NULL,
  description text,
  cover_image_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Profiles (auth.users 확장)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.contents ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, content_id)
);

-- Follows
CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Bookmarks
CREATE TABLE public.bookmarks (
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.contents ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

-- 신규 유저 가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS 활성화
ALTER TABLE public.contents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- contents RLS
CREATE POLICY "contents_select_all"   ON public.contents FOR SELECT USING (true);
CREATE POLICY "contents_insert_auth"  ON public.contents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "contents_update_auth"  ON public.contents FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "contents_delete_auth"  ON public.contents FOR DELETE USING (auth.uid() IS NOT NULL);

-- profiles RLS
CREATE POLICY "profiles_select_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- reviews RLS
CREATE POLICY "reviews_select_all"    ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own"    ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own"    ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own"    ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- follows RLS
CREATE POLICY "follows_select_all"    ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own"    ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"    ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- bookmarks RLS
CREATE POLICY "bookmarks_select_own"  ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own"  ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own"  ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);
```

- [ ] **Step 3: SQL 문법 검토**

파일을 열어 테이블 5개(contents, profiles, reviews, follows, bookmarks), trigger 1개, RLS 정책 14개가 모두 존재하는지 확인

- [ ] **Step 4: 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add backend/supabase/migrations/
git commit -m "chore: add initial schema migration with RLS policies"
```

---

## Task 12: Supabase Cloud 연결 및 마이그레이션 적용

**전제 조건:** supabase.com에서 프로젝트를 생성하고 Project Settings → API에서 URL과 Publishable Key를 복사해둔다.

- [ ] **Step 1: .env.local 값 채우기**

`frontend/.env.local`의 빈 값을 채운다:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

- [ ] **Step 2: Supabase CLI로 프로젝트 연결**

```bash
cd D:/Backend_Bootcamp/agent_project/backend
supabase login
supabase link --project-ref <your-project-id>
```

- [ ] **Step 3: 마이그레이션 적용**

```bash
cd D:/Backend_Bootcamp/agent_project/backend
supabase db push
```

예상 출력: `Applying migration 20260512000000_initial_schema.sql`

- [ ] **Step 4: Supabase 대시보드에서 테이블 확인**

`https://supabase.com/dashboard/project/<id>/editor`에서 테이블 5개(contents, profiles, reviews, follows, bookmarks) 생성 확인

- [ ] **Step 5: 개발 서버에서 최종 확인**

```bash
cd D:/Backend_Bootcamp/agent_project/frontend
npm run dev
```

`http://localhost:3000` 접속하여 에러 없이 렌더링 확인 (미들웨어가 Supabase 연결을 시도하므로 콘솔 에러가 없어야 함)

- [ ] **Step 6: docs/AI-ACTION-LOGS.md 업데이트**

`docs/AI-ACTION-LOGS.md`에 아래 항목 추가:
```markdown
## 2026-05-12
- Next.js 15 + Supabase Cloud 초기 환경 세팅 완료
- frontend/: App Router, TypeScript, Tailwind v4, shadcn/ui
- backend/: Supabase CLI, 초기 스키마 마이그레이션 적용
- 테이블: contents, profiles, reviews, follows, bookmarks (RLS 활성화)
```

- [ ] **Step 7: 최종 커밋**

```bash
cd D:/Backend_Bootcamp/agent_project
git add docs/AI-ACTION-LOGS.md
git commit -m "chore: complete initial Next.js + Supabase environment setup"
```
