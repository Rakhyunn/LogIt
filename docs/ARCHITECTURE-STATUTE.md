# ARCHITECTURE-STATUTE — 아키텍처 구현 규칙

---

## 폴더 구조

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

---

## 네이밍 규칙

- 파일: `kebab-case` (예: `content-card.tsx`)
- 컴포넌트: `PascalCase`
- Server Actions: 동사 + 명사 (예: `createContent`, `deleteReview`)
- `_components/`: 해당 라우트 전용, 외부에서 import 금지

---

## 로딩/에러 처리

- 페이지 단위: `loading.tsx` + `error.tsx` 필수
- Server Action 반환 형식: `{ success: true, data }` or `{ success: false, message: string }`

---

## 금지 사항

- 서버 컴포넌트에서 `useState`, `useEffect` 사용 금지
- `app/api/` Route Handler 신규 생성 금지 (Server Actions 사용)
- Supabase 서버 클라이언트를 클라이언트 컴포넌트에서 직접 사용 금지
- `console.log` 프로덕션 빌드 포함 금지
