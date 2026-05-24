// MTH_AUTOMATION_CAPABILITY_GOVERNANCE_V1
// Governance wrapper over the base Truth Engine (automationCapabilities.ts).
// Enriches capabilities with evidence governance, maturity model, testing pyramid,
// and security policy — without altering truth values or capability evidence.
// No fake AUTO. No fake live evidence. Teacher Release remains NO.

import {
  getAutomationCapabilities,
  getCapabilityById,
  getTeacherVisibleCapabilities,
  getBlockedCapabilities,
  getStaleCapabilities,
} from "./automationCapabilities";

import type { AutomationCapability as BaseCapability } from "./automationCapabilities";

import type {
  MaturityLevel,
  TestLevel,
  VerificationMethod,
  VerificationScope,
  Environment,
  MoodleWsSecurityPolicy,
} from "./automationCapabilityTypes";

import { SCHEMA_VERSION, SCHEMA_EVOLUTION_RULES } from "./automationCapabilityTypes";

// ─── Governed capability type ─────────────────────────────────────────────────
// Extends the base capability with evidence governance and maturity fields.
// Does not remove or alter any existing field.

export type GovernedCapability = BaseCapability & {
  readonly verifiedAt: string | null;
  readonly evidenceRef: string | null;
  readonly verificationMethod: VerificationMethod;
  readonly verificationScope: VerificationScope;
  readonly environment: Environment;
  readonly maturityLevel: MaturityLevel;
  readonly testLevels: readonly TestLevel[];
  readonly securityPolicy: MoodleWsSecurityPolicy | null;
};

export type GovernedCapabilityRegistry = {
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly capabilities: readonly GovernedCapability[];
  readonly moodleWsReadiness: ReturnType<typeof getAutomationCapabilities>["moodleWsReadiness"];
  readonly schemaEvolutionRules: readonly string[];
};

// ─── Auditable governance contract ───────────────────────────────────────────
// Machine-readable contract checked by the contract audit script.

export const GOVERNANCE_AUDIT_METADATA = {
  schemaVersion: "2.0.0",
  no_live_evidence_without_evidence_ref: true,
  no_blocked_capability_claims_live_evidence: true,
  moodle_ws_security_policy_present: true,
  raw_pii_logging_allowed: false,
  raw_moodle_response_storage_allowed: false,
  teacher_release_status: "BLOCKED",
  teacher_release_ready: false,
  practice_time_status: "BLOCKED",
  moodle_web_services_status: "BLOCKED",
} as const;

// ─── Moodle Web Services security policy ─────────────────────────────────────
// Required because moodle_web_services has secretRisk "high".
// rawPiiLoggingAllowed and rawMoodleResponseStorageAllowed are type-enforced false.

const MOODLE_WS_SECURITY_POLICY: MoodleWsSecurityPolicy = {
  serviceAccountRequired: true,
  leastPrivilegeRequired: true,
  tokenStorage: "environment_only",
  tokenRotationRequired: true,
  revokePathRequired: true,
  rawPiiLoggingAllowed: false,
  rawMoodleResponseStorageAllowed: false,
};

// ─── Per-capability governance overrides ─────────────────────────────────────
// evidenceRef and verificationMethod are set only where existing evidenceType
// clearly supports "audit". Blocked/missing capabilities keep null/none defaults.

type GovernanceOverride = {
  readonly evidenceRef?: string;
  readonly verificationMethod?: VerificationMethod;
  readonly verificationScope?: VerificationScope;
  readonly testLevels?: readonly TestLevel[];
  readonly securityPolicy?: MoodleWsSecurityPolicy | null;
};

const OVERRIDES: Readonly<Record<string, GovernanceOverride>> = {
  lti_context: {
    evidenceRef: "scripts/checks/moodle-automation-readiness-audit.cjs",
    verificationMethod: "audit",
    verificationScope: "repo-only",
    testLevels: ["audit"],
  },
  participants: {
    evidenceRef: "scripts/checks/moodle-automation-readiness-audit.cjs",
    verificationMethod: "audit",
    verificationScope: "repo-only",
    testLevels: ["audit", "integration"],
  },
  gradebook: {
    evidenceRef: "scripts/checks/moodle-automation-readiness-audit.cjs",
    verificationMethod: "audit",
    verificationScope: "repo-only",
    testLevels: ["audit", "integration"],
  },
  logs: {
    evidenceRef: "scripts/checks/moodle-automation-readiness-audit.cjs",
    verificationMethod: "audit",
    verificationScope: "repo-only",
    testLevels: ["audit", "integration"],
  },
  course_structure: {
    evidenceRef: "scripts/checks/moodle-automation-readiness-audit.cjs",
    verificationMethod: "audit",
    verificationScope: "repo-only",
    testLevels: ["audit", "integration"],
  },
  practice_time: {
    testLevels: ["audit"],
  },
  moodle_web_services: {
    testLevels: ["audit", "manual-live"],
    securityPolicy: MOODLE_WS_SECURITY_POLICY,
  },
  nrps: {
    testLevels: ["audit", "manual-live"],
  },
  ags: {
    testLevels: ["audit", "manual-live"],
  },
  teacher_release: {
    testLevels: ["audit", "e2e", "manual-live"],
  },
} as const;

// ─── Enrichment ───────────────────────────────────────────────────────────────

function enrichCapability(base: BaseCapability): GovernedCapability {
  const ov: GovernanceOverride = OVERRIDES[base.id] ?? {};

  const maturityLevel: MaturityLevel =
    base.evidenceType === "audit" ? "AUDIT_READY" : "DISCOVERED";

  return {
    ...base,
    verifiedAt: null,
    evidenceRef: ov.evidenceRef ?? null,
    verificationMethod: ov.verificationMethod ?? "none",
    verificationScope: ov.verificationScope ?? "none",
    environment: "none",
    maturityLevel,
    testLevels: ov.testLevels ?? ["audit"],
    securityPolicy: "securityPolicy" in ov ? (ov.securityPolicy ?? null) : null,
  };
}

// ─── Governed selectors ───────────────────────────────────────────────────────
// Pure and stable — safe for future UI consumers.
// Consumer UI must read from these selectors only.

export function getGovernedAutomationCapabilities(): GovernedCapabilityRegistry {
  const base = getAutomationCapabilities();
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: base.generatedAt,
    capabilities: base.capabilities.map(enrichCapability),
    moodleWsReadiness: base.moodleWsReadiness,
    schemaEvolutionRules: SCHEMA_EVOLUTION_RULES,
  };
}

export function getGovernedCapabilityById(id: string): GovernedCapability | undefined {
  const base = getCapabilityById(id);
  return base !== undefined ? enrichCapability(base) : undefined;
}

export function getGovernedTeacherVisibleCapabilities(): GovernedCapability[] {
  return getTeacherVisibleCapabilities().map(enrichCapability);
}

export function getGovernedBlockedCapabilities(): GovernedCapability[] {
  return getBlockedCapabilities().map(enrichCapability);
}

export function getGovernedStaleCapabilities(): GovernedCapability[] {
  return getStaleCapabilities().map(enrichCapability);
}
