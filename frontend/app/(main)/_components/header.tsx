import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SignOutButton } from './sign-out-button'
import { Avatar } from './avatar'

export async function Header() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_profile_setup, avatar_url, avatar_position')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_profile_setup) return null

  const position = (profile.avatar_position as { x: number; y: number } | null) ?? { x: 50, y: 50 }

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          LogIt
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/contents/new"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            + 등록
          </Link>
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
          >
            <Avatar
              avatarUrl={profile.avatar_url}
              position={position}
              size="sm"
              username={profile.username}
            />
            {profile.username}
          </Link>
          <SignOutButton />
        </div>
      </nav>
    </header>
  )
}
