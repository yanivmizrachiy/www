import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useImportsOverview } from "@/hooks/useImports";
import { useLtiSession } from "@/hooks/useLtiSession";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import type { CapabilityKey, CapabilityStatus } from "@/shared/capabilities";
import { capabilityStatusClasses, capabilityStatusLabels } from "@/shared/capabilities";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock,
  Database,
  Download,
  FileText,
  GraduationCap,
  HelpCircle,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

function StatCard({ label, value, icon: Icon, delay = 0 }: { label: string; value: number | string; icon: LucideIcon; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
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

function statusClass(status?: CapabilityStatus["status"]) {
  return capabilityStatusClasses[status ?? "not_implemented_yet"];
}

function isFeatureActive(capability?: CapabilityStatus) {
  return capability?.status === "automatic" || capability?.status === "available_from_import";
}

function PremiumFeatureButton({
  title,
  subtitle,
  to,
  icon: Icon,
  capability,
  delay = 0
}: {
  title: string;
  subtitle: string;
  to: string;
  icon: LucideIcon;
  capability?: CapabilityStatus;
  delay?: number;
}) {
  const active = isFeatureActive(capability);
  const label = capabilityStatusLabels[capability?.status ?? "not_implemented_yet"];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white/75 p-3 shadow-inner">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(capability?.status)}`}>
          {label}
        </span>
      </div>
      <div className="mt-5 space-y-2 text-right">
        <div className="text-2xl font-extrabold tracking-tight text-slate-950">{title}</div>
        <p className="text-sm font-medium leading-relaxed text-slate-600">{subtitle}</p>
      </div>
      <div className="mt-5 rounded-2xl bg-white/55 p-3 text-xs leading-relaxed text-slate-700">
        {capability?.teacher_message_he ?? "יכולת זו תופעל רק כשיהיה מקור נתונים אמיתי."}
      </div>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      {active ? (
        <Link
          to={to}
          className="block h-full rounded-[1.7rem] border border-white/70 bg-gradient-to-br from-white to-slate-100 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.13)] transition hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,23,42,0.18)]"
        >
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="block h-full w-full cursor-not-allowed rounded-[1.7rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 text-right opacity-85 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          title={capability?.next_action_he}
        >
          {inner}
        </button>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { session, site } = useLtiSession();
  const { data, loading: importsLoading, error: importsError } = useImportsOverview();
  const sync = useSyncStatus();
  const hasSession = Boolean(session);
  const v = (n: number | undefined) => (hasSession && data ? n ?? 0 : "—");

  const capabilities = sync.data?.capabilities;

  const missingCapabilities = useMemo(() => {
    return Object.values(capabilities ?? {})
      .filter(item => item.status === "missing_required_report" || item.status === "blocked_no_permission" || item.status === "not_implemented_yet")
      .slice(0, 5);
  }, [capabilities]);

  const featureButtons: Array<{
    title: string;
    subtitle: string;
    to: string;
    keyName: CapabilityKey;
    icon: LucideIcon;
  }> = [
    { title: "משימות", subtitle: "פרקים, משימות, השלמות וממוצעים רק מנתוני Moodle אמיתיים.", to: "/tasks", keyName: "course_tasks", icon: ClipboardList },
    { title: "משתתפים", subtitle: "תלמידים, מורים, חיפוש, סינון וכרטיס תלמיד.", to: "/students", keyName: "participants_names_emails", icon: Users },
    { title: "ציונים", subtitle: "Gradebook, ממוצעים, חסרים ודוחות ציונים.", to: "/grades", keyName: "grade_results", icon: GraduationCap },
    { title: "זמנים", subtitle: "זמן מצטבר, זמן יומי ומשימות שבוצעו בזמן הזה.", to: "/activity", keyName: "practice_time", icon: Clock },
    { title: "דוחות", subtitle: "דוחות תלמיד, משימה, כיתה, פערים ופעילות.", to: "/reports", keyName: "reports", icon: FileText },
    { title: "ייצוא", subtitle: "Excel, PDF, הדפסה ועזר WhatsApp כשיש נתונים.", to: "/export", keyName: "export", icon: Download }
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-hero p-8 shadow-elegant lg:p-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-background/20 px-3 py-1 text-xs font-bold text-background/80 backdrop-blur-md"
            >
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              {hasSession ? "מחובר מתוך Moodle" : "ממתין לכניסה מאומתת מתוך Moodle"}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl"
            >
              מרכז השליטה של המורה
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="max-w-3xl text-lg font-medium leading-relaxed text-white/75"
            >
              {session?.course_title ?? site?.site_name ?? "המערכת תציג נתוני Moodle אמיתיים בלבד. אם חסר מקור נתונים — יוצג בדיוק איזה דוח נדרש."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Button
                size="lg"
                onClick={() => void sync.run()}
                disabled={sync.running}
                className="rounded-2xl bg-white px-6 py-6 text-base font-extrabold text-primary shadow-2xl hover:bg-white/90"
              >
                <RefreshCcw className={`ml-2 h-5 w-5 ${sync.running ? "animate-spin" : ""}`} />
                {sync.running ? "מסנכרן..." : "סנכרן מרחב"}
              </Button>

              <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/30 px-6 py-6 text-base font-bold text-white hover:bg-white/10">
                <Link to="/import">ייבוא דוח אמיתי</Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/30 px-6 py-6 text-base font-bold text-white hover:bg-white/10">
                <Link to="/reports">דוחות</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <Card className="border-white/30 bg-white/15 text-white shadow-2xl backdrop-blur-xl">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white/70">סטטוס אוטומציה</div>
                    <div className="text-2xl font-extrabold">Automation Core</div>
                  </div>
                  <StatusBadge status={hasSession ? "proven" : "missing"} className="shadow-2xl" />
                </div>

                <div className="rounded-2xl bg-white/15 p-4 text-sm leading-relaxed text-white/80">
                  {sync.error ? (
                    <span>שגיאת בדיקת סנכרון: {sync.error}</span>
                  ) : sync.loading ? (
                    <span>בודק מה זמין באמת...</span>
                  ) : (
                    <span>{sync.data?.next_required?.[0]?.next_action_he ?? "המערכת מוכנה להציג את היכולות הזמינות לפי נתונים אמיתיים בלבד."}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white/15 p-3">
                    <div className="font-bold">סשן Moodle</div>
                    <div className="text-white/70">{sync.data?.session_present ? "זוהה" : "לא זוהה"}</div>
                  </div>
                  <div className="rounded-xl bg-white/15 p-3">
                    <div className="font-bold">ללא דמו</div>
                    <div className="text-white/70">פעיל</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </section>

      {(importsError || sync.error) && (
        <div className="rounded-xl border border-status-blocked/30 bg-status-blocked-bg/10 p-4 flex gap-3 text-sm text-status-blocked items-start">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">שגיאה בסנכרון נתונים</div>
            <p className="opacity-80 mt-1">{importsError || sync.error}</p>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="תלמידים רשומים" value={v(data?.students_count)} icon={Users} delay={0.1} />
        <StatCard label="פריטי ציון" value={v(data?.grade_items_count)} icon={GraduationCap} delay={0.2} />
        <StatCard label="ציונים שנקלטו" value={v(data?.grades_count)} icon={Database} delay={0.3} />
        <StatCard label="פרקים/נושאים" value={v(data?.chapters_count)} icon={ClipboardList} delay={0.4} />
        <StatCard label="משימות" value={v(data?.tasks_count)} icon={ClipboardList} delay={0.5} />
        <StatCard label="אירועי לוג" value={v(data?.log_events_count)} icon={Activity} delay={0.6} />
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {featureButtons.map((button, index) => (
          <PremiumFeatureButton
            key={button.keyName}
            title={button.title}
            subtitle={button.subtitle}
            to={button.to}
            icon={button.icon}
            capability={capabilities?.[button.keyName]}
            delay={0.05 * index}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-elegant border-none bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <SearchCheck className="h-5 w-5 text-primary" />
              מה חסר כדי שהכול יעבוד אוטומטית?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {missingCapabilities.length ? (
              missingCapabilities.map(item => (
                <div key={item.key} className="rounded-2xl border bg-white/65 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="font-extrabold">{item.label_he}</div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(item.status)}`}>
                      {capabilityStatusLabels[item.status]}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.next_action_he}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border bg-white/65 p-4 text-sm leading-relaxed text-muted-foreground">
                אין חוסרים מרכזיים שזוהו כרגע. כל יכולת עדיין נפתחת רק מול מקור נתונים אמיתי.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-none bg-primary/5 border border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <ShieldCheck className="h-5 w-5" />
              כלל אמת פעיל
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium leading-relaxed">
              הכפתורים בעמוד הראשי מחוברים ל־Feature Gates. יכולת שאין לה מקור נתונים אמיתי לא תוצג כפעילה.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-white/50 p-3">
                <span>שמות תלמידים:</span>
                <span className={data?.students_count ? "text-status-proven font-bold" : "text-status-blocked"}>
                  {data?.students_count ? "זמינים מייבוא אמיתי" : "נדרש Participants"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/50 p-3">
                <span>ציונים:</span>
                <span className={data?.grades_count ? "text-status-proven font-bold" : "text-status-blocked"}>
                  {data?.grades_count ? "זמינים" : "נדרש Gradebook"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/50 p-3">
                <span>זמנים:</span>
                <span className={data?.log_events_count ? "text-status-proven font-bold" : "text-status-blocked"}>
                  {data?.log_events_count ? "זמינים מלוגים" : "נדרש Logs"}
                </span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/import" className="flex items-center gap-2">
                העלה דוח Moodle אמיתי
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {(importsLoading || sync.loading) && (
        <div className="fixed bottom-8 left-8 flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-2xl border animate-bounce">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold">בודק נתוני אמת...</span>
        </div>
      )}

      <div className="sr-only">
        <HelpCircle />
      </div>
    </div>
  );
}