import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DomainStatus } from "@/hooks/useLtiSession";

const statusLabel: Record<DomainStatus, string> = {
  proven: "מחובר",
  missing: "לא מחובר",
  blocked: "חסום",
};

interface StatusBadgeProps {
  status: DomainStatus;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, className, size = "md" }: StatusBadgeProps) {
  const Icon = status === "proven" ? CheckCircle2 : status === "missing" ? AlertCircle : XCircle;
  const styles =
    status === "proven"
      ? "bg-status-proven-bg text-status-proven"
      : status === "missing"
        ? "bg-status-missing-bg text-status-missing"
        : "bg-status-blocked-bg text-status-blocked";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        styles,
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label ?? statusLabel[status]}
    </span>
  );
}
