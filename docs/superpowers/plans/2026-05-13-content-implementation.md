# Content 도메인 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 콘텐츠 목록(홈), 상세, 등록, 수정, 삭제 기능과 Supabase Storage 커버 이미지 업로드를 구현한다.

**Architecture:** 홈(`/`)은 서버 컴포넌트로 Supabase에서 직접 데이터를 fetch하고, 타입 필터와 검색은 URL 쿼리 파라미터로 처리한다. 이미지 업로드만 예외적으로 클라이언트에서 Supabase Storage에 직접 업로드하고 URL을 Server Action에 전달한다. 수정/삭제는 `created_by` 기반 RLS로 1차 보호, 서버에서 소유자 확인 후 렌더링으로 2차 보호한다.

**Tech Stack:** Next.js 16 App Router, Supabase (DB + Storage), shadcn/ui (button, input, label, textarea, select), TypeScript

---

## 파일 구조

| 파일 | 작업 | 역할 |
|------|------|------|
| `backend/supabase/migrations/20260513000002_storage_covers.sql` | 생성 | Storage 버킷 + 정책 |
| `backend/supabase/migrations/20260513000003_seed_contents.sql` | 생성 | 초기 콘텐츠 seed 데이터 |
| `frontend/next.config.ts` | 수정 | Supabase Storage 이미지 도메인 허용 |
| `frontend/types/content.ts` | 생성 | metadata 타입 정의 |
| `frontend/actions/contents.ts` | 생성 | createContent, updateContent, deleteContent |
| `frontend/app/(main)/page.tsx` | 수정 | 홈 = 콘텐츠 목록 (서버 컴포넌트) |
| `frontend/app/(main)/loading.tsx` | 생성 | 홈 스켈레톤 |
| `frontend/app/(main)/error.tsx` | 생성 | 홈 에러 UI |
| `frontend/app/(main)/_components/content-card.tsx` | 생성 | 목록용 카드 |
| `frontend/app/(main)/_components/content-filter.tsx` | 생성 | 타입 필터 + 검색 (클라이언트) |
| `frontend/app/(main)/_components/content-form.tsx` | 생성 | 등록/수정 공용 폼 (클라이언트, Storage 업로드 포함) |
| `frontend/app/(main)/contents/new/page.tsx` | 생성 | 콘텐츠 등록 |
| `frontend/app/(main)/contents/[id]/page.tsx` | 생성 | 콘텐츠 상세 |
| `frontend/app/(main)/contents/[id]/loading.tsx` | 생성 | 상세 스켈레톤 |
| `frontend/app/(main)/contents/[id]/error.tsx` | 생성 | 상세 에러 UI |
| `frontend/app/(main)/contents/[id]/edit/page.tsx` | 생성 | 콘텐츠 수정 (소유자만) |

---

## Task 1: Storage 버킷 설정 + Seed 마이그레이션

**Files:**
- Create: `backend/supabase/migrations/20260513000002_storage_covers.sql`
- Create: `backend/supabase/migrations/20260513000003_seed_contents.sql`

- [ ] **Step 1: Storage 마이그레이션 파일 작성**

```sql
-- backend/supabase/migrations/20260513000002_storage_covers.sql

-- covers 버킷 생성 (public: 이미지 URL 직접 접근 가능)
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 누구나 읽기 가능
CREATE POLICY "covers_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- 인증 유저만 업로드
CREATE POLICY "covers_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND auth.role() = 'authenticated'
  );

-- 본인이 업로드한 파일만 삭제 (경로: covers/{user_id}/...)
CREATE POLICY "covers_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

- [ ] **Step 2: Seed 마이그레이션 파일 작성**

```sql
-- backend/supabase/migrations/20260513000003_seed_contents.sql

