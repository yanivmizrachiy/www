import type { ReactNode } from "react";

export interface SafeEmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SafeEmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: SafeEmptyStateProps) {
  return (
    <section
      className={[
        "w-full rounded-3xl border border-slate-200 bg-white/90 p-6 text-right shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950/70",
        className,
      ].join(" ")}
      dir="rtl"
    >
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">{title}</h2>

          {description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}

          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}

export default SafeEmptyState;
