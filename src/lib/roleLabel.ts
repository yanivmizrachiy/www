// MTH_HEBREW_ROLE_LABEL_V1
// Translates a raw Moodle/LTI role string (e.g. "teacher", "Instructor",
// "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor") into a clean
// Hebrew label for display. Never invents data: an empty/unknown role returns
// the neutral placeholder.

export function hebrewRoleLabel(role: string | null | undefined): string {
  if (!role) return "—";
  const r = String(role).toLowerCase();

  if (/instructor|teacher|מורה|faculty|staff/.test(r)) return "מורה";
  if (/contentdeveloper|content_developer|designer/.test(r)) return "מפתח תוכן";
  if (/teachingassistant|teaching_assistant|\bta\b|mentor/.test(r)) return "עוזר הוראה";
  if (/administrator|admin|manager/.test(r)) return "מנהל";
  if (/student|learner|תלמיד/.test(r)) return "תלמיד";

  // Unknown but present role: show it as-is rather than inventing a label.
  return String(role);
}
