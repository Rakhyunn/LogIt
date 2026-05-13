# Content Domain Design

**Date:** 2026-05-13
**Scope:** DOMAIN-CONTENT-CONSTITUTION, DOMAIN-CONTENT-STATUTE

---

## 결정 사항

- 콘텐츠 등록: 로그인 회원 누구나 가능
- 초기 seed 데이터: 마이그레이션 파일로 관리
- 홈(`/`)이 콘텐츠 목록 페이지 (타입 필터, 검색)
- 커버 이미지: 선택 항목, 클라이언트에서 Supabase Storage 직접 업로드
- metadata: 타입별 구조화 (movie/drama/book)
- 이미지 업로드 방식: B — 클라이언트 직접 업로드, URL만 Server Action 전달

---

## DOMAIN-CONTENT-CONSTITUTION

1. **콘텐츠는 공개 자원** — 콘텐츠 목록과 상세는 비로그인 유저도 조회 가능하다. 단, 현재 미들웨어가 (main)/* 전체를 보호하므로 로그인 유저만 접근한다. 추후 공개 전환 시 미들웨어만 수정한다.
2. **등록/수정/삭제는 인증 필수** — 콘텐츠 등록은 로그인 유저 누구나 가능하다. 수정/삭제는 `created_by`가 본인인 경우만 허용하며 RLS가 1차로 강제한다.
3. **이미지는 선택, 클라이언트에서 직접 업로드** — 커버 이미지는 선택 항목이다. 이미지를 첨부한 경우 브라우저에서 Supabase Storage에 직접 업로드하고 URL만 Server Action으로 전달한다. 이미지 업로드에 한해 클라이언트 Supabase 클라이언트 사용을 허용한다.
4. **타입별 metadata 구조** — `metadata` 필드는 콘텐츠 타입에 따라 다른 구조를 가진다.
   - `movie`: `{ director, release_year, genres }`
   - `drama`: `{ director, air_year, episodes, genres }`
   - `book`: `{ author, publish_year, publisher }`
5. **초기 데이터는 seed 스크립트로 관리** — 기본 콘텐츠 데이터는 Supabase 마이그레이션 seed 파일로 관리한다.

---

## DOMAIN-CONTENT-STATUTE

### 페이지 구조
```
app/(main)/
├── page.tsx                    ← 홈 = 콘텐츠 목록 (타입 필터, 검색)
├── loading.tsx
├── error.tsx
├── contents/
│   ├── new/page.tsx            ← 콘텐츠 등록
│   └── [id]/
│       ├── page.tsx            ← 콘텐츠 상세
│       ├── loading.tsx
│       ├── error.tsx
│       └── edit/page.tsx       ← 콘텐츠 수정 (소유자만)
└── _components/
    ├── content-card.tsx        ← 목록용 카드
    ├── content-filter.tsx      ← 타입 필터 (movie/drama/book/전체)
    └── content-form.tsx        ← 등록/수정 공용 폼
```

### Server Actions (`actions/contents.ts`)
- `createContent(formData)` — 콘텐츠 등록
- `updateContent(id, formData)` — 콘텐츠 수정
- `deleteContent(id)` — 콘텐츠 삭제

### Supabase Storage 규칙
- 버킷명: `covers`
- 경로: `covers/{user_id}/{timestamp}-{filename}`
- 업로드는 클라이언트(`createBrowserClient`)에서 처리
- 허용 확장자: jpg, jpeg, png, webp
- 최대 파일 크기: 5MB

### metadata 타입 정의 (`frontend/types/content.ts`)
```ts
export type MovieMeta = { director: string; release_year: number; genres: string[] }
export type DramaMeta = { director: string; air_year: number; episodes: number; genres: string[] }
export type BookMeta = { author: string; publish_year: number; publisher: string }
export type ContentMeta = MovieMeta | DramaMeta | BookMeta
```

### 소유자 확인 규칙
- 수정/삭제 버튼은 `created_by === 현재 유저 id`일 때만 렌더링
- Server Action 시작 시 `getUser()`로 세션 확인 + DB에서 `created_by` 비교

### Seed 데이터
- 마이그레이션 파일로 영화/드라마/책 각 2~3개 초기 데이터 삽입
- `created_by`는 null (시스템 데이터)
