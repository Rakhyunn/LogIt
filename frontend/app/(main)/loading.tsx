export default function Loading() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-80 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-lg border overflow-hidden">
            <div className="aspect-[2/3] bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-10 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
