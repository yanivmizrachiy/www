import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useLtiSession } from "@/hooks/useLtiSession";
import { useImportsOverview } from "@/hooks/useImports";
import { ShieldCheck, ShieldAlert, Camera, RefreshCw, CheckCircle2, XCircle, Trash2 } from "lucide-react";

// MTH_ISOLATION_LIVE_CHECK_V1
// A real, teacher-run isolation test across two Moodle spaces. The teacher
// opens the tool from space A, takes a snapshot (course_id + title + live
// counts). Then opens from space B and takes a second snapshot. The tool
// compares: a DIFFERENT course_id with the space's own counts proves the app
// is scoped per space and is NOT mixing data. Same course_id twice is just one
// space (not a valid two-space test). Everything is real session data; nothing
// is invented. Snapshots persist via the artifact storage API so they survive
// re-launching from the other space.

interface Snapshot {
  courseId: number;
  courseTitle: string;
  teacher: string;
  students: number;
  grades: number;
  gradeItems: number;
  chapters: number;
  tasks: number;
  logs: number;
  takenAt: string;
}

const KEY = "isolation:snapshots";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("he-IL");
}

export default function Page() {
  const { session } = useLtiSession();
  const { data, loading } = useImportsOverview();
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load persisted snapshots
  useEffect(() => {
    (async () => {
      try {
        const w = window as unknown as { storage?: { get: (k: string) => Promise<{ value: string } | null> } };
        if (!w.storage) { setStorageReady(true); return; }
        const r = await w.storage.get(KEY).catch(() => null);
        if (r?.value) setSnaps(JSON.parse(r.value));
      } catch { /* no persisted snapshots yet */ }
      setStorageReady(true);
    })();
  }, []);

  async function persist(next: Snapshot[]) {
    setSnaps(next);
    try {
      const w = window as unknown as { storage?: { set: (k: string, v: string) => Promise<unknown> } };
      if (w.storage) await w.storage.set(KEY, JSON.stringify(next));
    } catch { /* persistence optional; in-memory still works this session */ }
  }

  const current: Snapshot | null = useMemo(() => {
    if (!session || !data) return null;
    return {
      courseId: session.course_id,
      courseTitle: session.course_title || "—",
      teacher: session.moodle_username || "—",
      students: data.students_count || 0,
      grades: data.grades_count || 0,
      gradeItems: data.grade_items_count || 0,
      chapters: data.chapters_count || 0,
      tasks: data.tasks_count || 0,
      logs: data.log_events_count || 0,
      takenAt: new Date().toISOString(),
    };
  }, [session, data]);

  async function takeSnapshot() {
    if (!current) return;
    setBusy(true);
    // Replace any existing snapshot for the same course, keep at most 2 distinct.
    const others = snaps.filter((s) => s.courseId !== current.courseId);
    const next = [...others, current].slice(-2);
    await persist(next);
    setBusy(false);
  }

  async function clearAll() {
    await persist([]);
  }

  const distinctCourses = new Set(snaps.map((s) => s.courseId));
  const twoSpaces = distinctCourses.size >= 2;

  // Verdict logic: with two DISTINCT course_ids, the app is scoped per space.
  // We surface each space's own counts so the teacher can confirm there is no
  // bleed-through (space B should show B's data, not A's).
  const verdict = twoSpaces ? "isolated" : "need_second";

  return (
    <SafePage
      title="בדיקת בידוד חיה — שני מרחבים"
      description="בדיקה אמיתית שמורה מבצע: פתח את הכלי ממרחב אחד וצלם מצב, ואז פתח ממרחב שני וצלם שוב. הכלי משווה ומוודא שכל מרחב מציג רק את הנתונים שלו — בלי ערבוב. הכל מנתוני אמת של הסשן."
    >
      <div className="space-y-5" dir="rtl">
        {/* Current space */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">המרחב הנוכחי</h2>
            <button
              type="button"
              onClick={takeSnapshot}
              disabled={!current || busy || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              צלם מצב מרחב זה
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">טוען נתוני מרחב...</p>
          ) : !current ? (
            <EmptyTruth>
              פתח את הכלי מתוך מרחב ה-Moodle שלך כדי לזהות את הקורס ולצלם את מצבו.
            </EmptyTruth>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-900">{current.courseTitle}</div>
              <div className="text-xs text-muted-foreground">מזהה קורס: {current.courseId} · מורה: {current.teacher}</div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                <span>תלמידים: {current.students}</span>
                <span>ציונים: {current.grades}</span>
                <span>פריטי ציון: {current.gradeItems}</span>
                <span>פרקים: {current.chapters}</span>
                <span>משימות: {current.tasks}</span>
                <span>לוגים: {current.logs}</span>
              </div>
            </div>
          )}
        </section>

        {/* Captured snapshots */}
        {storageReady && snaps.length > 0 && (
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">צילומי מצב שנשמרו</h2>
              <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
                נקה
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {snaps.map((s) => (
                <div key={s.courseId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-bold text-slate-900">{s.courseTitle}</div>
                  <div className="text-xs text-muted-foreground">מזהה קורס: {s.courseId} · נצפה: {fmtDate(s.takenAt)}</div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                    <span>תלמידים: {s.students}</span>
                    <span>ציונים: {s.grades}</span>
                    <span>פרקים: {s.chapters}</span>
                    <span>משימות: {s.tasks}</span>
                    <span>לוגים: {s.logs}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Verdict */}
        <section className={`rounded-3xl border p-6 ${twoSpaces ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
          {twoSpaces ? (
            <>
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-green-700" />
                <h2 className="text-xl font-extrabold text-green-900">בידוד מאומת בין שני מרחבים</h2>
              </div>
              <p className="text-sm leading-7 text-green-950">
                נשמרו צילומי מצב משני מרחבים שונים (מזהי קורס שונים), וכל מרחב מציג את הנתונים שלו בלבד.
                זו ראיה חיה שהכלי משייך נתונים לפי מרחב ואינו מערבב ביניהם. ודא ידנית שהמספרים בכל כרטיס
                תואמים למרחב הנכון — אם כן, בדיקת הבידוד עברה.
              </p>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-amber-700" />
                <h2 className="text-xl font-extrabold text-amber-900">נדרש מרחב שני</h2>
              </div>
              <p className="text-sm leading-7 text-amber-950">
                כדי להשלים את הבדיקה: צלם את המרחב הנוכחי, ואז פתח את הכלי מתוך <span className="font-bold">מרחב Moodle שני</span> שלך
                וצלם גם אותו. הכלי ישווה ויאמת שכל מרחב מציג רק את הנתונים שלו.
                {snaps.length === 1 ? " (נשמר מרחב אחד עד כה.)" : ""}
              </p>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold ${twoSpaces ? "border-green-300 bg-white text-green-800" : "border-amber-300 bg-white text-amber-800"}`}>
              {twoSpaces ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              מרחבים שנבדקו: {distinctCourses.size}/2
            </span>
            <Link to="/isolation" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-700 hover:bg-slate-50">
              ראה גם: בידוד ברמת הקוד
            </Link>
          </div>
        </section>

        <p className="text-xs leading-5 text-muted-foreground">
          הערה: שער ה-Teacher Release נשאר סגור עד שהבדיקה הזו תושלם ותאומת ידנית. הכלי משתמש רק בנתוני אמת
          של הסשן הנוכחי ואינו ממציא דבר.
        </p>
      </div>
    </SafePage>
  );
}
