export interface SafeSectionSkeletonProps {
  title?: string;
  rows?: number;
  className?: string;
}

export function SafeSectionSkeleton({
  title = "Loading",
  rows = 4,
  className = "",
}: SafeSectionSkeletonProps) {
  return (
    <section
      className={[
        "w-full rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950/70",
        className,
      ].join(" ")}
      aria-label={title}
    >
      <div className="mb-5 h-5 w-44 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

      <div className="space-y-3">
        {Array.from({ length: Math.max(1, rows) }).map((_, index) => (
          <div
            key={index}
            className="h-14 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
          />
        ))}
      </div>
    </section>
  );
}

export default SafeSectionSkeleton;
