'use client'

import { signOut } from '@/actions/auth'

export function SignOutButton() {
  return (
    <form action={async () => { await signOut() }}>
      <button
        type="submit"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        로그아웃
      </button>
    </form>
  )
}
