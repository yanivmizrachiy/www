import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useImportedStudents } from "@/hooks/useImports";

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
  const hasUserIdCount = Number(fieldPresence?.has_user_id_count || 0);
  const hasLisPersonCount = Number(fieldPresence?.has_lis_person_sourcedid_count || 0);

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

  return (
    <SafePage
      title="תלמידים"
      description="רשימת תלמידים אמיתית בלבד. NRPS מאמת מי שייך למרחב, וייבוא Participants משלים שמות כאשר Moodle לא שולח אותם ב-NRPS."
    >
      <div className="space-y-6" dir="rtl">
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">אמת מקור תלמידים</h2>
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

        {nrpsState === "error" && (
          <EmptyTruth>{nrpsError}</EmptyTruth>
        )}

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

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="שמות שהגיעו מ-NRPS"
            value={hasNameCount}
            tone={hasNameCount > 0 ? "green" : "orange"}
          />
          <InfoCard
            label="מיילים שהגיעו מ-NRPS"
            value={hasEmailCount}
            tone={hasEmailCount > 0 ? "green" : "orange"}
          />
          <InfoCard
            label="user_id מ-NRPS"
            value={hasUserIdCount || "לא התקבל"}
            tone={hasUserIdCount > 0 ? "green" : "orange"}
          />
          <InfoCard
            label="lis_person_sourcedid מ-NRPS"
            value={hasLisPersonCount || "לא התקבל"}
            tone={hasLisPersonCount > 0 ? "green" : "orange"}
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

        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold">תלמידים עם שמות שיובאו</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              כאן מוצגים רק תלמידים אמיתיים שנקלטו מ-Participants import. אין תלמידים לדוגמה ואין השלמת שמות אוטומטית.
            </p>
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-right text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="px-3 py-2">שם תלמיד</th>
                    <th className="px-3 py-2">מזהה / שם משתמש</th>
                    <th className="px-3 py-2">מייל</th>
                    <th className="px-3 py-2">מקור</th>
                    <th className="px-3 py-2">פעולה</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((student) => (
                    <tr key={student.id} className="rounded-2xl bg-slate-50">
                      <td className="rounded-r-2xl px-3 py-3 font-bold">{student.full_name}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {student.external_username || student.external_id || "לא התקבל"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {student.email || "לא התקבל"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        Participants import
                      </td>
                      <td className="rounded-l-2xl px-3 py-3">
                        <Link to={`/students/${student.id}`} className="font-bold text-primary hover:underline">
                          פתח פרופיל
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </SafePage>
  );
}
