#!/usr/bin/env node
// MTH_MOODLE_AUTOMATION_READINESS_AUDIT_V1
// Read-only repo audit: classifies Moodle data acquisition readiness from source code and docs.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const safeRead = (p) => {
  try { return fs.readFileSync(path.join(ROOT, p), "utf8"); } catch { return ""; }
};
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const contains = (p, needle) => safeRead(p).includes(needle);
const anyContains = (p, needles) => needles.some((needle) => contains(p, needle));

const files = {
  projectRules: "PROJECT_RULES.md",
  projectStatus: "STATE/project-status.md",
  aiControlTower: "docs/AI_CONTROL_TOWER.md",
  courseWorkOrder: "WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md",
  app: "src/App.tsx",
  sidebar: "src/components/AppSidebar.tsx",
  server: "src/server.js",
  courseImportPage: "src/pages/CourseStructureImport.tsx",
  tasksPage: "src/pages/Tasks.tsx",
  studentsPage: "src/pages/Students.tsx",
  gradesPage: "src/pages/Grades.tsx",
  logsPage: "src/pages/LogsImport.tsx"
};

function level({ auto, semi, blocked }) {
  if (auto) return "AUTO";
  if (semi) return "SEMI_AUTO";
  if (blocked) return "BLOCKED";
  return "UNKNOWN";
}

const routeCourseImport = contains(files.app, "/course-structure-import") || contains(files.sidebar, "/course-structure-import");
const endpointCourseImport = contains(files.server, "/api/import/course-structure");
const pageCourseImport = exists(files.courseImportPage);
const tasksReadsStructure = anyContains(files.tasksPage, ["course_sections", "course_tasks", "useCourseStructure", "Course Structure", "chapters"]);

const domains = {
  lti_context: {
    level: level({ auto: anyContains(files.server, ["/api/lti/launch", "lti_message_type", "context_id", "lis_person"]), semi: false, blocked: false }),
    evidence: ["server LTI launch/context markers"],
    next: "Continue using LTI context as the base identity/course context."
  },
  participants: {
    level: level({ auto: anyContains(files.server, ["NRPS", "Names and Role", "participants"]), semi: anyContains(files.server, ["/api/import/participants", "Participants"]), blocked: false }),
    evidence: ["Participants pipeline markers", "STATE says students=62"],
    next: "Do not change unless a verified bug appears."
  },
  gradebook: {
    level: level({ auto: anyContains(files.server, ["AGS", "lineitem", "lineitems"]), semi: anyContains(files.server, ["gradebook", "grade_items", "grade_results"]), blocked: false }),
    evidence: ["Gradebook import markers", "STATE says grade_items_written=243 and grade_results_written=1693"],
    next: "Do not change import pipeline; use grade_items as fallback activity evidence."
  },
  logs: {
    level: level({ auto: false, semi: anyContains(files.server, ["log_events", "logs-import", "Logs"]), blocked: false }),
    evidence: ["Logs import markers", "STATE says log_events_written=89995"],
    next: "Do not invent duration; keep practice-time blocked until official duration exists."
  },
  course_structure: {
    level: level({ auto: false, semi: routeCourseImport && endpointCourseImport && pageCourseImport, blocked: !routeCourseImport || !endpointCourseImport || !pageCourseImport }),
    evidence: [
      `route /course-structure-import: ${routeCourseImport}`,
      `endpoint /api/import/course-structure: ${endpointCourseImport}`,
      `page exists: ${pageCourseImport}`,
      `tasks structure markers: ${tasksReadsStructure}`
    ],
    next: routeCourseImport && endpointCourseImport && pageCourseImport
      ? "Run a real Activity Completion / Course Structure import when a real Moodle export is available; meanwhile keep UI truthful."
      : "Complete route, page, endpoint and /tasks connection."
  },
  moodle_web_services: {
    level: "BLOCKED",
    evidence: ["No verified MOODLE_WS_TOKEN evidence in repo; token values must never be committed."],
    next: "Only unlock after real token exists in Render/environment and live API call is recorded in STATE/evidence-log.md."
  },
  teacher_release: {
    level: "BLOCKED",
    evidence: ["Teacher Release remains NO", "multi-teacher/course isolation not complete"],
    next: "Run isolation validation only after current automation routes are live-verified."
  }
};

const requiredFiles = Object.values(files).filter((p) => p.endsWith(".md") || p.endsWith(".tsx") || p.endsWith(".js"));
const missingFiles = requiredFiles.filter((p) => !exists(p));
const protectedPipelines = {
  participants_protected: contains(files.projectStatus, "Participants") && contains(files.projectRules, "Participants import"),
  gradebook_protected: contains(files.projectStatus, "Gradebook") && contains(files.projectRules, "Gradebook import"),
  logs_protected: contains(files.projectStatus, "Logs") && contains(files.projectRules, "Logs import"),
  teacher_release_no: contains(files.projectStatus, "Teacher release: **NO**") || contains(files.projectStatus, "Teacher Release")
};

const counts = Object.values(domains).reduce((acc, item) => {
  acc[item.level] = (acc[item.level] || 0) + 1;
  return acc;
}, {});

const nextBestActions = [
  "Keep Participants / Gradebook / Logs stable; do not refactor verified pipelines.",
  "Verify /course-structure-import and /tasks after Render deploy.",
  "Add a live automation status endpoint/UI only after current merged course-structure import is verified in code and live.",
  "Do not claim Moodle Web Services AUTO until a real token and live API call are recorded.",
  "Teacher Release remains NO until multi-teacher/course isolation and final gate pass."
];

const result = {
  ok: missingFiles.length === 0 && protectedPipelines.teacher_release_no,
  mode: "MTH_MOODLE_AUTOMATION_READINESS_AUDIT_V1",
  generated_at: new Date().toISOString(),
  domains,
  summary: {
    counts,
    missingFiles,
    protectedPipelines,
    nextBestActions
  },
  safety: {
    read_only: true,
    no_moodle_export_required: true,
    no_secrets_read: true,
    no_student_rows_read: true,
    no_runtime_changes: true
  }
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 2);
