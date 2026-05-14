import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { type Database } from '@/types/database'
import { cn } from '@/lib/utils'
import { FollowButton } from '../../../_components/follow-button'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileHeaderProps {
  profile: Profile
  isOwner: boolean
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isLoggedIn: boolean
}

export function ProfileHeader({
  profile,
  isOwner,
  followerCount,
  followingCount,
  isFollowing,
  isLoggedIn,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">@{profile.username}</h1>
        {profile.bio && (
          <p className="text-muted-foreground">{profile.bio}</p>
        )}
        <p className="text-sm text-muted-foreground">
          가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}
        </p>
        <p className="text-sm text-muted-foreground">
          팔로워 {followerCount} · 팔로잉 {followingCount}
        </p>
      </div>
      <div>
        {isOwner ? (
          <Link
            href={`/profile/${profile.username}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            프로필 수정
          </Link>
        ) : (
          <FollowButton
            targetUserId={profile.id}
            initialFollowing={isFollowing}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>
    </div>
  )
}
