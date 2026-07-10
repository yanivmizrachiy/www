// Shared teacher-name display logic. A teacher's "name" from an LTI launch may
// be a real name, an honest "not received" placeholder, or — on the MOE Moodle —
// a raw numeric id (national ID as `ext_user_username` in LTI 1.1, or `sub` in
// 1.3). We must NEVER show a bare numeric id as a name: it's confusing and a
// privacy leak. These helpers pick a genuine human name or return "" so callers
// can fall back to a neutral label ("מורה").

const LETTER = /[A-Za-z֐-׿]/;
const LETTER_G = /[A-Za-z֐-׿]/g;

export function normalizeTeacherCandidate(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function isSafeHumanDisplayName(value: unknown) {
  const text = normalizeTeacherCandidate(value);
  if (!text) return false;
  if (/שם מורה לא התקבל/i.test(text)) return false; // "שם מורה לא התקבל"
  if (!LETTER.test(text)) return false; // must contain a real letter
  const letters = (text.match(LETTER_G) || []).length;
  const digits = (text.match(/\d/g) || []).length;
  if (digits >= Math.max(1, letters)) return false;
  if (/^\d{5,}$/.test(text.replace(/\D/g, ""))) return false; // basically a 5+ digit id
  return true;
}

// Returns a safe human display name from a session (plus optional extra
// candidates, e.g. NRPS roster names), or "" when none is a real name.
export function safeTeacherDisplayName(
  session:
    | { teacher_display_name?: string | null; moodle_username?: string | null }
    | null,
  extraNames: string[] = []
) {
  const candidates = [
    session?.teacher_display_name,
    ...(Array.isArray(extraNames) ? extraNames : []),
    session?.moodle_username,
  ];
  for (const candidate of candidates) {
    const text = normalizeTeacherCandidate(candidate);
    if (isSafeHumanDisplayName(text)) return text;
  }
  return "";
}
