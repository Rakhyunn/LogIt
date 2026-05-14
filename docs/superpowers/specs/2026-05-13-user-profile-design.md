# User 프로필 도메인 구현 설계

**날짜:** 2026-05-13
**범위:** 프로필 조회·수정. 아바타 업로드·팔로우 기능 제외.

---

## 1. 컴포넌트 구조

```
app/(main)/profile/
├── setup/
│   └── page.tsx                     ← 기존 (변경 없음)
└── [username]/
    ├── page.tsx                     ← Server Component: 프로필 헤더 + 탭 + Suspense
    ├── edit/
    │   └── page.tsx                 ← Server Component: 본인 여부 확인 후 폼 렌더
    └── _components/
        ├── profile-header.tsx       ← Server: username, bio, 가입일
        ├── profile-tabs.tsx         ← Client: 탭 버튼 (?tab= URL 변경)
        ├── reviews-tab.tsx          ← Server: 해당 유저 리뷰 목록 fetch
        ├── bookmarks-tab.tsx        ← Server: 해당 유저 북마크 목록 fetch
        └── profile-edit-form.tsx    ← Client: username/bio 수정 폼 + 중복 확인 버튼

actions/user.ts
├── updateProfile(formData)          ← username, bio 업데이트
└── checkUsername(username)          ← username 중복 여부 확인
```

---

## 2. 데이터 흐름

### 프로필 조회 (`/profile/[username]`)

1. `page.tsx`(서버)에서 `username`으로 `profiles` 조회
2. 없으면 → 쿠키에 toast 메시지 저장 후 `redirect('/')`, 홈에서 toast 표시
3. `ProfileHeader`로 프로필 정보(username, bio, 가입일) 즉시 표시
4. 현재 로그인 유저 id === `profile.id`이면 "프로필 수정" 버튼 표시
5. `searchParams.tab`(`reviews` | `bookmarks`, 기본값 `reviews`)에 따라 `<Suspense>` 안에 해당 탭 Server Component 렌더

### ReviewsTab

- `reviews` WHERE `user_id = profile.id` + 콘텐츠 제목 join
- 표시: 콘텐츠 제목, 별점, 태그, 작성일
- 없으면 "아직 작성한 리뷰가 없습니다."

### BookmarksTab

- `bookmarks` WHERE `user_id = profile.id` + 콘텐츠 정보 join
- 표시: 콘텐츠 제목, 타입(영화/드라마/책), 북마크 날짜
- 없으면 "북마크한 콘텐츠가 없습니다."

### updateProfile (`actions/user.ts`)

```
입력: username (2~30자, /^[a-zA-Z0-9_]+$/), bio (optional, max 200자)
형식 검증: Server Action에서 regex + 길이 체크 (클라이언트는 submit 시 검증)
중복 검증: DB UNIQUE 위반 → error.code 23505 → "이미 사용 중인 username입니다."
DB: profiles.update({ username, bio }).eq('id', user.id)
성공: revalidatePath('/profile/[newUsername]', 'layout') → redirect('/profile/[newUsername]')
실패: ActionResult { success: false, message }
```

### checkUsername (`actions/user.ts`)

```
입력: username string
조회: profiles WHERE username = input AND id != currentUser.id
반환: { available: boolean }
호출 시점: 수정 폼의 "중복 확인" 버튼 클릭 시
```

---

## 3. 에러 처리 & 엣지 케이스

| 상황 | 처리 |
|---|---|
| 존재하지 않는 username 접근 | 쿠키에 toast 메시지 저장 → `redirect('/')` → 홈에서 toast 표시 |
| 타인의 edit 페이지 접근 | 서버에서 `redirect('/profile/[username]')` |
| 비로그인 상태 | 미들웨어가 `/login`으로 처리 |
| username 중복 (버튼 클릭) | 인라인 "이미 사용 중인 username입니다." 표시 |
| username 중복 (submit 시) | 동일 메시지 반환 (2차 안전망) |
| username 형식 오류 | submit 시 Server Action에서 검증 후 메시지 반환 |
| bio 200자 초과 | 클라이언트 maxLength로 차단 |
| 리뷰/북마크 없음 | 빈 상태 메시지 표시 |
| DB 예외 | "프로필 수정에 실패했습니다." 반환 |

---

## 4. 테스트 전략

타입 체크(`tsc --noEmit`) + 린트(`next lint`) 통과를 완료 기준으로 삼는다.

핵심 수동 검증 항목:
- 타인의 edit 페이지 URL 직접 접근 시 차단 확인
- "중복 확인" 버튼 클릭 시 즉각 결과 표시 확인
- username 변경 후 새 URL(`/profile/[newUsername]`)로 정상 리다이렉트 확인
- 존재하지 않는 username 접근 시 홈 리다이렉트 + toast 확인
- 탭 전환 시 URL 변경 + 데이터 정상 로딩 확인

---

## 5. 구현 순서

1. `actions/user.ts` — `checkUsername`, `updateProfile`
2. `profile-edit-form.tsx` — 수정 폼 + 중복 확인 버튼
3. `edit/page.tsx` — 본인 확인 + 폼 렌더
4. `profile-header.tsx`, `profile-tabs.tsx` — 프로필 헤더 + 탭 UI
5. `reviews-tab.tsx`, `bookmarks-tab.tsx` — 탭별 데이터 컴포넌트
6. `[username]/page.tsx` — 조립 + 존재하지 않는 유저 처리
7. toast 시스템 — 홈에서 쿠키 기반 toast 표시
8. tsc + lint 통과 확인
