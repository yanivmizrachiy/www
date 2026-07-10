import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useImportedStudents } from "@/hooks/useImports";
import { nrpsPreviewUrl } from "@/hooks/useLtiSession";
import { GraduationCap, Users, RefreshCw, ArrowLeft } from "lucide-react";

// MTH_STUDENTS_TEACHERS_REAL_LIST_V1
// Two real sections, no demo text:
//  - מורים: real instructor names from NRPS.
//  - תלמידים: real learner roster. Only Learners are listed (instructors and
//    unknown roles are excluded). Counts come from live NRPS; rows link to a
//    real profile only when the learner matches an imported student record.
//    No invented names or IDs; missing stays missing.

type NrpsState = "loading" | "ready" | "error";

interface NamedMember {
  id: string;
  name: string;
  // role_kind is the robust server classification; is_instructor is kept for
  // backwards compatibility. Only role_kind === "learner" is a real student.
  role_kind?: "learner" | "instructor" | "unknown";
  is_instructor: boolean;
  has_email: boolean;
}

// A member is a teacher when classified "instructor" (or, for older payloads
// without role_kind, when is_instructor is set).
function isTeacherMember(m: NamedMember): boolean {
  return m.role_kind ? m.role_kind === "instructor" : m.is_instructor;
}

// A member is a real student only when explicitly classified as a learner.
// Unknown/ambiguous roles are never shown as students. Older payloads without
// role_kind fall back to "not an instructor".
function isLearnerMember(m: NamedMember): boolean {
  return m.role_kind ? m.role_kind === "learner" : !m.is_instructor;
}

// Normalize a display name so a live NRPS learner can be matched to an already
// imported student record (the real, clickable profile id). Whitespace-only.
function normalizeName(name: string): string {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export default function Page() {
  const { data: imported } = useImportedStudents();
  const [nrpsState, setNrpsState] = useState<NrpsState>("loading");
  const [nrps, setNrps] = useState<any>(null);

  async function loadNrps() {
    setNrpsState("loading");
    try {
      const res = await fetch(nrpsPreviewUrl(), {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      setNrps(json);
      setNrpsState("ready");
    } catch {
      setNrpsState("error");
    }
  }
  useEffect(() => { loadNrps(); }, []);

  const live = Boolean(nrps?.ok);
  const named: NamedMember[] = Array.isArray(nrps?.members_named) ? nrps.members_named : [];
  const teachers = useMemo(() => named.filter(isTeacherMember), [named]);
  const studentsFromNrps = useMemo(() => named.filter(isLearnerMember), [named]);

  // Aggregate counts straight from live NRPS role_counts (authoritative source).
  const learnersCount = Number(nrps?.role_counts?.Learner || 0);
  const instructorsCount = Number(nrps?.role_counts?.Instructor || 0);
  const participantsCount = Number(nrps?.members_count || 0);
  // Anything in the roster that NRPS counted but is neither Learner nor
  // Instructor. Surfaced as a safe note only; never auto-treated as a student.
  const unknownCount = Math.max(0, participantsCount - learnersCount - instructorsCount);

  const showSummary = live && participantsCount > 0;

  // Build the learner rows. Prefer the real NRPS roster (Learners only) and link
  // each to a valid profile only when the name matches an imported student
  // record (whose id is a real, routable student id). NRPS member ids are opaque
  // hashes that are NOT valid profile ids, so we never link to `nrps:<id>`.
  const importedByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of imported || []) {
      const key = normalizeName(s.full_name);
      if (key && !map.has(key)) map.set(key, s.id);
    }
    return map;
  }, [imported]);

  const studentRows = useMemo(() => {
    if (studentsFromNrps.length > 0) {
      return studentsFromNrps.map((m) => {
        const matchedId = importedByName.get(normalizeName(m.name)) || null;
        return { key: m.id, name: m.name, to: matchedId ? `/students/${matchedId}` : null };
      });
    }
    return (imported || []).map((s) => ({ key: s.id, name: s.full_name, to: `/students/${s.id}` }));
  }, [studentsFromNrps, imported, importedByName]);

  return (
    <SafePage title="תלמידים ומורים" description="רשימת התלמידים והמורים של המרחב." backTo="/" backLabel="חזרה למרכז המורה">
      <div className="space-y-6" dir="rtl">
        {/* NRPS summary — shown only when live NRPS returned real counts */}
        {showSummary && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-emerald-900">
              <span className="text-base font-black">{participantsCount} משתתפים במרחב</span>
              <span className="text-emerald-400">·</span>
              <span>{learnersCount} תלמידים</span>
              <span className="text-emerald-400">·</span>
              <span>{instructorsCount} מורים</span>
              {unknownCount > 0 && (
                <>
                  <span className="text-emerald-400">·</span>
                  <span className="text-emerald-700">{unknownCount} בתפקיד לא מזוהה</span>
                </>
              )}
            </div>
            <div className="mt-1 text-xs font-medium text-emerald-700">מקור: רשימת משתתפים ממודל</div>
          </section>
        )}

        {/* Teachers */}
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <GraduationCap className="h-5 w-5 text-primary" /> מורים
            </h2>
            {instructorsCount > 0 && (
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-black text-green-900">
                {instructorsCount}
              </span>
            )}
          </div>
          {nrpsState === "loading" ? (
            <p className="text-sm text-muted-foreground">טוען...</p>
          ) : teachers.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {teachers.map((t) => (
                <li key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800">
                  {t.name}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyTruth>אין כרגע מורים להצגה. פתח את הכלי מתוך Moodle.</EmptyTruth>
          )}
        </section>

        {/* Students (Learners only) */}
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <Users className="h-5 w-5 text-primary" /> תלמידים
            </h2>
            <div className="flex items-center gap-2">
              {studentRows.length > 0 && (
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-black text-green-900">
                  {studentRows.length}
                </span>
              )}
              <button
                type="button"
                onClick={loadNrps}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className={nrpsState === "loading" ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                רענן
              </button>
            </div>
          </div>

          {nrpsState === "loading" ? (
            <p className="text-sm text-muted-foreground">טוען רשימת תלמידים...</p>
          ) : studentRows.length > 0 ? (
            <ul className="space-y-2">
              {studentRows.map((s) =>
                s.to ? (
                  <li key={s.key}>
                    <Link
                      to={s.to}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                    >
                      <span className="text-base font-extrabold text-primary">{s.name}</span>
                      <ArrowLeft className="h-4 w-4 shrink-0 text-primary" />
                    </Link>
                  </li>
                ) : (
                  <li
                    key={s.key}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-base font-extrabold text-slate-800">{s.name}</span>
                  </li>
                )
              )}
            </ul>
          ) : learnersCount > 0 ? (
            <EmptyTruth>
              {`המערכת מזהה ${learnersCount} תלמידים במרחב. ודא שהפרטיות בכלי ב-Moodle מאפשרת שיתוף שמות, ואז רענן.`}
            </EmptyTruth>
          ) : (
            <EmptyTruth>אין כרגע תלמידים להצגה. פתח את הכלי מתוך Moodle.</EmptyTruth>
          )}
        </section>
      </div>
    </SafePage>
  );
}
