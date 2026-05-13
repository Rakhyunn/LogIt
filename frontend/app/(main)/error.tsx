'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="container mx-auto p-4 text-center space-y-4 py-20">
      <p className="text-muted-foreground">콘텐츠를 불러오는데 실패했습니다.</p>
      <button onClick={reset} className="text-sm hover:underline">
        다시 시도
      </button>
    </main>
  )
}
