import { useMemo } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useActivityOverview } from "@/hooks/useImports";
import { PracticeTimeSection } from "@/components/PracticeTimeSection";
import { Activity, CalendarDays, Clock3, AlertTriangle } from "lucide-react";

// MTH_PRACTICE_TIME_TRUTH_UI_V1
// Separates TWO different things that must never be conflated:
//   1) Log evidence (FACT): event counts, active days, first/last activity.
//      These come directly from imported real logs.
//   2) Practice time (ESTIMATE): sessionization-derived durations. There is
//      NO verified duration source in Moodle logs, so this is an estimate,
//      not a verified fact. The UI says so explicitly and never presents it
//      as verified practice time.

function StatCard({
  label,
  value,
  Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  Icon: React.ComponentType<{ className?: string }>;
  tone?: "green" | "neutral";
}) {
  const cls =
    tone === "green"
      ? "border-green-200 bg-green-50 text-green-900"
      : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="mb-1 flex items-center gap-2 text-xs font-bold opacity-70">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "לא התקבל";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "לא התקבל";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export default function Page() {
  const { data, loading, error } = useActivityOverview();

  // Surface the max active_days across students as a course signal.
  // We never sum active_days across students (that would be misleading).
  const maxActiveDays = useMemo(
    () => Math.max(0, ...(data?.per_student ?? []).map((s) => s.active_days)),
    [data]
  );

  return (
    <SafePage
      title="פעילות וזמנים"
      description="פעילות התלמידים מתוך לוגים שיובאו."
    >
      <div className="space-y-8" dir="rtl">
        {/* ── Section 1: Log evidence (FACT) ───────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xl font-extrabold">ראיות פעילות (מתוך לוגים)</h2>
            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-800">
              עובדה
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">טוען ראיות פעילות...</p>
          ) : error ? (
            <EmptyTruth>{error}</EmptyTruth>
          ) : !data || (data.events_count ?? 0) === 0 ? (
            <EmptyTruth>
              עדיין לא יובאו לוגים. ייבא דוח Logs כדי לראות ראיות פעילות.
            </EmptyTruth>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="סך אירועים" value={data.events_count.toLocaleString()} Icon={Activity} tone="green" />
              <StatCard label="ימים פעילים (מקס׳ לתלמיד)" value={maxActiveDays} Icon={CalendarDays} tone="green" />
              <StatCard label="אירוע ראשון" value={fmtDate(data.first_event)} Icon={Clock3} />
              <StatCard label="אירוע אחרון" value={fmtDate(data.last_event)} Icon={Clock3} />
            </div>
          )}
        </section>

        {/* ── Section 2: Practice time (ESTIMATE, honest disclaimer) ────── */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xl font-extrabold">זמן תרגול</h2>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
              הערכה — לא מאומת
            </span>
          </div>

          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              לוגים של Moodle מתעדים <span className="font-bold">אירועים</span>, לא משך זמן.
              הזמן המוצג הוא <span className="font-bold">הערכה</span> — השתמש בו כאינדיקציה בלבד.
            </div>
          </div>

          {/* Existing sessionization view kept, but framed honestly as an estimate */}
          <PracticeTimeSection title="הערכת זמן תרגול יומי (sessionization)" />
        </section>

        {/* ── Section 3: Recent events (real) ──────────────────────────── */}
        <section>
          <h2 className="mb-3 text-xl font-extrabold">אירועים אחרונים</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">טוען...</p>
          ) : error ? (
            <EmptyTruth>{error}</EmptyTruth>
          ) : !data?.recent?.length ? (
            <EmptyTruth>אין אירועים להצגה. ייבא דוח Logs.</EmptyTruth>
          ) : (
            <ul className="space-y-2">
              {data.recent.map((e) => (
                <li key={e.id} className="rounded-2xl border bg-white p-3 shadow-sm">
                  <div className="text-sm font-bold text-slate-900">{e.student_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.event_name ?? "—"} · {fmtDate(e.occurred_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </SafePage>
  );
}
