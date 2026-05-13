import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { type Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileHeaderProps {
  profile: Profile
  isOwner: boolean
}

export function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
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
      </div>
      {isOwner && (
        <Button asChild variant="outline" size="sm">
          <Link href={`/profile/${profile.username}/edit`}>프로필 수정</Link>
        </Button>
      )}
    </div>
  )
}
