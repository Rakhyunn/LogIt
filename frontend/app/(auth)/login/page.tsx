'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail, signInWithGoogle } from '@/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleEmailSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await signInWithEmail(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    }
  }

  async function handleGoogle() {
    setPending(true)
    setError(null)
    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.message)
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">로그인</h1>

        <form action={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '로그인'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={pending}>
          Google로 로그인
        </Button>

        <div className="text-center text-sm space-y-1">
          <Link href="/forgot-password" className="text-muted-foreground hover:underline block">
            비밀번호를 잊으셨나요?
          </Link>
          <Link href="/signup" className="text-muted-foreground hover:underline block">
            계정이 없으신가요? 회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}
