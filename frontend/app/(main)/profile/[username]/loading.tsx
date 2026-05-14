export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      {/* 프로필 헤더 스켈레톤 */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-36 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-6 border-b pb-2">
        <div className="h-5 w-10 bg-muted rounded animate-pulse" />
        <div className="h-5 w-14 bg-muted rounded animate-pulse" />
      </div>

      {/* 콘텐츠 목록 스켈레톤 */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
