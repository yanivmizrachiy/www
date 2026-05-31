import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EmptyTruth({children="אין עדיין נתונים להצגה. פתח את הכלי מתוך Moodle או ייבא דוח."}:{children?:string}) {
  return <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{children}</div>;
}

// MTH_SAFEPAGE_BACK_NAV_V1
// Optional back button: pass backTo="/route" to navigate to a specific page,
// or backTo="-1" (or omit and set showBack) to go to the previous page.
function BackButton({ backTo, label = "חזרה" }: { backTo?: string; label?: string }) {
  const navigate = useNavigate();
  const go = () => { if (backTo && backTo !== "-1") navigate(backTo); else navigate(-1); };
  return (
    <button type="button" onClick={go} aria-label={label}
      className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
      <ArrowRight className="h-4 w-4" />{label}
    </button>
  );
}

export function SafePage({title, description, children, backTo, backLabel}:{title:string; description:string; children?:React.ReactNode; backTo?:string; backLabel?:string}) {
  return <section className="space-y-5" dir="rtl">{backTo !== undefined && <BackButton backTo={backTo} label={backLabel} />}<section style={{ background: "linear-gradient(135deg, #06152f 0%, #0b3d91 50%, #0e7490 100%)", color: "white", padding: "28px 32px", borderRadius: "1.5rem", boxShadow: "0 20px 60px rgba(6, 21, 47, 0.25)" }}><h1 style={{ fontSize: "32px", fontWeight: 900, margin: 0, marginBottom: "6px", lineHeight: 1.1 }}>{title}</h1><p style={{ fontSize: "14px", opacity: 0.9, margin: 0 }}>{description}</p></section><Card><CardContent className="pt-6">{children ?? <EmptyTruth />}</CardContent></Card></section>;
}
