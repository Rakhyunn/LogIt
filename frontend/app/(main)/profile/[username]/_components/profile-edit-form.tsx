'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { checkUsername, updateProfile } from '@/actions/user'
import { type Database } from '@/types/database'

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
