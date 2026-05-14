'use client'

import { signOut } from '@/actions/auth'

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        로그아웃
      </button>
    </form>
  )
}
