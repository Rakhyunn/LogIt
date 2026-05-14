'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { addBookmark, removeBookmark } from '@/actions/bookmarks'

interface BookmarkButtonProps {
  contentId: string
  initialBookmarked: boolean
  isLoggedIn: boolean
}

export function BookmarkButton({
  contentId,
  initialBookmarked,
  isLoggedIn,
}: BookmarkButtonProps) {
  const router = useRouter()
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(initialBookmarked)
  const [, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    startTransition(async () => {
      setOptimisticBookmarked(!optimisticBookmarked)
      if (optimisticBookmarked) {
        await removeBookmark(contentId)
      } else {
        await addBookmark(contentId)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-background"
      aria-label={optimisticBookmarked ? '북마크 제거' : '북마크 추가'}
    >
      <Bookmark
        className={`h-4 w-4 ${
          optimisticBookmarked ? 'fill-current text-primary' : 'text-muted-foreground'
        }`}
      />
    </button>
  )
}
