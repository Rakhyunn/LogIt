# AI-ACTION-LOGS — 최근 작업 로그 (최대 100개)

---

## 2026-05-13

### [12] Supabase Cloud 연결 및 마이그레이션 적용
- supabase login → supabase link → supabase db push 완료
- Supabase Cloud에 5개 테이블 + RLS + 트리거 적용 확인
- **초기 환경 세팅 전체 완료**

### [13] 아키텍처 + 공통 도메인 문서 작성
- ARCHITECTURE-CONSTITUTION.md (6개 원칙: 서버 우선, Supabase 단일 백엔드, 도메인 응집, 단방향 흐름, RLS 1차 보안, 에러 비노출)
- ARCHITECTURE-STATUTE.md (폴더구조, 네이밍 규칙, 금지사항, 로딩/에러 처리)
- DOMAIN-COMMON-CONSTITUTION.md (5개 원칙: 문서 선행, 자기완결성, 공통 로직 위임, 서버 인증, Supabase 타입 기준)
- DOMAIN-COMMON-STATUTE.md (폴더구조 표준, ActionResult 타입, Supabase 클라이언트 규칙, 인증 확인 규칙)

### [14] Auth 도메인 문서 작성
- DOMAIN-AUTH-CONSTITUTION.md (5개 원칙: Supabase Auth 진입점, 이메일 인증 필수, OAuth 단일 콜백, 프로필 설정 흐름, Auth 페이지 보호)
- DOMAIN-AUTH-STATUTE.md (페이지구조, 미들웨어 규칙, Server Actions 7개, profiles.is_profile_setup 컬럼 추가)

### [15] Auth 도메인 구현
- DB 마이그레이션: profiles에 is_profile_setup boolean DEFAULT false 추가
- Server Actions: signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, sendPasswordResetEmail, updatePassword, setupProfile
- 미들웨어 전면 재작성: (main)/* 보호, Auth 페이지 로그인 시 리다이렉트, 프로필 미설정 리다이렉트
- OAuth 콜백 Route Handler: /auth/callback
- UI 페이지: login, signup, forgot-password, reset-password, profile/setup
- Google OAuth 설정 (Supabase 대시보드)
- 비밀번호 재설정 흐름 수정: redirectTo → /auth/callback?next=/reset-password

### [16] Content 도메인 문서 작성
- DOMAIN-CONTENT-CONSTITUTION.md (5개 원칙: 공개 자원, 인증 필수 CUD, 클라이언트 이미지 업로드, 타입별 metadata, seed 관리)
- DOMAIN-CONTENT-STATUTE.md (페이지구조, Server Actions, Storage 규칙, metadata 타입, Seed 데이터)

### [17] Content 도메인 구현
- DB 마이그레이션: covers Storage 버킷 + RLS 정책, 콘텐츠 seed 데이터 6개
- metadata 타입 정의 (frontend/types/content.ts)
- next.config.ts: Supabase Storage 이미지 도메인 허용
- shadcn textarea, select 추가
- Server Actions: createContent, updateContent (기존 이미지 교체 시 Storage 삭제), deleteContent (Storage 이미지 함께 삭제)
- 컴포넌트: content-card, content-filter (URL 쿼리 기반 필터/검색), content-form (Storage 직접 업로드, 세션 업로드 추적)
- 페이지: 홈(목록), 상세, 등록, 수정
- 버그 수정: deleteContent form action 직렬화, Storage 업로드 경로 버킷명 중복 제거

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
