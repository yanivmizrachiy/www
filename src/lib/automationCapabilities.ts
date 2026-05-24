// MTH_AUTOMATION_CAPABILITY_REGISTRY_V1
// Central Truth Engine: single source of truth for all automation capability status.
// Evidence classification: audit | live | inferred | missing
// No fake AUTO. No fake live evidence. Teacher Release remains NO.

export const SCHEMA_VERSION = "1.0.0";

export type CapabilityStatus = "AUTO" | "SEMI_AUTO" | "BLOCKED" | "UNKNOWN";
export type CapabilitySource =
  | "LTI"
  | "IMPORT"
  | "MOODLE_WS"
  | "NRPS"
  | "AGS"
  | "MANUAL"
  | "UNAVAILABLE";
export type EvidenceType = "audit" | "live" | "inferred" | "missing";
export type PiiRisk = "none" | "low" | "medium" | "high";
export type SecretRisk = "none" | "low" | "medium" | "high";

export interface AutomationCapability {
  readonly id: string;
  readonly labelHe: string;
  readonly status: CapabilityStatus;
  readonly source: CapabilitySource;
  readonly evidenceType: EvidenceType;
  readonly evidenceSummary: string;
  readonly verifiedBy: string;
  readonly lastVerifiedAt: string | null; // ISO 8601 or null
  readonly ttlHours: number | null;
  readonly isStale: boolean;
  readonly courseBound: boolean;
  readonly teacherVisible: boolean;
  readonly teacherActionHe: string;
  readonly allowedTeacherActions: readonly string[];
  readonly blockedReasonHe: string | null;
  readonly nextTechnicalStep: string;
  readonly dependsOn: readonly string[];
  readonly uiGroup: string;
  readonly displayPriority: number;
  readonly piiRisk: PiiRisk;
  readonly secretRisk: SecretRisk;
}

// Moodle Web Services readiness tracked as 7 separate criteria.
// null = not yet verified. false = known disabled. true = verified live.
export interface MoodleWsReadinessCriteria {
  readonly web_services_enabled: boolean | null;
  readonly rest_protocol_enabled: boolean | null;
  readonly external_service_configured: boolean | null;
  readonly required_functions_mapped: boolean | null;
  readonly authorized_user_has_permissions: boolean | null;
  readonly token_configured_in_environment: boolean | null;
  readonly core_webservice_get_site_info_live_verified: boolean | null;
}

export interface AutomationCapabilityRegistry {
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly capabilities: readonly AutomationCapability[];
  readonly moodleWsReadiness: MoodleWsReadinessCriteria;
}

// Auditable metadata — checked directly by automation-capability-registry-audit.cjs.
// These string/boolean values are the contract between the registry and the audit script.
export const CAPABILITY_AUDIT_METADATA = {
  practice_time_status: "BLOCKED",
  moodle_web_services_status: "BLOCKED",
  nrps_status: "BLOCKED",
  ags_status: "BLOCKED",
  teacher_release_status: "BLOCKED",
  teacher_release_visible: false,
  teacher_release_ready: false,
  no_auto_capability_has_missing_evidence: true,
} as const;

const MOODLE_WS_READINESS: MoodleWsReadinessCriteria = {
  web_services_enabled: null,
  rest_protocol_enabled: null,
  external_service_configured: null,
  required_functions_mapped: null,
  authorized_user_has_permissions: null,
  token_configured_in_environment: null,
  core_webservice_get_site_info_live_verified: null,
};

