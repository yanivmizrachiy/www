// MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1
// Auto Extraction Discovery + Source Router.
//
// Purpose: for the CURRENT Moodle/LTI context, decide for each data domain
// what the best AVAILABLE automatic source is, what is blocked, and which
// real fallback import route applies. This is the bridge from manual
// fallback toward maximum automation.
//
// HARD RULES (truth-first):
// - This module never invents capabilities. It only classifies based on
//   real signals passed in by the caller (LTI session, WS status, counts).
// - It never upgrades evidence to "live" unless a live signal is present.
// - It never marks Teacher Release ready.
// - It returns sanitized metadata only — no secrets, no tokens, no PII.
//
// It reuses the base Truth Engine (automationCapabilities.ts) as the
// authoritative baseline and refines per-domain routing with live signals.

import {
  getAutomationCapabilities,
  type AutomationCapability,
  type CapabilityStatus,
  type CapabilitySource,
  type EvidenceType,
} from "./automationCapabilities";

// ─── Routing-specific types ──────────────────────────────────────────────────

export type AutomationLevel =
  | "AUTOMATIC" // pulled automatically with no teacher upload, live-verified signal present
  | "AUTOMATIC_READY" // would be automatic if Moodle exposed a permission/claim
  | "SEMI_AUTOMATIC" // works today via real report import (fallback)
  | "BLOCKED" // cannot work until an admin/credential/source gate is resolved
  | "REFUSE"; // must refuse to calculate (e.g. practice time without duration)

export type RouteAction =
  | "use_live_signal"
  | "import_report"
  | "await_admin_enablement"
  | "await_token"
  | "refuse_calculation"
  | "open_from_moodle";

// Real, current signals the router reasons over. All optional/boolean — the
// caller (server endpoint) is responsible for extracting them safely.
export interface AutoExtractionSignals {
  // LTI context
  readonly hasLtiSession: boolean;
  readonly hasCourseIdentity: boolean;
  readonly hasTeacherIdentity: boolean;

  // LTI Advantage service claims actually present in the live launch payload
  readonly hasNrpsClaim: boolean;
  readonly hasAgsClaim: boolean;

  // Moodle Web Services
  readonly wsTokenConfigured: boolean;
  readonly wsSiteInfoLiveVerified: boolean;

  // Real imported data already persisted (aggregate booleans, never rows)
  readonly hasParticipantsData: boolean;
  readonly hasGradebookData: boolean;
  readonly hasLogsData: boolean;
  readonly hasCourseStructureData: boolean;

  // Practice time duration source
  readonly hasVerifiedDurationSource: boolean;
}

export interface DomainRoute {
  readonly domainId: string;
  readonly labelHe: string;
  readonly bestCurrentSource: CapabilitySource;
  readonly automationLevel: AutomationLevel;
  readonly isAutomaticNow: boolean;
  readonly isSemiAutoFallback: boolean;
  readonly isBlocked: boolean;
  readonly evidenceType: EvidenceType;
  readonly provingSignalHe: string; // what exact signal proved this
  readonly whatIsMissingHe: string | null;
  readonly teacherSeesHe: string; // teacher-facing Hebrew status line
  readonly adminEnablementHe: string | null; // required admin step if blocked
  readonly fallbackRoute: string | null; // existing real import route
  readonly routeAction: RouteAction;
  readonly mayShowDataNow: boolean;
  readonly mustRefuseToCalculate: boolean;
  readonly baseStatus: CapabilityStatus; // baseline from Truth Engine
}

export interface AutoExtractionSourceMap {
  readonly version: string;
  readonly generatedAt: string;
  readonly teacherRelease: "NO";
  readonly teacherReleaseReady: false;
  readonly signalsSummary: {
    readonly hasLtiSession: boolean;
    readonly hasCourseIdentity: boolean;
    readonly hasTeacherIdentity: boolean;
    readonly hasNrpsClaim: boolean;
    readonly hasAgsClaim: boolean;
    readonly wsTokenConfigured: boolean;
    readonly wsSiteInfoLiveVerified: boolean;
  };
  readonly domains: readonly DomainRoute[];
  readonly summary: {
    readonly automaticNowHe: readonly string[];
    readonly automaticReadyHe: readonly string[];
    readonly semiAutoFallbackHe: readonly string[];
    readonly blockedHe: readonly string[];
    readonly nextBestAutomationStepHe: string;
  };
}

