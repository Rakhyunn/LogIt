'use client'

import Link from 'next/link'
import Image from 'next/image'
import { type Database } from '@/types/database'

type Content = Database['public']['Tables']['contents']['Row']

const TYPE_LABEL: Record<string, string> = {
  movie: '영화',
  drama: '드라마',
  book: '책',
}

export default function ContentCard({
  content,
  bookmarkSlot,
}: {
  content: Content
  bookmarkSlot?: React.ReactNode
}) {
  return (
    <div className="relative">
      <Link
        href={`/contents/${content.id}`}
        className="group block rounded-lg border hover:border-primary transition-colors overflow-hidden"
      >
        <div className="relative w-full aspect-[2/3] bg-muted">
          {content.cover_image_url ? (
            <Image
              src={content.cover_image_url}
              alt={content.title}
              fill
              className="object-cover group-hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
              이미지 없음
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <span className="text-xs text-muted-foreground">
            {TYPE_LABEL[content.type]}
          </span>
          <h3 className="font-medium text-sm leading-snug line-clamp-2">
            {content.title}
          </h3>
        </div>
      </Link>
      {bookmarkSlot && (
        <div className="absolute top-2 right-2 z-10">
          {bookmarkSlot}
        </div>
      )}
    </div>
  )
}
