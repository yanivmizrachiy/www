import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { getLtiToken } from "@/hooks/useLtiSession";
import { ShieldCheck, ShieldAlert, Camera, RefreshCw, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { formatTeacherDateTime } from "@/lib/teacherDateFormat";

// MTH_ISOLATION_LIVE_CHECK_V1
// A real, teacher-run space-isolation test that reads ONLY safe current-session
// diagnostics from /api/lti13/participants-breakdown: course id, course title,
// client id, deployment id, resource link id, live learner/teacher/total counts,
// and the sync source. No raw student rows, no names, no emails, no person IDs,
// no tokens, no secrets — the endpoint already strips those (privacy block).
//
// The teacher opens the tool from space A and takes a snapshot, then opens it
// from space B and takes a second snapshot. A DIFFERENT resource link id / course
// id with each space's own counts proves the app is scoped per space and is NOT
// mixing data. Same resource link twice is just one space (not a valid two-space
// test). Everything shown is real live session data; nothing is invented.

interface Breakdown {
  ok: boolean;
  source?: string;
  course_id?: string | null;
  course_title?: string | null;
  resource_link_id?: string | null;
  deployment_id?: string | null;
  client_id?: string | null;
  total_members?: number;
  learners_count?: number;
  instructors_count?: number;
  updated_at?: string;
}

interface Snapshot {
  courseId: string;
  courseTitle: string;
  clientId: string;
  deploymentId: string;
  resourceLinkId: string;
  totalMembers: number;
  learners: number;
  instructors: number;
  source: string;
  takenAt: string;
}

const KEY = "isolation:space-snapshots:v2";

function breakdownUrl(): string {
  const token = getLtiToken();
  return "/api/lti13/participants-breakdown" + (token ? "?t=" + encodeURIComponent(token) : "");
}

// Snapshots are keyed by resource link id when present, falling back to course id.
// This is the per-space identity used to detect a valid two-space test.
function spaceKey(s: { resourceLinkId: string; courseId: string }): string {
  return s.resourceLinkId || s.courseId || "";
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <span className="break-all text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function Page() {
  const [bd, setBd] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(breakdownUrl(), { headers: { Accept: "application/json" }, credentials: "include" });
      const json = await res.json().catch(() => null);
      setBd(json);
    } catch {
      setBd(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load persisted snapshots (optional; in-memory still works without storage).
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
    } catch { /* persistence optional */ }
  }

  const live = Boolean(bd?.ok);

  const current: Snapshot | null = useMemo(() => {
    if (!bd?.ok) return null;
    return {
      courseId: String(bd.course_id || ""),
      courseTitle: String(bd.course_title || ""),
      clientId: String(bd.client_id || ""),
      deploymentId: String(bd.deployment_id || ""),
      resourceLinkId: String(bd.resource_link_id || ""),
      totalMembers: Number(bd.total_members || 0),
      learners: Number(bd.learners_count || 0),
      instructors: Number(bd.instructors_count || 0),
      source: String(bd.source || "nrps"),
      takenAt: String(bd.updated_at || new Date().toISOString()),
    };
  }, [bd]);

  async function takeSnapshot() {
    if (!current) return;
    // Replace any existing snapshot for the same space, keep at most 2 distinct.
    const key = spaceKey(current);
    const others = snaps.filter((s) => spaceKey(s) !== key);
    const next = [...others, { ...current, takenAt: new Date().toISOString() }].slice(-2);
    await persist(next);
  }

  async function clearAll() {
    await persist([]);
  }

  const distinctSpaces = new Set(snaps.map(spaceKey).filter(Boolean));
  const twoSpaces = distinctSpaces.size >= 2;

  return (
    <SafePage
      title="בדיקת בידוד חיה — שני מרחבים"
      description="אבחון בטוח של הסשן הנוכחי: מזהי מרחב וספירות בלבד, ללא נתונים אישיים."
      backTo="/isolation"
      backLabel="חזרה לבידוד נתונים"
    >
      <div className="space-y-5" dir="rtl">
        {/* Current space — live safe diagnostics */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">המרחב הנוכחי</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                רענן
              </button>
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={!current || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                צלם מצב מרחב זה
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">טוען אבחון מרחב...</p>
          ) : !live || !current ? (
            <EmptyTruth>
              פתח את הכלי מתוך מרחב ה-Moodle שלך (LTI 1.3 עם NRPS) כדי לזהות את הקורס ולצלם את מצבו.
            </EmptyTruth>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-base font-extrabold text-slate-900">{current.courseTitle || "—"}</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="מזהה קורס" value={current.courseId || "—"} />
                <Field label="מזהה קישור משאב (resource link)" value={current.resourceLinkId || "—"} />
                <Field label="Client ID" value={current.clientId || "—"} />
                <Field label="Deployment ID" value={current.deploymentId || "—"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
                <span>תלמידים: <span className="font-bold">{current.learners}</span></span>
                <span>מורים: <span className="font-bold">{current.instructors}</span></span>
                <span>סך משתתפים: <span className="font-bold">{current.totalMembers}</span></span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                מקור סנכרון אחרון: {current.source.toUpperCase()} · עודכן: {formatTeacherDateTime(current.takenAt)}
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
                <div key={spaceKey(s)} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-bold text-slate-900">{s.courseTitle || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    מזהה קורס: {s.courseId || "—"} · קישור משאב: {s.resourceLinkId || "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">נצפה: {formatTeacherDateTime(s.takenAt)}</div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                    <span>תלמידים: {s.learners}</span>
                    <span>מורים: {s.instructors}</span>
                    <span>סך משתתפים: {s.totalMembers}</span>
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
                <h2 className="text-xl font-extrabold text-green-900">בידוד נצפה בין שני מרחבים</h2>
              </div>
              <p className="text-sm leading-7 text-green-950">
                נשמרו צילומי מצב משני מרחבים שונים (מזהי קישור משאב / קורס שונים), וכל מרחב מציג את הספירות שלו בלבד.
                זו ראיה חיה שהכלי משייך נתונים לפי מרחב ואינו מערבב ביניהם. ודא ידנית שהמספרים בכל כרטיס
                תואמים למרחב הנכון — אם כן, בדיקת הבידוד עברה. <span className="font-bold">לא אומת</span> אוטומטית מעבר לכך.
              </p>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-amber-700" />
                <h2 className="text-xl font-extrabold text-amber-900">נדרש מרחב שני</h2>
              </div>
              <p className="text-sm leading-7 text-amber-950">
                כדי להשלים את הבדיקה: פתח את הכלי מתוך מרחב Moodle ראשון וצלם אותו, ואז פתח את הכלי מתוך{" "}
                <span className="font-bold">מרחב Moodle שני</span> וצלם גם אותו, ואז חזור למרחב הראשון לוודא שהמספרים לא התערבבו.
                {snaps.length === 1 ? " (נשמר מרחב אחד עד כה.)" : ""}
              </p>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold ${twoSpaces ? "border-green-300 bg-white text-green-800" : "border-amber-300 bg-white text-amber-800"}`}>
              {twoSpaces ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              מרחבים שנבדקו: {distinctSpaces.size}/2
            </span>
            <Link to="/isolation" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-700 hover:bg-slate-50">
              ראה גם: בידוד ברמת הקוד
            </Link>
          </div>
        </section>

        <p className="text-xs leading-5 text-muted-foreground">
          מוצגים מזהי התקנה/קורס וספירות בלבד — ללא שמות, ללא אימיילים, ללא מזהי משתמש, ללא טוקנים וללא סודות.
          שער ה-Teacher Release נשאר סגור עד שהבדיקה החיה תושלם.
        </p>
      </div>
    </SafePage>
  );
}
