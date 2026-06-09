export function SnippetCardSkeleton() {
  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden animate-pulse">
      <div className="p-5 border-b border-dark-700">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-16 bg-dark-700 rounded" />
          <div className="h-5 w-14 bg-dark-700 rounded" />
        </div>
        <div className="h-6 bg-dark-700 rounded mb-3 w-4/5" />
        <div className="h-4 bg-dark-700 rounded mb-4 w-full" />
        <div className="bg-dark-950 rounded-lg p-3 space-y-2">
          <div className="h-3 bg-dark-800 rounded w-3/4" />
          <div className="h-3 bg-dark-800 rounded w-full" />
          <div className="h-3 bg-dark-800 rounded w-1/2" />
          <div className="h-3 bg-dark-800 rounded w-2/3" />
          <div className="h-3 bg-dark-800 rounded w-1/3" />
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-dark-700" />
          <div className="h-4 w-16 bg-dark-700 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-8 bg-dark-700 rounded" />
          <div className="h-4 w-8 bg-dark-700 rounded" />
          <div className="h-4 w-12 bg-dark-700 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SnippetGridSkeleton({ count = 9 }: { count?: number }) {
  const columns: React.ReactNode[][] = [[], [], []]
  for (let i = 0; i < count; i++) {
    columns[i % 3].push(<SnippetCardSkeleton key={i} />)
  }
  return (
    <div className="flex gap-6">
      {columns.map((col, ci) => (
        <div key={ci} className="flex-1 flex flex-col gap-6">
          {col}
        </div>
      ))}
    </div>
  )
}

export function HomeHeaderSkeleton() {
  return (
    <div className="animate-pulse mb-8">
      <div className="h-9 bg-dark-700 rounded w-1/3 mx-auto mb-4" />
      <div className="h-5 bg-dark-700 rounded w-1/2 mx-auto mb-8" />
      <div className="h-14 bg-dark-800 rounded-xl max-w-2xl mx-auto mb-4" />
      <div className="h-16 bg-dark-800/50 rounded-xl mb-4" />
      <div className="h-14 bg-dark-800/30 rounded-xl" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse mb-8 p-10 bg-dark-800/50 border border-dark-700 rounded-3xl">
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 rounded-2xl bg-dark-700" />
        <div className="flex-1 space-y-4">
          <div className="h-10 bg-dark-700 rounded w-1/4" />
          <div className="h-5 bg-dark-700 rounded w-1/2" />
          <div className="h-4 bg-dark-700 rounded w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="p-5 bg-dark-900/60 rounded-2xl">
          <div className="h-9 w-8 bg-dark-700 rounded mb-2" />
          <div className="h-4 w-16 bg-dark-700 rounded" />
        </div>
        <div className="p-5 bg-dark-900/60 rounded-2xl">
          <div className="h-9 w-8 bg-dark-700 rounded mb-2" />
          <div className="h-4 w-16 bg-dark-700 rounded" />
        </div>
        <div className="p-5 bg-dark-900/60 rounded-2xl">
          <div className="h-9 w-8 bg-dark-700 rounded mb-2" />
          <div className="h-4 w-16 bg-dark-700 rounded" />
        </div>
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="p-8 bg-dark-800/50 border border-dark-700 rounded-2xl space-y-6">
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-20 bg-dark-700 rounded" />
            <div className="h-5 w-16 bg-dark-700 rounded" />
          </div>
          <div className="h-9 bg-dark-700 rounded w-4/5" />
          <div className="h-5 bg-dark-700 rounded w-2/3" />
          <div className="h-96 bg-dark-950 rounded-2xl" />
        </div>
      </div>
      <div>
        <div className="p-6 bg-dark-800/50 border border-dark-700 rounded-2xl h-48" />
      </div>
    </div>
  )
}
