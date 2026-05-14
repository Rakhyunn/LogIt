import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileEditForm } from '../_components/profile-edit-form'

interface ProfileEditPageProps {
  params: Promise<{ username: string }>
}

export default async function ProfileEditPage({ params }: ProfileEditPageProps) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile || profile.id !== user.id) {
    redirect(`/profile/${username}`)
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">프로필 수정</h1>
        <p className="text-sm text-muted-foreground">
          username과 자기소개를 수정할 수 있습니다.
        </p>
      </div>
      <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/40">
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  )
}
