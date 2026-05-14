# 아바타 기능 설계 스펙

**Goal:** 프로필 수정 폼에서 아바타 이미지를 선택적으로 업로드하고, 원형 미리보기 안에서 드래그로 포컬포인트를 조정해 저장한다. 네비게이션 헤더, 프로필 헤더, 콘텐츠 상세 작성자 영역에 아바타를 표시한다.

**Date:** 2026-05-14

---

## 아키텍처

### 신규 파일
| 파일 | 역할 |
|------|------|
| `frontend/app/(main)/_components/avatar.tsx` | 공유 아바타 표시 컴포넌트 (Server/Client 모두 사용) |
| `frontend/app/(main)/profile/[username]/_components/avatar-upload.tsx` | 업로드 + 드래그 위치 조정 Client Component |
| `backend/supabase/migrations/20260514000000_add_avatar_position.sql` | `profiles.avatar_position` 컬럼 추가 |

### 수정 파일
| 파일 | 변경 내용 |
|------|-----------|
| `frontend/actions/user.ts` — `updateProfile` | `avatar_url`, `avatar_position` 저장 추가 |
| `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx` | `AvatarUpload` 컴포넌트 추가 |
| `frontend/app/(main)/profile/[username]/_components/profile-header.tsx` | `Avatar` 컴포넌트로 아바타 표시 |
| `frontend/app/(main)/_components/header.tsx` | `UserCircle` → `Avatar` 컴포넌트 |
| `frontend/app/(main)/contents/[id]/page.tsx` | 작성자 영역에 `Avatar` 추가 |
| `frontend/types/database.ts` | `avatar_position` 타입 추가 |

---

## DB 마이그레이션

**파일:** `backend/supabase/migrations/20260514000000_add_avatar_position.sql`

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_position jsonb DEFAULT '{"x": 50, "y": 50}';
```

- 기본값 `{ x: 50, y: 50 }` → 중앙 포컬포인트
- `avatar_url`은 이미 존재 (`text | null`)

---

## Supabase Storage — `avatars` 버킷

같은 마이그레이션 파일에 포함:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

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

- 업로드 경로: `{user_id}/{timestamp}.{ext}`
- 새 아바타 업로드 전 기존 파일 삭제 (Storage 누적 방지)
- `covers` 버킷과 동일 Supabase 도메인 → `next.config.ts` 추가 설정 불필요

---

## `Avatar` 컴포넌트

**위치:** `frontend/app/(main)/_components/avatar.tsx`

```tsx
interface AvatarProps {
  avatarUrl: string | null
  position?: { x: number; y: number }  // 기본값: { x: 50, y: 50 }
  size?: 'sm' | 'md' | 'lg'            // sm=24px, md=32px, lg=64px
  username: string                      // alt 텍스트
}
```

**동작:**
- `avatarUrl` 있으면 → `<Image>` + `rounded-full`, `object-cover`, `object-position: {x}% {y}%`
- `avatarUrl` 없으면 → `<UserCircle>` lucide-react 아이콘

**크기:**
| 위치 | size prop |
|------|-----------|
| 네비게이션 헤더 | `sm` (h-6 w-6) |
| 프로필 헤더 | `lg` (h-16 w-16) |
| 콘텐츠 상세 작성자 | `sm` (h-6 w-6) |

---

## `AvatarUpload` 컴포넌트

**위치:** `frontend/app/(main)/profile/[username]/_components/avatar-upload.tsx`

**Props:**
```ts
interface AvatarUploadProps {
  currentAvatarUrl: string | null
  currentPosition: { x: number; y: number }
  userId: string
  onAvatarChange: (url: string | null, position: { x: number; y: number }) => void
}
```

**내부 상태:**
- `previewUrl: string | null` — 선택한 파일 blob URL 또는 기존 URL
- `position: { x: number; y: number }` — 현재 포컬포인트 (0~100%)
- `isDragging: boolean`
- `pendingFile: File | null` — 폼 저장 시 업로드할 파일

**UI 구조:**
```
[원형 미리보기 64px]   ← 드래그 가능
[파일 선택 버튼]
[아바타 삭제 버튼]  ← avatarUrl이 있을 때만 표시
```

**드래그 구현:**
```tsx
const handleMouseMove = (e: MouseEvent) => {
  const rect = circleRef.current!.getBoundingClientRect()
  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
  setPosition({ x: Math.round(x), y: Math.round(y) })
}
```

**업로드 흐름:**
1. 파일 선택 → Supabase Storage에 즉시 업로드 (Content 도메인 패턴과 동일)
2. 업로드 완료 → public URL로 미리보기 표시
3. 드래그로 포컬포인트 조정 → position 실시간 업데이트
4. `onAvatarChange(publicUrl, position)` 콜백으로 부모 폼에 전달
5. 폼 저장 시 `updateProfile`에 `avatar_url`, `avatar_position` 전달

**삭제:** 아바타 삭제 버튼 클릭 → Storage 파일 삭제 → `onAvatarChange(null, { x: 50, y: 50 })` → DB 업데이트

---

## `updateProfile` 수정

`frontend/actions/user.ts`의 `updateProfile`에 추가:

```ts
const avatarUrl = formData.get('avatar_url') as string | null
const avatarPositionRaw = formData.get('avatar_position') as string | null
const avatarPosition = avatarPositionRaw
  ? (JSON.parse(avatarPositionRaw) as { x: number; y: number })
  : undefined

// update 대상에 추가
const updateData: Record<string, unknown> = { username, bio }
if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl || null
if (avatarPosition) updateData.avatar_position = avatarPosition
```

---

## `database.ts` 타입 수정

`profiles` 테이블 `Row` / `Insert` / `Update`에 추가:

```ts
avatar_position: Json  // { x: number; y: number }
```

---

## 통합 위치별 변경

### 네비게이션 헤더 (`header.tsx`)
```tsx
// 기존: <UserCircle className="h-5 w-5" />
// 변경: <Avatar avatarUrl={profile.avatar_url} position={profile.avatar_position} size="sm" username={profile.username} />
```
- `select('username, is_profile_setup')` → `select('username, is_profile_setup, avatar_url, avatar_position')` 로 확장

### 프로필 헤더 (`profile-header.tsx`)
- `Avatar` 컴포넌트 `lg` 크기로 username 왼쪽에 배치

### 콘텐츠 상세 작성자 영역 (`contents/[id]/page.tsx`)
- 작성자 조회 시 `avatar_url, avatar_position`도 함께 조회
- `@username` 링크 왼쪽에 `Avatar` `sm` 크기 표시

---

## 에러 처리

| 상황 | 처리 |
|------|------|
| 파일 크기 초과 | 클라이언트에서 5MB 제한, 초과 시 에러 메시지 |
| 허용되지 않는 파일 형식 | jpg/png/webp만 허용, 그 외 에러 메시지 |
| Storage 업로드 실패 | 에러 메시지 표시, 기존 아바타 유지 |
| 아바타 없는 상태 | `UserCircle` 아이콘 표시 |
