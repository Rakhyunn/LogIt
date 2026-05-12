# CONTEXT.md

현재 작업에 직접 필요한 정보만 저장한다. 불필요한 내용은 즉시 제거한다.

---

## 현재 상태 (2026-05-13)

**초기 환경 세팅 완료.** 다음 작업 대기 중.

**스택:**
- Frontend: Next.js 16.2.6 (App Router, TypeScript, Tailwind v4, shadcn/ui) — `frontend/`
- Backend: Supabase Cloud (Auth, DB, Storage, Realtime) — 마이그레이션 적용 완료

**환경변수 키 이름 (`frontend/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**DB 스키마 핵심 사항:**
- `contents`: `created_by uuid` 소유권 컬럼 있음
- `profiles`: 가입 시 트리거 자동 생성 (username = email_prefix + uuid[:6])
- `reviews`: `UNIQUE(user_id, content_id)` — 유저당 콘텐츠 1개 리뷰
- 전 테이블 RLS 활성화
