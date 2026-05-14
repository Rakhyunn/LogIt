'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="mx-auto max-w-2xl min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground">프로필을 불러오는데 실패했습니다.</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>다시 시도</Button>
        <Button asChild variant="ghost">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </main>
  )
}
