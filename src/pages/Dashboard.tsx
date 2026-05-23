import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useImportsOverview } from "@/hooks/useImports";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { useLtiSession } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, ClipboardList, Database, Calendar, Import, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { formatTeacherDateDmyShort } from "@/lib/teacherDateFormat";

function StatCard({ label, value, icon: Icon, delay = 0 }: { label: string, value: number | string, icon: any, delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="shadow-elegant border-none bg-background/50 backdrop-blur-sm group hover:bg-muted/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"><Icon className="h-5 w-5" /></div>
            <div className="text-2xl font-bold font-mono">{value ?? "—"}</div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActionCard({ to, marker, icon: Icon, title, value, unit }: { to: string; marker: string; icon: any; title: string; value: number | string; unit: string }) {
  return (
    <Link to={to} className={`${marker} MTH_DASHBOARD_DARK_BLUE_CARD_V1 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#06152f] via-[#0b3d91] to-[#0e7490] p-8 text-white shadow-[0_24px_70px_rgba(6,21,47,0.34)] transition hover:-translate-y-1 hover:shadow-[0_32px_95px_rgba(6,21,47,0.45)]`}>
      <Icon className="mb-5 h-14 w-14" />
      <div className="text-5xl font-black leading-tight tracking-tight">{title}</div>
      <div className="mt-5 inline-flex rounded-full border border-white/25 bg-white/15 px-5 py-2 text-base font-black text-white shadow-lg">{value} {unit}</div>
    </Link>
  );
}

export default function Dashboard() {
  const { session, site } = useLtiSession();
  const { data, loading, error } = useImportsOverview();
  const syncStatus = useSyncStatus();
  const hasSession = Boolean(session);
  const v = (n: number | undefined) => hasSession && data ? n ?? 0 : "—";
  const realActivitiesCount = hasSession && data ? Math.max(data.tasks_count || 0, data.grade_items_count || 0) : "—";
  const realActivitiesUnit = hasSession && data && (data.tasks_count || 0) === 0 && (data.grade_items_count || 0) > 0 ? "פעילויות מ-Gradebook" : "משימות";

  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);

  const updatedAtText = useMemo(() => formatTeacherDateDmyShort(now), [now]);
  const teacherName = session?.moodle_username || "—";
  const courseName = session?.course_title || site?.site_name || "—";

  return (
    <div className="MTH_DASHBOARD_ACTION_HUB_V1 space-y-8" dir="rtl">
      <span className="sr-only">MTH_DASHBOARD_ACTION_ONLY_NO_EXPLAINER_TEXT_V1</span>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#06152f] via-[#082b66] to-[#0b4f8f] p-8 text-white shadow-[0_30px_90px_rgba(6,21,47,0.45)] lg:p-12">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-5 max-w-4xl">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#0b2b5c]/90 px-4 py-2 text-sm font-black text-white shadow-lg backdrop-blur-md">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />{hasSession ? "מחובר מתוך Moodle" : "נדרשת פתיחה מתוך Moodle"}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] lg:text-7xl">עמוד הבית החכם</motion.h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/25 bg-[#0f3d75]/95 px-5 py-3 text-base font-black text-white shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm">מורה: {teacherName}</div>
              <div className="rounded-2xl border border-white/25 bg-[#0f3d75]/95 px-5 py-3 text-base font-black text-white shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm">מרחב: {courseName}</div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-[#0f3d75]/95 px-5 py-3 text-base font-black text-white shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm"><Calendar className="h-5 w-5" />{updatedAtText}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" onClick={() => void syncStatus.runSync()} disabled={syncStatus.running} className="bg-white text-[#06152f] hover:bg-white/90 font-black shadow-xl"><RefreshCw className={syncStatus.running ? "h-4 w-4 animate-spin" : "h-4 w-4"} />סנכרן מרחב</Button>
              <Button asChild size="lg" className="border border-white/35 bg-[#0f3d75]/90 text-white hover:bg-[#15559a] font-black shadow-lg"><Link to="/import" className="flex items-center gap-2"><Import className="h-4 w-4" />ייבוא דוחות</Link></Button>
              <Button asChild variant="outline" size="lg" className="border-white/40 bg-[#06152f]/55 text-white hover:bg-[#0f3d75]/90 font-black"><Link to="/reports">דוחות</Link></Button>
            </motion.div>
          </div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: "spring" }}><StatusBadge status={hasSession ? "proven" : "missing"} className="scale-150 shadow-2xl" /></motion.div>
        </div>
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
      </section>

      <section className="grid gap-5 lg:grid-cols-4" aria-label="כפתורי פעולה ראשיים בעמוד הבית החכם">
        <ActionCard to="/students" marker="MTH_DASHBOARD_MAIN_PARTICIPANTS_BUTTON_V1" icon={Users} title="משתתפים" value={v(data?.students_count)} unit="תלמידים" />
        <ActionCard to="/tasks" marker="MTH_DASHBOARD_MAIN_ACTIVITIES_BUTTON_V1" icon={ClipboardList} title="פרקים ופעילויות" value={realActivitiesCount} unit={realActivitiesUnit} />
        <ActionCard to="/grades" marker="MTH_DASHBOARD_MAIN_GRADES_BUTTON_V1" icon={GraduationCap} title="ציונים" value={v(data?.grades_count)} unit="ציונים" />
        <a href="#all-actions-menu" className="MTH_DASHBOARD_MAIN_ALL_BUTTON_V1 MTH_DASHBOARD_DARK_BLUE_CARD_V1 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#06152f] via-[#0b3d91] to-[#0e7490] p-8 text-white shadow-[0_24px_70px_rgba(6,21,47,0.34)] transition hover:-translate-y-1 hover:shadow-[0_32px_95px_rgba(6,21,47,0.45)]"><Database className="mb-5 h-14 w-14" /><div className="text-5xl font-black leading-tight tracking-tight">כל השאר</div><div className="mt-5 inline-flex rounded-full border border-white/25 bg-white/15 px-5 py-2 text-base font-black text-white shadow-lg">תפריט</div></a>
      </section>

      {error && <div className="rounded-xl border border-status-blocked/30 bg-status-blocked-bg/10 p-4 flex gap-3 text-sm text-status-blocked items-start"><AlertCircle className="h-5 w-5 mt-0.5 shrink-0" /><div><div className="font-bold">שגיאה בסנכרון נתונים</div><p className="opacity-80 mt-1">{error}</p></div></div>}
      {syncStatus.error && <div className="rounded-xl border border-status-missing/30 bg-status-missing-bg/10 p-4 text-sm text-status-missing"><div className="font-bold">בדיקת סנכרון לא הצליחה</div><p className="opacity-80 mt-1">{syncStatus.error}</p></div>}

      <section id="all-actions-menu" className="MTH_DASHBOARD_SECONDARY_MENU_V1 scroll-mt-8 rounded-[2rem] border border-primary/10 bg-muted/30 p-6 shadow-elegant">
        <h2 className="mb-5 text-2xl font-black text-primary">פעולות נוספות</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/import">ייבוא נתונים</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/gradebook-import">ייבוא Gradebook</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/logs-import">ייבוא יומני מעקב</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/activity">פעילות / זמנים</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/reports">דוחות</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/export">ייצוא</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/settings">הגדרות</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/setup">חיבור Moodle</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/missing-data">מה חסר</Link></Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="תלמידים" value={v(data?.students_count)} icon={Users} delay={0.1} />
        <StatCard label="פריטי ציון" value={v(data?.grade_items_count)} icon={GraduationCap} delay={0.2} />
        <StatCard label="ציונים" value={v(data?.grades_count)} icon={Database} delay={0.3} />
        <StatCard label="פרקים" value={v(data?.chapters_count)} icon={ClipboardList} delay={0.4} />
        <StatCard label="פעילויות" value={realActivitiesCount} icon={ClipboardList} delay={0.5} />
        <StatCard label="לוגים" value={v(data?.log_events_count)} icon={Calendar} delay={0.6} />
      </section>
      {loading && <div className="fixed bottom-8 left-8 flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-2xl border animate-bounce"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-[10px] font-bold">טוען...</span></div>}
    </div>
  );
}
