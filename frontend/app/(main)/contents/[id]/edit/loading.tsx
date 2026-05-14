export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="h-8 w-36 bg-muted rounded animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
    </div>
  )
}
