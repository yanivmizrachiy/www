// MTH_MOODLE_DIRECT_REPORT_LINKS_V1
// Builds the EXACT Moodle report/export URLs for the teacher's real course,
// using the live LTI session (course_id) and the real Moodle base URL
// (site_url). These are the same teacher-accessible report endpoints that
// exist in every Ministry-of-Education Moodle space, verified by direct
// inspection of course 259 (moodlemoe.lms.education.gov.il).
//
// IMPORTANT: these are deep links to the teacher's OWN Moodle, opened in a new
// tab. The app never scrapes them, never stores credentials, and never claims
// the data is auto-fetched. They simply take the teacher straight to the right
// report to export — turning the manual fallback into one click.

export interface MoodleReportLink {
  key: string;
  title: string;
  desc: string;
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
export const MOODLE_REPORTS: MoodleReportLink[] = [
  {
    key: "participants",
    title: "רשימת משתתפים",
    desc: "דף המשתתפים של הקורס — שמות, תפקידים וגישה אחרונה. משם אפשר לייצא את רשימת התלמידים.",
    path: (id) => `/user/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "grades_csv",
    title: "ייצוא ציונים (CSV)",
    desc: "ייצוא גיליון הציונים המלא כקובץ CSV, ישירות מ-Gradebook של הקורס.",
    path: (id) => `/grade/export/txt/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "grades_ods",
    title: "ייצוא ציונים (ODS)",
    desc: "ייצוא הציונים כקובץ ODS (OpenOffice/Excel), חלופה ל-CSV.",
    path: (id) => `/grade/export/ods/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "progress",
    title: "דוח השלמת פעילות",
    desc: "מפת ההשלמה של כל תלמיד לכל פעילות — הבסיס למסך הפרקים והמשימות.",
    path: (id) => `/report/progress/index.php?course=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "logs",
    title: "יומני מעקב (Logs)",
    desc: "כל פעולה של כל משתמש עם חותמת זמן — הבסיס לראיות הפעילות. בחר את כל הימים והורד.",
    path: (id) => `/report/log/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "outline",
    title: "פעילות מרחב-לימוד",
    desc: "כמות צפיות וגישה אחרונה לכל רכיב בקורס.",
    path: (id) => `/report/outline/index.php?id=${id}`,
    importPath: "/smart-import",
  },
  {
    key: "participation",
    title: "השתתפות במרחב-לימוד",
    desc: "מי עשה מה, עם פילטר לפי רכיב ותפקיד.",
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
