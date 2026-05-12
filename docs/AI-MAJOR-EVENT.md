# AI-MAJOR-EVENT — 주요 사건 및 의사결정

---

## 2026-05-12 — 프로젝트 초기화

### 기술 스택 결정
- **결정:** Next.js 16.2.6 (App Router, TypeScript), Supabase Cloud, Tailwind CSS v4, shadcn/ui
- **이유:** 사용자 요구사항 확정 (브레인스토밍 세션)
- **영향:** 전체 아키텍처 기반

### DB 스키마 설계 결정
- **결정:** contents 테이블에 `created_by uuid` 컬럼 추가
- **이유:** 최초 설계에서 소유권 컬럼 누락 → 코드 리뷰에서 발견. 인증된 유저 누구나 콘텐츠를 수정/삭제할 수 있는 보안 취약점.
- **영향:** contents RLS UPDATE/DELETE 정책이 `created_by = auth.uid()` 기반으로 변경됨

### username 충돌 방지 전략 결정
- **결정:** `handle_new_user` 트리거에서 username을 `email_prefix + '_' + uuid[:6]`으로 생성
- **이유:** email prefix만 사용하면 동일 prefix 유저 2번째 가입 시 UNIQUE 제약 위반으로 가입 실패
- **영향:** username이 사람이 읽기 어려운 형태가 될 수 있음. 향후 프로필 설정 페이지에서 username 변경 기능 필요

### RLS WITH CHECK 정책 보완
- **결정:** reviews_update_own, contents_update_own에 WITH CHECK 추가
- **이유:** USING만 있으면 UPDATE 시 다른 user_id로 소유권 이전 가능한 보안 취약점
- **영향:** 모든 소유권 기반 UPDATE 정책에 WITH CHECK 적용
