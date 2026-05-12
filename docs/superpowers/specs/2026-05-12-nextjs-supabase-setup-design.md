# 설계 문서: Next.js + Supabase 초기 환경 세팅

**날짜**: 2026-05-12  
**프로젝트**: 콘텐츠 리뷰 플랫폼 (영화/드라마/책)

---

## 1. 개요

영화, 드라마, 책 콘텐츠에 대한 리뷰를 작성하고 공유하는 플랫폼.  
프론트엔드는 Next.js(App Router + TypeScript), 백엔드는 Supabase Cloud로 구성한다.

**핵심 기능**
- 콘텐츠(영화/드라마/책) 등록 및 조회
- 리뷰 작성 (별점 1~5, 태그, 본문) — 유저당 콘텐츠 1개 리뷰
- 유저 팔로우/팔로잉
- 콘텐츠 북마크

---

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
| 백엔드 | Supabase Cloud (Auth, Database, Storage, Realtime) |
| Supabase 클라이언트 | `@supabase/supabase-js` + `@supabase/ssr` |
| DB 관리 | Supabase CLI (마이그레이션) |

---

## 3. 디렉토리 구조

```
agent_project/
├── CLAUDE.md
├── docs/
│   ├── CONTEXT.md
│   ├── TODO-READY.md
│   ├── TODO-DOING.md
│   ├── TODO-BACKLOG.md
│   ├── TODO-DONE.md
│   ├── ARCHITECTURE-CONSTITUTION.md
│   ├── ARCHITECTURE-STATUTE.md
│   ├── DOMAIN-COMMON-CONSTITUTION.md
│   ├── DOMAIN-COMMON-STATUTE.md
│   ├── AI-ACTION-LOGS.md
│   ├── AI-MAJOR-EVENT.md
│   ├── AI-MAJOR-EVENT-RECAP.md
│   └── superpowers/specs/
│
├── frontend/                        # Next.js 앱
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── contents/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── reviews/
│   │   │   │   └── [id]/page.tsx
│   │   │   └── users/
│   │   │       └── [id]/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts            # 브라우저용 클라이언트
│   │       ├── server.ts            # 서버용 클라이언트
│   │       └── middleware.ts        # 세션 갱신 헬퍼
│   ├── types/
│   ├── middleware.ts                # Next.js 미들웨어 (루트)
│   ├── .env.local                   # 환경변수 (git 제외)
│   └── package.json
│
└── backend/
    └── supabase/
        ├── config.toml
        ├── migrations/
        ├── functions/
        └── seed.sql
```

---

## 4. Supabase DB 스키마

```sql
-- 콘텐츠
contents (
  id uuid PK DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('movie','drama','book')),
  title text NOT NULL,
  description text,
  cover_image_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
)

-- 유저 프로필 (auth.users 확장)
profiles (
  id uuid PK REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
)

-- 리뷰
reviews (
  id uuid PK DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content_id uuid REFERENCES contents ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, content_id)
)

-- 팔로우
follows (
  follower_id uuid REFERENCES auth.users ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
)

-- 북마크
bookmarks (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content_id uuid REFERENCES contents ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
)
```

---

## 5. RLS (Row Level Security) 정책

| 테이블 | SELECT | INSERT / UPDATE / DELETE |
|--------|--------|--------------------------|
| contents | 전체 공개 | 인증 유저만 INSERT, 작성자만 UPDATE/DELETE |
| profiles | 전체 공개 | 본인만 UPDATE |
| reviews | 전체 공개 | 본인만 INSERT/UPDATE/DELETE |
| follows | 전체 공개 | 본인(follower)만 INSERT/DELETE |
| bookmarks | 본인만 | 본인만 INSERT/DELETE |

---

## 6. 환경변수

`frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

---

## 7. Supabase 클라이언트 구성

`@supabase/ssr`을 사용하여 서버/클라이언트 컨텍스트를 올바르게 분리한다.

- `lib/supabase/client.ts` — `createBrowserClient()` (Client Component)
- `lib/supabase/server.ts` — `createServerClient()` (Server Component, Server Action, Route Handler)
- `lib/supabase/middleware.ts` — 세션 갱신 로직
- `middleware.ts` (frontend 루트) — 모든 요청에서 세션 갱신 실행

---

## 8. 설치 순서

1. `docs/` 초기 문서 생성
2. `frontend/` — `create-next-app` 으로 Next.js 15 생성
3. `frontend/` — `@supabase/supabase-js`, `@supabase/ssr` 설치
4. `frontend/` — `shadcn/ui` 초기화
5. `frontend/lib/supabase/` — 클라이언트 파일 작성
6. `frontend/middleware.ts` — 세션 미들웨어 작성
7. `frontend/.env.local` — 환경변수 파일 생성
8. `backend/` — Supabase CLI `supabase init`
9. `backend/supabase/migrations/` — 초기 스키마 마이그레이션 파일 작성
