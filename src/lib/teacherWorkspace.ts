export type TeacherWorkspaceMode = "manage" | "present" | "focus";

export type TeacherWorkspaceTheme = {
  id: string;
  name: string;
  match?: {
    courseTitles?: string[];
    courseTitleIncludes?: string[];
  };
  classes: {
    shell: string;
    header: string;
    content: string;
  };
};

// MTH_TEACHER_WORKSPACE_ENGINE_V1
// Central presentation policy for a Moodle learning space.
// The engine is intentionally UI-only: it does not change LTI identity,
// course data, APIs, permissions, DB rows, or sync truth.
const THEMES: TeacherWorkspaceTheme[] = [
  {
    id: "yaniv-premium-blue",
    name: "Yaniv Premium Blue",
    classes: {
      shell:
        "bg-[radial-gradient(circle_at_top_right,rgba(14,116,144,0.16),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_48%,#f8fafc_100%)]",
      header:
        "border-white/50 bg-white/82 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl",
      content: "relative isolate",
    },
  },
];

const DEFAULT_THEME = THEMES[0];

function normalize(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase("he-IL");
}

export function resolveTeacherWorkspaceTheme(courseTitle?: string | null): TeacherWorkspaceTheme {
  const title = normalize(courseTitle);

  for (const theme of THEMES) {
    const exact = theme.match?.courseTitles?.some((candidate) => normalize(candidate) === title) ?? false;
    const includes = theme.match?.courseTitleIncludes?.some((candidate) => title.includes(normalize(candidate))) ?? false;
    if (exact || includes) return theme;
  }

  return DEFAULT_THEME;
}

export function workspaceModeClasses(mode: TeacherWorkspaceMode) {
  switch (mode) {
    case "present":
      return {
        shell: "text-[1.08rem]",
        header: "h-16 sm:h-[4.5rem]",
        content: "[&_[data-teacher-secondary]]:hidden",
      };
    case "focus":
      return {
        shell: "",
        header: "",
        content: "mx-auto w-full max-w-6xl",
      };
    case "manage":
    default:
      return { shell: "", header: "", content: "" };
  }
}

const STORAGE_KEY = "mth.teacher-workspace-mode.v1";

export function readTeacherWorkspaceMode(): TeacherWorkspaceMode {
  if (typeof window === "undefined") return "manage";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "present" || value === "focus" || value === "manage" ? value : "manage";
}

export function saveTeacherWorkspaceMode(mode: TeacherWorkspaceMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}
