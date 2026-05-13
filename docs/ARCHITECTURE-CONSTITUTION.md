# ARCHITECTURE-CONSTITUTION — 아키텍처 핵심 원칙

---

1. **서버 우선 렌더링** — 데이터 패칭은 서버 컴포넌트에서 수행한다. 인터랙션이 필요한 최소 단위만 `'use client'`로 분리한다.

2. **Supabase 단일 백엔드** — DB, Auth, Storage, Realtime 모두 Supabase Cloud를 통한다. 별도 API 서버를 두지 않는다.

3. **도메인 단위 응집** — 기능은 도메인(Auth, Content, Review, User, Bookmark) 단위로 묶는다. 도메인 간 직접 의존을 최소화하고 공통 로직은 `DOMAIN-COMMON`으로 올린다.

4. **단방향 데이터 흐름** — 서버 컴포넌트(조회) → 클라이언트 컴포넌트(표시/인터랙션) → Server Actions(변경) → revalidate → 서버 컴포넌트 재실행.

5. **RLS가 1차 보안** — 모든 보안 규칙은 Supabase RLS에서 강제한다. 프론트엔드 조건부 렌더링은 UX용이며 보안 수단이 아니다.

6. **에러는 사용자에게 노출하지 않는다** — Server Action 에러는 사용자 친화적 메시지로 변환한다. 콘솔 로그는 개발 환경에서만 출력한다.
