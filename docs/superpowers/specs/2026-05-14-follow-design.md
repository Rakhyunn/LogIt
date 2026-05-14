# 팔로우 도메인 설계 스펙

**Goal:** 프로필 페이지와 콘텐츠 상세 페이지에서 Optimistic UI 팔로우/언팔로우 기능을 제공하고, 프로필에 팔로워·팔로잉 수를 표시한다.

**Date:** 2026-05-14

---

## 아키텍처

### 신규 파일
| 파일 | 역할 |
|------|------|
| `frontend/app/(main)/_components/follow-button.tsx` | Client Component — Optimistic UI 팔로우 토글 |

### 수정 파일
| 파일 | 변경 내용 |
|------|-----------|
| `frontend/actions/user.ts` | `followUser`, `unfollowUser` Server Actions 추가 |
| `frontend/app/(main)/profile/[username]/page.tsx` | 팔로워/팔로잉 수 + 팔로우 여부 조회, ProfileHeader에 전달 |
| `frontend/app/(main)/profile/[username]/_components/profile-header.tsx` | 팔로워/팔로잉 수 표시 + FollowButton 렌더 |
| `frontend/app/(main)/contents/[id]/page.tsx` | 작성자 username + 팔로우 상태 조회, 작성자 영역 추가 |

---

## Server Actions (`actions/user.ts` 추가)

```ts
followUser(targetUserId: string): Promise<ActionResult>
unfollowUser(targetUserId: string): Promise<ActionResult>
```

- `getUser()`로 세션 확인 → 없으면 `{ success: false, message: '로그인이 필요합니다.' }` 반환
- `targetUserId === user.id`이면 `{ success: false, message: '자기 자신을 팔로우할 수 없습니다.' }` 반환
- `followUser`: `follows` 테이블에 `{ follower_id: user.id, following_id: targetUserId }` insert
- `unfollowUser`: `.eq('follower_id', user.id).eq('following_id', targetUserId)` 조건으로 delete
- 성공 시 `revalidatePath('/profile', 'layout')` 호출
- DB의 `follows` 자기 팔로우 방지 CHECK 제약이 이중 보호

---

## FollowButton (Client Component)

**위치:** `frontend/app/(main)/_components/follow-button.tsx`

**Props:**
```ts
interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  isLoggedIn: boolean
}
```

**동작 (BookmarkButton과 동일한 패턴):**
- `isLoggedIn: false` → 클릭 시 `router.push('/login')`
- `isLoggedIn: true` → `useOptimistic` 즉시 토글 + `useTransition` 백그라운드 실행
- `isPending` 상태 시 버튼 비활성화
- 실패 시 `router.refresh()`로 롤백

**버튼 텍스트:**
- 팔로우 중(`optimisticFollowing: true`): **"팔로잉"** (outline variant)
- 미팔로우(`optimisticFollowing: false`): **"팔로우"** (default variant)

---

## 프로필 페이지 (`profile/[username]/page.tsx`)

### 추가 데이터 조회
```ts
const [followerResult, followingResult, followResult] = await Promise.all([
  supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
  supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  user && !isOwner
    ? supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', profile.id).maybeSingle()
    : Promise.resolve({ data: null }),
])

const followerCount = followerResult.count ?? 0
const followingCount = followingResult.count ?? 0
const isFollowing = !!followResult.data
```

### ProfileHeader에 전달하는 추가 props
```ts
<ProfileHeader
  profile={profile}
  isOwner={isOwner}
  followerCount={followerCount}
  followingCount={followingCount}
  isFollowing={isFollowing}
  isLoggedIn={!!user}
/>
```

---

## ProfileHeader 변경

### 추가 Props
```ts
interface ProfileHeaderProps {
  profile: Profile
  isOwner: boolean
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isLoggedIn: boolean
}
```

### 렌더링 구조
```
@username
bio (있으면)
가입일

팔로워 {followerCount} · 팔로잉 {followingCount}

[프로필 수정] (isOwner)
[FollowButton] (!isOwner)  ← isLoggedIn 여부는 FollowButton 내부에서 처리
```

---

## 콘텐츠 상세 페이지 작성자 영역

### 추가 데이터 조회 (`contents/[id]/page.tsx`)
```ts
// 작성자 프로필 + 팔로우 여부 조회 (기존 Promise.all 이후 순차 실행)
const { data: authorProfile } = await supabase
  .from('profiles')
  .select('username')
  .eq('id', content.created_by)
  .single()

const { data: followRow } = user && content.created_by !== user.id
  ? await supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', content.created_by).maybeSingle()
  : { data: null }

const isFollowingAuthor = !!followRow
```

### 작성자 영역 렌더링
콘텐츠 정보 상단(제목 위)에 추가:
```tsx
<div className="flex items-center justify-between">
  <Link href={`/profile/${authorProfile.username}`} className="text-sm font-medium hover:underline">
    @{authorProfile.username}
  </Link>
  {!isOwner && (
    <FollowButton
      targetUserId={content.created_by}
      initialFollowing={isFollowingAuthor}
      isLoggedIn={!!user}
    />
  )}
</div>
```

---

## 엣지 케이스

| 상황 | 처리 |
|------|------|
| 비로그인 타인 프로필 | FollowButton 렌더, 클릭 시 /login 리다이렉트 |
| 본인 프로필 | FollowButton 없음, "프로필 수정" 버튼만 |
| 본인 콘텐츠 상세 | 작성자 영역에 FollowButton 없음 (`!isOwner` 조건) |
| 자기 자신 팔로우 시도 | Server Action에서 차단 + DB CHECK 이중 보호 |
| 팔로우 실패 | router.refresh()로 optimistic 상태 롤백 |
