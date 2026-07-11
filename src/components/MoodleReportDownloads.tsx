import { Link } from "react-router-dom";
import { Download, ExternalLink } from "lucide-react";
import { useLtiSession } from "@/hooks/useLtiSession";
import { MOODLE_REPORTS, buildMoodleReportUrl } from "@/lib/moodleReportLinks";

// One shared "download from Moodle in one click" panel, used by both the
// dashboard and the smart-import page (single implementation, no duplication).
//
// Each link is built from the LIVE LTI session — the teacher's real Moodle base
// URL (site_url) + course id (course_id) — and opens the EXACT report/export
// page of the teacher's own course in a new tab. The teacher is already signed
// in to Moodle (they launched the tool from there), so the page loads straight
// to the export. The app never scrapes it, never stores credentials, and never
// claims the data was auto-fetched — it just removes the "find the report"
// friction, which is the most automation possible without Moodle-side services.
export function MoodleReportDownloads({ title = "הורדת דוחות מ-Moodle בלחיצה אחת" }: { title?: string }) {
  const { session, site } = useLtiSession();
  const courseId = session?.course_id ?? null;
  const moodleBase = site?.site_url ?? null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" dir="rtl">
      <div className="mb-1 flex items-center gap-2 text-sm font-extrabold text-slate-700">
        <Download className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="mb-3 text-xs leading-6 text-slate-600">
        <b>1</b> לחצו על הדוח שאתם צריכים ← נפתח ב-Moodle.&nbsp;&nbsp;
        <b>2</b> הורידו שם את הקובץ.&nbsp;&nbsp;
        <b>3</b> גררו אותו לאזור הייבוא — והנתונים נטענים לבד.
      </p>
      {courseId && moodleBase ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {MOODLE_REPORTS.map((r) => {
            const url = buildMoodleReportUrl(moodleBase, courseId, r);
            if (!url) return null;
            return (
              <a
                key={r.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-primary"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-bold text-slate-800 group-hover:text-primary">
                  <span className="truncate">{r.title}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
                </span>
                <span className="text-xs font-medium leading-5 text-slate-500">{r.desc}</span>
                <span className="text-[11px] leading-5 text-slate-400">{r.action}</span>
              </a>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          פתחו את הכלי מתוך המרחב ב-Moodle כדי לקבל קישורי הורדה ישירים לקורס שלכם, או עברו ל-
          <Link to="/smart-import" className="font-bold text-primary hover:underline"> ייבוא חכם</Link>.
        </p>
      )}
    </section>
  );
}

export default MoodleReportDownloads;
