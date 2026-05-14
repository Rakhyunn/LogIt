# TODO-DONE — 완료된 작업

---

## 2026-05-12

- [x] docs/ 초기 문서 구조 생성 (CLAUDE.md 규칙)
- [x] Next.js 16.2.6 앱 스캐폴딩 (App Router, TypeScript, Tailwind v4, Turbopack)
- [x] @supabase/supabase-js + @supabase/ssr 설치
- [x] shadcn/ui 초기화 (Default style)
- [x] 환경변수 파일 설정 (.env.local, .env.example)
- [x] TypeScript DB 타입 정의 (5개 테이블)
- [x] Supabase 클라이언트 파일 작성 (client.ts, server.ts, middleware.ts)
- [x] Next.js middleware.ts 작성
- [x] 라우트 플레이스홀더 페이지 생성 ((auth), (main) 라우트 그룹)
- [x] Supabase CLI 초기화 (backend/supabase/)
- [x] 초기 DB 스키마 마이그레이션 작성 (5테이블 + RLS + 트리거)

## 2026-05-13

- [x] Supabase Cloud 연결 및 마이그레이션 적용 (supabase db push)
- [x] ARCHITECTURE-CONSTITUTION.md 작성 (6개 핵심 원칙)
- [x] ARCHITECTURE-STATUTE.md 작성 (폴더구조, 네이밍, 금지사항)
- [x] DOMAIN-COMMON-CONSTITUTION.md 작성 (5개 공통 원칙)
- [x] DOMAIN-COMMON-STATUTE.md 작성 (폴더구조 표준, ActionResult 타입, 인증 규칙)
- [x] DOMAIN-AUTH-CONSTITUTION.md 작성 (5개 인증 원칙)
- [x] DOMAIN-AUTH-STATUTE.md 작성 (페이지구조, 미들웨어 규칙, Server Actions, DB 변경사항)
- [x] Auth 도메인 구현 (이메일/패스워드 + Google OAuth, 비밀번호 재설정, 라우트 보호, 프로필 설정)
- [x] DOMAIN-CONTENT-CONSTITUTION.md 작성 (5개 콘텐츠 원칙)
- [x] DOMAIN-CONTENT-STATUTE.md 작성 (페이지구조, Storage 규칙, metadata 타입, Seed 데이터)
- [x] Content 도메인 구현 (목록/상세/등록/수정/삭제, Supabase Storage 이미지 업로드, seed 데이터)
- [x] DOMAIN-REVIEW-CONSTITUTION.md 작성 (5개 리뷰 원칙)
- [x] DOMAIN-REVIEW-STATUTE.md 작성 (컴포넌트 구조, Server Actions, ReviewSection/Card/StarRating, preset 태그)
- [x] Review 도메인 구현 (리뷰 작성/수정/삭제, 별점, preset 태그, 더보기/축약, 평균별점, Suspense 스트리밍)
- [x] DOMAIN-USER-CONSTITUTION.md 작성 (5개 유저/프로필 원칙)
- [x] DOMAIN-USER-STATUTE.md 작성 (라우트, DB 스키마, Server Actions, 팔로우 규칙)
- [x] User 도메인 구현 — 1단계: 기반 파일 완료
  - database.ts: reviews·bookmarks Relationships 추가 (commit: d00b3a9)
  - actions/user.ts: checkUsername, updateProfile Server Actions (commit: 8b5fe39)
  - _components/profile-not-found.tsx (commit: 7b2dbf1)
  - _components/profile-header.tsx (commit: 4c54384)
  - _components/profile-tabs.tsx (commit: 271bc65)
  - _components/reviews-tab.tsx (commit: e154d58 → 32a0fd9에서 error handling 수정)
  - _components/bookmarks-tab.tsx (commit: 33ece03 → 32a0fd9에서 error handling 수정)
- [x] User 도메인 구현 — 2단계: 페이지 및 수정 폼 완료
  - profile/[username]/page.tsx: 프로필 조회 페이지 (commit: 0b538fe)
  - _components/profile-edit-form.tsx: username 중복 확인 포함 수정 폼 (commit: 94cbeed)
  - profile/[username]/edit/page.tsx: 프로필 수정 페이지, 소유자 검증 (commit: d788e53)
  - tsc --noEmit: 오류 없음, eslint: 기존 warning 2개 (신규 없음)
