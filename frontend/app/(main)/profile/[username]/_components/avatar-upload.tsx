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
