'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { followUser, unfollowUser } from '@/actions/user'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  isLoggedIn: boolean
}

export function FollowButton({
  targetUserId,
  initialFollowing,
  isLoggedIn,
}: FollowButtonProps) {
  const router = useRouter()
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing)
      const result = optimisticFollowing
        ? await unfollowUser(targetUserId)
        : await followUser(targetUserId)
      if (!result.success) {
        router.refresh()
      }
    })
  }

  return (
    <Button
      type="button"
      variant={optimisticFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {optimisticFollowing ? '팔로잉' : '팔로우'}
    </Button>
  )
}
