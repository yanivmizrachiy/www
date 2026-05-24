// MTH_AUTOMATION_CAPABILITY_TYPES_V2
// Canonical type contract for the Automation Capability Registry.
// Future consumers must not guess fields or statuses — read from registry only.
// Schema version: 2.0.0

// ─── Schema versioning ────────────────────────────────────────────────────────

export const SCHEMA_VERSION = "2.0.0";

// Rules governing safe schema evolution.
// Contract audit enforces these as machine-checkable invariants.
export const SCHEMA_EVOLUTION_RULES = [
  "New optional fields may be added without bumping schemaVersion.",
  "Removing or renaming required fields requires a schemaVersion bump.",
  "maturityLevel may only increase via explicit live evidence upgrade.",
  "evidenceType 'live' requires a non-null evidenceRef.",
  "evidenceType 'missing' means the feature MUST NOT be claimed as working.",
  "evidenceType 'audit' means code/audit readiness only — not live Moodle proof.",
  "BLOCKED capabilities may not claim evidenceType 'live'.",
  "teacher_release_ready may only become true after live end-to-end verification.",
  "securityPolicy.rawPiiLoggingAllowed must always be false.",
  "securityPolicy.rawMoodleResponseStorageAllowed must always be false.",
] as const;

// ─── Teacher-facing status (stable, consumer-facing) ─────────────────────────

export type CapabilityStatus = "AUTO" | "SEMI_AUTO" | "BLOCKED" | "UNKNOWN";

export type CapabilitySource =
  | "LTI"
  | "IMPORT"
  | "MOODLE_WS"
  | "NRPS"
  | "AGS"
  | "MANUAL"
  | "UNAVAILABLE";

// Evidence classification rules (enforced by contract audit):
//   "live"     — live Moodle verification exists; requires non-null evidenceRef
//   "audit"    — code/audit readiness only; NOT live Moodle proof
//   "inferred" — derived from indirect evidence; insufficient for AUTO status
//   "missing"  — no evidence; feature MUST NOT be claimed as working
export type EvidenceType = "audit" | "live" | "inferred" | "missing";

export type PiiRisk = "none" | "low" | "medium" | "high";
export type SecretRisk = "none" | "low" | "medium" | "high";

// ─── Internal maturity axis (separate from teacher-facing status) ─────────────
//
// Progression: DISCOVERED → AUDIT_READY → LIVE_READY → LIVE_VERIFIED → TEACHER_SAFE → RELEASE_READY
// Do not upgrade a capability beyond its current evidence.
// Teacher-facing status remains: AUTO | SEMI_AUTO | BLOCKED | UNKNOWN
export type MaturityLevel =
  | "DISCOVERED"    // capability identified; no audit or live evidence
  | "AUDIT_READY"   // code/audit readiness confirmed; no live Moodle proof
  | "LIVE_READY"    // live plumbing exists; awaiting first live verification
  | "LIVE_VERIFIED" // live Moodle verification recorded; not yet teacher-safe
  | "TEACHER_SAFE"  // isolation + PII constraints verified; safe for real teachers
  | "RELEASE_READY"; // end-to-end verified; Teacher Release gate may be opened

// ─── Testing pyramid ──────────────────────────────────────────────────────────

// Expected test level(s) per capability and future consumer.
// Consumer UI must read from registry only — do not duplicate logic.
export type TestLevel =
  | "unit"         // pure helper/selector unit tests
  | "integration"  // route + import pipeline integration tests
  | "e2e"          // full browser/session end-to-end tests
  | "audit"        // static audit script verification
  | "manual-live"; // manual teacher/admin live verification

// ─── Evidence governance ──────────────────────────────────────────────────────

export type VerificationMethod =
  | "audit"        // static code/file audit script
  | "code-review"  // human code review
  | "live-probe"   // live system probe (requires non-null evidenceRef)
  | "manual"       // manual teacher/admin action
  | "none";        // no verification performed

export type VerificationScope =
  | "repo-only"      // verified against repo artifacts only
  | "live-moodle"    // verified against a live Moodle instance
  | "live-render"    // verified against the live Render deployment
  | "manual-report"  // verified via teacher-generated manual report
  | "none";

export type Environment =
  | "production"
  | "staging"
  | "local"
  | "none";

// ─── Security governance ──────────────────────────────────────────────────────

export type TokenStorage = "environment_only" | "database" | "none";

// Required when secretRisk is "high" (e.g., moodle_web_services).
// rawPiiLoggingAllowed and rawMoodleResponseStorageAllowed are literal false —
// hardcoded in the type to make violations a compile error.
export interface MoodleWsSecurityPolicy {
  readonly serviceAccountRequired: boolean;
  readonly leastPrivilegeRequired: boolean;
  readonly tokenStorage: TokenStorage;
  readonly tokenRotationRequired: boolean;
  readonly revokePathRequired: boolean;
  readonly rawPiiLoggingAllowed: false;            // compile-enforced; never override
  readonly rawMoodleResponseStorageAllowed: false; // compile-enforced; never override
}

// ─── Canonical AutomationCapability schema ───────────────────────────────────

export interface AutomationCapability {
  // Identity
  readonly id: string;
  readonly labelHe: string;

  // Teacher-facing status
  readonly status: CapabilityStatus;
  readonly source: CapabilitySource;

  // Evidence governance
  readonly evidenceType: EvidenceType;
  readonly evidenceSummary: string;
  readonly verifiedBy: string;
  readonly lastVerifiedAt: string | null; // ISO 8601 or null
  readonly verifiedAt: string | null;     // canonical governance field (ISO 8601 or null)
  readonly evidenceRef: string | null;    // path/URL to evidence artifact; required when evidenceType is "live"
  readonly verificationMethod: VerificationMethod;
  readonly verificationScope: VerificationScope;
  readonly environment: Environment;

  // Staleness / TTL
  readonly ttlHours: number | null;
  readonly isStale: boolean;

  // Internal maturity (separate from teacher-facing status)
  readonly maturityLevel: MaturityLevel;

  // Teacher UX
  readonly courseBound: boolean;
  readonly teacherVisible: boolean;
  readonly teacherActionHe: string;
  readonly allowedTeacherActions: readonly string[];
  readonly blockedReasonHe: string | null;

  // Engineering
  readonly nextTechnicalStep: string;
  readonly dependsOn: readonly string[];
  readonly testLevels: readonly TestLevel[];

  // UI ordering
  readonly uiGroup: string;
  readonly displayPriority: number;

  // Risk
  readonly piiRisk: PiiRisk;
  readonly secretRisk: SecretRisk;

  // Security policy — required when secretRisk is "high"; null otherwise
  readonly securityPolicy: MoodleWsSecurityPolicy | null;
}

// Moodle Web Services readiness — 7 separate live-verification criteria.
// null = not yet verified; false = known disabled; true = verified live.
// All criteria must be true before moodle_web_services may claim evidenceType "live".
export interface MoodleWsReadinessCriteria {
  readonly web_services_enabled: boolean | null;
  readonly rest_protocol_enabled: boolean | null;
  readonly external_service_configured: boolean | null;
  readonly required_functions_mapped: boolean | null;
  readonly authorized_user_has_permissions: boolean | null;
  readonly token_configured_in_environment: boolean | null;
  readonly core_webservice_get_site_info_live_verified: boolean | null;
}

// ─── Canonical registry schema ────────────────────────────────────────────────

export interface AutomationCapabilityRegistry {
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly capabilities: readonly AutomationCapability[];
  readonly moodleWsReadiness: MoodleWsReadinessCriteria;
  readonly schemaEvolutionRules: readonly string[];
}
