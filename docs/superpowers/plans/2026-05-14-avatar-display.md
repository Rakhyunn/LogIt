# 아바타 표시 구현 계획 (Plan A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DB에 `avatar_position` 컬럼을 추가하고, 공유 `Avatar` 컴포넌트를 만들어 네비게이션 헤더·프로필 헤더·콘텐츠 상세 작성자 영역에 아바타를 표시한다. 아바타가 없으면 `UserCircle` 아이콘을 표시한다.

**Architecture:** DB 마이그레이션으로 `profiles.avatar_position jsonb`를 추가하고, `Avatar` Server/Client 공용 컴포넌트가 `avatar_url`/`avatar_position`을 받아 원형 이미지 또는 기본 아이콘을 렌더링한다. 기존 3곳(header, profile-header, content detail)에 통합한다.

**Tech Stack:** Next.js 16 App Router, Supabase SSR, TypeScript, Tailwind CSS, lucide-react, next/image

---

## 파일 구조

| 상태 | 경로 | 역할 |
|------|------|------|
| 신규 | `backend/supabase/migrations/20260514000000_add_avatar_position.sql` | DB 컬럼 + avatars Storage 버킷 추가 |
| 수정 | `frontend/types/database.ts` | `avatar_position` 타입 추가 |
| 신규 | `frontend/app/(main)/_components/avatar.tsx` | 공유 아바타 표시 컴포넌트 |
| 수정 | `frontend/app/(main)/_components/header.tsx` | Avatar 컴포넌트로 교체, 쿼리 확장 |
| 수정 | `frontend/app/(main)/profile/[username]/_components/profile-header.tsx` | Avatar `lg` 추가 |
| 수정 | `frontend/app/(main)/profile/[username]/page.tsx` | `avatar_url`, `avatar_position` 조회 |
| 수정 | `frontend/app/(main)/contents/[id]/page.tsx` | 작성자 Avatar `sm` 추가, 쿼리 확장 |

---

## Task 1: DB 마이그레이션

**Files:**
- Create: `backend/supabase/migrations/20260514000000_add_avatar_position.sql`

- [ ] **Step 1: 마이그레이션 파일 생성**

```sql
-- profiles에 avatar_position 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_position jsonb DEFAULT '{"x": 50, "y": 50}';

-- avatars Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS 정책
CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
```

- [ ] **Step 2: Supabase db push 실행**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\backend && supabase db push 2>&1"
```

Expected: `Applying migration ... done`

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add backend/supabase/migrations/20260514000000_add_avatar_position.sql
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add avatar_position column and avatars storage bucket"
```

---

## Task 2: `database.ts` 타입 업데이트

**Files:**
- Modify: `frontend/types/database.ts`

`profiles` 테이블의 `Row` / `Insert` / `Update` 각각에 `avatar_position` 추가한다.

- [ ] **Step 1: Row에 추가**

`profiles.Row`의 `avatar_url: string | null` 아래에 추가:
```ts
avatar_position: { x: number; y: number }
```

- [ ] **Step 2: Insert에 추가**

`profiles.Insert`의 `avatar_url?: string | null` 아래에 추가:
```ts
avatar_position?: { x: number; y: number }
```

- [ ] **Step 3: Update에 추가**

`profiles.Update`의 `avatar_url?: string | null` 아래에 추가:
```ts
avatar_position?: { x: number; y: number }
```

- [ ] **Step 4: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 5: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add frontend/types/database.ts
git -C D:\Backend_Bootcamp\agent_project commit -m "chore: add avatar_position type to profiles"
```

---

## Task 3: `Avatar` 컴포넌트

**Files:**
- Create: `frontend/app/(main)/_components/avatar.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
import Image from 'next/image'
import { UserCircle } from 'lucide-react'

interface AvatarProps {
  avatarUrl: string | null
  position?: { x: number; y: number }
  size?: 'sm' | 'md' | 'lg'
  username: string
}

const SIZE_MAP = {
  sm: { px: 24, cls: 'h-6 w-6' },
  md: { px: 32, cls: 'h-8 w-8' },
  lg: { px: 64, cls: 'h-16 w-16' },
}

export function Avatar({
  avatarUrl,
  position = { x: 50, y: 50 },
  size = 'md',
  username,
}: AvatarProps) {
  const { px, cls } = SIZE_MAP[size]

  if (!avatarUrl) {
    return <UserCircle className={cls} />
  }

  return (
    <div className={`${cls} rounded-full overflow-hidden flex-shrink-0 relative`}>
      <Image
        src={avatarUrl}
        alt={`@${username}`}
        width={px}
        height={px}
        className="h-full w-full object-cover"
        style={{ objectPosition: `${position.x}% ${position.y}%` }}
      />
    </div>
  )
}
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/_components/avatar.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add Avatar component"
```

---

## Task 4: Header에 Avatar 통합

**Files:**
- Modify: `frontend/app/(main)/_components/header.tsx`

현재 파일을 아래로 전체 교체한다.

- [ ] **Step 1: 파일 수정**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SignOutButton } from './sign-out-button'
import { Avatar } from './avatar'

export async function Header() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_profile_setup, avatar_url, avatar_position')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_profile_setup) return null

  const position = (profile.avatar_position as { x: number; y: number } | null) ?? { x: 50, y: 50 }

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          LogIt
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/contents/new"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            + 등록
          </Link>
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
          >
            <Avatar
              avatarUrl={profile.avatar_url}
              position={position}
              size="sm"
              username={profile.username}
            />
            {profile.username}
          </Link>
          <SignOutButton />
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/_components/header.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: show avatar in navigation header"
```

