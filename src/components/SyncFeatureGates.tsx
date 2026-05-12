import { Link } from "react-router-dom";
import { Clock, GraduationCap, ListChecks, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SyncStatus } from "@/hooks/useSyncStatus";

const gates = [
  ["participants", "משתתפים", "/students", "נדרש דוח Participants ממודל", Users],
  ["tasks", "פרקים ומשימות", "/tasks", "נדרש דוח Activity Completion / מבנה קורס", ListChecks],
  ["grades", "ציונים", "/grades", "נדרש דוח Gradebook ממודל", GraduationCap],
  ["logs", "זמנים ולוגים", "/activity", "נדרש דוח Logs ממודל", Clock],
] as const;

export default function SyncFeatureGates({ status, loading }: { status: SyncStatus | null; loading: boolean }) {
  return (
    <section dir="rtl" className="rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-elegant">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-primary">שערי יכולות אמת</h2>
          <p className="mt-1 text-xs text-muted-foreground">כל כפתור נפתח לפי נתונים אמיתיים בלבד. אין דמו ואין הצלחה מזויפת.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{loading ? "בודק..." : "בדיקת יכולות"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {gates.map(([key, title, href, missing, Icon]) => {
          const available = status?.capabilities?.[key] === "available";
          return (
            <Card key={key} className={available ? "border-status-proven/30 bg-status-proven-bg/10" : "border-status-missing/30 bg-status-missing-bg/10"}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5" />{title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={available ? "text-sm font-bold text-status-proven" : "text-sm font-bold text-status-missing"}>
                  {available ? "זמין מנתוני אמת" : "חסר מקור נתונים"}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{available ? "אפשר לפתוח ולעבוד עם הנתונים שנקלטו." : missing}</p>
                <Button asChild variant={available ? "default" : "outline"} className="w-full">
                  <Link to={available ? href : "/missing-data"}>{available ? "פתח" : "מה חסר?"}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
