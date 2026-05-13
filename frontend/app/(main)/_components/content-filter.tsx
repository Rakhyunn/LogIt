'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TYPES = [
  { value: '', label: '전체' },
  { value: 'movie', label: '영화' },
  { value: 'drama', label: '드라마' },
  { value: 'book', label: '책' },
]

export default function ContentFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const currentType = searchParams.get('type') ?? ''

  function setType(type: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (type) params.set('type', type)
    else params.delete('type')
    params.delete('q')
    startTransition(() => router.push(`/?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) params.set('q', search)
    else params.delete('q')
    startTransition(() => router.push(`/?${params.toString()}`))
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="콘텐츠 검색..."
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          검색
        </Button>
      </form>
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(({ value, label }) => (
          <Button
            key={value}
            variant={currentType === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType(value)}
            disabled={isPending}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