export const AUTO_EXTRACTION_ROUTER_VERSION = "MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1";

// ─── Per-domain Hebrew labels for domains not 1:1 with the registry ──────────

const EXTRA_LABELS_HE: Record<string, string> = {
  course_identity: "זהות קורס / מרחב למידה",
  teacher_identity: "זהות מורה",
  students_roster: "רשימת תלמידים (Roster)",
  teachers_roles: "מורים ותפקידים",
  activity_completion: "השלמת פעילויות / התקדמות",
};

// Helper: find a base capability by id (may be undefined for synthetic domains).
function baseCap(id: string): AutomationCapability | undefined {
  return getAutomationCapabilities().capabilities.find((c) => c.id === id);
}

// ─── Domain routing functions ────────────────────────────────────────────────
// Each returns a DomainRoute reasoned purely from real signals.

function routeCourseIdentity(s: AutoExtractionSignals): DomainRoute {
  const automatic = s.hasLtiSession && s.hasCourseIdentity;
  return {
    domainId: "course_identity",
    labelHe: EXTRA_LABELS_HE.course_identity,
    bestCurrentSource: automatic ? "LTI" : "UNAVAILABLE",
    automationLevel: automatic ? "AUTOMATIC" : "BLOCKED",
    isAutomaticNow: automatic,
    isSemiAutoFallback: false,
    isBlocked: !automatic,
    evidenceType: automatic ? "live" : "missing",
    provingSignalHe: automatic
      ? "התקבל הקשר LTI חי עם מזהה קורס/מרחב מתוך Moodle."
      : "אין סשן LTI פעיל עם מזהה קורס.",
    whatIsMissingHe: automatic ? null : "פתיחת הכלי מתוך מרחב Moodle.",
    teacherSeesHe: automatic ? "נשלף אוטומטית" : "נדרשת פתיחה מתוך Moodle",
    adminEnablementHe: null,
    fallbackRoute: null,
    routeAction: automatic ? "use_live_signal" : "open_from_moodle",
    mayShowDataNow: automatic,
    mustRefuseToCalculate: false,
    baseStatus: "AUTO",
  };
}

function routeTeacherIdentity(s: AutoExtractionSignals): DomainRoute {
  const automatic = s.hasLtiSession && s.hasTeacherIdentity;
  return {
    domainId: "teacher_identity",
    labelHe: EXTRA_LABELS_HE.teacher_identity,
    bestCurrentSource: automatic ? "LTI" : "UNAVAILABLE",
    automationLevel: automatic ? "AUTOMATIC" : "BLOCKED",
    isAutomaticNow: automatic,
    isSemiAutoFallback: false,
    isBlocked: !automatic,
    evidenceType: automatic ? "live" : "missing",
    provingSignalHe: automatic
      ? "התקבלה זהות מורה מתוך הקשר ה-LTI החי."
      : "אין זהות מורה בסשן LTI פעיל.",
    whatIsMissingHe: automatic ? null : "פתיחת הכלי מתוך מרחב Moodle עם זיהוי מורה.",
    teacherSeesHe: automatic ? "נשלף אוטומטית" : "נדרשת פתיחה מתוך Moodle",
    adminEnablementHe: null,
    fallbackRoute: null,
    routeAction: automatic ? "use_live_signal" : "open_from_moodle",
    mayShowDataNow: automatic,
    mustRefuseToCalculate: false,
    baseStatus: "AUTO",
  };
}

