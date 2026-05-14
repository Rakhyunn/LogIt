'use client'

import { signOut } from '@/actions/auth'

async function handleSignOut() {
  await signOut()
}

export function SignOutButton() {
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
