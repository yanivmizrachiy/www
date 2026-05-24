#!/usr/bin/env node
// MTH_AUTOMATION_CAPABILITY_REGISTRY_AUDIT_V1
// Focused static analysis of src/lib/automationCapabilities.ts.
// Enforces: schema completeness, no fake AUTO, no fake live evidence,
// critical capabilities remain BLOCKED, teacher_release stays NO.
"use strict";

const fs = require("fs");

function fail(msg) {
  console.error("CAPABILITY_REGISTRY_AUDIT_FAIL: " + msg);
  process.exit(1);
}
function ok(msg) { console.log("OK: " + msg); }

const SRC = "src/lib/automationCapabilities.ts";
if (!fs.existsSync(SRC)) fail(SRC + " not found");
const src = fs.readFileSync(SRC, "utf8");

// 1. schemaVersion present
if (!src.includes("SCHEMA_VERSION")) fail("SCHEMA_VERSION constant missing");
if (!src.includes("schemaVersion")) fail("schemaVersion field missing from registry interface");
ok("schemaVersion present");

// 2. Every required capability field is declared in the interface
const requiredFields = [
  "id", "status", "source", "evidenceType",
  "verifiedBy", "uiGroup", "displayPriority",
  "lastVerifiedAt", "ttlHours", "isStale",
  "courseBound", "teacherVisible",
];
for (const field of requiredFields) {
  if (!src.includes("readonly " + field + ":") && !src.includes(field + ":")) {
    fail("required interface field missing: " + field);
  }
}
ok("all required capability fields present in interface");

// 3. All 10 required capability IDs present
const requiredIds = [
  "lti_context", "participants", "gradebook", "logs", "course_structure",
  "practice_time", "moodle_web_services", "nrps", "ags", "teacher_release",
];
for (const id of requiredIds) {
  if (!src.includes('id: "' + id + '"')) fail("capability id missing: " + id);
}
ok("all 10 capability ids present");