function routeStudentsRoster(s: AutoExtractionSignals): DomainRoute {
  // Priority order: live WS > live NRPS > import fallback > blocked.
  if (s.wsTokenConfigured && s.wsSiteInfoLiveVerified) {
    return {
      domainId: "students_roster",
      labelHe: EXTRA_LABELS_HE.students_roster,
      bestCurrentSource: "MOODLE_WS",
      automationLevel: "AUTOMATIC",
      isAutomaticNow: true,
      isSemiAutoFallback: false,
      isBlocked: false,
      evidenceType: "live",
      provingSignalHe: "Moodle Web Services מאומת חי (core_webservice_get_site_info).",
      whatIsMissingHe: null,
      teacherSeesHe: "נשלף אוטומטית",
      adminEnablementHe: null,
      fallbackRoute: "/import",
      routeAction: "use_live_signal",
      mayShowDataNow: true,
      mustRefuseToCalculate: false,
      baseStatus: "AUTO",
    };
  }
  if (s.hasNrpsClaim) {
    return {
      domainId: "students_roster",
      labelHe: EXTRA_LABELS_HE.students_roster,
      bestCurrentSource: "NRPS",
      automationLevel: "AUTOMATIC_READY",
      isAutomaticNow: false,
      isSemiAutoFallback: true,
      isBlocked: false,
      evidenceType: "inferred",
      provingSignalHe: "claim של NRPS נמצא ב-launch החי. נדרש מימוש שליפה מאומת לפני שמירה.",
      whatIsMissingHe: "מימוש שליפת NRPS מאומת + בדיקת בידוד לפני שמירה אוטומטית.",
      teacherSeesHe: "מוכן לאוטומציה אם Moodle יחשוף הרשאה",
      adminEnablementHe: null,
      fallbackRoute: "/import",
      routeAction: "import_report",
      mayShowDataNow: s.hasParticipantsData,
      mustRefuseToCalculate: false,
      baseStatus: "BLOCKED",
    };
  }
  // No live automatic source → real import fallback.
  return {
    domainId: "students_roster",
    labelHe: EXTRA_LABELS_HE.students_roster,
    bestCurrentSource: "IMPORT",
    automationLevel: s.hasParticipantsData ? "SEMI_AUTOMATIC" : "SEMI_AUTOMATIC",
    isAutomaticNow: false,
    isSemiAutoFallback: true,
    isBlocked: false,
    evidenceType: "audit",
    provingSignalHe: s.hasParticipantsData
      ? "קיימים נתוני משתתפים שיובאו מדוח Moodle אמיתי."
      : "אין claim של NRPS ואין token WS — המסלול הזמין הוא ייבוא דוח Participants אמיתי.",
    whatIsMissingHe: s.hasParticipantsData ? null : "ייבוא דוח Participants אמיתי ממודל.",
    teacherSeesHe: s.hasParticipantsData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
    adminEnablementHe:
      "להפעלת אוטומציה מלאה: מנהל Moodle מפעיל NRPS בהגדרות הכלי, או מנפיק Web Services token.",
    fallbackRoute: "/import",
    routeAction: "import_report",
    mayShowDataNow: s.hasParticipantsData,
    mustRefuseToCalculate: false,
    baseStatus: "AUTO",
  };
}

function routeTeachersRoles(s: AutoExtractionSignals): DomainRoute {
  const viaWs = s.wsTokenConfigured && s.wsSiteInfoLiveVerified;
  const viaNrps = s.hasNrpsClaim;
  return {
    domainId: "teachers_roles",
    labelHe: EXTRA_LABELS_HE.teachers_roles,
    bestCurrentSource: viaWs ? "MOODLE_WS" : viaNrps ? "NRPS" : "IMPORT",
    automationLevel: viaWs ? "AUTOMATIC" : viaNrps ? "AUTOMATIC_READY" : "SEMI_AUTOMATIC",
    isAutomaticNow: viaWs,
    isSemiAutoFallback: !viaWs,
    isBlocked: false,
    evidenceType: viaWs ? "live" : viaNrps ? "inferred" : "audit",
    provingSignalHe: viaWs
      ? "Moodle Web Services מאומת מחזיר תפקידים."
      : viaNrps
        ? "claim של NRPS נמצא ב-launch (כולל תפקידים) — נדרש מימוש מאומת."
        : "תפקידי מורים מגיעים מדוח המשתתפים שיובא.",
    whatIsMissingHe: viaWs ? null : "מקור תפקידים אוטומטי מאומת (WS/NRPS).",
    teacherSeesHe: viaWs
      ? "נשלף אוטומטית"
      : viaNrps
        ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה"
        : "זמין מייבוא דוח אמיתי",
    adminEnablementHe: viaWs ? null : "מנהל Moodle מפעיל NRPS או Web Services.",
    fallbackRoute: "/import",
    routeAction: viaWs ? "use_live_signal" : "import_report",
    mayShowDataNow: viaWs || s.hasParticipantsData,
    mustRefuseToCalculate: false,
    baseStatus: "AUTO",
  };
}

