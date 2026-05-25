// MTH_TASK_TYPE_VISUAL_SYSTEM_V1
// Classifies a real Moodle task/activity into a Hebrew label + icon + color,
// based ONLY on real signals (task_type / item_type / task_name). It never
// invents a type: when nothing matches confidently, it returns the honest
// "unknown/other" neutral treatment.
//
// Yaniv's Moodle rule: the PINK Moodle icon indicates a computerized / online
// task such as an online quiz/activity. So computerized task / online quiz
// uses a pink visual treatment.

import {
  MonitorCheck, // computerized / online quiz (pink)
  FileCheck2, // test / exam
  FileText, // worksheet
  Presentation, // presentation
  FileBox, // file / resource
  Link2, // external link
  Boxes, // H5P / interactive
  MessagesSquare, // forum / discussion
  CircleHelp, // unknown / other (neutral, honest)
  type LucideIcon,
} from "lucide-react";

export type TaskTypeKey =
  | "computerized_quiz"
  | "test_exam"
  | "worksheet"
  | "presentation"
  | "file_resource"
  | "external_link"
  | "interactive_h5p"
  | "forum"
  | "unknown";

export interface TaskTypeVisual {
  key: TaskTypeKey;
  labelHe: string;
  Icon: LucideIcon;
  // Tailwind classes for a soft card/badge treatment.
  badgeClass: string; // border + bg + text for a small chip
  iconClass: string; // icon color
}

// Visual definitions. The computerized/online quiz is PINK per Moodle's icon.
const VISUALS: Record<TaskTypeKey, TaskTypeVisual> = {
  computerized_quiz: {
    key: "computerized_quiz",
    labelHe: "מטלה מתוקשבת / בוחן מקוון",
    Icon: MonitorCheck,
    badgeClass: "border-pink-200 bg-pink-50 text-pink-800",
    iconClass: "text-pink-600",
  },
  test_exam: {
    key: "test_exam",
    labelHe: "מבחן / מבדק",
    Icon: FileCheck2,
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-800",
    iconClass: "text-indigo-600",
  },
  worksheet: {
    key: "worksheet",
    labelHe: "דף עבודה",
    Icon: FileText,
    badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
    iconClass: "text-amber-600",
  },
  presentation: {
    key: "presentation",
    labelHe: "מצגת",
    Icon: Presentation,
    badgeClass: "border-orange-200 bg-orange-50 text-orange-800",
    iconClass: "text-orange-600",
  },
  file_resource: {
    key: "file_resource",
    labelHe: "קובץ / משאב",
    Icon: FileBox,
    badgeClass: "border-sky-200 bg-sky-50 text-sky-800",
    iconClass: "text-sky-600",
  },
  external_link: {
    key: "external_link",
    labelHe: "קישור חיצוני",
    Icon: Link2,
    badgeClass: "border-teal-200 bg-teal-50 text-teal-800",
    iconClass: "text-teal-600",
  },
  interactive_h5p: {
    key: "interactive_h5p",
    labelHe: "פעילות אינטראקטיבית (H5P)",
    Icon: Boxes,
    badgeClass: "border-violet-200 bg-violet-50 text-violet-800",
    iconClass: "text-violet-600",
  },
  forum: {
    key: "forum",
    labelHe: "פורום / דיון",
    Icon: MessagesSquare,
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconClass: "text-emerald-600",
  },
  unknown: {
    key: "unknown",
    labelHe: "סוג לא ידוע",
    Icon: CircleHelp,
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
    iconClass: "text-slate-400",
  },
};

// Keyword matchers per type. Matched against a normalized lowercase string
// built from real fields (task_type + task_name). Order matters: more
// specific types are checked before generic ones.
const MATCHERS: { key: TaskTypeKey; patterns: RegExp[] }[] = [
  {
    key: "computerized_quiz",
    patterns: [
      /\bquiz\b/i,
      /online\s*quiz/i,
      /computeriz/i,
      /מתוקשב/,
      /מקוון/,
      /בוחן/,
      /חידון/,
    ],
  },
  {
    key: "test_exam",
    patterns: [/\bexam\b/i, /\btest\b/i, /מבחן/, /מבדק/, /מבחנים/],
  },
  {
    key: "interactive_h5p",
    patterns: [/h5p/i, /interactive/i, /אינטראקטיב/],
  },
  {
    key: "presentation",
    patterns: [/presentation/i, /\bslides?\b/i, /powerpoint/i, /\bppt\b/i, /מצגת/],
  },
  {
    key: "worksheet",
    patterns: [/worksheet/i, /\bassign(ment)?\b/i, /דף\s*עבודה/, /משימ/, /מטלה/],
  },
  {
    key: "external_link",
    patterns: [/\burl\b/i, /external\s*tool/i, /\blti\b/i, /\blink\b/i, /קישור/],
  },
  {
    key: "file_resource",
    patterns: [/resource/i, /\bfile\b/i, /\bfolder\b/i, /\bpdf\b/i, /קובץ/, /משאב/],
  },
  {
    key: "forum",
    patterns: [/forum/i, /discussion/i, /פורום/, /דיון/],
  },
];

/**
 * Classify a task into its visual treatment using ONLY real fields.
 * Never invents a type — falls back to "unknown" (neutral) when uncertain.
 */
export function classifyTaskVisual(input: {
  taskType?: string | null;
  taskName?: string | null;
}): TaskTypeVisual {
  const haystack = `${input.taskType ?? ""} ${input.taskName ?? ""}`
    .toLowerCase()
    .trim();

  if (!haystack) return VISUALS.unknown;

  for (const matcher of MATCHERS) {
    if (matcher.patterns.some((re) => re.test(haystack))) {
      return VISUALS[matcher.key];
    }
  }

  return VISUALS.unknown;
}

export function getTaskTypeVisual(key: TaskTypeKey): TaskTypeVisual {
  return VISUALS[key];
}

export const ALL_TASK_TYPE_VISUALS: TaskTypeVisual[] = Object.values(VISUALS);
