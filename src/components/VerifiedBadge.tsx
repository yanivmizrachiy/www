import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeStatus = "proven" | "calculated" | "imported" | "missing" | "blocked";

interface VerifiedBadgeProps {
  status: BadgeStatus;
  className?: string;
  showLabel?: boolean;
}

export function VerifiedBadge({ status, className, showLabel = true }: VerifiedBadgeProps) {
  const config = {
    proven: {
      icon: ShieldCheck,
      text: "נתונים קיימים",
      color: "text-status-proven bg-status-proven-bg border-status-proven/20",
    },
    calculated: {
      icon: ShieldCheck,
      text: "מחושב מלוגים",
      color: "text-status-active bg-status-active-bg border-status-active/20",
    },
    imported: {
      icon: ShieldAlert,
      text: "יובא ידנית",
      color: "text-status-pending bg-status-pending-bg border-status-pending/20",
    },
    missing: {
      icon: ShieldX,
      text: "חסר בנתונים",
      color: "text-status-blocked bg-status-blocked-bg border-status-blocked/20",
    },
    blocked: {
      icon: ShieldX,
      text: "חסום",
      color: "text-status-blocked bg-status-blocked-bg border-status-blocked/20",
    },
  };

  const { icon: Icon, text, color } = config[status];

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
      color,
      className
    )}>
      <Icon className="h-3 w-3" />
      {showLabel && <span>{text}</span>}
    </div>
  );
}
