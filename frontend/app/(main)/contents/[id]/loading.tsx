export default function Loading() {
  return (
    <main className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      <div className="flex gap-6">
        <div className="w-32 h-44 flex-shrink-0 rounded border bg-muted animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-40 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
