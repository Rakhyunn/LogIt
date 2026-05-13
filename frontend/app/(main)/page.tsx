'use client'
import { signOut } from '@/actions/auth'

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">콘텐츠 리뷰 플랫폼</h1>
      <form action={async () => { await signOut() }}>
        <button type="submit" className="text-sm text-red-500 hover:underline">
          로그아웃 (임시)
        </button>
      </form>
    </main>
  )
}
