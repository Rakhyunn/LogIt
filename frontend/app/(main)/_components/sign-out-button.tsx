'use client'

import { signOut } from '@/actions/auth'

export function SignOutButton() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form action={signOut as any}>
      <button
        type="submit"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        로그아웃
      </button>
    </form>
  )
}
