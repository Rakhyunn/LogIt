import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { type Database } from '@/types/database'
import { cn } from '@/lib/utils'
import { FollowButton } from '../../../_components/follow-button'
import { Avatar } from '../../../_components/avatar'

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
  const position = (profile.avatar_position as { x: number; y: number } | null) ?? { x: 50, y: 50 }

  return (
    <div className="flex items-start justify-between pb-2">
      <div className="flex items-start gap-4">
        <Avatar
          avatarUrl={profile.avatar_url}
          position={position}
          size="lg"
          username={profile.username}
        />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">@{profile.username}</h1>
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
