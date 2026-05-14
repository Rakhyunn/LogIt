import Image from 'next/image'
import { UserCircle } from 'lucide-react'

interface AvatarProps {
  avatarUrl: string | null
  position?: { x: number; y: number }
  size?: 'sm' | 'md' | 'lg'
  username: string
}

const SIZE_MAP = {
  sm: { px: 24, cls: 'h-6 w-6' },
  md: { px: 32, cls: 'h-8 w-8' },
  lg: { px: 64, cls: 'h-16 w-16' },
}

export function Avatar({
  avatarUrl,
  position = { x: 50, y: 50 },
  size = 'md',
  username,
}: AvatarProps) {
  const { px, cls } = SIZE_MAP[size]

  if (!avatarUrl) {
    return <UserCircle className={cls} />
  }

  return (
    <div className={`${cls} rounded-full overflow-hidden flex-shrink-0 relative`}>
      <Image
        src={avatarUrl}
        alt={`@${username}`}
        width={px}
        height={px}
        className="h-full w-full object-cover"
        style={{ objectPosition: `${position.x}% ${position.y}%` }}
      />
    </div>
  )
}
