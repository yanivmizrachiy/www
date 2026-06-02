import { TableCell, TableRow } from "@/components/ui/table";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

interface SkeletonListProps {
  rows?: number;
  className?: string;
}

export function SkeletonList({ rows = 5, className = "" }: SkeletonListProps) {
  return (
    <ul className={`space-y-2 ${className}`} dir="rtl" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="rounded-2xl border bg-white p-3 shadow-sm">
          <Skeleton className="mb-2 h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </li>
      ))}
    </ul>
  );
}

interface SkeletonTableRowsProps {
  rows?: number;
  columns: number;
}

export function SkeletonTableRows({ rows = 6, columns }: SkeletonTableRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} aria-hidden="true">
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c} className={c === 0 ? "text-right" : "text-center"}>
              <Skeleton className={c === 0 ? "h-4 w-32" : "mx-auto h-4 w-10"} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
