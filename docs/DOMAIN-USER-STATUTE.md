# DOMAIN-USER-STATUTE — 유저/프로필 도메인 규칙

---

## 라우트 구조

```
app/(main)/profile/
├── setup/
│   └── page.tsx              ← 최초 username 설정 (is_profile_setup=false 상태 전용)
├── [username]/
│   ├── page.tsx              ← 프로필 조회 (공개)
│   └── edit/
│       └── page.tsx          ← 프로필 수정 (본인만)
```

---

## DB 스키마

### profiles

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | `uuid` | auth.users.id와 동일 |
| `username` | `text` | UNIQUE, 2~30자 |
| `avatar_url` | `text \| null` | Storage URL |
| `bio` | `text \| null` | 자기소개 |
| `is_profile_setup` | `boolean` | DEFAULT false, 미들웨어 리다이렉트 기준 |
| `created_at` | `timestamptz` | |

### follows

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `follower_id` | `uuid` | 팔로우 하는 유저 |
| `following_id` | `uuid` | 팔로우 받는 유저 |
| `created_at` | `timestamptz` | |

---

## Server Actions

- `setupProfile(formData)` → `actions/auth.ts` (기존 구현)
- `updateProfile(formData)` → `actions/user.ts` — username·bio·avatar_url 수정
- `followUser(targetUserId)` → `actions/user.ts` — follows 행 삽입
- `unfollowUser(targetUserId)` → `actions/user.ts` — follows 행 삭제

---

## username 유효성 규칙

- 허용 문자: 영문·숫자·밑줄(`_`) → `/^[a-zA-Z0-9_]+$/`
- 길이: 최소 2자, 최대 30자
- 클라이언트에서 1차 검증, Server Action에서 2차 검증
- 중복 시 DB `error.code === '23505'` → "이미 사용 중인 username입니다." 반환

---

## 아바타 스토리지

- `covers` 버킷은 콘텐츠 커버 전용이므로 아바타 업로드 구현 시 별도 `avatars` 버킷 생성 필요
- 경로: `{user_id}/{timestamp}-{random}.{ext}`
- 업로드 전 기존 아바타 삭제 (Storage 누적 방지)

---

## 팔로우 규칙

- 자기 자신 팔로우 불가 — Server Action 시작 시 `targetUserId !== user.id` 확인
- 팔로우 여부 확인: `follows.eq('follower_id', currentUserId).eq('following_id', targetUserId)`
- 팔로워 수 / 팔로잉 수: 프로필 조회 시 `follows` 테이블 COUNT 조회

---

## 소유자 확인 규칙

- 프로필 수정 페이지는 URL의 `username`이 현재 로그인 유저의 username과 일치할 때만 접근 허용
- Server Action 시작 시 `getUser()`로 세션 확인 후 `.eq('id', user.id)` 조건 강제
