import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from './_components/profile-header'
import { ProfileTabs } from './_components/profile-tabs'
import { ReviewsTab } from './_components/reviews-tab'
import { BookmarksTab } from './_components/bookmarks-tab'
import { ProfileNotFound } from './_components/profile-not-found'

interface ProfilePageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params
  const { tab = 'reviews' } = await searchParams

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return <ProfileNotFound username={username} />
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id
  const activeTab = !isOwner && tab === 'bookmarks' ? 'reviews' : tab

  const [{ count: followerCount }, { count: followingCount }, followingRow] =
    await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id),
      user
        ? supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ])

  const isFollowing = !!followingRow.data
  const isLoggedIn = !!user

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        isFollowing={isFollowing}
        isLoggedIn={isLoggedIn}
      />
      <div className="space-y-4">
        <Suspense fallback={<div className="h-10 border-b" />}>
          <ProfileTabs username={username} isOwner={isOwner} />
        </Suspense>
        <Suspense
          fallback={
            <p className="py-8 text-center text-sm text-muted-foreground">
              로딩 중...
            </p>
          }
        >
          {activeTab === 'bookmarks' ? (
            <BookmarksTab userId={profile.id} />
          ) : (
            <ReviewsTab userId={profile.id} />
          )}
        </Suspense>
      </div>
    </div>
  )
}
