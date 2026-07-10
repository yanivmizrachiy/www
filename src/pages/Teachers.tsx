import { useEffect, useMemo, useState } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useLtiSession, nrpsPreviewUrl } from "@/hooks/useLtiSession";
import { hebrewRoleLabel } from "@/lib/roleLabel";
import { formatTeacherDateTime } from "@/lib/teacherDateFormat";
import { GraduationCap, RefreshCw, Users } from "lucide-react";

// MTH_TEACHERS_PAGE_V1
// Teacher/team page for the current LTI 1.3 space. Reads the safe NRPS preview
// (same endpoint + token flow as Dashboard/Students) and shows ONLY instructor
// (Instructor / teacher) members: real names + a short Hebrew role label, the
// team size, the space name when safely known, the source (NRPS), and the
// NRPS update time. Optionally marks which teacher opened the tool, inferred
// purely by matching the session display name to an NRPS instructor name — no
// identifiers, emails, raw IDs, national IDs, tokens, or secrets are read or
// shown. Never invents names or counts: missing stays missing.

type NrpsState = "loading" | "ready" | "error";

interface NamedMember {
  id: string;
  name: string;
  role_kind?: "learner" | "instructor" | "unknown";
  is_instructor: boolean;
  has_email: boolean;
}

function isTeacherMember(m: NamedMember): boolean {
  return m.role_kind ? m.role_kind === "instructor" : m.is_instructor;
}

// Normalize a display name so the session teacher can be matched to an NRPS
// instructor name. Whitespace/case only — never compares identifiers.
function normalizeName(name: string): string {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export default function Page() {
  const { session, site } = useLtiSession();
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

  // Authoritative instructor count from live NRPS role_counts; falls back to the
  // number of resolved instructor names only when the count field is absent.
  const instructorsCount = Number(nrps?.role_counts?.Instructor || 0) || teachers.length;
  const updatedAt = live && typeof nrps?.now === "string" ? nrps.now : null;

  // Space/course name — only when safely available from the session/site.
  const courseName = session?.course_title || site?.site_name || null;

  // "Who opened the tool" — inferred ONLY by matching the session display name to
  // an NRPS instructor name. No identifiers involved. If the session has no safe
  // display name, nobody is marked (we never guess).
  const sessionName = normalizeName(session?.teacher_display_name || "");
  const teamSizeLabel = instructorsCount === 1 ? "מורה אחד" : `${instructorsCount} מורים`;

  return (
    <SafePage
      title="צוות הוראה במרחב"
      description="המורים וצוות ההוראה של המרחב, מתוך רשימת המשתתפים של Moodle."
      backTo="/"
      backLabel="חזרה למרכז המורה"
    >
      <div className="space-y-6" dir="rtl">
        {/* Summary — shown only when live NRPS returned a real instructor count */}
        {live && instructorsCount > 0 && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-emerald-900">
              <span className="text-base font-black">{teamSizeLabel} במרחב</span>
              {courseName && (
                <>
                  <span className="text-emerald-400">·</span>
                  <span className="font-extrabold">{courseName}</span>
                </>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-emerald-700">
              <span>מקור: רשימת משתתפים ממודל</span>
              {updatedAt && (
                <>
                  <span className="text-emerald-400">·</span>
                  <span>עודכן {formatTeacherDateTime(updatedAt)}</span>
                </>
              )}
            </div>
          </section>
        )}

        {/* Teachers / team */}
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <GraduationCap className="h-5 w-5 text-primary" /> מורים וצוות הוראה
            </h2>
            <div className="flex items-center gap-2">
              {instructorsCount > 0 && (
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-black text-green-900">
                  {instructorsCount}
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
            <p className="text-sm text-muted-foreground">טוען רשימת מורים...</p>
          ) : teachers.length > 0 ? (
            <ul className="space-y-2">
              {teachers.map((t) => {
                const isYou = sessionName && normalizeName(t.name) === sessionName;
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold text-slate-800">{t.name}</span>
                      {isYou && (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          זה אתה
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      {hebrewRoleLabel(t.role_kind || "instructor")}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : instructorsCount > 0 ? (
            <EmptyTruth>
              {`המערכת מזהה ${teamSizeLabel} במרחב, אך השמות לא התקבלו. ודא שהפרטיות בכלי ב-Moodle מאפשרת שיתוף שמות, ואז רענן.`}
            </EmptyTruth>
          ) : (
            <EmptyTruth>אין כרגע מורים להצגה. פתח את הכלי מתוך Moodle.</EmptyTruth>
          )}
        </section>

        {/* Truthful note linking back to the full participants view */}
        <section className="flex items-center gap-2 rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          <span>רשימת התלמידים המלאה זמינה בעמוד התלמידים והמורים.</span>
        </section>
      </div>
    </SafePage>
  );
}
