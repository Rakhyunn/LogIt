'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ProfileTabsProps {
  username: string
}

const TABS = [
  { key: 'reviews', label: '리뷰' },
  { key: 'bookmarks', label: '북마크' },
] as const

export function ProfileTabs({ username }: ProfileTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'reviews'

  return (
    <div className="flex gap-6 border-b">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => router.push(`/profile/${username}?tab=${key}`)}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === key
              ? 'border-b-2 border-foreground text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
