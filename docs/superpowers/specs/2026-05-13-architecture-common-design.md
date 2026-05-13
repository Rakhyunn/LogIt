# Architecture & Common Domain Design

**Date:** 2026-05-13
**Scope:** ARCHITECTURE-CONSTITUTION, ARCHITECTURE-STATUTE, DOMAIN-COMMON-CONSTITUTION, DOMAIN-COMMON-STATUTE

---

## 1. ARCHITECTURE-CONSTITUTION

1. **서버 우선 렌더링** — 데이터 패칭은 서버 컴포넌트에서 수행한다. 인터랙션이 필요한 최소 단위만 `'use client'`로 분리한다.
2. **Supabase 단일 백엔드** — DB, Auth, Storage, Realtime 모두 Supabase Cloud를 통한다. 별도 API 서버를 두지 않는다.
3. **도메인 단위 응집** — 기능은 도메인(Auth, Content, Review, User, Bookmark) 단위로 묶는다. 도메인 간 직접 의존을 최소화하고 공통 로직은 `DOMAIN-COMMON`으로 올린다.
4. **단방향 데이터 흐름** — 서버 컴포넌트(조회) → 클라이언트 컴포넌트(표시/인터랙션) → Server Actions(변경) → revalidate → 서버 컴포넌트 재실행.
5. **RLS가 1차 보안** — 모든 보안 규칙은 Supabase RLS에서 강제한다. 프론트엔드 조건부 렌더링은 UX용이며 보안 수단이 아니다.
6. **에러는 사용자에게 노출하지 않는다** — Server Action 에러는 사용자 친화적 메시지로 변환한다. 콘솔 로그는 개발 환경에서만 출력한다.

---

## 2. ARCHITECTURE-STATUTE

### 폴더 구조
```
frontend/
├── app/
│   ├── (auth)/           ← 로그인/회원가입 (레이아웃 없음)
│   └── (main)/           ← 인증 후 메인 (공통 헤더)
│       ├── contents/
│       │   ├── page.tsx
│       │   ├── loading.tsx
│       │   ├── error.tsx
│       │   ├── [id]/
│       │   └── _components/
│       └── ...
├── components/ui/        ← shadcn 공통 컴포넌트만
├── lib/
│   └── supabase/         ← client.ts, server.ts, middleware.ts
└── actions/              ← 도메인별 Server Actions
    ├── auth.ts
    ├── contents.ts
    └── ...
```

### 네이밍 규칙
- 파일: `kebab-case` (예: `content-card.tsx`)
- 컴포넌트: `PascalCase`
- Server Actions: 동사 + 명사 (예: `createContent`, `deleteReview`)
- `_components/`: 해당 라우트 전용, 외부에서 import 금지

### 금지 사항
- 서버 컴포넌트에서 `useState`, `useEffect` 사용 금지
- `app/api/` Route Handler 신규 생성 금지 (Server Actions 사용)
- Supabase 서버 클라이언트를 클라이언트 컴포넌트에서 직접 사용 금지
- `console.log` 프로덕션 빌드 포함 금지

### 로딩/에러 처리
- 페이지 단위: `loading.tsx` + `error.tsx` 필수
- Server Action 반환: `{ success: true, data }` or `{ success: false, message: string }`

---

## 3. DOMAIN-COMMON-CONSTITUTION

1. **도메인 문서 선행** — 구현 전 반드시 해당 도메인의 CONSTITUTION + STATUTE 문서가 존재해야 한다.
2. **도메인 자기완결성** — 각 도메인의 컴포넌트, 액션, 타입은 해당 도메인 폴더 안에서 완결된다. 다른 도메인의 내부 구현에 직접 의존하지 않는다.
3. **공통 로직은 위로** — 2개 이상의 도메인에서 반복되는 패턴은 `DOMAIN-COMMON`(공통 유틸, 공통 컴포넌트)으로 올린다.
4. **인증 상태는 서버에서 확인** — 도메인 내 접근 제어는 서버 컴포넌트 또는 Server Action에서 Supabase 세션을 통해 확인한다. 클라이언트 조건부 렌더링만으로 보호하지 않는다.
5. **타입은 Supabase 생성 타입 기준** — DB 테이블 관련 타입은 Supabase CLI로 생성한 `database.types.ts`를 기준으로 한다. 별도 수동 타입 정의를 중복 생성하지 않는다. 도메인 간 타입 참조가 불가피한 경우 `database.types.ts`를 직접 참조하는 것을 허용한다.

---

## 4. DOMAIN-COMMON-STATUTE

### 도메인 폴더 구조 표준
```
app/(main)/[domain]/
├── page.tsx
├── loading.tsx
├── error.tsx
├── [id]/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
└── _components/        ← 해당 도메인 전용 컴포넌트
actions/[domain].ts     ← 해당 도메인 Server Actions
```

### Server Action 표준 반환 타입
```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string }
```

### Supabase 클라이언트 사용 규칙
- 서버 컴포넌트 / Server Action: `lib/supabase/server.ts`의 `createServerClient()` 사용
- 클라이언트 컴포넌트: `lib/supabase/client.ts`의 `createBrowserClient()` 사용 (Realtime 등 불가피한 경우만)

### 인증 확인 규칙
- Server Action 시작 시 `supabase.auth.getUser()`로 세션 확인
- 미인증 시 `{ success: false, message: '로그인이 필요합니다.' }` 반환

### 금지 사항
- 다른 도메인의 `_components/` 직접 import 금지
- Server Action에서 raw 에러 메시지(`error.message`) 그대로 반환 금지
