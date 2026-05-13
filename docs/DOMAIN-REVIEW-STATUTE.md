# DOMAIN-REVIEW-STATUTE — 리뷰 도메인 규칙

---

## 컴포넌트 구조

```
app/(main)/contents/[id]/
├── page.tsx                   ← 콘텐츠 정보 + <Suspense><ReviewSection /></Suspense>
└── _components/
    ├── review-section.tsx     ← 서버: 리뷰 목록 fetch + 평균별점 계산
    ├── review-form.tsx        ← 클라이언트: 작성/수정 폼 (별점, 태그, 본문)
    ├── review-card.tsx        ← 클라이언트: 더보기/축약 토글
    └── star-rating.tsx        ← 클라이언트: 별점 입력 UI
```

---

## Server Actions (`actions/reviews.ts`)

- `createReview(contentId, formData)` — 리뷰 등록
- `updateReview(reviewId, formData)` — 리뷰 수정
- `deleteReview(reviewId, contentId)` — 리뷰 삭제 후 해당 콘텐츠 상세로 revalidate

---

## ReviewSection 동작

- 리뷰 목록 + `AVG(rating)`, `COUNT(*)` 동시 조회
- 현재 유저의 리뷰 여부 확인 → 있으면 수정/삭제 UI, 없으면 작성 폼 표시
- 평균별점: `⭐ 4.2 (12개)` 형태로 상단 표시
- 리뷰 없으면 "아직 리뷰가 없습니다." 표시

---

## ReviewCard

- 본문 100자 이상이면 잘라서 표시
- `더보기` 버튼으로 전체 펼침, `다시 축약` 버튼으로 원복
- 작성자 username, 별점, 태그, 작성일 표시

---

## StarRating 컴포넌트

- `lucide-react`의 `Star` 아이콘 사용
- hover 시 미리보기, 클릭 시 확정
- 선택된 별점 값은 `<input type="hidden" name="rating" />`으로 form에 전달

---

## Preset 태그 (`frontend/constants/review-tags.ts`)

```ts
export const REVIEW_TAGS = [
  '명작', '감동적인', '재관할만한', '독창적인',
  '웃긴', '무서운', '생각할거리', 'OST가 좋은',
  '지루한', '실망스러운',
]
```

---

## 소유자 확인 규칙

- 수정/삭제 버튼은 `review.user_id === 현재 유저 id`일 때만 렌더링
- Server Action 시작 시 `getUser()`로 세션 확인 + `.eq('user_id', user.id)` DB 조건으로 소유자 강제