function routeGradebook(s: AutoExtractionSignals): DomainRoute {
  if (s.hasAgsClaim) {
    return {
      domainId: "gradebook",
      labelHe: baseCap("gradebook")?.labelHe || "גיליון ציונים (Gradebook)",
      bestCurrentSource: "AGS",
      automationLevel: "AUTOMATIC_READY",
      isAutomaticNow: false,
      isSemiAutoFallback: true,
      isBlocked: false,
      evidenceType: "inferred",
      provingSignalHe: "claim של AGS נמצא ב-launch החי. AGS אינו מחליף את ייצוא ה-Gradebook המלא.",
      whatIsMissingHe: "מימוש שליפת AGS מאומת. AGS מספק ציונים חלקיים בלבד.",
      teacherSeesHe: "מוכן לאוטומציה אם Moodle יחשוף הרשאה",
      adminEnablementHe: null,
      fallbackRoute: "/gradebook-import",
      routeAction: "import_report",
      mayShowDataNow: s.hasGradebookData,
      mustRefuseToCalculate: false,
      baseStatus: "BLOCKED",
    };
  }
  return {
    domainId: "gradebook",
    labelHe: baseCap("gradebook")?.labelHe || "גיליון ציונים (Gradebook)",
    bestCurrentSource: "IMPORT",
    automationLevel: "SEMI_AUTOMATIC",
    isAutomaticNow: false,
    isSemiAutoFallback: true,
    isBlocked: false,
    evidenceType: "audit",
    provingSignalHe: s.hasGradebookData
      ? "קיימים נתוני ציונים שיובאו מדוח Gradebook אמיתי."
      : "אין claim של AGS — המסלול הזמין הוא ייבוא דוח Gradebook אמיתי.",
    whatIsMissingHe: s.hasGradebookData ? null : "ייבוא דוח Gradebook אמיתי ממודל.",
    teacherSeesHe: s.hasGradebookData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
    adminEnablementHe: "להפעלת אוטומציה: מנהל Moodle מפעיל AGS (LTI Advantage) או Web Services.",
    fallbackRoute: "/gradebook-import",
    routeAction: "import_report",
    mayShowDataNow: s.hasGradebookData,
    mustRefuseToCalculate: false,
    baseStatus: "AUTO",
  };
}

function routeLogs(s: AutoExtractionSignals): DomainRoute {
  const viaWs = s.wsTokenConfigured && s.wsSiteInfoLiveVerified;
  return {
    domainId: "logs",
    labelHe: baseCap("logs")?.labelHe || "לוגים (יומן פעילות)",
    bestCurrentSource: viaWs ? "MOODLE_WS" : "IMPORT",
    automationLevel: viaWs ? "AUTOMATIC_READY" : "SEMI_AUTOMATIC",
    isAutomaticNow: false,
    isSemiAutoFallback: true,
    isBlocked: false,
    evidenceType: viaWs ? "inferred" : "audit",
    provingSignalHe: viaWs
      ? "Web Services מאומת — קריאת לוגים אפשרית בכפוף לפונקציות מורשות."
      : s.hasLogsData
        ? "קיימים אירועי לוג שיובאו מדוח Moodle אמיתי."
        : "המסלול הזמין הוא ייבוא דוח Logs אמיתי.",
    whatIsMissingHe: viaWs ? "מיפוי פונקציית לוגים מורשית ב-WS." : s.hasLogsData ? null : "ייבוא דוח Logs אמיתי.",
    teacherSeesHe: viaWs ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : s.hasLogsData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
    adminEnablementHe: viaWs ? null : "מנהל Moodle מפעיל Web Services לקריאת לוגים.",
    fallbackRoute: "/logs-import",
    routeAction: "import_report",
    mayShowDataNow: s.hasLogsData,
    mustRefuseToCalculate: false,
    baseStatus: "SEMI_AUTO",
  };
}

