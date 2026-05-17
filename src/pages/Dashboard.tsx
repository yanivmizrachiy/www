import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useImportsOverview } from "@/hooks/useImports";
import TeacherStatusPanel from "@/components/TeacherStatusPanel";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { useLtiSession } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, ClipboardList, Database, Calendar, Import, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import SyncFeatureGates from "@/components/SyncFeatureGates";

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

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const updatedAtText = useMemo(() => new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(now), [now]);

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
              עמוד הבית החכם
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="inline-flex flex-wrap items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-base font-black text-white backdrop-blur-sm"
            >
              <Calendar className="h-5 w-5" />
              <span>מעודכן לתאריך: {updatedAtText}</span>
            </motion.div>
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
                className="bg-white text-primary hover:bg-white/90 font-bold"
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

      <section className="grid gap-5 lg:grid-cols-4" aria-label="כפתורי פעולה ראשיים בעמוד הבית החכם">
        <Link
          to="/students"
          className="MTH_DASHBOARD_MAIN_PARTICIPANTS_BUTTON_V1 rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-white shadow-elegant transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <Users className="mb-5 h-14 w-14" />
          <div className="text-5xl font-black leading-tight tracking-tight">משתתפים</div>
          <p className="mt-3 text-lg font-bold leading-relaxed text-white/85">
            רשימת תלמידים ומשתתפים מנתוני Moodle אמיתיים בלבד.
          </p>
          <div className="mt-5 inline-flex rounded-full bg-white/20 px-5 py-2 text-base font-black">
            {v(data?.students_count)} תלמידים
          </div>
        </Link>

        <Link
          to="/tasks"
          className="MTH_DASHBOARD_MAIN_ACTIVITIES_BUTTON_V1 rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-white shadow-elegant transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <ClipboardList className="mb-5 h-14 w-14" />
          <div className="text-5xl font-black leading-tight tracking-tight">פרקים ופעילויות</div>
          <p className="mt-3 text-lg font-bold leading-relaxed text-white/85">
            כניסה מהירה לפרקים, משימות ופעילויות לפי נתוני אמת.
          </p>
          <div className="mt-5 inline-flex rounded-full bg-white/20 px-5 py-2 text-base font-black">
            {v(data?.tasks_count)} משימות
          </div>
        </Link>

        <Link
          to="/grades"
          className="MTH_DASHBOARD_MAIN_GRADES_BUTTON_V1 rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-white shadow-elegant transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <GraduationCap className="mb-5 h-14 w-14" />
          <div className="text-5xl font-black leading-tight tracking-tight">ציונים</div>
          <p className="mt-3 text-lg font-bold leading-relaxed text-white/85">
            ציונים ופריטי ציון שיובאו מ־Gradebook אמיתי.
          </p>
          <div className="mt-5 inline-flex rounded-full bg-white/20 px-5 py-2 text-base font-black">
            {v(data?.grades_count)} ציונים
          </div>
        </Link>

        <a
          href="#all-actions-menu"
          className="MTH_DASHBOARD_MAIN_ALL_BUTTON_V1 rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-white shadow-elegant transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <Database className="mb-5 h-14 w-14" />
          <div className="text-5xl font-black leading-tight tracking-tight">כל השאר</div>
          <p className="mt-3 text-lg font-bold leading-relaxed text-white/85">
            ייבוא, דוחות, פעילות, ייצוא, הגדרות ותמיכה בתפריט מסודר.
          </p>
          <div className="mt-5 inline-flex rounded-full bg-white/20 px-5 py-2 text-base font-black">
            תפריט
          </div>
        </a>
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

      {syncStatus.error && (
        <div className="rounded-xl border border-status-missing/30 bg-status-missing-bg/10 p-4 text-sm text-status-missing">
          <div className="font-bold">בדיקת סנכרון לא הצליחה</div>
          <p className="opacity-80 mt-1">{syncStatus.error}</p>
        </div>
      )}

      {syncStatus.data?.next_actions_he?.length ? (
        <section className="rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-elegant">
          <h2 className="mb-3 text-lg font-extrabold text-primary">מה חסר כדי להמשיך?</h2>
          <div className="grid gap-2">
            {syncStatus.data.next_actions_he.map((action, index) => (
              <div key={`${action}-${index}`} className="rounded-xl bg-muted/50 p-3 text-sm font-medium">
                {action}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            אין כאן נתוני דמו. הכפתור בודק יכולות וחוסרים לפי הנתונים האמיתיים שקיימים כרגע.
          </p>
        </section>
      ) : null}

      <SyncFeatureGates status={syncStatus.data} loading={syncStatus.loading} />

      <TeacherStatusPanel />


      <section id="all-actions-menu" className="MTH_DASHBOARD_SECONDARY_MENU_V1 scroll-mt-8 rounded-[2rem] border border-primary/10 bg-muted/30 p-6 shadow-elegant">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-primary">תפריט כל השאר</h2>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              כל הפעולות הנוספות במקום אחד, בלי עומס בעמוד הראשי.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-black text-primary">תפריט משני</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/import">ייבוא נתונים</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/gradebook-import">ייבוא Gradebook</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/logs-import">ייבוא יומני מעקב</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/activity">פעילות / זמנים</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/reports">דוחות</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/export">ייצוא</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/settings">הגדרות</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/setup">התקנה / חיבור Moodle</Link></Button>
        </div>
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


