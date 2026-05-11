import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileQuestion,
  ListChecks,
  Loader2,
  RefreshCcw,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isCapabilityReady, useSyncStatus, type SyncCapability } from "@/hooks/useSyncStatus";

const iconMap: Record<string, typeof Users> = {
  "סנכרן מרחב": RefreshCcw,
  "משימות": ListChecks,
  "משתתפים": Users,
  "ציונים": BarChart3,
  "זמנים": Clock3,
  "דוחות": FileQuestion,
  "ייצוא": Download,
  "מה חסר?": AlertTriangle,
};

function statusLabel(capability?: SyncCapability) {
  if (!capability) return "לא נבדק";
  switch (capability.status) {
    case "automatic":
      return "אוטומטי";
    case "available_from_import":
      return "זמין מנתוני אמת";
    case "missing_required_report":
      return "חסר דוח";
    case "blocked_no_permission":
      return "חסום הרשאה";
    case "not_implemented_yet":
      return "מתוכנן";
    default:
      return "לא נבדק";
  }
}

function statusClass(capability?: SyncCapability) {
  if (!capability) return "border-slate-200 bg-slate-50 text-slate-600";
  if (capability.status === "automatic") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (capability.status === "available_from_import") return "border-blue-200 bg-blue-50 text-blue-700";
  if (capability.status === "missing_required_report") return "border-amber-200 bg-amber-50 text-amber-700";
  if (capability.status === "blocked_no_permission") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function AutomationCommandCenter() {
  const { data, loading, refreshing, error, refresh } = useSyncStatus();

  const missing = data
    ? Object.entries(data.capabilities)
        .filter(([, capability]) => !isCapabilityReady(capability))
        .slice(0, 4)
    : [];

  return (
    <section className="space-y-5" dir="rtl">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-extrabold">
                <Sparkles className="h-6 w-6 text-cyan-300" />
                מרכז סנכרון חכם
              </CardTitle>
              <p className="mt-2 text-sm text-white/70">
                המורה עושה מינימום. המערכת בודקת אוטומטית מה זמין באמת ומה חסר.
              </p>
            </div>

            <Button
              onClick={refresh}
              disabled={refreshing}
              size="lg"
              className="rounded-2xl bg-white px-6 font-extrabold text-indigo-950 shadow-[0_12px_30px_rgba(255,255,255,0.25)] hover:bg-cyan-50"
            >
              {refreshing ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="ml-2 h-4 w-4" />}
              סנכרן מרחב
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-300/30 bg-rose-500/15 p-3 text-sm text-rose-50">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/60">תלמידים</div>
              <div className="mt-1 text-3xl font-black">{loading ? "—" : data?.counts.students ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/60">משימות</div>
              <div className="mt-1 text-3xl font-black">{loading ? "—" : data?.counts.tasks ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/60">ציונים</div>
              <div className="mt-1 text-3xl font-black">{loading ? "—" : data?.counts.grades ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/60">לוגים</div>
              <div className="mt-1 text-3xl font-black">{loading ? "—" : data?.counts.log_events ?? 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(data?.main_buttons ?? [
          { label: "משימות", capability: "course_tasks", path: "/tasks" },
          { label: "משתתפים", capability: "participants_names_emails", path: "/students" },
          { label: "ציונים", capability: "grade_results", path: "/grades" },
          { label: "זמנים", capability: "practice_time", path: "/activity" },
        ]).map((button, index) => {
          const capability = data?.capabilities?.[button.capability];
          const ready = button.label === "סנכרן מרחב" || button.label === "מה חסר?" || isCapabilityReady(capability);
          const Icon = iconMap[button.label] ?? CheckCircle2;

          return (
            <motion.div
              key={button.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className={`h-full rounded-3xl border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-2xl ${ready ? "bg-white" : "bg-slate-50"}`}>
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 p-3 text-white shadow-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${statusClass(capability)}`}>
                      {button.label === "סנכרן מרחב" ? "פעולה ראשית" : statusLabel(capability)}
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-black">{button.label}</div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {capability?.teacher_message_he ?? "בדיקת יכולת תתבצע מול נתוני Moodle אמיתיים."}
                    </p>
                  </div>

                  <div className="mt-auto">
                    {ready ? (
                      <Button asChild className="w-full rounded-2xl font-bold shadow-md">
                        <Link to={button.path}>{button.label === "סנכרן מרחב" ? "בדוק עכשיו" : "פתח"}</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full rounded-2xl">
                        {capability?.next_action_he ?? "חסר מקור נתונים"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {missing.length > 0 && (
        <Card className="rounded-3xl border-amber-200 bg-amber-50/70 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">מה חסר כדי להגיע לאוטומציה מלאה?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {missing.map(([key, capability]) => (
              <div key={key} className="rounded-2xl bg-white p-3 text-sm">
                <div className="font-bold text-amber-950">{capability.teacher_message_he}</div>
                <div className="mt-1 text-amber-800">{capability.next_action_he}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
