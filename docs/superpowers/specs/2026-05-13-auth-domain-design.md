# Auth Domain Design

**Date:** 2026-05-13
**Scope:** DOMAIN-AUTH-CONSTITUTION, DOMAIN-AUTH-STATUTE

---

## 결정 사항

- 인증 방식: 이메일/패스워드 + Google OAuth (추후 Kakao → Naver 확장)
- 비밀번호 재설정 포함
- 라우트 보호: 미들웨어에서 (main)/* 전체 차단
- 가입 후 흐름: 이메일 인증 → /profile/setup → username 설정 → /
- OAuth 콜백: 단일 /auth/callback Route Handler에서 처리
- 프로필 미설정 감지: profiles.is_profile_setup boolean 컬럼 기준

---

## DOMAIN-AUTH-CONSTITUTION

1. **Auth는 진입점** — 모든 사용자 식별은 Supabase Auth를 통한다. 자체 세션/토큰 관리를 구현하지 않는다.
2. **이메일 인증 필수** — 이메일/패스워드 가입 시 이메일 인증을 완료해야 로그인이 허용된다.
3. **소셜 로그인은 동일한 흐름** — 현재 Google OAuth만 지원한다. 추후 Kakao → Naver 순으로 확장한다. 모든 소셜 로그인은 `/auth/callback`에서 세션을 확정하며 제공자별 로직을 분리하지 않는다.
4. **프로필 설정은 Auth 완료 직후** — 신규 가입자는 인증 완료 후 `/profile/setup`으로 이동하여 username을 설정한다. 미들웨어가 프로필 미설정 유저를 감지하고 강제 이동시킨다.
5. **Auth 페이지는 로그인 상태에서 접근 불가** — 이미 로그인한 유저가 `/login`, `/signup`에 접근하면 미들웨어가 `/`로 리다이렉트한다.

---

## DOMAIN-AUTH-STATUTE

### 페이지 구조
```
app/
├── (auth)/
│   ├── login/page.tsx           ← 이메일/패스워드 + Google 로그인
│   ├── signup/page.tsx          ← 이메일/패스워드 가입
│   ├── forgot-password/page.tsx ← 비밀번호 재설정 메일 발송
│   ├── reset-password/page.tsx  ← 새 비밀번호 입력 (메일 링크 도착)
│   └── callback/route.ts        ← OAuth 콜백 처리 (Route Handler)
└── (main)/
    └── profile/
        └── setup/page.tsx       ← 신규 가입자 username 설정
```

### 미들웨어 라우팅 규칙
- `(main)/*` — 비로그인 시 `/login` 리다이렉트
- `(main)/*` — 로그인 + `is_profile_setup = false` 시 `/profile/setup` 리다이렉트
- `(auth)/*` — 로그인 상태 시 `/` 리다이렉트

### Server Actions (`actions/auth.ts`)
- `signUpWithEmail(formData)` — 가입 + 인증 메일 발송
- `signInWithEmail(formData)` — 로그인
- `signInWithGoogle()` — Google OAuth URL 생성 후 리다이렉트
- `signOut()` — 로그아웃
- `sendPasswordResetEmail(formData)` — 재설정 메일 발송
- `updatePassword(formData)` — 새 비밀번호 저장
- `setupProfile(formData)` — username 초기 설정 + is_profile_setup = true

### DB 변경 사항
- `profiles` 테이블에 `is_profile_setup boolean DEFAULT false` 컬럼 추가 (마이그레이션 필요)
- `setupProfile()` 완료 시 `is_profile_setup = true`로 업데이트

### 프로필 미설정 감지 기준
미들웨어에서 `profiles.is_profile_setup = false`이면 `/profile/setup`으로 리다이렉트.
`/profile/setup` 자체는 미들웨어 리다이렉트 대상에서 제외한다 (무한 루프 방지).
