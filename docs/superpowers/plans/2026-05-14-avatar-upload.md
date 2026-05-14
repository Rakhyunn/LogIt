# 아바타 업로드 구현 계획 (Plan B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **사전 조건:** Plan A (avatar-display) 완료 후 진행할 것.

**Goal:** 프로필 수정 폼에서 아바타 이미지를 업로드하고, 원형 미리보기 안에서 드래그로 포컬포인트를 조정해 저장한다.

**Architecture:** `AvatarUpload` Client Component가 파일 선택 시 즉시 Supabase Storage `avatars` 버킷에 업로드하고, 드래그 이벤트로 `object-position` 값을 계산해 부모 폼에 콜백으로 전달한다. `updateProfile` Server Action이 `avatar_url`과 `avatar_position`을 함께 저장한다.

**Tech Stack:** Next.js 16, Supabase SSR, TypeScript, Tailwind CSS, @supabase/supabase-js (browser client)

---

## 파일 구조

| 상태 | 경로 | 역할 |
|------|------|------|
| 신규 | `frontend/app/(main)/profile/[username]/_components/avatar-upload.tsx` | 업로드 + 드래그 Client Component |
| 수정 | `frontend/actions/user.ts` — `updateProfile` | `avatar_url`, `avatar_position` 저장 추가 |
| 수정 | `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx` | `AvatarUpload` 추가, hidden inputs |
| 수정 | `frontend/app/(main)/profile/[username]/edit/page.tsx` | `avatar_url`, `avatar_position` 전달 |

---

## Task 1: `AvatarUpload` 컴포넌트