INSERT INTO public.contents (type, title, description, metadata, created_by) VALUES
  (
    'movie', '인터스텔라',
    '우주를 배경으로 시간과 사랑을 탐구하는 SF 걸작',
    '{"director": "크리스토퍼 놀란", "release_year": 2014, "genres": ["SF", "드라마"]}',
    null
  ),
  (
    'movie', '기생충',
    '봉준호 감독의 아카데미 작품상 수상 사회 비판 영화',
    '{"director": "봉준호", "release_year": 2019, "genres": ["스릴러", "드라마"]}',
    null
  ),
  (
    'drama', '이상한 변호사 우영우',
    '자폐 스펙트럼을 가진 천재 변호사의 성장 이야기',
    '{"director": "유인식", "air_year": 2022, "episodes": 16, "genres": ["법정", "드라마"]}',
    null
  ),
  (
    'drama', '오징어 게임',
    '456억 원의 상금이 걸린 생존 게임에 뛰어든 사람들의 이야기',
    '{"director": "황동혁", "air_year": 2021, "episodes": 9, "genres": ["스릴러", "액션"]}',
    null
  ),
  (
    'book', '채식주의자',
    '한강의 부커 국제상 수상 소설. 폭력과 억압에 저항하는 한 여성의 이야기',
    '{"author": "한강", "publish_year": 2007, "publisher": "창비"}',
    null
  ),
  (
    'book', '82년생 김지영',
    '평범한 한국 여성의 삶을 통해 사회 구조적 문제를 조명한 소설',
    '{"author": "조남주", "publish_year": 2016, "publisher": "민음사"}',
    null
  );
```

- [ ] **Step 3: 마이그레이션 적용**

```bash
cd backend
supabase db push
```

Expected:
```
Applying migration 20260513000002_storage_covers.sql...
Applying migration 20260513000003_seed_contents.sql...
Finished supabase db push.
```

- [ ] **Step 4: 커밋**

```bash
git add backend/supabase/migrations/20260513000002_storage_covers.sql
git add backend/supabase/migrations/20260513000003_seed_contents.sql
git commit -m "chore: add storage covers bucket and seed contents"
```

---

## Task 2: metadata 타입 + next.config.ts 업데이트

**Files:**
- Create: `frontend/types/content.ts`
- Modify: `frontend/next.config.ts`

- [ ] **Step 1: `frontend/types/content.ts` 작성**

```typescript
export type MovieMeta = {
  director: string
  release_year: number
  genres: string[]
}

export type DramaMeta = {
  director: string
  air_year: number
  episodes: number
  genres: string[]
}

export type BookMeta = {
  author: string
  publish_year: number
  publisher: string
}

export type ContentMeta = MovieMeta | DramaMeta | BookMeta
```

- [ ] **Step 2: `frontend/next.config.ts` 수정 — Supabase Storage 이미지 도메인 허용**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add frontend/types/content.ts frontend/next.config.ts
git commit -m "chore: add content metadata types and allow Supabase image domain"
```

---

## Task 3: shadcn textarea, select 추가

**Files:**
- Create: `frontend/components/ui/textarea.tsx`
- Create: `frontend/components/ui/select.tsx`

- [ ] **Step 1: shadcn 컴포넌트 설치**

```bash
cd frontend
npx shadcn@latest add textarea select
```

Expected: `components/ui/textarea.tsx`, `components/ui/select.tsx` 생성됨

- [ ] **Step 2: 설치 확인**

```bash
ls frontend/components/ui/
```

Expected: `button.tsx input.tsx label.tsx select.tsx textarea.tsx` 포함 확인

- [ ] **Step 3: 커밋**

```bash
git add frontend/components/ui/textarea.tsx frontend/components/ui/select.tsx
git commit -m "chore: add shadcn textarea and select components"
```

---

## Task 4: Server Actions

**Files:**
- Create: `frontend/actions/contents.ts`

- [ ] **Step 1: `frontend/actions/contents.ts` 작성**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '@/actions/auth'
import { type ContentType } from '@/types/database'
import { type ContentMeta } from '@/types/content'

