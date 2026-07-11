// MTH_MOODLE_DIRECT_REPORT_LINKS_V1
// Builds the EXACT Moodle report/export URLs for the teacher's real course,
// using the live LTI session (course_id) and the real Moodle base URL
// (site_url). These are the same teacher-accessible report endpoints that
// exist in every Ministry-of-Education Moodle space. All 7 links verified LIVE
// on 2026-07-11 against course 38381 (signed in as the teacher): every page
// loaded with no permission error and resolved to the correct course. See
// STATE/evidence-log.md.
//
// IMPORTANT: these are deep links to the teacher's OWN Moodle, opened in a new
// tab. The app never scrapes them, never stores credentials, and never claims
// the data is auto-fetched. They simply take the teacher straight to the right
// report to export — turning the manual fallback into one click.

export interface MoodleReportLink {
  key: string;
  title: string;
  desc: string;
  // one concrete step for the teacher to do in Moodle after the page opens
  action: string;
  path: (courseId: number) => string;
  // which app import this report feeds
  importPath: string;
}

// Normalize a Moodle base URL (strip trailing slash, ensure protocol).
export function normalizeMoodleBase(siteUrl: string | null | undefined): string | null {
  if (!siteUrl) return null;
  let u = siteUrl.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u.replace(/\/+$/, "");
}

// The teacher-accessible reports verified to exist per Moodle course.
// Each report carries a SHORT, plain-Hebrew explainer for the teacher: what the
// file gives you (`desc`) and the concrete step to do in Moodle after the page
// opens (`action`). Shown right under each button so nothing is a mystery.
export const MOODLE_REPORTS: MoodleReportLink[] = [
  {
    key: "participants",
    title: "רשימת התלמידים",
    desc: "שמות כל התלמידים בכיתה. הכי כדאי להתחיל מזה.",
    action: 'ב-Moodle: גללו למטה, לחצו "הורדת נתוני טבלה בתור" ובחרו Excel.',
    path: (id) => `/user/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "grades_csv",
    title: "ציונים",
    desc: "כל הציונים של הכיתה בקובץ אחד.",
    action: 'ב-Moodle: סמנו את הפריטים ולחצו "הורדה".',
    path: (id) => `/grade/export/txt/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "grades_ods",
    title: "ציונים (Excel)",
    desc: "אותם ציונים, בפורמט Excel — אם ה-CSV לא נפתח יפה.",
    action: 'ב-Moodle: לחצו "הורדה".',
    path: (id) => `/grade/export/ods/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "progress",
    title: "השלמת משימות",
    desc: "מי סיים כל משימה ופעילות בקורס.",
    action: 'ב-Moodle: לחצו "הורדה בפורמט" ובחרו Excel.',
    path: (id) => `/report/progress/index.php?course=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "logs",
    title: "יומני פעילות",
    desc: "מתי כל תלמיד נכנס ומה עשה — הבסיס לזמני הפעילות.",
    action: 'ב-Moodle: בחרו "כל הימים", לחצו "קבל יומנים", ואז "הורדה".',
    path: (id) => `/report/log/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "outline",
    title: "צפיות בתכנים",
    desc: "כמה צפיות וכניסות לכל פריט בקורס.",
    action: "ב-Moodle: הדף נפתח לצפייה; אפשר להעתיק או להדפיס.",
    path: (id) => `/report/outline/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "participation",
    title: "השתתפות בפעילות",
    desc: "מי ביצע כל פעילות, לפי בחירה.",
    action: "ב-Moodle: בחרו פעילות ותפקיד כדי לראות מי השתתף.",
    path: (id) => `/report/participation/index.php?id=${id}`,
    importPath: "/smart-import",
  },
];

// Build a full absolute URL for a report, or null if we don't have a real base.
export function buildMoodleReportUrl(
  base: string | null,
  courseId: number | null | undefined,
  report: MoodleReportLink
): string | null {
  const b = normalizeMoodleBase(base);
  if (!b || !courseId) return null;
  return b + report.path(courseId);
}
