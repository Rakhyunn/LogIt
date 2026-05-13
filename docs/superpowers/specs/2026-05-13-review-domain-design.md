# Review Domain Design

**Date:** 2026-05-13
**Scope:** DOMAIN-REVIEW-CONSTITUTION, DOMAIN-REVIEW-STATUTE

---

## 결정 사항

- 리뷰 폼 위치: 콘텐츠 상세 페이지 하단 (별도 페이지 없음)
- 태그: preset 10개 클릭 선택 (constants/review-tags.ts로 분리)
- 리뷰 상세 페이지: 없음 (본문 더보기/축약 토글로 대체)
- 별점 UI: StarRating 클라이언트 컴포넌트 (lucide-react Star 아이콘)
- 평균별점: ReviewSection에서 AVG(rating) + COUNT(*) 실시간 계산
- 아키텍처: ReviewSection 서버 컴포넌트를 Suspense로 스트리밍

---

## DOMAIN-REVIEW-CONSTITUTION

1. **리뷰는 콘텐츠에 종속** — 리뷰는 독립 페이지 없이 콘텐츠 상세 페이지에서만 작성·조회한다. 별도 `/reviews` 라우트는 두지 않는다.
2. **유저당 콘텐츠 1개 리뷰** — `UNIQUE(user_id, content_id)` 제약으로 중복 작성을 방지한다. 기존 리뷰가 있으면 작성 폼 대신 수정 폼을 표시한다.
3. **리뷰 작성/수정/삭제는 인증 필수** — 작성은 로그인 유저 누구나 가능하다. 수정·삭제는 본인 리뷰만 가능하며 RLS가 1차로 강제한다.
4. **태그는 서버에서 관리되는 preset** — 태그 목록은 서버 상수로 정의하며 클라이언트에 전달한다. 추후 DB 테이블로 마이그레이션 가능하도록 상수 파일로 분리한다.
5. **리뷰 섹션은 스트리밍으로 로딩** — 콘텐츠 상세 페이지에서 `ReviewSection` 서버 컴포넌트를 `<Suspense>`로 감싸 스트리밍 처리한다. 콘텐츠 정보가 먼저 표시되고 리뷰가 뒤따라 로딩된다.

---

## DOMAIN-REVIEW-STATUTE

### 컴포넌트 구조

```
app/(main)/contents/[id]/
├── page.tsx                   ← 콘텐츠 정보 + <Suspense><ReviewSection /></Suspense>
└── _components/
    ├── review-section.tsx     ← 서버: 리뷰 목록 fetch + 평균별점 계산
    ├── review-form.tsx        ← 클라이언트: 작성/수정 폼 (별점, 태그, 본문)
    ├── review-card.tsx        ← 클라이언트: 더보기/축약 토글
    └── star-rating.tsx        ← 클라이언트: 별점 입력 UI
```

### Server Actions (`actions/reviews.ts`)

- `createReview(contentId, formData)` — 리뷰 등록
- `updateReview(reviewId, formData)` — 리뷰 수정
- `deleteReview(reviewId, contentId)` — 리뷰 삭제 후 해당 콘텐츠 상세로 revalidate

### ReviewSection 동작

- 리뷰 목록 + `AVG(rating)`, `COUNT(*)` 동시 조회
- 현재 유저의 리뷰 여부 확인 → 있으면 수정/삭제 UI, 없으면 작성 폼 표시
- 평균별점: `⭐ 4.2 (12개)` 형태로 상단 표시
- 리뷰 없으면 "아직 리뷰가 없습니다." 표시

### ReviewCard

- 본문이 일정 길이(100자) 이상이면 잘라서 표시
- `더보기` 버튼으로 전체 펼침, `다시 축약` 버튼으로 원복
- 작성자 username, 별점, 태그, 작성일 표시

### StarRating 컴포넌트

- `lucide-react`의 `Star` 아이콘 사용 (설치됨)
- hover 시 미리보기, 클릭 시 확정
- 선택된 별점 값은 `<input type="hidden" name="rating" />` 으로 form에 전달

### Preset 태그 (`frontend/constants/review-tags.ts`)

```ts
export const REVIEW_TAGS = [
  '명작', '감동적인', '재관할만한', '독창적인',
  '웃긴', '무서운', '생각할거리', 'OST가 좋은',
  '지루한', '실망스러운',
]
```

### 소유자 확인 규칙

- 수정/삭제 버튼은 `review.user_id === 현재 유저 id`일 때만 렌더링
- Server Action 시작 시 `getUser()`로 세션 확인 + `.eq('user_id', user.id)` DB 조건으로 소유자 강제