export async function createContent(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const title = (formData.get('title') as string).trim()
  const type = formData.get('type') as ContentType
  const description = ((formData.get('description') as string) ?? '').trim() || null
  const cover_image_url = (formData.get('cover_image_url') as string) || null
  const metadata = JSON.parse(formData.get('metadata') as string) as ContentMeta

  if (!title) return { success: false, message: '제목을 입력해 주세요.' }
  if (!['movie', 'drama', 'book'].includes(type)) {
    return { success: false, message: '올바른 콘텐츠 유형을 선택해 주세요.' }
  }

  const { data, error } = await supabase
    .from('contents')
    .insert({ title, type, description, cover_image_url, metadata, created_by: user.id })
    .select('id')
    .single()

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '콘텐츠 등록에 실패했습니다.' }
  }

  revalidatePath('/')
  return { success: true, data: { id: data.id } }
}

export async function updateContent(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const title = (formData.get('title') as string).trim()
  const description = ((formData.get('description') as string) ?? '').trim() || null
  const cover_image_url = (formData.get('cover_image_url') as string) || null
  const metadata = JSON.parse(formData.get('metadata') as string) as ContentMeta

  if (!title) return { success: false, message: '제목을 입력해 주세요.' }

  const { error } = await supabase
    .from('contents')
    .update({ title, description, cover_image_url, metadata })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '콘텐츠 수정에 실패했습니다.' }
  }

  revalidatePath('/')
  revalidatePath(`/contents/${id}`)
  redirect(`/contents/${id}`)
}

export async function deleteContent(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
    return { success: false, message: '콘텐츠 삭제에 실패했습니다.' }
  }

  revalidatePath('/')
  redirect('/')
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add frontend/actions/contents.ts
git commit -m "feat: add content server actions"
```

---

## Task 5: content-form.tsx (공용 등록/수정 폼)

**Files:**
- Create: `frontend/app/(main)/_components/content-form.tsx`

- [ ] **Step 1: `_components/` 디렉토리 생성 후 `content-form.tsx` 작성**

```tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createContent, updateContent } from '@/actions/contents'
import { type ContentType } from '@/types/database'
import { type Database } from '@/types/database'

type Content = Database['public']['Tables']['contents']['Row']