**Files:**
- Create: `frontend/app/(main)/profile/[username]/_components/avatar-upload.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  currentPosition: { x: number; y: number }
  userId: string
  onAvatarChange: (url: string | null, position: { x: number; y: number }) => void
}

export function AvatarUpload({
  currentAvatarUrl,
  currentPosition,
  userId,
  onAvatarChange,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl)
  const [position, setPosition] = useState(currentPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const el = circleRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
      const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)))
      const newPos = { x, y }
      setPosition(newPos)
      onAvatarChange(avatarUrl, newPos)
    }

    const handleMouseUp = () => setIsDragging(false)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, avatarUrl, onAvatarChange])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('jpg, png, webp 형식만 업로드 가능합니다.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)
    setError(null)

    const supabase = createClient()

    // 기존 아바타 삭제
    if (avatarUrl) {
      const parsed = new URL(avatarUrl)
      const storagePath = parsed.pathname.split('/storage/v1/object/public/avatars/')[1]
      if (storagePath) {
        await supabase.storage.from('avatars').remove([storagePath])
      }
    }

    const ext = file.type.split('/')[1] || 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file)

    if (uploadError) {
      if (process.env.NODE_ENV === 'development') console.error(uploadError)
      setError('이미지 업로드에 실패했습니다.')
      setIsUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const newPos = { x: 50, y: 50 }
    setAvatarUrl(publicUrl)
    setPosition(newPos)
    onAvatarChange(publicUrl, newPos)
    setIsUploading(false)

    // input 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete() {
    if (!avatarUrl) return

    const supabase = createClient()
    const parsed = new URL(avatarUrl)
    const storagePath = parsed.pathname.split('/storage/v1/object/public/avatars/')[1]
    if (storagePath) {
      await supabase.storage.from('avatars').remove([storagePath])
    }

    setAvatarUrl(null)
    setPosition({ x: 50, y: 50 })
    onAvatarChange(null, { x: 50, y: 50 })
  }

  return (
    <div className="space-y-3">
      <div
        ref={circleRef}
        className={`h-16 w-16 rounded-full overflow-hidden border-2 border-muted relative ${avatarUrl ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseDown={() => avatarUrl && setIsDragging(true)}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="아바타 미리보기"
            width={64}
            height={64}
            className="h-full w-full object-cover select-none"
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
            draggable={false}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <UserCircle className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {avatarUrl && (
        <p className="text-xs text-muted-foreground">
          원 안에서 드래그해 포커스 위치를 조정하세요.
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? '업로드 중...' : avatarUrl ? '이미지 변경' : '이미지 선택'}
        </Button>
        {avatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
          >
            삭제
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
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
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/profile/[username]/_components/avatar-upload.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add AvatarUpload component with drag position adjustment"
```

---

## Task 2: `updateProfile` Server Action 수정

**Files:**
- Modify: `frontend/actions/user.ts`

`updateProfile` 함수에서 `username`, `bio` 외에 `avatar_url`, `avatar_position`을 처리하도록 수정한다.

현재 `updateProfile` 함수의 update 부분을 아래로 교체한다:

- [ ] **Step 1: update 로직 수정**

기존:
```ts
  const { error } = await supabase
    .from('profiles')
    .update({ username, bio })
    .eq('id', user.id)
```

교체:
```ts
  const avatarUrl = (formData.get('avatar_url') as string) || null
  const avatarPositionRaw = formData.get('avatar_position') as string | null
  const avatarPosition: { x: number; y: number } = avatarPositionRaw
    ? JSON.parse(avatarPositionRaw)
    : { x: 50, y: 50 }

  const { error } = await supabase
    .from('profiles')
    .update({ username, bio, avatar_url: avatarUrl, avatar_position: avatarPosition })
    .eq('id', user.id)
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add frontend/actions/user.ts
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add avatar_url and avatar_position to updateProfile action"
```

---

## Task 3: `profile-edit-form.tsx` 수정

**Files:**
- Modify: `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx`

현재 파일을 아래로 전체 교체한다.

- [ ] **Step 1: 파일 수정**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { checkUsername, updateProfile } from '@/actions/user'
import { type Database } from '@/types/database'
import { AvatarUpload } from './avatar-upload'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileEditFormProps {
  profile: Profile
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [usernameValue, setUsernameValue] = useState(profile.username)
  const [checkResult, setCheckResult] = useState<{
    available: boolean
    message: string
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentPosition = (profile.avatar_position as { x: number; y: number } | null) ?? { x: 50, y: 50 }
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [avatarPosition, setAvatarPosition] = useState(currentPosition)

  const isUsernameChanged = usernameValue !== profile.username

  async function handleCheckUsername() {
    setIsChecking(true)
    setCheckResult(null)
    const result = await checkUsername(usernameValue)
    setCheckResult({
      available: result.available,
      message: result.available
        ? '사용 가능한 username입니다.'
        : (result.message ?? '이미 사용 중인 username입니다.'),
    })
    setIsChecking(false)
  }

  function handleSubmit(formData: FormData) {
    const username = (formData.get('username') as string).trim()

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('username은 영문, 숫자, 밑줄(_)만 사용 가능합니다.')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (!result.success) setError(result.message)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* hidden inputs for avatar */}
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ''} />
      <input type="hidden" name="avatar_position" value={JSON.stringify(avatarPosition)} />

      <div className="space-y-2">
        <Label>프로필 이미지</Label>
        <AvatarUpload
          currentAvatarUrl={profile.avatar_url}
          currentPosition={currentPosition}
          userId={profile.id}
          onAvatarChange={(url, pos) => {
            setAvatarUrl(url)
            setAvatarPosition(pos)
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex gap-2">
          <Input
            id="username"
            name="username"
            value={usernameValue}
            onChange={(e) => {
              setUsernameValue(e.target.value)
              setCheckResult(null)
            }}
            minLength={2}
            maxLength={30}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCheckUsername}
            disabled={isChecking || !isUsernameChanged}
          >
            {isChecking ? '확인 중...' : '중복 확인'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          영문, 숫자, 밑줄(_) 사용 가능 (2~30자)
        </p>
        {checkResult && (
          <p
            className={`text-sm ${
              checkResult.available ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {checkResult.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">자기소개</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ''}
          maxLength={200}
          rows={3}
          placeholder="자기소개를 입력해 주세요. (선택, 200자 이내)"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </Button>
    </form>
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
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add AvatarUpload to profile edit form"
```

---

## Task 4: 최종 검증 및 문서 정리

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

- [ ] **Step 3: 수동 검증 체크리스트**

1. `/profile/[username]/edit` 접속 → 상단에 원형 미리보기 + "이미지 선택" 버튼 표시
2. 이미지 선택 → 즉시 업로드 → 원형 미리보기에 이미지 표시
3. 원 안에서 드래그 → 이미지 포컬포인트 실시간 이동
4. "저장" 클릭 → 프로필 페이지로 이동, 헤더와 프로필 헤더에 아바타 반영
5. "이미지 변경" 클릭 → 새 이미지로 교체 (기존 Storage 파일 삭제됨)
6. "삭제" 클릭 → 기본 UserCircle 아이콘으로 복귀
7. 5MB 초과 파일 → 에러 메시지 표시, 업로드 안 됨
8. 콘텐츠 상세 작성자 영역에도 아바타 반영 확인

- [ ] **Step 4: 문서 업데이트**

`docs/AI-ACTION-LOGS.md`에 추가:
```
### [29] 아바타 업로드 구현 (Plan B)
- avatar-upload.tsx: 파일 선택 즉시 업로드, 드래그 포컬포인트 조정, 삭제 기능
- actions/user.ts: updateProfile에 avatar_url, avatar_position 저장 추가
- profile-edit-form.tsx: AvatarUpload 통합, hidden inputs로 formData 전달
```

`docs/TODO-DONE.md`에 추가:
```
- [x] 아바타 이미지 업로드 + 위치 조정 구현 (drag focal point, avatars 버킷)
```

`docs/CONTEXT.md`:
```
**아바타 기능 구현 완료.** 다음 작업: 로딩/에러 상태 처리.
```

- [ ] **Step 5: 문서 Commit**

```
git -C D:\Backend_Bootcamp\agent_project add docs/AI-ACTION-LOGS.md docs/TODO-DONE.md docs/CONTEXT.md
git -C D:\Backend_Bootcamp\agent_project commit -m "docs: update docs for avatar upload (Plan B)"
```