function routeCourseStructure(s: AutoExtractionSignals): DomainRoute {
  const viaWs = s.wsTokenConfigured && s.wsSiteInfoLiveVerified;
  return {
    domainId: "course_structure",
    labelHe: baseCap("course_structure")?.labelHe || "מבנה קורס ופעילויות",
    bestCurrentSource: viaWs ? "MOODLE_WS" : "IMPORT",
    automationLevel: viaWs ? "AUTOMATIC_READY" : "SEMI_AUTOMATIC",
    isAutomaticNow: false,
    isSemiAutoFallback: true,
    isBlocked: false,
    evidenceType: viaWs ? "inferred" : "audit",
    provingSignalHe: viaWs
      ? "Web Services מאומת — קריאת מבנה קורס אפשרית בכפוף לפונקציות מורשות."
      : s.hasCourseStructureData
        ? "קיים מבנה קורס שיובא מדוח Moodle אמיתי."
        : "המסלול הזמין הוא ייבוא דוח Activity Completion אמיתי.",
    whatIsMissingHe: viaWs ? "מיפוי core_course_get_contents מורשה." : s.hasCourseStructureData ? null : "ייבוא דוח מבנה קורס אמיתי.",
    teacherSeesHe: viaWs ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : s.hasCourseStructureData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
    adminEnablementHe: viaWs ? null : "מנהל Moodle מפעיל Web Services לקריאת מבנה קורס.",
    fallbackRoute: "/course-structure-import",
    routeAction: "import_report",
    mayShowDataNow: s.hasCourseStructureData,
    mustRefuseToCalculate: false,
    baseStatus: "SEMI_AUTO",
  };
}

function routeActivityCompletion(s: AutoExtractionSignals): DomainRoute {
  // Completion rides on course_structure import today.
  return {
    domainId: "activity_completion",
    labelHe: EXTRA_LABELS_HE.activity_completion,
    bestCurrentSource: "IMPORT",
    automationLevel: "SEMI_AUTOMATIC",
    isAutomaticNow: false,
    isSemiAutoFallback: true,
    isBlocked: false,
    evidenceType: "audit",
    provingSignalHe: s.hasCourseStructureData
      ? "השלמת פעילויות נגזרת ממבנה הקורס שיובא."
      : "נדרש ייבוא דוח Activity Completion אמיתי.",
    whatIsMissingHe: s.hasCourseStructureData ? null : "ייבוא דוח Activity Completion אמיתי.",
    teacherSeesHe: s.hasCourseStructureData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
    adminEnablementHe: "להפעלת אוטומציה: Web Services עם core_completion מורשה.",
    fallbackRoute: "/course-structure-import",
    routeAction: "import_report",
    mayShowDataNow: s.hasCourseStructureData,
    mustRefuseToCalculate: false,
    baseStatus: "SEMI_AUTO",
  };
}

function routePracticeTime(s: AutoExtractionSignals): DomainRoute {
  // REFUSE unless a verified duration source exists. Never compute synthetically.
  const allowed = s.hasVerifiedDurationSource;
  return {
    domainId: "practice_time",
    labelHe: baseCap("practice_time")?.labelHe || "זמן תרגול",
    bestCurrentSource: "UNAVAILABLE",
    automationLevel: allowed ? "SEMI_AUTOMATIC" : "REFUSE",
    isAutomaticNow: false,
    isSemiAutoFallback: allowed,
    isBlocked: !allowed,
    evidenceType: allowed ? "audit" : "missing",
    provingSignalHe: allowed
      ? "קיים מקור משך זמן מאומת."
      : "אין שדה משך זמן רשמי בייצוא הלוגים. חישוב סינתטי אסור.",
    whatIsMissingHe: allowed ? null : "מקור משך זמן רשמי מ-Moodle.",
    teacherSeesHe: allowed ? "זמין ממקור משך מאומת" : "לא ניתן לחשב ללא מקור משך אמיתי",
    adminEnablementHe: null,
    fallbackRoute: null,
    routeAction: allowed ? "import_report" : "refuse_calculation",
    mayShowDataNow: allowed,
    mustRefuseToCalculate: !allowed,
    baseStatus: "BLOCKED",
  };
}

