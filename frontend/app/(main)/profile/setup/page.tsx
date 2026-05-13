'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setupProfile } from '@/actions/auth'

export default function ProfileSetupPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    const username = (formData.get('username') as string).trim()

    if (username.length < 2) {
      setError('username은 2자 이상이어야 합니다.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('username은 영문, 숫자, 밑줄(_)만 사용 가능합니다.')
      return
    }

    setPending(true)
    setError(null)
    const result = await setupProfile(formData)
    if (!result.success) {
      setError(result.message)
      setPending(false)
    } else {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">프로필 설정</h1>
          <p className="text-sm text-muted-foreground">
            사용할 username을 설정해 주세요. 나중에 변경할 수 있습니다.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="my_username"
              minLength={2}
              maxLength={30}
              required
            />
            <p className="text-xs text-muted-foreground">영문, 숫자, 밑줄(_) 사용 가능 (2~30자)</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '저장 중...' : '시작하기'}
          </Button>
        </form>
      </div>
    </div>
  )
}
