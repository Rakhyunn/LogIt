export default function Loading() {
  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8">
      <div className="space-y-2">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="h-4 w-56 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-10 bg-muted rounded animate-pulse" />
    </div>
  )
}