function routeMoodleWs(s: AutoExtractionSignals): DomainRoute {
  const verified = s.wsTokenConfigured && s.wsSiteInfoLiveVerified;
  const configuredOnly = s.wsTokenConfigured && !s.wsSiteInfoLiveVerified;
  return {
    domainId: "moodle_web_services",
    labelHe: baseCap("moodle_web_services")?.labelHe || "שירותי Web מודל (אוטומציה מלאה)",
    bestCurrentSource: verified ? "MOODLE_WS" : "UNAVAILABLE",
    automationLevel: verified ? "AUTOMATIC" : "BLOCKED",
    isAutomaticNow: verified,
    isSemiAutoFallback: false,
    isBlocked: !verified,
    evidenceType: verified ? "live" : "missing",
    provingSignalHe: verified
      ? "core_webservice_get_site_info אומת חי."
      : configuredOnly
        ? "MOODLE_WS_TOKEN מוגדר אך core_webservice_get_site_info טרם אומת חי."
        : "MOODLE_WS_TOKEN לא מוגדר באף סביבה מאומתת.",
    whatIsMissingHe: verified ? null : configuredOnly ? "אימות חי של core_webservice_get_site_info." : "token + הפעלת Web Services.",
    teacherSeesHe: verified ? "נשלף אוטומטית" : "נדרש חיבור מנהל מערכת",
    adminEnablementHe: verified
      ? null
      : "מנהל Moodle מפעיל Web Services + REST, יוצר משתמש שירות, מנפיק token, ומקצה core_webservice_get_site_info. הגדר MOODLE_WS_TOKEN ב-Render בלבד.",
    fallbackRoute: null,
    routeAction: verified ? "use_live_signal" : "await_token",
    mayShowDataNow: verified,
    mustRefuseToCalculate: false,
    baseStatus: "BLOCKED",
  };
}

function routeNrps(s: AutoExtractionSignals): DomainRoute {
  return {
    domainId: "nrps",
    labelHe: baseCap("nrps")?.labelHe || "NRPS (רשימת משתתפים אוטומטית)",
    bestCurrentSource: s.hasNrpsClaim ? "NRPS" : "UNAVAILABLE",
    automationLevel: s.hasNrpsClaim ? "AUTOMATIC_READY" : "BLOCKED",
    isAutomaticNow: false,
    isSemiAutoFallback: s.hasNrpsClaim,
    isBlocked: !s.hasNrpsClaim,
    evidenceType: s.hasNrpsClaim ? "inferred" : "missing",
    provingSignalHe: s.hasNrpsClaim
      ? "claim של namesroleservice נמצא ב-launch החי."
      : "claim של NRPS לא התקבל מ-Moodle ב-launch האחרון.",
    whatIsMissingHe: s.hasNrpsClaim ? "מימוש שליפת חברות מאומת." : "הפעלת NRPS בהגדרות הכלי ב-Moodle.",
    teacherSeesHe: s.hasNrpsClaim ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : "נדרש חיבור מנהל מערכת",
    adminEnablementHe: s.hasNrpsClaim
      ? null
      : "מנהל Moodle מפעיל Names and Roles Provisioning Service בהגדרות הכלי החיצוני, שומר, ומפעיל מחדש.",
    fallbackRoute: "/import",
    routeAction: s.hasNrpsClaim ? "import_report" : "await_admin_enablement",
    mayShowDataNow: false,
    mustRefuseToCalculate: false,
    baseStatus: "BLOCKED",
  };
}

