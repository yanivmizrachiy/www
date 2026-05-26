import { SafePage } from "@/components/SafePage";
import { useImportsOverview } from "@/hooks/useImports";
import { AlertCircle, FileWarning, Import, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TruthBadge } from "@/components/TruthBadge";
import { Link } from "react-router-dom";

export default function GapReport() {
  const { data, loading } = useImportsOverview();

  const missingRepos = [
    { type: "students", label: "תלמידים / משתתפים", present: !!data?.students_count },
    { type: "grades", label: "גיליון ציונים (Gradebook)", present: !!data?.grades_count },
    { type: "completion", label: "השלמת פעילות (Activity Completion)", present: !!data?.tasks_count },
    { type: "logs", label: "יומני מעקב (Logs)", present: !!data?.log_events_count },
  ];

  return (
    <SafePage 
      title="דוח פערים" 
      description="חוסרים ידועים בנתוני הקורס — מה עדיין חסר לייבוא."
    >
      <div className="max-w-3xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {missingRepos.map((repo) => (
            <Card key={repo.type} className={repo.present ? "border-status-proven/20 bg-status-proven-bg/5" : "border-status-blocked/20 bg-status-blocked-bg/5"}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-full p-2 ${repo.present ? "bg-status-proven-bg text-status-proven" : "bg-status-blocked-bg text-status-blocked"}`}>
                  {repo.present ? <CheckCircle2 className="h-5 w-5" /> : <FileWarning className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold">{repo.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {repo.present ? "נתונים קיימים" : "חסר נתונים - נדרש ייבוא"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-status-pending/30 shadow-elegant">
          <CardHeader className="bg-status-pending-bg/10 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-status-pending" />
              פערים המשפיעים על החישובים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {!data?.log_events_count && (
              <div className="rounded-lg border p-3 flex gap-3 text-sm">
                <div className="text-status-blocked shrink-0"><Import className="h-5 w-5" /></div>
                <div>
                  <div className="font-bold">חישוב זמן תרגול חסום</div>
                  <p className="text-muted-foreground mt-1 text-xs">לא הועלה דוח לוגים. ללא לוגים לא ניתן לחשב זמני שהייה ופעילות יומיים.</p>
                  <Link to="/import" className="text-primary hover:underline font-bold text-[10px] mt-2 block">עבור לייבוא לוגים</Link>
                </div>
              </div>
            )}

            {!data?.tasks_count && (
              <div className="rounded-lg border p-3 flex gap-3 text-sm">
                <div className="text-status-blocked shrink-0"><Import className="h-5 w-5" /></div>
                <div>
                  <div className="font-bold">השלמת משימות ופרקים חסר</div>
                  <p className="text-muted-foreground mt-1 text-xs">לא הועלה דוח השלמת פעילות. לא ניתן להציג את אחוז ההשלמה של התלמידים.</p>
                  <Link to="/import" className="text-primary hover:underline font-bold text-[10px] mt-2 block">עבור לייבוא השלמת פעילות</Link>
                </div>
              </div>
            )}

            {data?.students_count === 0 && (
              <div className="rounded-lg border p-3 flex gap-3 text-sm">
                <div className="text-status-blocked shrink-0"><Import className="h-5 w-5" /></div>
                <div>
                  <div className="font-bold">מידע על תלמידים מצומצם</div>
                  <p className="text-muted-foreground mt-1 text-xs">לא יובאו תלמידים. החיבור נעשה על סמך מזהים בלבד ללא שמות מלאים או דוא"ל.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <TruthBadge status="missing" />
        </div>
      </div>
    </SafePage>
  );
}

