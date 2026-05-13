'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/actions/auth'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
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
    const result = await updatePassword(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">새 비밀번호 설정</h1>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">새 비밀번호</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">비밀번호 확인</Label>
            <Input id="confirm" name="confirm" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '처리 중...' : '비밀번호 변경'}
          </Button>
        </form>
      </div>
    </div>
  )
}
