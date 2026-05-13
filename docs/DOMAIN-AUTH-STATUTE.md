# DOMAIN-AUTH-STATUTE — 인증 도메인 규칙

---

## 페이지 구조

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

---

## 미들웨어 라우팅 규칙

- `(main)/*` — 비로그인 시 `/login` 리다이렉트
- `(main)/*` — 로그인 + `is_profile_setup = false` 시 `/profile/setup` 리다이렉트
- `(auth)/*` — 로그인 상태 시 `/` 리다이렉트
- `/profile/setup` — 미들웨어 리다이렉트 대상에서 제외 (무한 루프 방지)

---

## Server Actions (`actions/auth.ts`)

- `signUpWithEmail(formData)` — 가입 + 인증 메일 발송
- `signInWithEmail(formData)` — 로그인
- `signInWithGoogle()` — Google OAuth URL 생성 후 리다이렉트
- `signOut()` — 로그아웃
- `sendPasswordResetEmail(formData)` — 재설정 메일 발송
- `updatePassword(formData)` — 새 비밀번호 저장
- `setupProfile(formData)` — username 초기 설정 + `is_profile_setup = true`

---

## DB 변경 사항

- `profiles` 테이블에 `is_profile_setup boolean DEFAULT false` 컬럼 추가 (마이그레이션 필요)
- `setupProfile()` 완료 시 `is_profile_setup = true`로 업데이트

---

## 프로필 미설정 감지 기준

미들웨어에서 `profiles.is_profile_setup = false`이면 `/profile/setup`으로 리다이렉트.
