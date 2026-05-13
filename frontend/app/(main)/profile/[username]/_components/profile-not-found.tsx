'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileNotFoundProps {
  username: string
}

export function ProfileNotFound({ username }: ProfileNotFoundProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.back(), 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">
        @{username} 유저를 찾을 수 없습니다. 이전 페이지로 돌아갑니다...
      </p>
    </div>
  )
}
