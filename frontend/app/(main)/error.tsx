'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground">페이지를 불러오는데 실패했습니다.</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>다시 시도</Button>
        <Link href="/" className={buttonVariants({ variant: 'ghost' })}>홈으로</Link>
      </div>
    </main>
  )
}
