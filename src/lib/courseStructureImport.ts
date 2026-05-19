export type CourseStructureSourceKind = "activity_completion" | "course_structure" | "gradebook" | "unknown";

export type RawMoodleRow = Record<string, unknown>;

export interface ParsedCourseSection {
  id: string;
  name: string;
  position: number;
  source: CourseStructureSourceKind;
}

export interface ParsedCourseTask {
  id: string;
  section_id: string | null;
  name: string;
  type: string | null;
  position: number;
  source: CourseStructureSourceKind;
  raw_link: string | null;
}

export interface CourseStructureImportResult {
  ok: boolean;
  source_kind: CourseStructureSourceKind;
  sections: ParsedCourseSection[];
  tasks: ParsedCourseTask[];
  warnings: string[];
  confidence: number;
  safety: {
    no_fake_tasks: true;
    no_fake_sections: true;
    no_student_rows_required: true;
  };
}

function normalizeKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function stableSlug(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\u200e\u200f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "item";
}

function pick(row: RawMoodleRow, candidates: string[]) {
  const keys = Object.keys(row || {});
  const lookup = new Map(keys.map(key => [normalizeKey(key), key]));
  for (const candidate of candidates) {
    const key = lookup.get(normalizeKey(candidate));
    const value = key ? row[key] : undefined;
    if (value !== null && value !== undefined && String(value).trim()) return String(value).trim();
  }
  return "";
}

function hasAnyHeader(headers: string[], candidates: string[]) {
  const set = new Set(headers.map(normalizeKey));
  return candidates.some(candidate => set.has(normalizeKey(candidate)));
}

export function detectCourseStructureSource(rows: RawMoodleRow[]): CourseStructureSourceKind {
  const headers = Array.from(new Set((rows || []).flatMap(row => Object.keys(row || {}))));
  if (!headers.length) return "unknown";

  const hasActivity = hasAnyHeader(headers, ["פעילות", "Activity", "Activity name", "שם פעילות", "שם רכיב", "Module name"]);
  const hasCompletion = hasAnyHeader(headers, ["השלמה", "Completion", "Completion status", "מצב השלמה", "Completed"]);
  const hasSection = hasAnyHeader(headers, ["פרק", "Section", "Topic", "נושא", "יחידה", "Chapter"]);
  const hasGradebookItem = hasAnyHeader(headers, ["פריט ציון", "Grade item", "Item name", "שם פריט", "שם פריט ציון"]);

  if (hasActivity && hasCompletion) return "activity_completion";
  if (hasActivity && hasSection) return "course_structure";
  if (hasGradebookItem) return "gradebook";
  return "unknown";
}

function taskTypeFromName(name: string) {
  const text = String(name || "");
  if (/בוחן|quiz/i.test(text)) return "quiz";
  if (/h5p|אינטראקטיבי/i.test(text)) return "h5p";
  if (/דפי עבודה|assignment|מטלה/i.test(text)) return "assignment";
  if (/פורום|forum/i.test(text)) return "forum";
  return null;
}

export function parseCourseStructureRows(rows: RawMoodleRow[]): CourseStructureImportResult {
  const input = Array.isArray(rows) ? rows : [];
  const sourceKind = detectCourseStructureSource(input);
  const warnings: string[] = [];
  const sections = new Map<string, ParsedCourseSection>();
  const tasks = new Map<string, ParsedCourseTask>();

  if (!input.length) warnings.push("לא התקבלו שורות לייבוא מבנה קורס.");
  if (sourceKind === "unknown") warnings.push("לא זוהה דוח Activity Completion / Course Structure / Gradebook לפי הכותרות.");

  input.forEach((row, index) => {
    const sectionName = pick(row, ["פרק", "Section", "Topic", "נושא", "יחידה", "Chapter"]);
    const activityName = pick(row, ["פעילות", "Activity", "Activity name", "שם פעילות", "שם רכיב", "Module name", "פריט ציון", "Grade item", "Item name", "שם פריט", "שם פריט ציון"]);
    const activityType = pick(row, ["סוג", "Type", "Activity type", "רכיב", "Component", "Module"]);
    const rawLink = pick(row, ["קישור", "URL", "Link", "Activity URL", "כתובת"]);

    if (!activityName) return;

    const sectionId = sectionName ? `section-${stableSlug(sectionName)}` : null;
    if (sectionId && !sections.has(sectionId)) {
      sections.set(sectionId, {
        id: sectionId,
        name: sectionName,
        position: sections.size + 1,
        source: sourceKind
      });
    }

    const taskId = `task-${stableSlug(sectionName || "root")}-${stableSlug(activityName)}-${index + 1}`;
    tasks.set(taskId, {
      id: taskId,
      section_id: sectionId,
      name: activityName,
      type: activityType || taskTypeFromName(activityName),
      position: index + 1,
      source: sourceKind,
      raw_link: rawLink || null
    });
  });

  if (!tasks.size) warnings.push("לא נמצאו פעילויות אמיתיות בדוח.");

  const confidence = sourceKind === "activity_completion" ? 0.92 : sourceKind === "course_structure" ? 0.86 : sourceKind === "gradebook" ? 0.7 : 0.2;

  return {
    ok: tasks.size > 0 && sourceKind !== "unknown",
    source_kind: sourceKind,
    sections: Array.from(sections.values()),
    tasks: Array.from(tasks.values()),
    warnings,
    confidence,
    safety: {
      no_fake_tasks: true,
      no_fake_sections: true,
      no_student_rows_required: true
    }
  };
}