---

## Task 5: ProfileHeader에 Avatar 통합

**Files:**
- Modify: `frontend/app/(main)/profile/[username]/_components/profile-header.tsx`

현재 파일을 아래로 전체 교체한다.

- [ ] **Step 1: 파일 수정**

```tsx
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { type Database } from '@/types/database'
import { cn } from '@/lib/utils'
import { FollowButton } from '../../../../_components/follow-button'
import { Avatar } from '../../../../_components/avatar'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileHeaderProps {
  profile: Profile
  isOwner: boolean
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isLoggedIn: boolean
}

export function ProfileHeader({
  profile,
  isOwner,
  followerCount,
  followingCount,
  isFollowing,
  isLoggedIn,
}: ProfileHeaderProps) {
  const position = (profile.avatar_position as { x: number; y: number } | null) ?? { x: 50, y: 50 }

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <Avatar
          avatarUrl={profile.avatar_url}
          position={position}
          size="lg"
          username={profile.username}
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">@{profile.username}</h1>
          {profile.bio && (
            <p className="text-muted-foreground">{profile.bio}</p>
          )}
          <p className="text-sm text-muted-foreground">
            가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}
          </p>
          <p className="text-sm text-muted-foreground">
            팔로워 {followerCount} · 팔로잉 {followingCount}
          </p>
        </div>
      </div>
      <div>
        {isOwner ? (
          <Link
            href={`/profile/${profile.username}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            프로필 수정
          </Link>
        ) : (
          <FollowButton
            targetUserId={profile.id}
            initialFollowing={isFollowing}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/profile/[username]/_components/profile-header.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: show avatar in profile header"
```

---

## Task 6: 콘텐츠 상세 작성자 영역에 Avatar 통합

**Files:**
- Modify: `frontend/app/(main)/contents/[id]/page.tsx`

작성자 프로필 조회 쿼리에 `avatar_url`, `avatar_position` 추가하고, 작성자 영역에 Avatar 렌더링을 추가한다.

- [ ] **Step 1: 파일에서 두 부분 수정**

**import 추가** (FollowButton import 아래):
```tsx
import { Avatar } from '../../_components/avatar'
```

**작성자 프로필 쿼리 수정** (기존 `select('username')` → `select('username, avatar_url, avatar_position')`):
```tsx
  const [authorProfileResult, followResult] = createdBy
    ? await Promise.all([
        supabase.from('profiles').select('username, avatar_url, avatar_position').eq('id', createdBy).maybeSingle(),
        user && !isOwner
          ? supabase
              .from('follows')
              .select('follower_id')
              .eq('follower_id', user.id)
              .eq('following_id', createdBy)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ])
    : [{ data: null }, { data: null }]
```

**작성자 영역 JSX 수정** — 기존 Link 앞에 Avatar 추가:
```tsx
          {authorProfile && createdBy && (
            <div className="flex items-center justify-between">
              <Link
                href={`/profile/${authorProfile.username}`}
                className="flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <Avatar
                  avatarUrl={authorProfile.avatar_url}
                  position={(authorProfile.avatar_position as { x: number; y: number } | null) ?? { x: 50, y: 50 }}
                  size="sm"
                  username={authorProfile.username}
                />
                @{authorProfile.username}
              </Link>
              {!isOwner && (
                <FollowButton
                  targetUserId={createdBy}
                  initialFollowing={isFollowingAuthor}
                  isLoggedIn={!!user}
                />
              )}
            </div>
          )}
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/contents/[id]/page.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: show avatar in content detail author area"
```

---

## Task 7: 최종 검증 및 문서 정리

- [ ] **Step 1: tsc 전체 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 2: eslint 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx eslint . --ext .ts,.tsx 2>&1"
```

Expected: 신규 오류/경고 없음

- [ ] **Step 3: 수동 검증**

1. 네비게이션 헤더: 아바타 없는 계정 → UserCircle 아이콘 + username 표시
2. 프로필 헤더: 아바타 없음 → UserCircle 아이콘 (lg 크기)
3. 콘텐츠 상세: 작성자 영역 → UserCircle 아이콘 (sm) + @username

- [ ] **Step 4: 문서 업데이트**

`docs/AI-ACTION-LOGS.md`에 추가:
```
### [28] 아바타 표시 구현 (Plan A)
- DB: avatar_position jsonb 컬럼 + avatars Storage 버킷 + RLS
- avatar.tsx: 공유 Avatar 컴포넌트 (sm/md/lg, object-position, UserCircle 폴백)
- header.tsx: Avatar sm 표시
- profile-header.tsx: Avatar lg 표시, 레이아웃 조정
- contents/[id]/page.tsx: 작성자 Avatar sm 표시
```

`docs/CONTEXT.md`:
```
**아바타 표시 구현 완료 (Plan A).** 다음: 아바타 업로드 구현 (Plan B).
```

- [ ] **Step 5: 문서 Commit**

```
git -C D:\Backend_Bootcamp\agent_project add docs/AI-ACTION-LOGS.md docs/CONTEXT.md
git -C D:\Backend_Bootcamp\agent_project commit -m "docs: update docs for avatar display (Plan A)"
```
