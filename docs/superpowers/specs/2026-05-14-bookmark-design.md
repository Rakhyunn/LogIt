# Bookmark 도메인 설계 스펙

**Goal:** 콘텐츠 목록 카드와 상세 페이지 양쪽에서 북마크 추가/제거를 즉시 반응형(Optimistic UI)으로 제공한다.

**Date:** 2026-05-14

---

## 아키텍처

### 신규 파일
| 파일 | 역할 |
|------|------|
| `frontend/actions/bookmarks.ts` | `addBookmark`, `removeBookmark` Server Actions |
| `frontend/app/(main)/_components/bookmark-button.tsx` | Optimistic UI 북마크 토글 버튼 (Client Component) |

### 수정 파일
| 파일 | 변경 내용 |
|------|-----------|
| `app/(main)/_components/content-card.tsx` | `bookmarkSlot?: React.ReactNode` prop 추가 |
| `app/(main)/page.tsx` | 유저 북마크 목록 1회 조회 후 각 카드 슬롯 전달 |
| `app/(main)/contents/[id]/page.tsx` | 북마크 상태 조회 후 `BookmarkButton` 렌더 |

---

## Server Actions (`actions/bookmarks.ts`)

```ts
addBookmark(contentId: string): Promise<ActionResult>
removeBookmark(contentId: string): Promise<ActionResult>
```

- `getUser()`로 세션 확인 → 없으면 `{ success: false }` 반환
- `addBookmark`: `bookmarks` 테이블에 `{ user_id, content_id }` insert
- `removeBookmark`: `user_id = auth.uid()` + `content_id` 조건으로 delete
- RLS가 소유자 강제 (`user_id = auth.uid()`)
- 성공 시 `revalidatePath` 불필요 — Optimistic UI가 즉시 반영

---

## BookmarkButton (Client Component)

```
props:
  contentId: string
  initialBookmarked: boolean
  isLoggedIn: boolean
```

- `isLoggedIn: false` → 클릭 시 `router.push('/login')`
- `isLoggedIn: true` → `useOptimistic`으로 즉시 아이콘 토글, `useTransition`으로 Server Action 실행
- 실패 시 `useOptimistic` 자동 롤백 (별도 토스트 없음)
- lucide-react `Bookmark` 아이콘: 채워짐(북마크됨) / 아웃라인(미북마크)
- 위치: ContentCard 우측 상단 오버레이, 콘텐츠 상세 페이지 헤더 영역

---

## 데이터 조회 전략

### 홈 페이지 (목록)
```ts
// 로그인 유저의 북마크 content_id를 한 번에 조회
const bookmarkedIds = new Set(bookmarks?.map(b => b.content_id) ?? [])
// 각 카드에 슬롯 전달
bookmarkSlot={
  <BookmarkButton
    contentId={content.id}
    initialBookmarked={bookmarkedIds.has(content.id)}
    isLoggedIn={!!user}
  />
}
```
- 비로그인: 북마크 조회 생략, `initialBookmarked: false`, `isLoggedIn: false`

### 콘텐츠 상세 페이지
- 기존 `Promise.all`에 북마크 조회 추가
- `isLoggedIn: false` 또는 `initialBookmarked` 값 결정 후 `BookmarkButton` 렌더

---

## 에러 처리 및 엣지 케이스

| 상황 | 처리 |
|------|------|
| 서버 액션 실패 | `useOptimistic` 자동 롤백, 아이콘만 원복 |
| 비로그인 클릭 | `router.push('/login')` |
| 중복 insert 시도 | `useOptimistic` 특성상 UI가 이미 토글 상태 → 실제 중복 불가 |
| 자기 콘텐츠 북마크 | 허용 |
