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
      // 성공 시 updateContent 내부에서 redirect
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
