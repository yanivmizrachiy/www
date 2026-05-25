import { useLtiSession } from "@/hooks/useLtiSession";
import { hebrewRoleLabel } from "@/lib/roleLabel";
import { CheckCircle2, BookOpen, MousePointerClick, ShieldCheck } from "lucide-react";

// MTH_REAL_SETUP_PAGE_V1
// Real connection page: shows the live connection status (from the session) and
// clear Hebrew steps to open the tool from inside Moodle. No demo, no password.

export default function Page() {
  const { hasSession, session, site } = useLtiSession();

  return (
    <section className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">התקנה / חיבור Moodle</h1>
        <p className="mt-1 text-sm text-muted-foreground">חיבור הכלי מתבצע מתוך Moodle בלבד. אין צורך בסיסמה.</p>
      </div>

      {/* Live connection status */}
      <div className={`rounded-3xl border p-5 ${hasSession ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
        <div className="flex items-center gap-3">
          {hasSession ? (
            <CheckCircle2 className="h-6 w-6 text-green-700" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-amber-700" />
          )}
          <div>
            <div className={`text-lg font-black ${hasSession ? "text-green-900" : "text-amber-900"}`}>
              {hasSession ? "מחובר ל-Moodle" : "לא מחובר עדיין"}
            </div>
            {hasSession && session ? (
              <div className="text-sm text-green-800">
                {session.course_title ? `מרחב: ${session.course_title}` : null}
                {session.moodle_username ? ` · ${session.moodle_username}` : null}
                {session.role ? ` · ${hebrewRoleLabel(session.role)}` : null}
              </div>
            ) : (
              <div className="text-sm text-amber-800">פתח את הכלי מתוך מרחב הלימוד שלך ב-Moodle.</div>
            )}
          </div>
        </div>
      </div>

      {/* Steps to connect */}
      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-extrabold">איך מתחברים</h2>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-primary">1</span>
            <div>
              <div className="flex items-center gap-2 font-bold"><BookOpen className="h-4 w-4 text-primary" />היכנס למרחב הלימוד שלך ב-Moodle</div>
              <p className="mt-0.5 text-sm text-muted-foreground">המרחב שבו אתה מלמד, באתר משרד החינוך.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-primary">2</span>
            <div>
              <div className="flex items-center gap-2 font-bold"><MousePointerClick className="h-4 w-4 text-primary" />לחץ על הכלי "המודל החכם"</div>
              <p className="mt-0.5 text-sm text-muted-foreground">הכלי מופיע כפעילות מסוג כלי חיצוני (LTI) בתוך המרחב.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-primary">3</span>
            <div>
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4 text-primary" />זהו — הנתונים נטענים אוטומטית</div>
              <p className="mt-0.5 text-sm text-muted-foreground">שם המרחב, המורים והתלמידים מגיעים ישירות מ-Moodle.</p>
            </div>
          </li>
        </ol>
      </div>

      {site?.site_name || site?.site_url ? (
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-extrabold">שרת Moodle</h2>
          <p className="text-sm text-muted-foreground">{site.site_name ?? site.site_url}</p>
        </div>
      ) : null}
    </section>
  );
}
