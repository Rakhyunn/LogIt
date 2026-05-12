# AI-ACTION-LOGS — 최근 작업 로그 (최대 100개)

---

## 2026-05-12

### [1] docs/ 초기 문서 구조 생성 (커밋: fe2afd7)
- CLAUDE.md 규칙에 따른 docs/ 디렉토리 12개 문서 파일 생성
- git 저장소 초기화 (git init)

### [2] Next.js 15 앱 스캐폴딩 (커밋: c9cdc8a, 9050d44)
- create-next-app@latest로 frontend/ 생성 (실제 설치 버전: Next.js 16.2.6)
- App Router, TypeScript, Tailwind CSS v4, Turbopack 활성화
- 보일러플레이트 정리, 메타데이터 한국어로 업데이트, html lang="ko"

### [3] Supabase 패키지 설치 (커밋: 8092300)
- @supabase/supabase-js ^2.105.4, @supabase/ssr ^0.10.3 설치

### [4] shadcn/ui 초기화 (커밋: 5f42d33)
- shadcn@latest init (Default style, Tailwind v4 자동 감지)
- components/ui/button.tsx, lib/utils.ts 생성

### [5] 환경변수 설정 (커밋: ca31756)
- frontend/.env.local 생성 (빈 값, git 제외)
- frontend/.env.example 생성 (예시값 포함, git 포함)
- .gitignore에 .env* 제외, !.env.example 예외 규칙 추가

### [6] TypeScript DB 타입 정의 (커밋: 17bc439, ef3c23a, 46957eb)
- frontend/types/database.ts 수동 작성
- 5개 테이블(contents, profiles, reviews, follows, bookmarks) Row/Insert/Update 타입
- Views, Functions, Enums, CompositeTypes, Relationships 추가 (Supabase gen types 호환)
- 코드 리뷰 후 contents.created_by 컬럼 추가 반영

### [7] Supabase 클라이언트 파일 작성 (커밋: 9114be0)
- frontend/lib/supabase/client.ts — createBrowserClient (Client Component용)
- frontend/lib/supabase/server.ts — createServerClient async (Server Component/Action용)
- frontend/lib/supabase/middleware.ts — updateSession, getUser() 세션 갱신
- 환경변수: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 사용

### [8] Next.js 미들웨어 작성 (커밋: bf2edcf)
- frontend/middleware.ts — 모든 요청에 updateSession 적용
- 정적 파일/이미지 제외 matcher 설정

### [9] 라우트 플레이스홀더 페이지 생성 (커밋: 1e23741)
- app/page.tsx 삭제 (라우팅 충돌 방지)
- app/(auth)/login/page.tsx, app/(auth)/signup/page.tsx 생성
- app/(main)/layout.tsx, app/(main)/page.tsx 생성

### [10] Supabase CLI 초기화 (커밋: 14fad7d)
- backend/에서 supabase init 실행
- backend/supabase/config.toml 생성

### [11] 초기 DB 스키마 마이그레이션 작성 (커밋: 30b6ae9, 46957eb)
- backend/supabase/migrations/20260512000000_initial_schema.sql 작성
- 5개 테이블: contents(created_by 소유권), profiles, reviews, follows, bookmarks
- 코드 리뷰 후 수정사항:
  - contents에 created_by 컬럼 추가 (소유권 기반 UPDATE/DELETE)
  - profiles INSERT RLS 정책 추가
  - follows 자기 팔로우 방지 CHECK 추가
  - reviews updated_at 자동 갱신 트리거 추가
  - handle_new_user username 충돌 방지 (email prefix + UUID 6자)
  - reviews_update_own WITH CHECK 추가
  - 쿼리 최적화 인덱스 추가 (reviews.content_id, reviews.user_id, bookmarks.user_id, contents.created_by)
