# DOMAIN-CONTENT-STATUTE — 콘텐츠 도메인 규칙

---

## 페이지 구조

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

---

## Server Actions (`actions/contents.ts`)

- `createContent(formData)` — 콘텐츠 등록
- `updateContent(id, formData)` — 콘텐츠 수정
- `deleteContent(id)` — 콘텐츠 삭제

---

## Supabase Storage 규칙

- 버킷명: `covers`
- 경로 (버킷 내): `{user_id}/{timestamp}-{random}.{ext}`
- 업로드는 클라이언트(`createBrowserClient`)에서 처리
- 허용 확장자: jpg, jpeg, png, webp
- 최대 파일 크기: 5MB

---

## metadata 타입 정의 (`frontend/types/content.ts`)

```ts
export type MovieMeta = { director: string; release_year: number; genres: string[] }
export type DramaMeta = { director: string; air_year: number; episodes: number; genres: string[] }
export type BookMeta = { author: string; publish_year: number; publisher: string }
export type ContentMeta = MovieMeta | DramaMeta | BookMeta
```

---

## 소유자 확인 규칙

- 수정/삭제 버튼은 `created_by === 현재 유저 id`일 때만 렌더링
- Server Action 시작 시 `getUser()`로 세션 확인 + DB에서 `created_by` 비교

---

## Seed 데이터

- 마이그레이션 파일로 영화/드라마/책 각 2~3개 초기 데이터 삽입
- `created_by`는 null (시스템 데이터)
