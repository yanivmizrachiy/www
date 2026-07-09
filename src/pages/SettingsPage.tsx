import { useEffect, useMemo, useState } from "react";
import { SafePage } from "@/components/SafePage";
import { useImportsOverview } from "@/hooks/useImports";
import { formatTeacherDateTime } from "@/lib/teacherDateFormat";

type LoadState = "loading" | "ready" | "error";

function StatusLine({
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
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold">
        {value === null || value === undefined || value === "" ? "לא התקבל" : String(value)}
      </div>
    </div>
  );
}

async function fetchJsonSafe(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: "NOT_JSON",
      raw: text.slice(0, 2000),
      http_status: res.status,
    };
  }
}

export default function SettingsPage() {
  const [state, setState] = useState<LoadState>("loading");
  const importsOverview = useImportsOverview();
  const [error, setError] = useState("");
  const [services, setServices] = useState<any>(null);
  const [nrps, setNrps] = useState<any>(null);
  const [wsStatus, setWsStatus] = useState<any>(null);
  const [wsSiteInfo, setWsSiteInfo] = useState<any>(null);
  const [wsUsersPreview, setWsUsersPreview] = useState<any>(null);
  const [loadedAt, setLoadedAt] = useState<string>("");

  async function load() {
    setState("loading");
    setError("");
    setLoadedAt(formatTeacherDateTime(new Date()));

    try {
      const [servicesJson, nrpsJson, wsStatusJson, wsSiteInfoJson, wsUsersPreviewJson] =
        await Promise.all([
          fetchJsonSafe("/api/lti13/services-status"),
          fetchJsonSafe("/api/lti13/nrps-preview"),
          fetchJsonSafe("/api/moodle-ws/status"),
          fetchJsonSafe("/api/moodle-ws/site-info"),
          fetchJsonSafe("/api/moodle-ws/enrolled-users-preview"),
        ]);

      setServices(servicesJson);
      setNrps(nrpsJson);
      setWsStatus(wsStatusJson);
      setWsSiteInfo(wsSiteInfoJson);
      setWsUsersPreview(wsUsersPreviewJson);
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא ידועה בטעינת אבחון");
      setState("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const fieldPresence = nrps?.member_field_presence || {};
  const membersCount = Number(nrps?.members_count || 0);
  const learnersCount = Number(nrps?.role_counts?.Learner || 0);
  const instructorsCount = Number(nrps?.role_counts?.Instructor || 0);
  const hasNames = Number(fieldPresence?.has_name_count || 0) > 0;
  const hasEmails = Number(fieldPresence?.has_email_count || 0) > 0;
  const hasUserIds = Number(fieldPresence?.has_user_id_count || 0) > 0;
  const hasLisIds = Number(fieldPresence?.has_lis_person_sourcedid_count || 0) > 0;

  const wsConfigured = Boolean(wsStatus?.configured);
  const wsTokenMissing = wsStatus?.configured === false || wsSiteInfo?.error === "MOODLE_WS_TOKEN_NOT_CONFIGURED";
  const wsHasEnrollmentFunction = Boolean(wsSiteInfo?.site?.has_core_enrol_get_enrolled_users);
  const wsUsersCount = Number(wsUsersPreview?.users_count || 0);
  const wsFieldPresence = wsUsersPreview?.field_presence || {};
  const wsFullNameCount = Number(wsFieldPresence?.has_fullname_count || 0);
  const wsEmailCount = Number(wsFieldPresence?.has_email_count || 0);

  const truthMessage = useMemo(() => {
    if (state === "loading") return "טוען אבחון חי...";
    if (state === "error") return "לא ניתן לטעון אבחון כרגע.";

    if (nrps?.ok && membersCount > 0 && hasNames) {
      return "NRPS מחזיר משתתפים עם שמות. אפשר להתקדם למיפוי ושמירה מבוקרת.";
    }

    if (wsConfigured && wsUsersCount > 0 && wsFullNameCount > 0) {
      return "Moodle Web Services מחזיר משתמשים עם שמות. אפשר להתקדם לשמירה אוטומטית מבוקרת אחרי בדיקת הפרדת קורסים.";
    }

    if (nrps?.ok && membersCount > 0 && !hasNames && !hasEmails && wsTokenMissing) {
      return "NRPS עובד ומחזיר משתתפים אמיתיים, אך בלי שמות ומיילים. נתיב Web Services מוכן בקוד אך חסר MOODLE_WS_TOKEN אמיתי ב-Render.";
    }

    if (!services?.has_latest_lti13_session) {
      return "אין session חי. פתח את הכלי מתוך Moodle ואז רענן את המסך.";
    }

    if (!services?.has_nrps && wsTokenMissing) {
      return "אין כרגע מקור אוטומטי לשמות תלמידים. צריך NRPS עם שמות או MOODLE_WS_TOKEN אמיתי.";
    }

    return "האבחון נטען. בדוק את כרטיסי NRPS ו-Web Services כדי לראות מה חסר.";
  }, [state, services, nrps, membersCount, hasNames, hasEmails, wsConfigured, wsUsersCount, wsFullNameCount, wsTokenMissing]);

  return (
    <SafePage
      title="הגדרות ואבחון חיבור"
      description="סטטוס חיבור — LTI, NRPS ו-Moodle Web Services."
      backTo="-1"
    >
      <div className="space-y-6" dir="rtl">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">סטטוס חיבור</h2>
              <p className="mt-1 text-sm text-muted-foreground">{truthMessage}</p>
              {loadedAt && <p className="mt-1 text-xs text-muted-foreground">בדיקה אחרונה: {loadedAt}</p>}
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
            >
              רענן אבחון
            </button>
          </div>
        </div>

        {state === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">
            {error}
          </div>
        )}

        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-extrabold">חיבור אוטומטי מול Moodle</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatusLine
              label="חיבור מאובטח למודל"
              value={services?.has_latest_lti13_session ? "קיים" : "חסר"}
              tone={services?.has_latest_lti13_session ? "green" : "red"}
            />
            <StatusLine
              label="סנכרון רשימת משתתפים"
              value={services?.has_nrps ? "זמין" : "לא זמין"}
              tone={services?.has_nrps ? "green" : "red"}
            />
            <StatusLine
              label="עדכון ציונים אוטומטי"
              value={services?.has_ags ? "זמין" : "לא זמין"}
              tone={services?.has_ags ? "green" : "orange"}
            />
            <StatusLine
              label="בדיקת סנכרון משתתפים"
              value={nrps?.ok ? "עובד" : nrps?.error || "לא אומת"}
              tone={nrps?.ok ? "green" : "orange"}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatusLine label="משתתפים שהתקבלו" value={membersCount || "לא התקבל"} tone={membersCount > 0 ? "green" : "orange"} />
            <StatusLine label="תלמידים שזוהו" value={learnersCount || "לא התקבל"} tone={learnersCount > 0 ? "green" : "neutral"} />
            <StatusLine label="מורים שזוהו" value={instructorsCount || "לא התקבל"} tone={instructorsCount > 0 ? "green" : "neutral"} />
            <StatusLine
              label="שמירה למסד הנתונים"
              value={(importsOverview.data?.students_count ?? 0) > 0 ? `${importsOverview.data?.students_count} נשמרו` : "טרם נשמרו"}
              tone={(importsOverview.data?.students_count ?? 0) > 0 ? "green" : "orange"}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatusLine label="שמות תלמידים התקבלו" value={fieldPresence?.has_name_count ?? "לא התקבל"} tone={hasNames ? "green" : "orange"} />
            <StatusLine label="כתובות דוא״ל התקבלו" value={fieldPresence?.has_email_count ?? "לא התקבל"} tone={hasEmails ? "green" : "orange"} />
            <StatusLine label="מזהי משתמש התקבלו" value={fieldPresence?.has_user_id_count ?? "לא התקבל"} tone={hasUserIds ? "green" : "orange"} />
            <StatusLine label="מזהים מוסדיים התקבלו" value={fieldPresence?.has_lis_person_sourcedid_count ?? "לא התקבל"} tone={hasLisIds ? "green" : "orange"} />
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-extrabold">חיבור מורחב — שירותי Moodle</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatusLine
              label="הרשאת חיבור מורחבת"
              value={wsConfigured ? "מוגדרת" : "לא מוגדרת"}
              tone={wsConfigured ? "green" : "red"}
            />
            <StatusLine
              label="סטטוס חיבור"
              value={wsStatus?.mode === "moodle-web-services-automatic-readiness" ? "בדיקת תקינות מוכנה" : (wsStatus?.mode || wsStatus?.error || "לא התקבל")}
              tone={wsStatus?.ok ? (wsConfigured ? "green" : "orange") : "red"}
            />
            <StatusLine
              label="שליפת רשימת נרשמים"
              value={wsHasEnrollmentFunction ? "זמין" : wsTokenMissing ? "לא ניתן לבדוק ללא הרשאה" : "לא זמין / לא אומת"}
              tone={wsHasEnrollmentFunction ? "green" : "orange"}
            />
            <StatusLine
              label="שמירה אוטומטית"
              value="מוכן"
              tone="orange"
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatusLine
              label="משתמשים שהתקבלו"
              value={wsUsersCount || (wsTokenMissing ? "חסרה הרשאה" : "לא התקבל")}
              tone={wsUsersCount > 0 ? "green" : "orange"}
            />
            <StatusLine
              label="שמות שהתקבלו"
              value={wsFullNameCount || (wsTokenMissing ? "חסרה הרשאה" : "לא התקבל")}
              tone={wsFullNameCount > 0 ? "green" : "orange"}
            />
            <StatusLine
              label="כתובות דוא״ל שהתקבלו"
              value={wsEmailCount || (wsTokenMissing ? "חסרה הרשאה" : "לא התקבל")}
              tone={wsEmailCount > 0 ? "green" : "orange"}
            />
            <StatusLine
              label="מצב חסימה"
              value={wsTokenMissing ? "חסרה הרשאת חיבור מורחבת" : wsUsersPreview?.error || "לא חסום כרגע"}
              tone={wsTokenMissing ? "red" : "orange"}
            />
          </div>
        </section>

        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-7 text-orange-950">
          <p>קבלת שמות תלמידים אוטומטית דורשת סנכרון פעיל מול Moodle, או הרשאת חיבור מורחבת שמוגדרת על ידי מנהל המערכת.</p>
        </div>
      </div>
    </SafePage>
  );
}
