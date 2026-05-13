'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithEmail } from '@/actions/auth'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setPending(true)
    setError(null)
    const result = await signUpWithEmail(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    } else {
      setPending(false)
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4 p-6 text-center">
          <h1 className="text-2xl font-bold">이메일을 확인해 주세요</h1>
          <p className="text-muted-foreground">
            가입하신 이메일로 인증 링크를 발송했습니다.
            이메일을 확인한 후 로그인해 주세요.
          </p>
          <Link href="/login" className="text-sm hover:underline">
            로그인으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">회원가입</h1>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">비밀번호 확인</Label>
            <Input id="confirm" name="confirm" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '가입하기'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
