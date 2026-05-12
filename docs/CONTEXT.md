# CONTEXT.md

현재 작업에 직접 필요한 정보만 저장한다. 불필요한 내용은 즉시 제거한다.

---

## 현재 상태 (2026-05-12)

**진행 중인 작업:** Next.js + Supabase 초기 환경 세팅

**대기 중인 단계:** Supabase Cloud 연결 (Task 12 — 사용자가 직접 수행)
- supabase.com에서 프로젝트 생성
- frontend/.env.local에 URL + PUBLISHABLE_KEY 입력
- supabase login → supabase link → supabase db push

**환경변수 키 이름:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**주요 결정사항:**
- Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui
- Supabase Cloud (로컬 Docker 아님)
- contents 테이블에 created_by 소유권 컬럼 존재
- handle_new_user 트리거가 가입 시 profiles 자동 생성 (username = email prefix + UUID 6자)