export default function ContentForm({ content }: { content?: Content }) {
  const router = useRouter()
  const [type, setType] = useState<ContentType>(content?.type ?? 'movie')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [coverUrl, setCoverUrl] = useState<string | null>(
    content?.cover_image_url ?? null
  )
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const meta = (content?.metadata ?? {}) as Record<string, unknown>

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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

    setUploading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인이 필요합니다.')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop()
    const path = `covers/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, file)

    if (uploadError) {
      if (process.env.NODE_ENV === 'development') console.error(uploadError)
      setError('이미지 업로드에 실패했습니다.')
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    setCoverUrl(data.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('cover_image_url', coverUrl ?? '')

    const metadata: Record<string, unknown> = {}
    if (type === 'movie') {
      metadata.director = formData.get('director')
      metadata.release_year = Number(formData.get('release_year'))
      metadata.genres = (formData.get('genres') as string)
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    } else if (type === 'drama') {
      metadata.director = formData.get('director')
      metadata.air_year = Number(formData.get('air_year'))
      metadata.episodes = Number(formData.get('episodes'))
      metadata.genres = (formData.get('genres') as string)
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    } else {
      metadata.author = formData.get('author')
      metadata.publish_year = Number(formData.get('publish_year'))
      metadata.publisher = formData.get('publisher')
    }
    formData.set('metadata', JSON.stringify(metadata))

    if (content) {
      const result = await updateContent(content.id, formData)
      if (!result.success) {
        setError(result.message)
        setPending(false)
      }
      // 성공 시 updateContent 내부에서 redirect — pending은 자동 해제
    } else {
      const result = await createContent(formData)
      if (!result.success) {
        setError(result.message)
        setPending(false)
      } else {
        router.push(`/contents/${result.data.id}`)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">
        {content ? '콘텐츠 수정' : '콘텐츠 등록'}
      </h1>

      {/* 유형 선택 — 수정 시 변경 불가 */}
      <div className="space-y-1">
        <Label>유형</Label>
        {content ? (
          <p className="text-sm text-muted-foreground">
            {type === 'movie' ? '영화' : type === 'drama' ? '드라마' : '책'}
          </p>
        ) : (
          <Select
            value={type}
            onValueChange={(v) => setType(v as ContentType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movie">영화</SelectItem>
              <SelectItem value="drama">드라마</SelectItem>
              <SelectItem value="book">책</SelectItem>
            </SelectContent>
          </Select>
        )}
        <input type="hidden" name="type" value={type} />
      </div>

      {/* 제목 */}
      <div className="space-y-1">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={content?.title}
          required
        />
      </div>

      {/* 설명 */}
      <div className="space-y-1">
        <Label htmlFor="description">설명 (선택)</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={content?.description ?? ''}
          rows={3}
        />
      </div>

      {/* 커버 이미지 */}
      <div className="space-y-2">
        <Label>커버 이미지 (선택)</Label>
        {coverUrl && (
          <div className="relative w-32 h-44 rounded overflow-hidden border">
            <Image src={coverUrl} alt="커버 미리보기" fill className="object-cover" />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '업로드 중...' : '이미지 선택'}
          </Button>
          {coverUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCoverUrl(null)}
            >
              제거
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* 타입별 metadata 필드 */}
      {type === 'movie' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="director">감독</Label>
            <Input
              id="director"
              name="director"
              defaultValue={(meta.director as string) ?? ''}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="release_year">개봉연도</Label>
            <Input
              id="release_year"
              name="release_year"
              type="number"
              min={1900}
              max={2099}
              defaultValue={(meta.release_year as number) ?? ''}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="genres">장르 (쉼표로 구분)</Label>
            <Input
              id="genres"
              name="genres"
              placeholder="SF, 드라마"
              defaultValue={((meta.genres as string[]) ?? []).join(', ')}
              required
            />
          </div>
        </div>
      )}

      {type === 'drama' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="director">감독</Label>
            <Input
              id="director"
              name="director"
              defaultValue={(meta.director as string) ?? ''}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="air_year">방영연도</Label>
            <Input
              id="air_year"
              name="air_year"
              type="number"
              min={1900}
              max={2099}
              defaultValue={(meta.air_year as number) ?? ''}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="episodes">에피소드 수</Label>
            <Input
              id="episodes"
              name="episodes"
              type="number"
              min={1}
              defaultValue={(meta.episodes as number) ?? ''}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="genres">장르 (쉼표로 구분)</Label>
            <Input
              id="genres"
              name="genres"
              placeholder="스릴러, 드라마"
              defaultValue={((meta.genres as string[]) ?? []).join(', ')}
              required
            />
          </div>
        </div>
      )}

      {type === 'book' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="author">저자</Label>
            <Input
              id="author"
              name="author"
              defaultValue={(meta.author as string) ?? ''}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="publish_year">출판연도</Label>
            <Input
              id="publish_year"
              name="publish_year"
              type="number"
              min={1000}
              max={2099}
              defaultValue={(meta.publish_year as number) ?? ''}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="publisher">출판사</Label>
            <Input
              id="publisher"
              name="publisher"
              defaultValue={(meta.publisher as string) ?? ''}
              required
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? '저장 중...' : content ? '수정 완료' : '등록'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          취소
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add "frontend/app/(main)/_components/content-form.tsx"
git commit -m "feat: add content form component with storage upload"
```

---

## Task 6: content-card.tsx + content-filter.tsx

**Files:**
- Create: `frontend/app/(main)/_components/content-card.tsx`
- Create: `frontend/app/(main)/_components/content-filter.tsx`

- [ ] **Step 1: `content-card.tsx` 작성**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { type Database } from '@/types/database'

type Content = Database['public']['Tables']['contents']['Row']

const TYPE_LABEL: Record<string, string> = {
  movie: '영화',
  drama: '드라마',
  book: '책',
}

export default function ContentCard({ content }: { content: Content }) {
  return (
    <Link
      href={`/contents/${content.id}`}
      className="group block rounded-lg border hover:border-primary transition-colors overflow-hidden"
    >
      <div className="relative w-full aspect-[2/3] bg-muted">
        {content.cover_image_url ? (
          <Image
            src={content.cover_image_url}
            alt={content.title}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
            이미지 없음
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <span className="text-xs text-muted-foreground">
          {TYPE_LABEL[content.type]}
        </span>
        <h3 className="font-medium text-sm leading-snug line-clamp-2">
          {content.title}
        </h3>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: `content-filter.tsx` 작성**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TYPES = [
  { value: '', label: '전체' },
  { value: 'movie', label: '영화' },
  { value: 'drama', label: '드라마' },
  { value: 'book', label: '책' },
]

export default function ContentFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const currentType = searchParams.get('type') ?? ''

  function setType(type: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (type) params.set('type', type)
    else params.delete('type')
    params.delete('q')
    startTransition(() => router.push(`/?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) params.set('q', search)
    else params.delete('q')
    startTransition(() => router.push(`/?${params.toString()}`))
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="콘텐츠 검색..."
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          검색
        </Button>
      </form>
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(({ value, label }) => (
          <Button
            key={value}
            variant={currentType === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType(value)}
            disabled={isPending}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add "frontend/app/(main)/_components/content-card.tsx" "frontend/app/(main)/_components/content-filter.tsx"
git commit -m "feat: add content card and filter components"
```

---

## Task 7: 홈 페이지 + loading/error

**Files:**
- Modify: `frontend/app/(main)/page.tsx`
- Create: `frontend/app/(main)/loading.tsx`
- Create: `frontend/app/(main)/error.tsx`

- [ ] **Step 1: `page.tsx` 전체 교체**

```tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ContentCard from './_components/content-card'
import ContentFilter from './_components/content-filter'
import { Button } from '@/components/ui/button'
import { type ContentType } from '@/types/database'

interface HomePageProps {
  searchParams: Promise<{ type?: ContentType; q?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contents')
    .select('*')
    .order('created_at', { ascending: false })

  if (type && ['movie', 'drama', 'book'].includes(type)) {
    query = query.eq('type', type)
  }
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: contents, error } = await query
  if (error) throw error

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">콘텐츠</h1>
        <Button asChild size="sm">
          <Link href="/contents/new">+ 등록</Link>
        </Button>
      </div>

      <Suspense>
        <ContentFilter />
      </Suspense>

      {contents && contents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-12 text-center">
          {q ? `"${q}"에 대한 검색 결과가 없습니다.` : '등록된 콘텐츠가 없습니다.'}
        </p>
      )}
    </main>
  )
}
```

- [ ] **Step 2: `loading.tsx` 작성**

```tsx
export default function Loading() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-80 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-lg border overflow-hidden">
            <div className="aspect-[2/3] bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-10 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: `error.tsx` 작성**

```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="container mx-auto p-4 text-center space-y-4 py-20">
      <p className="text-muted-foreground">콘텐츠를 불러오는데 실패했습니다.</p>
      <button onClick={reset} className="text-sm hover:underline">
        다시 시도
      </button>
    </main>
  )
}
```

- [ ] **Step 4: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 5: dev 서버에서 확인**

```bash
cd frontend && npm run dev
```

`http://localhost:3000` 접속:
- 콘텐츠 목록 그리드 표시 확인 (seed 데이터 6개)
- 타입 필터 클릭 시 URL 변경 + 목록 필터링 확인
- 검색어 입력 후 검색 버튼 클릭 시 필터링 확인

- [ ] **Step 6: 커밋**

```bash
git add "frontend/app/(main)/page.tsx" "frontend/app/(main)/loading.tsx" "frontend/app/(main)/error.tsx"
git commit -m "feat: implement home page with content list, filter, and search"
```

---

## Task 8: 콘텐츠 상세 페이지

**Files:**
- Create: `frontend/app/(main)/contents/[id]/page.tsx`
- Create: `frontend/app/(main)/contents/[id]/loading.tsx`
- Create: `frontend/app/(main)/contents/[id]/error.tsx`

- [ ] **Step 1: `contents/[id]/page.tsx` 작성**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { deleteContent } from '@/actions/contents'
import { type ContentMeta, type MovieMeta, type DramaMeta, type BookMeta } from '@/types/content'

const TYPE_LABEL: Record<string, string> = {
  movie: '영화',
  drama: '드라마',
  book: '책',
}

function MetaInfo({ type, metadata }: { type: string; metadata: ContentMeta }) {
  if (type === 'movie') {
    const m = metadata as MovieMeta
    return (
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>감독: {m.director}</li>
        <li>개봉: {m.release_year}년</li>
        <li>장르: {m.genres.join(', ')}</li>
      </ul>
    )
  }
  if (type === 'drama') {
    const m = metadata as DramaMeta
    return (
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>감독: {m.director}</li>
        <li>방영: {m.air_year}년</li>
        <li>에피소드: {m.episodes}부작</li>
        <li>장르: {m.genres.join(', ')}</li>
      </ul>
    )
  }
  const m = metadata as BookMeta
  return (
    <ul className="text-sm text-muted-foreground space-y-1">
      <li>저자: {m.author}</li>
      <li>출판: {m.publish_year}년</li>
      <li>출판사: {m.publisher}</li>
    </ul>
  )
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: content }, { data: { user } }] = await Promise.all([
    supabase.from('contents').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!content) notFound()

  const isOwner = !!user && user.id === content.created_by
  const deleteWithId = deleteContent.bind(null, id)

  return (
    <main className="container mx-auto p-4 max-w-2xl space-y-6">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← 목록으로
      </Link>

      <div className="flex gap-6">
        {content.cover_image_url ? (
          <div className="relative w-32 h-44 flex-shrink-0 rounded overflow-hidden border">
            <Image
              src={content.cover_image_url}
              alt={content.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-44 flex-shrink-0 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
            이미지 없음
          </div>
        )}

        <div className="space-y-3 flex-1 min-w-0">
          <div>
            <span className="text-xs text-muted-foreground">
              {TYPE_LABEL[content.type]}
            </span>
            <h1 className="text-2xl font-bold">{content.title}</h1>
          </div>
          <MetaInfo
            type={content.type}
            metadata={content.metadata as ContentMeta}
          />
          {content.description && (
            <p className="text-sm text-muted-foreground">{content.description}</p>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="flex gap-2 pt-2 border-t">
          <Button asChild size="sm" variant="outline">
            <Link href={`/contents/${id}/edit`}>수정</Link>
          </Button>
          <form action={deleteWithId}>
            <Button type="submit" size="sm" variant="destructive">
              삭제
            </Button>
          </form>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: `loading.tsx` 작성**

```tsx
export default function Loading() {
  return (
    <main className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      <div className="flex gap-6">
        <div className="w-32 h-44 flex-shrink-0 rounded border bg-muted animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-40 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: `error.tsx` 작성**

```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="container mx-auto p-4 max-w-2xl text-center space-y-4 py-20">
      <p className="text-muted-foreground">콘텐츠를 불러오는데 실패했습니다.</p>
      <button onClick={reset} className="text-sm hover:underline">
        다시 시도
      </button>
    </main>
  )
}
```

- [ ] **Step 4: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 5: dev 서버에서 확인**

홈에서 콘텐츠 카드 클릭 → 상세 페이지 이동 확인:
- 커버 이미지, 제목, metadata, 설명 표시 확인
- seed 데이터(`created_by = null`)이므로 수정/삭제 버튼이 표시되지 않아야 함

- [ ] **Step 6: 커밋**

```bash
git add "frontend/app/(main)/contents/[id]/page.tsx" "frontend/app/(main)/contents/[id]/loading.tsx" "frontend/app/(main)/contents/[id]/error.tsx"
git commit -m "feat: implement content detail page"
```

---

## Task 9: 콘텐츠 등록 페이지

**Files:**
- Create: `frontend/app/(main)/contents/new/page.tsx`

- [ ] **Step 1: `contents/new/page.tsx` 작성**

```tsx
import ContentForm from '../../_components/content-form'

export default function NewContentPage() {
  return <ContentForm />
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: dev 서버에서 확인**

홈에서 `+ 등록` 버튼 클릭 → `/contents/new` 이동:
- 유형 선택(영화/드라마/책)에 따라 metadata 필드 변경 확인
- 이미지 선택 → 업로드 → 미리보기 표시 확인
- 등록 성공 → 상세 페이지로 이동 확인
- 홈으로 돌아가면 새 콘텐츠가 목록 상단에 표시 확인

- [ ] **Step 4: 커밋**

```bash
git add "frontend/app/(main)/contents/new/page.tsx"
git commit -m "feat: implement content create page"
```

---

## Task 10: 콘텐츠 수정 페이지

**Files:**
- Create: `frontend/app/(main)/contents/[id]/edit/page.tsx`

- [ ] **Step 1: `contents/[id]/edit/page.tsx` 작성**

```tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContentForm from '../../../_components/content-form'

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: content }, { data: { user } }] = await Promise.all([
    supabase.from('contents').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!content) notFound()
  if (!user || content.created_by !== user.id) redirect(`/contents/${id}`)

  return <ContentForm content={content} />
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: dev 서버에서 확인**

1. 새 콘텐츠 등록 (본인 소유)
2. 상세 페이지에서 `수정` 버튼 클릭 → `/contents/[id]/edit` 이동
3. 기존 값이 폼에 채워져 있는지 확인
4. 수정 후 저장 → 상세 페이지로 이동, 변경 내용 반영 확인
5. `삭제` 버튼 클릭 → 홈으로 이동, 목록에서 제거 확인

- [ ] **Step 4: 커밋**

```bash
git add "frontend/app/(main)/contents/[id]/edit/page.tsx"
git commit -m "feat: implement content edit page"
```

---

## Task 11: 문서 업데이트

**Files:**
- Modify: `docs/TODO-DONE.md`
- Modify: `docs/TODO-BACKLOG.md`
- Modify: `docs/CONTEXT.md`

- [ ] **Step 1: `TODO-DONE.md`에 완료 항목 추가**

`## 2026-05-13` 섹션에 추가:
```
- [x] Content 도메인 구현 (목록/상세/등록/수정/삭제, Supabase Storage 이미지 업로드, seed 데이터)
```

- [ ] **Step 2: `TODO-BACKLOG.md`에서 Content 항목 완료 처리**

`## 콘텐츠 (Content)` 섹션 전체를 `[x]`로 변경:
```
- [x] 콘텐츠 목록 페이지 (홈) — 타입별 필터, 검색
- [x] 콘텐츠 상세 페이지 (`/contents/[id]`)
- [x] 콘텐츠 등록 페이지 (`/contents/new`) — 영화/드라마/책 구분
- [x] 콘텐츠 수정/삭제 (소유자만)
```

- [ ] **Step 3: `CONTEXT.md` 업데이트**

```markdown
# CONTEXT.md

현재 작업에 직접 필요한 정보만 저장한다. 불필요한 내용은 즉시 제거한다.

---

## 현재 상태 (2026-05-13)

**Content 도메인 구현 완료.** 다음 작업: Review 도메인 문서 작성 → 구현.

**스택:**
- Frontend: Next.js 16.2.6 (App Router, TypeScript, Tailwind v4, shadcn/ui)
- Backend: Supabase Cloud (Auth, DB, Storage, Realtime)

**환경변수 키 이름 (`frontend/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

**DB 스키마 핵심 사항:**
- `contents`: `created_by uuid` 소유권, `metadata jsonb` 타입별 구조화
- `profiles`: `is_profile_setup boolean DEFAULT false` — 미들웨어 리다이렉트 기준
- `reviews`: `UNIQUE(user_id, content_id)` — 유저당 콘텐츠 1개 리뷰
- 전 테이블 RLS 활성화

**Storage:**
- 버킷: `covers` (public)
- 경로: `covers/{user_id}/{timestamp}-{random}.{ext}`
```

- [ ] **Step 4: 커밋**

```bash
git add docs/TODO-DONE.md docs/TODO-BACKLOG.md docs/CONTEXT.md
git commit -m "docs: update content domain completion status"
```
