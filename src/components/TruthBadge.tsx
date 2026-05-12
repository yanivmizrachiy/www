import { CheckCircle2, CircleHelp, Sigma, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type TruthStatus = "proven" | "missing" | "calculated" | "blocked";

const labels: Record<TruthStatus, string> = {
  proven: "נתון אמיתי",
  missing: "חסר נתון",
  calculated: "מחושב מלוגים",
  blocked: "חסום",
};

const styles: Record<TruthStatus, string> = {
  proven: "bg-status-proven-bg text-status-proven",
  missing: "bg-status-missing-bg text-status-missing",
  calculated: "bg-accent text-accent-foreground",
  blocked: "bg-status-blocked-bg text-status-blocked",
};

const icons = {
  proven: CheckCircle2,
  missing: CircleHelp,
  calculated: Sigma,
  blocked: TriangleAlert,
};

export function TruthBadge({ status, label, className }: { status: TruthStatus; label?: string; className?: string }) {
  const Icon = icons[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", styles[status], className)}>
      <Icon className="h-3.5 w-3.5" />
      {label ?? labels[status]}
    </span>
  );
}
