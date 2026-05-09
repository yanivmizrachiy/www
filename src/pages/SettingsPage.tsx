import { useEffect, useMemo, useState } from "react";
import { SafePage } from "@/components/SafePage";

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

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <details className="rounded-2xl border bg-slate-950 p-4 text-left text-xs text-slate-50" dir="ltr">
      <summary className="cursor-pointer font-bold">{title}</summary>
      <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

export default function SettingsPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [services, setServices] = useState<any>(null);
  const [nrps, setNrps] = useState<any>(null);
  const [loadedAt, setLoadedAt] = useState<string>("");

  async function load() {
    setState("loading");
    setError("");
    setLoadedAt(new Date().toLocaleString("he-IL"));

    try {
      const [servicesRes, nrpsRes] = await Promise.all([
        fetch("/api/lti13/services-status", { headers: { Accept: "application/json" } }),
        fetch("/api/lti13/nrps-preview", { headers: { Accept: "application/json" } }),
      ]);

      const servicesText = await servicesRes.text();
      const nrpsText = await nrpsRes.text();

      let servicesJson: any = null;
      let nrpsJson: any = null;

      try {
        servicesJson = JSON.parse(servicesText);
      } catch {
        servicesJson = { ok: false, raw: servicesText.slice(0, 2000) };
      }

      try {
        nrpsJson = JSON.parse(nrpsText);
      } catch {
        nrpsJson = { ok: false, raw: nrpsText.slice(0, 2000) };
      }

      setServices(servicesJson);
      setNrps(nrpsJson);
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

  const truthMessage = useMemo(() => {
    if (state === "loading") return "טוען אבחון חי...";
    if (state === "error") return "לא ניתן לטעון אבחון כרגע.";
    if (!services?.has_latest_lti13_session) {
      return "אין session חי. פתח את הכלי מתוך Moodle ואז רענן את המסך.";
    }
    if (!services?.has_nrps) {
      return "יש session, אך NRPS לא זמין ב-launch האחרון.";
    }
    if (nrps?.ok && membersCount > 0 && !hasNames && !hasEmails) {
      return "NRPS עובד ומחזיר משתתפים אמיתיים, אך Moodle שולח מזהים בלבד ללא שמות וללא מיילים. יש להשלים שמות דרך Participants import.";
    }
    if (nrps?.ok && membersCount > 0) {
      return "NRPS עובד ומחזיר משתתפים אמיתיים. נדרש מיפוי מבוקר לפני שמירה.";
    }
    return "NRPS עדיין לא החזיר משתתפים. בדוק את services-status ו-nrps-preview.";
  }, [state, services, nrps, membersCount, hasNames, hasEmails]);

  return (
    <SafePage
      title="הגדרות ואבחון חיבור"
      description="מסך אמת חי ל-LTI 1.3, NRPS, AGS ומצב הנתונים. לא מוצגים secrets, access tokens, שמות תלמידים או מיילים."
    >
      <div className="space-y-6" dir="rtl">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">סטטוס אמת חי</h2>
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

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatusLine
            label="LTI 1.3 session"
            value={services?.has_latest_lti13_session ? "קיים" : "חסר"}
            tone={services?.has_latest_lti13_session ? "green" : "red"}
          />
          <StatusLine
            label="NRPS"
            value={services?.has_nrps ? "זמין" : "לא זמין"}
            tone={services?.has_nrps ? "green" : "red"}
          />
          <StatusLine
            label="AGS"
            value={services?.has_ags ? "זמין" : "לא זמין"}
            tone={services?.has_ags ? "green" : "orange"}
          />
          <StatusLine
            label="NRPS preview"
            value={nrps?.ok ? "עובד" : nrps?.error || "לא אומת"}
            tone={nrps?.ok ? "green" : "orange"}
          />
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatusLine label="משתתפים מ-NRPS" value={membersCount || "לא התקבל"} tone={membersCount > 0 ? "green" : "orange"} />
          <StatusLine label="Learners / תלמידים" value={learnersCount || "לא התקבל"} tone={learnersCount > 0 ? "green" : "orange"} />
          <StatusLine label="Instructors / מורים" value={instructorsCount || "לא התקבל"} tone={instructorsCount > 0 ? "green" : "neutral"} />
          <StatusLine label="שמירה למסד" value="לא בוצעה — אבחון בלבד" tone="orange" />
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatusLine label="שמות ב-NRPS" value={fieldPresence?.has_name_count ?? "לא התקבל"} tone={hasNames ? "green" : "orange"} />
          <StatusLine label="מיילים ב-NRPS" value={fieldPresence?.has_email_count ?? "לא התקבל"} tone={hasEmails ? "green" : "orange"} />
          <StatusLine label="user_id ב-NRPS" value={fieldPresence?.has_user_id_count ?? "לא התקבל"} tone={hasUserIds ? "green" : "orange"} />
          <StatusLine label="lis_person_sourcedid ב-NRPS" value={fieldPresence?.has_lis_person_sourcedid_count ?? "לא התקבל"} tone={hasLisIds ? "green" : "orange"} />
        </section>

        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-7 text-orange-950">
          <h3 className="mb-2 font-extrabold">מסקנה למורה / מפתח</h3>
          <p>
            אם NRPS מחזיר 59 תלמידים אך 0 שמות ו-0 מיילים, אין להציג רשימת תלמידים עם שמות מומצאים.
            השלב הבא הוא לייבא דוח Participants אמיתי ממודל, ואז לבצע מיפוי מבוקר בין מזהי NRPS לבין דוח המשתתפים.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <JsonBlock title="services-status raw JSON" data={services} />
          <JsonBlock title="nrps-preview raw JSON" data={nrps} />
        </div>
      </div>
    </SafePage>
  );
}
