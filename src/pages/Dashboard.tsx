import { Link } from "react-router-dom";
import { useImportsOverview } from "@/hooks/useImports";
import { useLtiSession } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function stat(label:string, value: number | string | null | undefined) { return <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{value ?? "—"}</CardContent></Card>; }
export default function Dashboard() {
  const { session, site } = useLtiSession();
  const { data, loading, error } = useImportsOverview();
  const v = (n: number | undefined) => session && data ? n ?? 0 : "—";
  return <section className="space-y-6" dir="rtl"><div className="rounded-2xl bg-gradient-hero p-6 shadow-elegant"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">מרכז המורה</h1><p className="text-muted-foreground">{session?.course_title ?? site?.site_name ?? "ממתין ל־LTI launch מתוך Moodle"}</p></div><StatusBadge status={session ? "proven" : "missing"} /></div></div>{error && <div className="rounded-lg border border-status-blocked/30 bg-status-blocked-bg p-3 text-sm text-status-blocked">{error}</div>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stat("תלמידים", v(data?.students_count))}{stat("פריטי ציון", v(data?.grade_items_count))}{stat("ציונים שנקלטו", v(data?.grades_count))}{stat("פרקים", v(data?.chapters_count))}{stat("משימות", v(data?.tasks_count))}{stat("אירועי לוג", v(data?.log_events_count))}</div><div className="flex flex-wrap gap-2"><Button asChild><Link to="/import">ייבוא נתונים</Link></Button><Button asChild variant="outline"><Link to="/students">תלמידים</Link></Button><Button asChild variant="outline"><Link to="/reports">דוחות</Link></Button></div>{loading && <p className="text-sm text-muted-foreground">טוען נתוני אמת...</p>}</section>;
}
