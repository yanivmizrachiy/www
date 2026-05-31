export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
      <div className="h-4 bg-slate-200 rounded-full w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`h-3 bg-slate-100 rounded-full ${i % 2 === 0 ? "w-1/2" : "w-2/3"}`} />
      ))}
    </div>
  );
}
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-slate-200 rounded-full w-1/2" />
            <div className="h-3 bg-slate-100 rounded-full w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function SkeletonStat() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="h-3 bg-slate-200 rounded-full w-1/2 mb-3" />
      <div className="h-8 bg-slate-200 rounded-full w-1/3" />
    </div>
  );
}