function routeAgs(s: AutoExtractionSignals): DomainRoute {
  return {
    domainId: "ags",
    labelHe: baseCap("ags")?.labelHe || "AGS (ציונים אוטומטיים)",
    bestCurrentSource: s.hasAgsClaim ? "AGS" : "UNAVAILABLE",
    automationLevel: s.hasAgsClaim ? "AUTOMATIC_READY" : "BLOCKED",
    isAutomaticNow: false,
    isSemiAutoFallback: s.hasAgsClaim,
    isBlocked: !s.hasAgsClaim,
    evidenceType: s.hasAgsClaim ? "inferred" : "missing",
    provingSignalHe: s.hasAgsClaim
      ? "claim של AGS נמצא ב-launch החי."
      : "claim של AGS לא התקבל מ-Moodle ב-launch האחרון.",
    whatIsMissingHe: s.hasAgsClaim ? "מימוש שליפת ציונים מאומת. AGS אינו מחליף ייצוא Gradebook מלא." : "הפעלת AGS בהגדרות הכלי ב-Moodle.",
    teacherSeesHe: s.hasAgsClaim ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : "נדרש חיבור מנהל מערכת",
    adminEnablementHe: s.hasAgsClaim
      ? null
      : "מנהל Moodle מפעיל Assignment and Grade Services (LTI Advantage) בהגדרות הכלי.",
    fallbackRoute: "/gradebook-import",
    routeAction: s.hasAgsClaim ? "import_report" : "await_admin_enablement",
    mayShowDataNow: false,
    mustRefuseToCalculate: false,
    baseStatus: "BLOCKED",
  };
}

// ─── Main router ─────────────────────────────────────────────────────────────

export function buildAutoExtractionSourceMap(
  signals: AutoExtractionSignals
): AutoExtractionSourceMap {
  const domains: DomainRoute[] = [
    routeCourseIdentity(signals),
    routeTeacherIdentity(signals),
    routeStudentsRoster(signals),
    routeTeachersRoles(signals),
    routeGradebook(signals),
    routeLogs(signals),
    routePracticeTime(signals),
    routeCourseStructure(signals),
    routeActivityCompletion(signals),
    routeMoodleWs(signals),
    routeNrps(signals),
    routeAgs(signals),
  ];

  const automaticNowHe = domains.filter((d) => d.automationLevel === "AUTOMATIC").map((d) => d.labelHe);
  const automaticReadyHe = domains.filter((d) => d.automationLevel === "AUTOMATIC_READY").map((d) => d.labelHe);
  const semiAutoFallbackHe = domains.filter((d) => d.automationLevel === "SEMI_AUTOMATIC").map((d) => d.labelHe);
  const blockedHe = domains.filter((d) => d.automationLevel === "BLOCKED" || d.automationLevel === "REFUSE").map((d) => d.labelHe);

  // Truthful next best automation step — based on the single highest-leverage gate.
  let nextBestAutomationStepHe: string;
  if (!signals.hasLtiSession) {
    nextBestAutomationStepHe = "פתח את הכלי מתוך מרחב Moodle כדי לקבל הקשר חי.";
  } else if (!signals.wsTokenConfigured && !signals.hasNrpsClaim && !signals.hasAgsClaim) {
    nextBestAutomationStepHe =
      "בקש ממנהל Moodle להפעיל Web Services (token) או NRPS/AGS. עד אז המסלול הוא ייבוא דוחות אמיתיים.";
  } else if (signals.wsTokenConfigured && !signals.wsSiteInfoLiveVerified) {
    nextBestAutomationStepHe =
      "אמת את ה-token דרך core_webservice_get_site_info כדי לפתוח שאיבה אוטומטית.";
  } else if (signals.hasNrpsClaim) {
    nextBestAutomationStepHe = "ממש שליפת NRPS מאומתת + בדיקת בידוד לפני שמירה אוטומטית.";
  } else {
    nextBestAutomationStepHe = "המשך עם ייבוא דוחות אמיתיים. שדרוג לאוטומציה ייפתח עם הרשאות Moodle.";
  }

  return {
    version: AUTO_EXTRACTION_ROUTER_VERSION,
    generatedAt: new Date().toISOString(),
    teacherRelease: "NO",
    teacherReleaseReady: false,
    signalsSummary: {
      hasLtiSession: signals.hasLtiSession,
      hasCourseIdentity: signals.hasCourseIdentity,
      hasTeacherIdentity: signals.hasTeacherIdentity,
      hasNrpsClaim: signals.hasNrpsClaim,
      hasAgsClaim: signals.hasAgsClaim,
      wsTokenConfigured: signals.wsTokenConfigured,
      wsSiteInfoLiveVerified: signals.wsSiteInfoLiveVerified,
    },
    domains,
    summary: {
      automaticNowHe,
      automaticReadyHe,
      semiAutoFallbackHe,
      blockedHe,
      nextBestAutomationStepHe,
    },
  };
}
