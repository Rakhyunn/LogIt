# DOMAIN-COMMON-STATUTE — 공통 도메인 규칙

---

## 도메인 폴더 구조 표준

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

---

## Server Action 표준 반환 타입

```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string }
```

---

## Supabase 클라이언트 사용 규칙

- 서버 컴포넌트 / Server Action: `lib/supabase/server.ts`의 `createServerClient()` 사용
- 클라이언트 컴포넌트: `lib/supabase/client.ts`의 `createBrowserClient()` 사용 (Realtime 등 불가피한 경우만)

---

## 인증 확인 규칙

- Server Action 시작 시 `supabase.auth.getUser()`로 세션 확인
- 미인증 시 `{ success: false, message: '로그인이 필요합니다.' }` 반환

---

## 금지 사항

- 다른 도메인의 `_components/` 직접 import 금지
- Server Action에서 raw 에러 메시지(`error.message`) 그대로 반환 금지
