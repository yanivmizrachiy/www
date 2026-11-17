import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, BookOpen, ExternalLink, Link2, ShieldCheck } from "lucide-react";
import { SafePage } from "@/components/SafePage";
import { useLtiSession } from "@/hooks/useLtiSession";
import { parseMoodleCourseUrl, isCourseInVerifiedSession } from "@/lib/moodleCourseUrl";

// MTH_COURSE_URL_VISUAL_ENTRY_V1 — verified course selector, not a URL scraper.
// This page never fetches a supplied URL or treats it as an authentication token.
export default function OpenCourse() {
  const [courseUrl, setCourseUrl] = useState("");
  const [notice, setNotice] = useState("");
  const { session, site, loading, error: sessionError } = useLtiSession();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (loading) return;

    const result = parseMoodleCourseUrl(courseUrl, site?.site_url);
    if (result.ok === false) {
      setNotice(result.error);
      return;
    }
    if (!session || !site || sessionError) {
      setNotice("כדי לראות את המרחב, פתח את Moodle Teacher Hub מתוך המרחב שלך ב־Moodle. כתובת בלבד אינה מעניקה גישה.");
      return;
    }
    if (!isCourseInVerifiedSession(result.course, session, site)) {
      setNotice("הכתובת אינה שייכת למרחב שאומת בכניסה הנוכחית. פתח את הכלי מתוך המרחב המבוקש ב־Moodle ונסה שוב.");
      return;
    }

    // Reuse existing read-only chapter/task views and the server-scoped
    // session. Do not pass pasted course_id to a server endpoint or route.
    navigate("/chapters");
  }

  return (
    <SafePage
      title="הצגת מרחב בעיצוב חדש"
      description="הדבק כתובת של מרחב Moodle שלך ופתח את התצוגה החלופית."
      backTo="/"
      backLabel="חזרה למרכז המורה"
    >
      <div className="mx-auto max-w-2xl space-y-5" dir="rtl">
        <form className="space-y-4 rounded-2xl border bg-background p-5 sm:p-7" onSubmit={handleSubmit}>
          <label htmlFor="moodle-course-url" className="block text-base font-bold">
            כתובת מרחב הלמידה
          </label>
          <input
            id="moodle-course-url"
            type="url"
            required
            dir="ltr"
            spellCheck={false}
            autoComplete="off"
            value={courseUrl}
            onChange={event => { setCourseUrl(event.target.value); setNotice(""); }}
            placeholder="https://moodlemoe.lms.education.gov.il/course/view.php?id=..."
            aria-describedby="moodle-course-url-help"
            className="w-full min-w-0 rounded-xl border bg-background px-4 py-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p id="moodle-course-url-help" className="text-sm text-muted-foreground">
            נדרש חיבור מאומת לאותו מרחב מתוך Moodle. לא מתבצעת קריאה מהכתובת שהודבקה.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookOpen className="h-5 w-5" />
            {loading ? "בודק חיבור..." : "הצג מרחב בעיצוב חדש"}
          </button>
        </form>

        {notice && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{notice}</div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4 text-sm">
          {session && site && !sessionError ? (
            <>
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="font-bold">זוהה הקשר כניסה למרחב Moodle</div>
                <div className="mt-1 text-muted-foreground">
                  אפשר להציג רק את הקורס שאושר בכניסה זו. הצגת התוכן תלויה בנתוני המבנה שכבר נקלטו.
                </div>
              </div>
            </>
          ) : (
            <>
              <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-bold">נדרש חיבור מתוך Moodle</div>
                <p className="mt-1 text-muted-foreground">
                  פתח את הכלי מתוך מרחב הלמידה שלך. אין צורך למסור סיסמה באתר הזה.
                </p>
                <Link className="mt-2 inline-flex items-center gap-1 font-bold text-primary underline" to="/setup">
                  הוראות חיבור <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          בשלב הראשון מוצגים פרקים ופעילויות שנקלטו ממקור אמיתי. הצגת קבצים ותוכן מלא אוטומטית תתאפשר רק לאחר אישור הרשאות הקריאה של Moodle.
        </p>
      </div>
    </SafePage>
  );
}
