import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useImportedStudents } from "@/hooks/useImports";
import { GraduationCap, Users, RefreshCw, ArrowLeft } from "lucide-react";

// MTH_STUDENTS_TEACHERS_REAL_LIST_V1
// Two real sections, no demo text:
//  - מורים: real instructor names from NRPS.
//  - תלמידים: real student roster from NRPS (names now allowed by Moodle
//    privacy), each clickable to a profile. Imported students are merged in
//    when present. No invented names; missing stays missing.

type NrpsState = "loading" | "ready" | "error";

interface NamedMember {
  id: string;
  name: string;
  is_instructor: boolean;
  has_email: boolean;
}

function StudentSearchList({ rows }: { rows: { key: string; name: string; to: string }[] }) {
  const [q, setQ] = useState("");
  const filtered = q ? rows.filter(r => r.name.includes(q)) : rows;
  return (
    <div className="space-y-2">
      <input type="text" placeholder="חיפוש תלמיד..." value={q} onChange={e => setQ(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2 px-4 text-sm focus:border-primary focus:outline-none" dir="rtl" />
      <ul className="space-y-2">
        {filtered.map((s) => (
          <li key={s.key}>
            <Link to={s.to} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5">
              <StudentAvatar name={s.name} size="sm" />
              <span className="flex-1 text-base font-extrabold text-primary">{s.name}</span>
              <ArrowLeft className="h-4 w-4 shrink-0 text-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  const { data: imported } = useImportedStudents();
  const [nrpsState, setNrpsState] = useState<NrpsState>("loading");
  const [nrps, setNrps] = useState<any>(null);

  async function loadNrps() {
    setNrpsState("loading");
    try {
      const res = await fetch("/api/lti13/nrps-preview", { headers: { Accept: "application/json" } });
      const json = await res.json().catch(() => null);
      setNrps(json);
      setNrpsState("ready");
    } catch {
      setNrpsState("error");
    }
  }
  useEffect(() => { loadNrps(); }, []);

  const named: NamedMember[] = Array.isArray(nrps?.members_named) ? nrps.members_named : [];
  const teachers = useMemo(() => named.filter((m) => m.is_instructor), [named]);
  const studentsFromNrps = useMemo(() => named.filter((m) => !m.is_instructor), [named]);

  const learnersCount = Number(nrps?.role_counts?.Learner || 0);
  const instructorsCount = Number(nrps?.role_counts?.Instructor || 0);

  // Prefer the real NRPS roster (with names). Fall back to imported students.
  const studentRows = useMemo(() => {
    if (studentsFromNrps.length > 0) {
      return studentsFromNrps.map((m) => ({ key: m.id, name: m.name, to: `/students/nrps:${m.id}` }));
    }
    return (imported || []).map((s) => ({ key: s.id, name: s.full_name, to: `/students/${s.id}` }));
  }, [studentsFromNrps, imported]);

  return (
    <SafePage title="תלמידים ומורים" description="רשימת התלמידים והמורים של המרחב." backTo="/" backLabel="חזרה למרכז המורה">
      <div className="space-y-6" dir="rtl">
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

        {/* Students */}
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
              {studentRows.map((s) => (
                <li key={s.key}>
                  <Link
                    to={s.to}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span className="text-base font-extrabold text-primary">{s.name}</span>
                    <ArrowLeft className="h-4 w-4 shrink-0 text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : learnersCount > 0 ? (
            <EmptyTruth>
              {`NRPS מאשר ${learnersCount} תלמידים במרחב. ודא שהפרטיות בכלי ב-Moodle מאפשרת שיתוף שמות, ואז רענן.`}
            </EmptyTruth>
          ) : (
            <EmptyTruth>אין כרגע תלמידים להצגה. פתח את הכלי מתוך Moodle.</EmptyTruth>
          )}
        </section>
      </div>
    </SafePage>
  );
}


