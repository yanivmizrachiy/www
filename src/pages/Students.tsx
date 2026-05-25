import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useImportedStudents } from "@/hooks/useImports";

// MTH_PARTICIPANTS_TEACHER_ROLES_PRIVACY_SAFE_LIST_V1
// Clean, privacy-safe participants view:
// - Student names are clickable links to their profile.
// - The main list shows ONLY name + open-profile action.
// - Emails / usernames / external IDs are NOT shown in the main list;
//   they are available behind an explicit "הצג פרטים נוספים" toggle, and
//   only when the data is real (never invented).
// - Teachers are shown ONLY when NRPS returns a real Instructor source.
// Truth-first: missing stays missing, no invented names, no fake "connected".

type NrpsState = "loading" | "ready" | "error";

function InfoCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  tone?: "green" | "orange" | "red" | "neutral";
}) {
  const toneClass =
    tone === "green"
      ? "border-green-200 bg-green-50 text-green-900"
      : tone === "orange"
        ? "border-orange-200 bg-orange-50 text-orange-900"
        : tone === "red"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-slate-200 bg-white text-slate-900";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-xs font-bold opacity-70">{label}</div>
      <div className="mt-1 break-words text-xl font-extrabold">
        {value === null || value === undefined || value === "" ? "לא התקבל" : String(value)}
      </div>
    </div>
  );
}

