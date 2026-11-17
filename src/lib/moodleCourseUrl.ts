// MTH_COURSE_URL_VISUAL_ENTRY_V1
// A pasted URL is an identifier, NEVER a Moodle credential or fetch destination.
export type MoodleCourseLocator = Readonly<{ origin: string; courseId: number }>;
export type ParseCourseResult =
  | { ok: true; course: MoodleCourseLocator }
  | { ok: false; error: string };

const MINISTRY_HOST = "moodlemoe.lms.education.gov.il";

function trustedOrigin(siteUrl: string | null | undefined): string | null {
  if (!siteUrl) return null;
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function parseMoodleCourseUrl(
  input: string,
  verifiedSiteUrl?: string | null
): ParseCourseResult {
  if (!input.trim() || input.length > 2048) {
    return { ok: false, error: "יש להדביק כתובת מלאה של מרחב Moodle." };
  }

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { ok: false, error: "הכתובת אינה כתובת אינטרנט תקינה." };
  }

  const siteOrigin = trustedOrigin(verifiedSiteUrl);
  if (
    url.protocol !== "https:" ||
    !!url.username ||
    !!url.password ||
    !!url.port ||
    !!url.hash ||
    (url.hostname !== MINISTRY_HOST && (!siteOrigin || url.origin !== siteOrigin))
  ) {
    return { ok: false, error: "אפשר להזין רק כתובת HTTPS של שרת Moodle מאושר." };
  }

  // URL is parsed only. Never use this value as a server-side fetch target.
  if (url.pathname !== "/course/view.php") {
    return { ok: false, error: "יש להדביק קישור לעמוד המרחב, לא לקובץ או למשימה." };
  }

  const ids = url.searchParams.getAll("id");
  const sections = url.searchParams.getAll("section");
  if (
    ids.length !== 1 ||
    !/^[1-9][0-9]*$/.test(ids[0]) ||
    sections.length > 1 ||
    (sections.length === 1 && !/^[0-9]+$/.test(sections[0])) ||
    [...url.searchParams.keys()].some(key => key !== "id" && key !== "section")
  ) {
    return { ok: false, error: "הכתובת חייבת לכלול מספר מרחב יחיד ותקין." };
  }

  const courseId = Number(ids[0]);
  if (!Number.isSafeInteger(courseId)) {
    return { ok: false, error: "מספר המרחב אינו תקין." };
  }

  return { ok: true, course: { origin: url.origin, courseId } };
}

export function isCourseInVerifiedSession(
  course: MoodleCourseLocator,
  session: { course_id?: number | null } | null,
  site: { site_url?: string | null } | null
): boolean {
  // This is a UI preflight only. Server APIs MUST enforce their own LTI
  // course/teacher authorization before serving course data.
  return !!session &&
    Number.isSafeInteger(session.course_id) &&
    session.course_id === course.courseId &&
    trustedOrigin(site?.site_url) === course.origin;
}
