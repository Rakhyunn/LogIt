'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendPasswordResetEmail } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await sendPasswordResetEmail(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4 p-6 text-center">
          <h1 className="text-2xl font-bold">이메일을 확인해 주세요</h1>
          <p className="text-muted-foreground">
            비밀번호 재설정 링크를 발송했습니다.
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
        <h1 className="text-2xl font-bold text-center">비밀번호 재설정</h1>
        <p className="text-sm text-muted-foreground text-center">
          가입한 이메일을 입력하면 재설정 링크를 보내드립니다.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '재설정 링크 보내기'}
          </Button>
        </form>

        <p className="text-center text-sm">
          <Link href="/login" className="text-muted-foreground hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
