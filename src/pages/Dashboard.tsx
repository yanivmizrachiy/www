import { Link } from "react-router-dom";
import { useImportsOverview } from "@/hooks/useImports";
import { useSyncStatus, type CapabilityDomain } from "@/hooks/useSyncStatus";
import { useLtiSession } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, ClipboardList, Database, Calendar, Import, ArrowRight, AlertCircle, RefreshCw, ShieldCheck, ListChecks } from "lucide-react";
import { motion } from "motion/react";


function capabilityStatusLabel(status: CapabilityDomain["status"]) {
  switch (status) {
    case "automatic": return "אוטומטי";
    case "available_from_import": return "זמין מייבוא";
    case "missing_required_report": return "חסר דוח";
    case "blocked_no_permission": return "חסום הרשאה";
    case "not_implemented_yet": return "מתוכנן";
    default: return status;
  }
}

function capabilityStatusClass(status: CapabilityDomain["status"]) {
  switch (status) {
    case "automatic":
    case "available_from_import":
      return "border-status-proven/30 bg-status-proven-bg/20 text-status-proven";
    case "missing_required_report":
      return "border-status-missing/30 bg-status-missing-bg/20 text-status-missing";
    case "blocked_no_permission":
      return "border-status-blocked/30 bg-status-blocked-bg/20 text-status-blocked";
    default:
      return "border-muted bg-muted/40 text-muted-foreground";
  }
}

function StatCard({ label, value, icon: Icon, delay = 0 }: { label: string, value: number | string, icon: any, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="shadow-elegant border-none bg-background/50 backdrop-blur-sm group hover:bg-muted/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold font-mono">{value ?? "—"}</div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { session, site } = useLtiSession();
  const { data, loading, error } = useImportsOverview();
  const syncStatus = useSyncStatus();
  const hasSession = Boolean(session);
  const v = (n: number | undefined) => hasSession && data ? n ?? 0 : "—";
  const domains = syncStatus.data?.domains ?? [];
  const nextActions = syncStatus.data?.next_actions_he ?? [];

  return (
    <div className="space-y-8" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 shadow-elegant lg:p-12">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-background/20 px-3 py-1 text-xs font-bold text-background/80 backdrop-blur-md"
            >
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              {hasSession ? "מחובר מתוך Moodle" : "ממתין לכניסה מאומתת מתוך Moodle"}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl"
            >
              שלום, {session?.moodle_username?.split(" ")[0] || "מורה"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/70 font-medium"
            >
              {session?.course_title ?? site?.site_name ?? "עדיין לא התקבלה כניסה אמיתית מתוך Moodle. ניתן להתחיל רק מייבוא נתוני Moodle אמיתיים."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button
                size="lg"
                onClick={() => void syncStatus.runSync()}
                disabled={syncStatus.running}
                className="bg-white text-primary hover:bg-white/90 font-bold shadow-xl"
              >
                <RefreshCw className={syncStatus.running ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                סנכרן מרחב
              </Button>
              <Button asChild size="lg" className="bg-white/15 text-white hover:bg-white/25 font-bold border border-white/20">
                <Link to="/import" className="flex items-center gap-2">
                  <Import className="h-4 w-4" />
                  ייבוא דוחות
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/reports">צפייה בדוחות</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <StatusBadge status={hasSession ? "proven" : "missing"} className="scale-150 shadow-2xl" />
          </motion.div>
        </div>

        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </section>

      {error && (
        <div className="rounded-xl border border-status-blocked/30 bg-status-blocked-bg/10 p-4 flex gap-3 text-sm text-status-blocked items-start">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">שגיאה בסנכרון נתונים</div>
            <p className="opacity-80 mt-1">{error}</p>
          </div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-none bg-white/80 shadow-elegant backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              מרכז סנכרון מרחב
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncStatus.error && (
              <div className="rounded-xl border border-status-missing/30 bg-status-missing-bg/10 p-3 text-xs text-status-missing">
                בדיקת הסנכרון לא הצליחה כרגע: {syncStatus.error}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {domains.map((domain) => (
                <div key={domain.id} className={`rounded-2xl border p-4 ${capabilityStatusClass(domain.status)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-extrabold">{domain.label_he}</div>
                    <span className="rounded-full bg-white/60 px-2 py-1 text-[10px] font-bold">
                      {capabilityStatusLabel(domain.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed opacity-90">{domain.teacher_message_he}</p>
                  <p className="mt-2 text-[11px] font-bold opacity-80">{domain.next_action_he}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/30 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-primary" />
              מה המורה צריך לעשות?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextActions.length ? nextActions.map((action, index) => (
              <div key={`${action}-${index}`} className="rounded-xl bg-background/70 p-3 text-sm font-medium">
                {action}
              </div>
            )) : (
              <div className="rounded-xl bg-background/70 p-3 text-sm font-medium">
                לחץ סנכרן מרחב כדי לבדוק מה קיים ומה חסר.
              </div>
            )}
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
              עקרון המוצר: המורה עושה מינימום. המערכת בודקת קודם מה אפשר למשוך, ורק אם חסר מקור אמיתי היא מבקשת דוח Moodle מדויק.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="תלמידים רשומים" value={v(data?.students_count)} icon={Users} delay={0.1} />
        <StatCard label="פריטי ציון" value={v(data?.grade_items_count)} icon={GraduationCap} delay={0.2} />
        <StatCard label="ציונים שנקלטו" value={v(data?.grades_count)} icon={Database} delay={0.3} />
        <StatCard label="פרקים/נושאים" value={v(data?.chapters_count)} icon={ClipboardList} delay={0.4} />
        <StatCard label="משימות" value={v(data?.tasks_count)} icon={ClipboardList} delay={0.5} />
        <StatCard label="אירועי לוג" value={v(data?.log_events_count)} icon={Calendar} delay={0.6} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-elegant border-none bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">סיכום סטטוס אמת</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              הנתונים המוצגים כאן נגזרים רק מהייבוא שבוצע או מסשן Moodle מאומת. המערכת אינה מחשבת ממוצעים או זמנים על בסיס נתונים חסרים.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="ghost" className="p-0 text-primary font-bold hover:bg-transparent">
                <Link to="/reports/gaps" className="flex items-center gap-1">
                  הצג דוח פערים
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-none bg-primary/5 border border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg text-primary">השלמה מהירה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium">ייבוא מהיר של נתוני לוגים לשיפור דוח זמן תרגול:</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-lg bg-white/50 p-3 text-xs">
                <span>דוא"ל תלמידים:</span>
                <span className={data?.students_count ? "text-status-proven font-bold" : "text-status-blocked"}>
                  {data?.students_count ? "פעיל" : "נדרש ייבוא"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/50 p-3 text-xs">
                <span>מיפוי משימות לפרקים:</span>
                <span className={data?.chapters_count ? "text-status-proven font-bold" : "text-status-blocked"}>
                  {data?.chapters_count ? "פעיל" : "חסר מיפוי"}
                </span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/import">עבור לממשק הייבוא</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {loading && (
        <div className="fixed bottom-8 left-8 flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-2xl border animate-bounce">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold">טוען נתוני אמת...</span>
        </div>
      )}
    </div>
  );
}
