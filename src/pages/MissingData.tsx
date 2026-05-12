import { Link } from "react-router-dom";
import { AlertCircle, FileUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSyncStatus, type SyncStatus } from "@/hooks/useSyncStatus";

const gateInfo: Record<keyof SyncStatus["capabilities"], { title: string; report: string; why: string }> = {
  participants: {
    title: "משתתפים",
    report: "Participants / משתתפים",
    why: "בלי דוח משתתפים אי אפשר להציג רשימת תלמידים אמיתית.",
  },
  tasks: {
    title: "פרקים ומשימות",
    report: "Activity Completion או מבנה קורס",
    why: "בלי דוח משימות אי אפשר לבנות תפריטי פרקים ומשימות אמיתיים.",
  },
  grades: {
    title: "ציונים",
    report: "Gradebook / גיליון ציונים",
    why: "בלי Gradebook אי אפשר להציג ציונים, ממוצעים ודוחות ציונים.",
  },
  logs: {
    title: "זמנים ולוגים",
    report: "Logs / לוגים",
    why: "בלי לוגים אי אפשר לחשב זמן תרגול אמיתי.",
  },
};

function isAvailable(value: string | undefined) {
  return value === "available";
}

export default function MissingData() {
  const sync = useSyncStatus();
  const status = sync.data;
  const keys = Object.keys(gateInfo) as Array<keyof SyncStatus["capabilities"]>;

  return (
    <div dir="rtl" className="space-y-6">
      <section className="rounded-3xl bg-gradient-hero p-8 text-white shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">מה חסר כדי להמשיך?</h1>
            <p className="mt-2 text-sm text-white/75">
              הדף הזה לא מציג דמו. הוא בודק אילו מקורות אמת חסרים ומכוון את המורה לדוח Moodle הנכון.
            </p>
          </div>
          <Button onClick={() => void sync.runSync()} disabled={sync.running} className="bg-white text-primary hover:bg-white/90">
            <RefreshCw className={sync.running ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            בדוק שוב
          </Button>
        </div>
      </section>

      {sync.error && (
        <div className="rounded-xl border border-status-missing/30 bg-status-missing-bg/10 p-4 text-status-missing">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-5 w-5" />
            בדיקת החוסרים לא הצליחה
          </div>
          <p className="mt-1 text-sm">{sync.error}</p>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {keys.map((key) => {
          const info = gateInfo[key];
          const available = isAvailable(status?.capabilities?.[key]);
          return (
            <Card key={key} className={available ? "border-status-proven/30 bg-status-proven-bg/10" : "border-status-missing/30 bg-status-missing-bg/10"}>
              <CardHeader>
                <CardTitle>{info.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={available ? "font-bold text-status-proven" : "font-bold text-status-missing"}>
                  {available ? "קיים מקור אמת" : "חסר מקור אמת"}
                </div>
                <p className="text-sm text-muted-foreground">{available ? "הנתונים כבר קיימים ואפשר לעבוד איתם במסכים הרלוונטיים." : info.why}</p>
                <div className="rounded-xl bg-background/70 p-3 text-sm">
                  <span className="font-bold">הדוח הדרוש: </span>{info.report}
                </div>
                <Button asChild variant={available ? "default" : "outline"} className="w-full">
                  <Link to={available ? "/" : "/import"}>
                    {available ? "חזור לדשבורד" : "עבור לייבוא דוח"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <div className="font-extrabold text-primary">עיקרון עבודה</div>
            <p className="text-sm text-muted-foreground">
              המורה עושה מינימום: פתיחה מתוך Moodle, לחיצה על סנכרן מרחב, ורק אם חסר מקור אמת — ייבוא דוח אחד שהמערכת מבקשת.
            </p>
          </div>
          <Button asChild>
            <Link to="/import">
              <FileUp className="h-4 w-4" />
              ייבוא דוח Moodle
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