const CAPABILITIES: readonly AutomationCapability[] = [
  {
    id: "lti_context",
    labelHe: "הקשר LTI (זיהוי מורה וקורס)",
    status: "AUTO",
    source: "LTI",
    evidenceType: "audit",
    evidenceSummary:
      "audit:moodle-automation confirms LTI launch route, context_id, and lis_person markers in server.js. Not live-verified in repo-visible state.",
    verifiedBy: "audit:moodle-automation",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: false,
    courseBound: true,
    teacherVisible: true,
    teacherActionHe: "פתח את הכלי מתוך Moodle כדי לזהות את הקורס והמורה.",
    allowedTeacherActions: ["open_from_moodle"],
    blockedReasonHe: null,
    nextTechnicalStep: "Maintain LTI 1.1 launch and session handling. Do not refactor.",
    dependsOn: [],
    uiGroup: "context",
    displayPriority: 1,
    piiRisk: "low",
    secretRisk: "low",
  },
  {
    id: "participants",
    labelHe: "משתתפים (רשימת תלמידים)",
    status: "AUTO",
    source: "IMPORT",
    evidenceType: "audit",
    evidenceSummary:
      "audit:moodle-automation confirms Participants import pipeline in server.js. STATE records 62 students for Course 259. Not live-verified in repo-visible state.",
    verifiedBy: "audit:moodle-automation",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: false,
    courseBound: true,
    teacherVisible: true,
    teacherActionHe: "ייבא דוח Participants ממודל כדי לקבל את רשימת התלמידים האמיתית.",
    allowedTeacherActions: ["import_participants_report"],
    blockedReasonHe: null,
    nextTechnicalStep:
      "Do not refactor. Validate with a real Moodle Participants export when available.",
    dependsOn: ["lti_context"],
    uiGroup: "data",
    displayPriority: 2,
    piiRisk: "medium",
    secretRisk: "none",
  },
  {
    id: "gradebook",
    labelHe: "גיליון ציונים (Gradebook)",
    status: "AUTO",
    source: "IMPORT",
    evidenceType: "audit",
    evidenceSummary:
      "audit:moodle-automation confirms wide Gradebook import pipeline. STATE records 243 grade items and 1693 grade results for Course 259. Not live-verified in repo-visible state.",
    verifiedBy: "audit:moodle-automation",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: false,
    courseBound: true,
    teacherVisible: true,
    teacherActionHe: "ייבא דוח Gradebook ממודל כדי לקבל ציונים אמיתיים.",
    allowedTeacherActions: ["import_gradebook_report"],
    blockedReasonHe: null,
    nextTechnicalStep:
      "Do not refactor. Use grade_items as fallback activity evidence where needed.",
    dependsOn: ["lti_context"],
    uiGroup: "data",
    displayPriority: 3,
    piiRisk: "medium",
    secretRisk: "none",
  },
  {
    id: "logs",
    labelHe: "לוגים (יומן פעילות)",
    status: "SEMI_AUTO",
    source: "IMPORT",
    evidenceType: "audit",
    evidenceSummary:
      "audit:moodle-automation confirms Logs import pipeline. STATE records 89,995 log events. No verified duration field — practice_time remains BLOCKED.",
    verifiedBy: "audit:moodle-automation",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: false,
    courseBound: true,
    teacherVisible: true,
    teacherActionHe: "ייבא דוח Logs ממודל לצפייה בפעילות. חישוב זמן תרגול לא זמין.",
    allowedTeacherActions: ["import_logs_report"],
    blockedReasonHe: null,
    nextTechnicalStep:
      "Do not invent duration. Keep practice_time BLOCKED until an official duration field exists in Moodle log exports.",
    dependsOn: ["lti_context"],
    uiGroup: "data",
    displayPriority: 4,
    piiRisk: "low",
    secretRisk: "none",
  },
  {
    id: "course_structure",
    labelHe: "מבנה קורס ופעילויות",
    status: "SEMI_AUTO",
    source: "IMPORT",
    evidenceType: "audit",
    evidenceSummary:
      "PR #119 added POST /api/import/course-structure. audit:moodle-automation confirms route /course-structure-import, page CourseStructureImport.tsx, and endpoint all present. Not yet live-verified with a real Moodle Activity Completion export.",
    verifiedBy: "audit:moodle-automation",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: false,
    courseBound: true,
    teacherVisible: true,
    teacherActionHe: "ייבא דוח Activity Completion ממודל כדי לראות פרקים ומשימות אמיתיים.",
    allowedTeacherActions: ["import_course_structure_report"],
    blockedReasonHe: null,
    nextTechnicalStep:
      "Verify with a real Moodle Activity Completion export. Record live evidence in STATE/evidence-log.md before upgrading evidenceType to live.",
    dependsOn: ["lti_context"],
    uiGroup: "data",
    displayPriority: 5,
    piiRisk: "none",
    secretRisk: "none",
  },
  {
    id: "practice_time",
    labelHe: "זמן תרגול",
    status: "BLOCKED",
    source: "UNAVAILABLE",
    evidenceType: "missing",
    evidenceSummary:
      "Moodle log exports do not include a duration field. Practice time cannot be computed without an official duration source. Synthetic computation is forbidden.",
    verifiedBy: "missing",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: true,
    courseBound: true,
    teacherVisible: false,
    teacherActionHe: "זמן תרגול אינו זמין כרגע. נדרש שדה משך זמן רשמי.",
    allowedTeacherActions: [],
    blockedReasonHe:
      "שדה משך זמן לא קיים בייצוא הלוגים של Moodle. לא ניתן לחשב זמן תרגול ללא מקור רשמי.",
    nextTechnicalStep:
      "Wait for an official Moodle duration field in log exports or a verified alternative. Do not compute synthetically.",
    dependsOn: ["logs"],
    uiGroup: "computed",
    displayPriority: 6,
    piiRisk: "none",
    secretRisk: "none",
  },
  {
    id: "moodle_web_services",
    labelHe: "שירותי Web מודל (אוטומציה מלאה)",
    status: "BLOCKED",
    source: "UNAVAILABLE",
    evidenceType: "missing",
    evidenceSummary:
      "MOODLE_WS_TOKEN not configured in any verified environment. core_webservice_get_site_info not live-verified. Web Services must be enabled by Moodle admin first.",
    verifiedBy: "missing",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: true,
    courseBound: false,
    teacherVisible: false,
    teacherActionHe: "Web Services לא מוגדרים. נדרש אישור מנהל Moodle.",
    allowedTeacherActions: [],
    blockedReasonHe:
      "לא קיים MOODLE_WS_TOKEN מאומת. Web Services לא הופעלו ב-Moodle ולא אומתו.",
    nextTechnicalStep:
      "Moodle admin must enable Web Services, REST protocol, create a service user, and issue a token. Set MOODLE_WS_TOKEN in Render env only. Verify with /api/moodle-ws/site-info.",
    dependsOn: ["lti_context"],
    uiGroup: "automation",
    displayPriority: 7,
    piiRisk: "high",
    secretRisk: "high",
  },
  {
    id: "nrps",
    labelHe: "NRPS (רשימת משתתפים אוטומטית)",
    status: "BLOCKED",
    source: "UNAVAILABLE",
    evidenceType: "missing",
    evidenceSummary:
      "NRPS claim absent from live Moodle LTI launch (2026-05-20 probe). namesroleservice claim not sent by Moodle.",
    verifiedBy: "missing",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: true,
    courseBound: true,
    teacherVisible: false,
    teacherActionHe: "NRPS לא זמין מ-Moodle כרגע.",
    allowedTeacherActions: [],
    blockedReasonHe:
      "NRPS claim לא התקבל מ-Moodle. לא ניתן לשלוף רשימת משתתפים אוטומטית.",
    nextTechnicalStep:
      "Request Moodle admin to enable NRPS in the LTI External Tool configuration. Verify the namesroleservice claim appears in the next launch.",
    dependsOn: ["lti_context", "moodle_web_services"],
    uiGroup: "automation",
    displayPriority: 8,
    piiRisk: "medium",
    secretRisk: "none",
  },
  {
    id: "ags",
    labelHe: "AGS (ציונים אוטומטיים)",
    status: "BLOCKED",
    source: "UNAVAILABLE",
    evidenceType: "missing",
    evidenceSummary:
      "AGS claim absent from live Moodle LTI launch (2026-05-20 probe). AGS endpoint claim not sent by Moodle.",
    verifiedBy: "missing",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: true,
    courseBound: true,
    teacherVisible: false,
    teacherActionHe: "AGS לא זמין מ-Moodle כרגע.",
    allowedTeacherActions: [],
    blockedReasonHe:
      "AGS claim לא התקבל מ-Moodle. לא ניתן לשלוף ציונים אוטומטית.",
    nextTechnicalStep:
      "Request Moodle admin to enable AGS in the LTI Advantage configuration. AGS does not replace the full Gradebook export.",
    dependsOn: ["lti_context"],
    uiGroup: "automation",
    displayPriority: 9,
    piiRisk: "medium",
    secretRisk: "none",
  },
  {
    id: "teacher_release",
    labelHe: "שחרור למורים (Teacher Release)",
    status: "BLOCKED",
    source: "MANUAL",
    evidenceType: "missing",
    evidenceSummary:
      "Teacher Release remains NO. Multi-teacher/course isolation not validated. No end-to-end real Moodle verification completed.",
    verifiedBy: "manual-review",
    lastVerifiedAt: null,
    ttlHours: null,
    isStale: true,
    courseBound: false,
    teacherVisible: false,
    teacherActionHe: "הכלי לא מוכן לשחרור מורים.",
    allowedTeacherActions: [],
    blockedReasonHe:
      "Teacher Release נשאר NO. טרם אומת בידוד נתונים בין מורים. נדרשת בדיקת end-to-end אמיתית.",
    nextTechnicalStep:
      "Complete multi-teacher isolation validation, real Moodle end-to-end verification, and production persistence check.",
    dependsOn: ["lti_context", "participants", "gradebook", "logs"],
    uiGroup: "release",
    displayPriority: 10,
    piiRisk: "high",
    secretRisk: "low",
  },
];

export function getAutomationCapabilities(): AutomationCapabilityRegistry {
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    capabilities: CAPABILITIES,
    moodleWsReadiness: MOODLE_WS_READINESS,
  };
}

export function getCapabilityById(id: string): AutomationCapability | undefined {
  return CAPABILITIES.find((c) => c.id === id);
}

export function getTeacherVisibleCapabilities(): AutomationCapability[] {
  return CAPABILITIES.filter((c) => c.teacherVisible);
}

export function getBlockedCapabilities(): AutomationCapability[] {
  return CAPABILITIES.filter((c) => c.status === "BLOCKED");
}

export function getStaleCapabilities(): AutomationCapability[] {
  return CAPABILITIES.filter((c) => c.isStale);
}