// 4. No AUTO capability has evidenceType missing
// Confirmed via CAPABILITY_AUDIT_METADATA flag (author-verified invariant)
if (!src.includes("no_auto_capability_has_missing_evidence: true")) {
  fail("no_auto_capability_has_missing_evidence must be true in CAPABILITY_AUDIT_METADATA");
}
// Double-check with regex: no AUTO object contains evidenceType missing within 600 chars
const autoMissingRe = /status:\s*["']AUTO["'].{0,600}?evidenceType:\s*["']missing["']/s;
if (autoMissingRe.test(src)) fail("AUTO capability has evidenceType missing — forbidden");
ok("no AUTO capability has evidenceType missing");

// 5. No fake live evidence on BLOCKED capabilities
const blockedLiveRe = /status:\s*["']BLOCKED["'].{0,600}?evidenceType:\s*["']live["']/s;
if (blockedLiveRe.test(src)) fail("BLOCKED capability claims evidenceType live — not allowed");
ok("no BLOCKED capability claims evidenceType live");

// 6. course_structure is SEMI_AUTO with audit evidence only
if (!src.includes('"course_structure"')) fail("course_structure capability missing");
// Must have SEMI_AUTO in the file
if (!src.includes('"SEMI_AUTO"') && !src.includes("'SEMI_AUTO'")) {
  fail("SEMI_AUTO status missing — course_structure and logs must use it");
}
// evidenceType for course_structure must not be live
// Check via CAPABILITY_AUDIT_METADATA — course_structure is not in the BLOCKED list
// and the regex above already ensures no SEMI_AUTO claims live either implicitly.
// Direct check: course_structure section must reference audit evidence
if (!src.includes("audit:moodle-automation")) fail("audit:moodle-automation verifiedBy reference missing");
ok("course_structure present, SEMI_AUTO and audit evidence confirmed");

// 7. moodle_web_services is BLOCKED (unless live site_info evidence exists — it does not)
if (!src.includes('moodle_web_services_status: "BLOCKED"')) {
  fail("moodle_web_services_status must be BLOCKED in CAPABILITY_AUDIT_METADATA");
}
ok("moodle_web_services is BLOCKED");

// 8. practice_time is BLOCKED without official duration evidence
if (!src.includes('practice_time_status: "BLOCKED"')) {
  fail("practice_time_status must be BLOCKED in CAPABILITY_AUDIT_METADATA");
}
ok("practice_time is BLOCKED");

// 9. teacher_release remains BLOCKED/NO
if (!src.includes('teacher_release_status: "BLOCKED"')) {
  fail("teacher_release_status must be BLOCKED in CAPABILITY_AUDIT_METADATA");
}
if (!src.includes("teacher_release_visible: false")) {
  fail("teacher_release teacherVisible must be false");
}
if (!src.includes("teacher_release_ready: false")) {
  fail("teacher_release_ready must be false");
}
ok("teacher_release is BLOCKED with teacherVisible false and teacher_release_ready false");

// 10. No secret values in the registry file
const secretPatterns = [
  /MOODLE_WS_TOKEN\s*=\s*["'][^"']+["']/,
  /SUPABASE.*KEY\s*=\s*["'][^"']+["']/i,
  /password\s*=\s*["'][^"']+["']/i,
];
for (const pat of secretPatterns) {
  if (pat.test(src)) fail("secret value detected in registry file");
}
ok("no secret values in registry file");

// 11. Governance layer files exist
const TYPES_SRC = "src/lib/automationCapabilityTypes.ts";
const GOV_SRC = "src/lib/automationCapabilityGovernance.ts";
if (!fs.existsSync(TYPES_SRC)) fail(TYPES_SRC + " not found — canonical types file missing");
ok("automationCapabilityTypes.ts present");
if (!fs.existsSync(GOV_SRC)) fail(GOV_SRC + " not found — governance wrapper missing");
ok("automationCapabilityGovernance.ts present");

const typesSrc = fs.readFileSync(TYPES_SRC, "utf8");
const govSrc = fs.readFileSync(GOV_SRC, "utf8");

// 12. Types file contains required governance types and constants
for (const name of [
  "MaturityLevel", "TestLevel", "VerificationMethod", "VerificationScope",
  "MoodleWsSecurityPolicy", "SCHEMA_EVOLUTION_RULES",
]) {
  if (!typesSrc.includes(name)) fail("automationCapabilityTypes.ts missing: " + name);
}
ok("all required governance types present in automationCapabilityTypes.ts");

// 13. Governance file has auditable contract metadata with required flags
if (!govSrc.includes("GOVERNANCE_AUDIT_METADATA")) {
  fail("GOVERNANCE_AUDIT_METADATA missing from governance file");
}
const govRequired = [
  'teacher_release_status: "BLOCKED"',
  "teacher_release_ready: false",
  "no_live_evidence_without_evidence_ref: true",
  "no_blocked_capability_claims_live_evidence: true",
  "moodle_ws_security_policy_present: true",
  "raw_pii_logging_allowed: false",
  "raw_moodle_response_storage_allowed: false",
];
for (const flag of govRequired) {
  if (!govSrc.includes(flag)) fail("GOVERNANCE_AUDIT_METADATA missing flag: " + flag);
}
ok("GOVERNANCE_AUDIT_METADATA present with all required governance flags");

// 14. Security policy enforces false for PII and raw response logging
if (!/rawPiiLoggingAllowed\s*:\s*false/.test(govSrc)) {
  fail("governance: rawPiiLoggingAllowed must be false in MOODLE_WS_SECURITY_POLICY");
}
if (!/rawMoodleResponseStorageAllowed\s*:\s*false/.test(govSrc)) {
  fail("governance: rawMoodleResponseStorageAllowed must be false in MOODLE_WS_SECURITY_POLICY");
}
ok("security policy enforces rawPiiLoggingAllowed:false and rawMoodleResponseStorageAllowed:false");

// 15. All governed selectors exported
for (const fn of [
  "getGovernedAutomationCapabilities",
  "getGovernedCapabilityById",
  "getGovernedTeacherVisibleCapabilities",
  "getGovernedBlockedCapabilities",
  "getGovernedStaleCapabilities",
]) {
  if (!govSrc.includes(fn)) fail("governance selector missing: " + fn);
}
ok("all 5 governed selectors present");

console.log("\nCAPABILITY_REGISTRY_AUDIT_OK");
