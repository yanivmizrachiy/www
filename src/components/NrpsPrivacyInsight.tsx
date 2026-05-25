import { useEffect, useState } from "react";
import { Users, UserCheck, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { hebrewRoleLabel } from "@/lib/roleLabel";

// MTH_NRPS_PRIVACY_INSIGHT_V1
// Reads the real /api/lti13/nrps-preview endpoint and shows the exact privacy
// reality: whether NRPS returned members, how many, and how many carried names
// / emails. This makes the "NRPS active but names blocked by privacy" case
// (observed in the real Moodle tool settings) visible and actionable. No demo,
// no invented names — only counts from the live NRPS response.

interface NrpsPreview {
  ok: boolean;
  members_count?: number;
  role_counts?: Record<string, number>;
  privacy_signals?: {
    has_name_count?: number;
    has_email_count?: number;
    has_user_id_count?: number;
  };
  // The endpoint nests the signal counts under different keys depending on stage;
  // we read defensively below.
  has_name_count?: number;
  has_email_count?: number;
  error?: string;
  stage?: string;
}

export function NrpsPrivacyInsight() {
  const [data, setData] = useState<NrpsPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [reachable, setReachable] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/lti13/nrps-preview", { headers: { Accept: "application/json" } });
        const json = await res.json().catch(() => null);
        if (!alive) return;
        setData(json);
        setReachable(Boolean(json));
      } catch {
        if (alive) setReachable(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <section className="rounded-3xl border bg-white p-6 shadow-sm" dir="rtl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> בודק NRPS חי...
        </div>
      </section>
    );
  }

  const membersCount = Number(data?.members_count ?? 0);
  // The endpoint exposes name/email counts either at top level or under a
  // privacy block; read both safely.
  const nameCount = Number(data?.has_name_count ?? data?.privacy_signals?.has_name_count ?? 0);
  const emailCount = Number(data?.has_email_count ?? data?.privacy_signals?.has_email_count ?? 0);
  const nrpsLive = Boolean(data?.ok) && membersCount > 0;
  const namesBlocked = nrpsLive && nameCount === 0;

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm" dir="rtl">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-extrabold text-slate-900">NRPS — רשימת משתתפים חיה</h2>
      </div>

      {!reachable || !data ? (
        <p className="text-sm text-muted-foreground">
          לא ניתן היה לבדוק NRPS כרגע. ודא שהכלי נפתח מתוך Moodle (LTI 1.3) ונסה שוב.
        </p>
      ) : !nrpsLive ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            NRPS לא החזיר משתתפים בהפעלה האחרונה
          </div>
          <p>
            ייתכן שהכלי לא נפתח מתוך Moodle בהפעלה חיה, או ש-NRPS אינו פעיל בהגדרות הכלי. אם הגדרת
            "סינכרון וניהול משתמשים" ל"השתמשו בשירות זה", פתח מחדש מתוך Moodle ונסה שוב.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold text-green-800">
                <UserCheck className="h-4 w-4" /> משתתפים שהתקבלו
              </div>
              <div className="text-2xl font-extrabold text-green-900">{membersCount}</div>
            </div>
            <div className={`rounded-2xl border p-4 ${nameCount > 0 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
              <div className={`mb-1 flex items-center gap-2 text-xs font-bold ${nameCount > 0 ? "text-green-800" : "text-amber-800"}`}>
                {nameCount > 0 ? <CheckCircle2 className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} עם שם
              </div>
              <div className={`text-2xl font-extrabold ${nameCount > 0 ? "text-green-900" : "text-amber-900"}`}>{nameCount}</div>
            </div>
            <div className={`rounded-2xl border p-4 ${emailCount > 0 ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
              <div className={`mb-1 flex items-center gap-2 text-xs font-bold ${emailCount > 0 ? "text-green-800" : "text-slate-600"}`}>
                {emailCount > 0 ? <CheckCircle2 className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} עם אימייל
              </div>
              <div className={`text-2xl font-extrabold ${emailCount > 0 ? "text-green-900" : "text-slate-700"}`}>{emailCount}</div>
            </div>
          </div>

          {data.role_counts && (
            <div className="text-xs text-muted-foreground">
              תפקידים: {Object.entries(data.role_counts).map(([r, c]) => `${hebrewRoleLabel(r)}: ${c}`).join(" · ")}
            </div>
          )}

          {namesBlocked && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
              <div className="mb-1 flex items-center gap-2 font-bold">
                <EyeOff className="h-4 w-4 text-amber-600" />
                NRPS פעיל ומחזיר {membersCount} משתתפים — אך ללא שמות
              </div>
              <p>
                הגדרות הפרטיות של הכלי ב-Moodle חוסמות שמות. כדי לקבל שמות אמיתיים אוטומטית
                (בלי ייבוא ידני), שנה בהגדרות הכלי ב-Moodle, תחת "פרטיות":
              </p>
              <ul className="mt-2 mr-4 list-disc space-y-1">
                <li>"שתפו שם המשתמש עם הכלי החיצוני" → בחר "תמיד".</li>
                <li>(אופציונלי) "שתפו כתובת הדואר" → "תמיד", אם דרושים אימיילים.</li>
              </ul>
              <p className="mt-2 text-xs">
                לאחר השינוי, פתח מחדש את הכלי מתוך Moodle — הרשימה תתמלא בשמות אוטומטית.
                עד אז, אפשר להשתמש בייבוא רשימת המשתתפים כ-fallback.
              </p>
            </div>
          )}

          {nameCount > 0 && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-900">
              NRPS מחזיר שמות אמיתיים — רשימת המשתתפים נטענת אוטומטית, ללא ייבוא ידני.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
