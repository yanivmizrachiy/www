import { Link } from "react-router-dom";
import { Compass, ExternalLink, FileSearch, UploadCloud, ArrowLeft } from "lucide-react";

// MTH_TEACHER_ONBOARDING_GUIDE_V1
// First-run guidance shown on the dashboard when the teacher has no real data
// yet. Walks the teacher through the exact 3-step flow we built, with direct
// links into each step. No demo data — purely navigational guidance.

interface Step {
  n: number;
  title: string;
  body: string;
  to: string;
  cta: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    n: 1,
    title: "בדוק מה חסר",
    body: "המערכת בודקת אילו מקורות אמת חסרים, ונותנת לך קישור ישיר לכל דוח Moodle שצריך — בלי לחפש לבד.",
    to: "/missing-data",
    cta: "פתח: מה חסר",
    Icon: FileSearch,
  },
  {
    n: 2,
    title: "הורד את הדוח מ-Moodle",
    body: "לחיצה אחת על הקישור הישיר פותחת את הדוח המדויק במרחב ה-Moodle שלך. הורד אותו כקובץ (CSV / Excel / ODS).",
    to: "/missing-data",
    cta: "קישורים ישירים לדוחות",
    Icon: ExternalLink,
  },
  {
    n: 3,
    title: "גרור לייבוא חכם",
    body: "גרור את הקובץ (או כמה יחד) ל\"ייבוא חכם\". המערכת מזהה לבד איזה דוח זה ומעדכנת את כל המסכים. וזהו.",
    to: "/smart-import",
    cta: "פתח: ייבוא חכם",
    Icon: UploadCloud,
  },
];

export function TeacherOnboarding({ hasSession }: { hasSession: boolean }) {
  return (
    <section className="rounded-3xl border border-primary/15 bg-primary/5 p-6 shadow-sm" dir="rtl">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">איך מתחילים — 3 צעדים</h2>
          <p className="text-sm text-muted-foreground">
            {hasSession
              ? "עדיין אין נתונים להצגה. עקוב אחרי הצעדים כדי להביא את נתוני הקורס שלך."
              : "כדי להתחיל, פתח את הכלי מתוך מרחב הלימוד שלך ב-Moodle, ואז עקוב אחרי הצעדים."}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {STEPS.map((s) => {
          const Icon = s.Icon;
          return (
            <div key={s.n} className="flex flex-col rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                  {s.n}
                </span>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-base font-extrabold text-slate-900">{s.title}</div>
              <p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{s.body}</p>
              <Link
                to={s.to}
                className="mt-3 inline-flex items-center justify-center gap-1 rounded-xl border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5"
              >
                {s.cta}
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        הערה: המערכת מציגה רק נתוני אמת. קבצים שלא זוהו בוודאות לא ייובאו, ושום נתון אינו מומצא.
      </p>
    </section>
  );
}