export default function Page() {
  const { data, loading, error } = useImportedStudents();
  const [nrpsState, setNrpsState] = useState<NrpsState>("loading");
  const [nrpsError, setNrpsError] = useState("");
  const [nrps, setNrps] = useState<any>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  async function loadNrps() {
    setNrpsState("loading");
    setNrpsError("");

    try {
      const res = await fetch("/api/lti13/nrps-preview", {
        headers: { Accept: "application/json" },
      });

      const text = await res.text();
      let json: any = null;

      try {
        json = JSON.parse(text);
      } catch {
        json = { ok: false, raw: text.slice(0, 2000) };
      }

      setNrps(json);
      setNrpsState("ready");
    } catch (err) {
      setNrpsError(err instanceof Error ? err.message : "שגיאה לא ידועה בבדיקת NRPS");
      setNrpsState("error");
    }
  }

  useEffect(() => {
    loadNrps();
  }, []);

  const importedCount = data?.length ?? 0;
  const membersCount = Number(nrps?.members_count || 0);
  const learnersCount = Number(nrps?.role_counts?.Learner || 0);
  const instructorsCount = Number(nrps?.role_counts?.Instructor || 0);
  const fieldPresence = nrps?.member_field_presence || {};
  const hasNameCount = Number(fieldPresence?.has_name_count || 0);
  const hasEmailCount = Number(fieldPresence?.has_email_count || 0);

  // Real teacher names, only if NRPS actually provided named Instructor members.
  // We never invent names: a member counts only if it has a real name string
  // AND a role that marks it as an instructor/teacher.
  const teacherNames: string[] = useMemo(() => {
    const members = Array.isArray(nrps?.members) ? nrps.members : [];
    const names: string[] = [];
    for (const m of members) {
      const roles: string[] = Array.isArray(m?.roles)
        ? m.roles
        : typeof m?.role === "string"
          ? [m.role]
          : [];
      const isInstructor = roles.some((r) => /instructor|teacher|מורה/i.test(String(r)));
      const name = (m?.name || m?.full_name || "").toString().trim();
      if (isInstructor && name) names.push(name);
    }
    return Array.from(new Set(names));
  }, [nrps]);

  const truthMessage = useMemo(() => {
    if (nrpsState === "loading") return "בודק NRPS מול Moodle...";
    if (nrpsState === "error") return "לא ניתן לבדוק NRPS כרגע.";
    if (!nrps?.ok && nrps?.error === "NO_LIVE_LTI13_NRPS_SESSION") {
      return "אין session חי. פתח את הכלי מתוך Moodle ואז רענן את המסך.";
    }
    if (!nrps?.ok) {
      return "NRPS עדיין לא החזיר משתתפים. בדוק את מסך הגדרות/אבחון.";
    }
    if (nrps?.ok && membersCount > 0 && hasNameCount === 0 && hasEmailCount === 0) {
      return "NRPS עובד ומחזיר משתתפים אמיתיים, אך Moodle שולח מזהים בלבד ללא שמות וללא מיילים. נדרש ייבוא Participants להשלמת שמות.";
    }
    if (nrps?.ok && membersCount > 0) {
      return "NRPS עובד ומחזיר משתתפים אמיתיים. נדרש מיפוי מבוקר לפני שמירה.";
    }
    return "עדיין לא התקבלו משתתפים מ-NRPS.";
  }, [nrpsState, nrps, membersCount, hasNameCount, hasEmailCount]);

  const anySensitiveAvailable = useMemo(
    () => (data || []).some((s) => s.email || s.external_username || s.external_id),
    [data]
  );

  return (
    <SafePage
      title="משתתפים"
      description="רשימת תלמידים ומורים אמיתית בלבד. NRPS מאמת מי שייך למרחב, וייבוא Participants משלים שמות כאשר Moodle לא שולח אותם ב-NRPS."
    >
      <div className="space-y-6" dir="rtl">
        {/* Teachers in this space */}
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">מורים במרחב</h2>
            {instructorsCount > 0 && (
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-black text-green-900">
                {instructorsCount} מורים
              </span>
            )}
          </div>

          {nrpsState === "loading" ? (
            <p className="text-sm text-muted-foreground">בודק מורים מול NRPS...</p>
          ) : instructorsCount > 0 && teacherNames.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {teacherNames.map((name, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : instructorsCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              NRPS מאשר {instructorsCount} מורים במרחב, אך Moodle לא שלח את שמותיהם. לא מוצגים שמות מומצאים.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              אין כרגע מקור אמיתי לשמות/מספר מורים. פתח את הכלי מתוך Moodle עם NRPS פעיל כדי להציג מורים.
            </p>
          )}
        </section>

        {/* Source truth + refresh */}
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">אמת מקור משתתפים</h2>
              <p className="mt-1 text-sm text-muted-foreground">{truthMessage}</p>
            </div>
            <button
              type="button"
              onClick={loadNrps}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
            >
              רענן בדיקת NRPS
            </button>
          </div>
        </section>

        {nrpsState === "error" && <EmptyTruth>{nrpsError}</EmptyTruth>}

        {/* Real counts (aggregate, no PII) */}
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="משתתפים מ-NRPS"
            value={membersCount || "לא התקבל"}
            tone={membersCount > 0 ? "green" : "orange"}
          />
          <InfoCard
            label="Learners / תלמידים"
            value={learnersCount || "לא התקבל"}
            tone={learnersCount > 0 ? "green" : "orange"}
          />
          <InfoCard
            label="Instructors / מורים"
            value={instructorsCount || "לא התקבל"}
            tone={instructorsCount > 0 ? "green" : "neutral"}
          />
          <InfoCard
            label="תלמידים עם שמות מיובאים"
            value={importedCount}
            tone={importedCount > 0 ? "green" : "orange"}
          />
        </section>

        {nrps?.ok && learnersCount > 0 && hasNameCount === 0 && importedCount === 0 && (
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-7 text-orange-950">
            <h3 className="mb-2 font-extrabold">מה חסר כדי לראות שמות תלמידים?</h3>
            <p>
              Moodle NRPS אימת שיש במרחב תלמידים אמיתיים, אבל לא שלח שמות או מיילים. לכן אין להציג שמות מומצאים.
              השלב הבא הוא לייבא דוח Participants אמיתי ממודל. לאחר מכן אפשר למפות בין מזהי NRPS לבין דוח המשתתפים.
            </p>
            <div className="mt-4">
              <Link
                to="/import"
                className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
              >
                עבור לייבוא Participants
              </Link>
            </div>
          </div>
        )}

        {/* Clean student list: name (clickable) + open profile */}
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">תלמידים</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                רשימה נקייה: שם תלמיד לחיץ הפותח את פרופיל התלמיד. פרטים רגישים אינם מוצגים כברירת מחדל.
              </p>
            </div>
            {anySensitiveAvailable && (
              <button
                type="button"
                onClick={() => setShowSensitive((v) => !v)}
                className="self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                {showSensitive ? "הסתר פרטים נוספים" : "הצג פרטים נוספים"}
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">טוען רשימת תלמידים מיובאים...</p>
          ) : error ? (
            <EmptyTruth>{error}</EmptyTruth>
          ) : !data?.length ? (
            <EmptyTruth>
              עדיין לא יובאה רשימת Participants עם שמות. NRPS מאומת, אך חסרים שמות להצגה.
            </EmptyTruth>
          ) : (
            <ul className="space-y-2">
              {data.map((student) => (
                <li key={student.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to={`/students/${student.id}`}
                      className="text-base font-extrabold text-primary hover:underline"
                    >
                      {student.full_name}
                    </Link>
                    <Link
                      to={`/students/${student.id}`}
                      className="shrink-0 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5"
                    >
                      פתח פרופיל ←
                    </Link>
                  </div>

                  {showSensitive && (
                    <div className="mt-2 grid gap-1 border-t border-slate-200 pt-2 text-xs text-muted-foreground sm:grid-cols-3">
                      <div>
                        <span className="font-bold">מזהה/שם משתמש: </span>
                        {student.external_username || student.external_id || "לא התקבל"}
                      </div>
                      <div>
                        <span className="font-bold">מייל: </span>
                        {student.email || "לא התקבל"}
                      </div>
                      <div>
                        <span className="font-bold">מקור: </span>
                        Participants import
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </SafePage>
  );
}
