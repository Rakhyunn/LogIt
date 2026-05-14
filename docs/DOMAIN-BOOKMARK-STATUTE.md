# DOMAIN-BOOKMARK-STATUTE — 북마크 도메인 규칙

---

## 라우트 구조

북마크 전용 라우트 없음. 기능은 아래 두 곳에 통합된다.

- `app/(main)/page.tsx` — 목록 페이지: 카드마다 BookmarkButton 슬롯
- `app/(main)/contents/[id]/page.tsx` — 상세 페이지: 헤더 영역에 BookmarkButton

북마크 목록 조회: `app/(main)/profile/[username]/_components/bookmarks-tab.tsx` (기구현)

---

## DB 스키마

### bookmarks

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `user_id` | `uuid` | auth.users.id 참조 |
| `content_id` | `uuid` | contents.id 참조 |
| `created_at` | `timestamptz` | |

- PK: `(user_id, content_id)` UNIQUE 제약
- RLS: insert/delete 모두 `user_id = auth.uid()` 조건 강제

---

## Server Actions (`actions/bookmarks.ts`)

```ts
addBookmark(contentId: string): Promise<ActionResult>
removeBookmark(contentId: string): Promise<ActionResult>
```

- 두 액션 모두 `getUser()`로 세션 확인 → 없으면 `{ success: false, message: '로그인이 필요합니다.' }` 반환
- `addBookmark`: `bookmarks` 테이블에 `{ user_id: user.id, content_id: contentId }` insert
- `removeBookmark`: `.eq('user_id', user.id).eq('content_id', contentId)` 조건으로 delete
- 성공 시 `revalidatePath` 없음 — Optimistic UI가 상태를 관리

---

## BookmarkButton 컴포넌트

**위치:** `app/(main)/_components/bookmark-button.tsx`

**Props:**
```ts
interface BookmarkButtonProps {
  contentId: string
  initialBookmarked: boolean
  isLoggedIn: boolean
}
```

**동작:**
- `isLoggedIn: false` → 클릭 시 `router.push('/login')`
- `isLoggedIn: true` → `useOptimistic` + `useTransition`으로 토글
  - optimistic 상태가 `true`이면 `removeBookmark` 호출
  - optimistic 상태가 `false`이면 `addBookmark` 호출
  - 서버 실패 시 `useOptimistic` 자동 롤백

**아이콘:** lucide-react `Bookmark`
- 북마크됨: `fill="currentColor"` (채워진 아이콘)
- 미북마크: 아웃라인 아이콘

---

## ContentCard 수정 규칙

```ts
// 기존
export default function ContentCard({ content }: { content: Content })

// 수정 후
export default function ContentCard({
  content,
  bookmarkSlot,
}: {
  content: Content
  bookmarkSlot?: React.ReactNode
})
```

- `bookmarkSlot`이 있으면 카드 우측 상단에 오버레이로 렌더링
- `bookmarkSlot`이 없으면 기존과 동일하게 렌더링 (하위 호환)

---

## 홈 페이지 데이터 조회 규칙

```ts
// 북마크 일괄 조회 (로그인 유저만)
const bookmarkedIds = user
  ? new Set((await supabase.from('bookmarks').select('content_id').eq('user_id', user.id)).data?.map(b => b.content_id) ?? [])
  : new Set<string>()
```

- 비로그인: 조회 생략, 빈 Set 사용
- 각 ContentCard에 `bookmarkSlot` 전달 시 `bookmarkedIds.has(content.id)` 로 `initialBookmarked` 결정

---

## 소유자 확인 규칙

- Server Action 시작 시 `getUser()`로 세션 확인
- DB 조작 시 `.eq('user_id', user.id)` 조건 필수 (RLS 이중 보호)
- 클라이언트 `isLoggedIn` prop은 UX 전용 — 보안 기준 아님
