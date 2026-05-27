// MTH_PAGE_HEADER_BACK_NAV_V1
// A single, consistent page header for every sub-page: title, optional
// description, and a back button. Gives the teacher a predictable way to
// navigate back from any screen (e.g. a student profile back to the list).
// Pure presentation — no data, no invented state.

import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PageHeaderProps = {
  /** The page title shown in bold. */
  title: string;
  /** Optional short description under the title. */
  description?: string;
  /**
   * Where the back button goes. If a string is given, navigate to that route.
   * If omitted, navigate to the previous entry in history (navigate(-1)).
   */
  backTo?: string;
  /** Optional override for the back button label. */
  backLabel?: string;
  /** Optional actions rendered on the opposite side of the header. */
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, backTo, backLabel = "חזרה", actions }: PageHeaderProps) {
  const navigate = useNavigate();
  const goBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={goBack}
          className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={backLabel}
        >
          <ArrowRight className="h-4 w-4" />
          {backLabel}
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export default PageHeader;
