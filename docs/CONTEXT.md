# CONTEXT.md

현재 작업에 직접 필요한 정보만 저장한다. 불필요한 내용은 즉시 제거한다.

---

## 현재 상태 (2026-05-14)

**팔로우 도메인 구현 완료.** 다음 작업: UX 개선 (헤더 등록 버튼 정리, 아바타, 반응형).

**스택:**
- Frontend: Next.js 16.2.6 (App Router, TypeScript, Tailwind v4, shadcn/ui)
- Backend: Supabase Cloud (Auth, DB, Storage, Realtime)

**환경변수 키 이름 (`frontend/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

**DB 스키마 핵심 사항:**
- `contents`: `created_by uuid` 소유권, `metadata jsonb` 타입별 구조화
- `profiles`: `is_profile_setup boolean DEFAULT false` — 미들웨어 리다이렉트 기준
- `reviews`: `UNIQUE(user_id, content_id)` — 유저당 콘텐츠 1개 리뷰
- 전 테이블 RLS 활성화

**Storage:**
- 버킷: `covers` (public)
- 경로 (버킷 내): `{user_id}/{timestamp}-{random}.{ext}`
