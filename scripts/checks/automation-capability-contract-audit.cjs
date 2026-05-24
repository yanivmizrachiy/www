#!/usr/bin/env node
// MTH_AUTOMATION_CAPABILITY_CONTRACT_AUDIT_V1
// Enforces governance contract invariants for the Truth Engine.
// Checks: schema evolution rules, evidence governance, maturity model,
// security policy, and teacher release gate.
// All checks are static text analysis — no runtime imports.
"use strict";

const fs = require("fs");

function fail(msg) {
  console.error("CONTRACT_AUDIT_FAIL: " + msg);
  process.exit(1);
}
function ok(msg) { console.log("OK: " + msg); }

const TYPES = "src/lib/automationCapabilityTypes.ts";
const GOV   = "src/lib/automationCapabilityGovernance.ts";
const BASE  = "src/lib/automationCapabilities.ts";

if (!fs.existsSync(TYPES)) fail(TYPES + " not found");
if (!fs.existsSync(GOV))   fail(GOV   + " not found");
if (!fs.existsSync(BASE))  fail(BASE  + " not found");

const typesSrc = fs.readFileSync(TYPES, "utf8");
const govSrc   = fs.readFileSync(GOV,   "utf8");
const baseSrc  = fs.readFileSync(BASE,  "utf8");

// ─── 1. Schema version ────────────────────────────────────────────────────────
if (!typesSrc.includes('SCHEMA_VERSION = "2.0.0"')) {
  fail("SCHEMA_VERSION must be 2.0.0 in automationCapabilityTypes.ts");
}
ok("SCHEMA_VERSION is 2.0.0");

// ─── 2. Schema evolution rules present ───────────────────────────────────────
if (!typesSrc.includes("SCHEMA_EVOLUTION_RULES")) {
  fail("SCHEMA_EVOLUTION_RULES missing from types file");
}
const requiredRules = [
  "evidenceType 'live' requires a non-null evidenceRef",
  "evidenceType 'missing' means the feature MUST NOT be claimed as working",
  "evidenceType 'audit' means code/audit readiness only",
  "BLOCKED capabilities may not claim evidenceType 'live'",
  "teacher_release_ready may only become true after live end-to-end verification",
  "securityPolicy.rawPiiLoggingAllowed must always be false",
  "securityPolicy.rawMoodleResponseStorageAllowed must always be false",
];
for (const rule of requiredRules) {
  if (!typesSrc.includes(rule)) fail("SCHEMA_EVOLUTION_RULES missing rule: " + rule);
}
ok("SCHEMA_EVOLUTION_RULES contains all required governance rules");

// ─── 3. Required governance types present in types file ──────────────────────
const requiredTypes = [
  "MaturityLevel",
  "TestLevel",
  "VerificationMethod",
  "VerificationScope",
  "Environment",
  "TokenStorage",
  "MoodleWsSecurityPolicy",
  "AutomationCapability",
  "MoodleWsReadinessCriteria",
  "AutomationCapabilityRegistry",
];
for (const t of requiredTypes) {
  if (!typesSrc.includes(t)) fail("types file missing required type: " + t);
}
ok("all required governance types defined in types file");

// ─── 4. MaturityLevel has all 6 levels ───────────────────────────────────────
const maturityLevels = [
  "DISCOVERED", "AUDIT_READY", "LIVE_READY",
  "LIVE_VERIFIED", "TEACHER_SAFE", "RELEASE_READY",
];
for (const level of maturityLevels) {
  if (!typesSrc.includes('"' + level + '"')) {
    fail("MaturityLevel missing value: " + level);
  }
}
ok("MaturityLevel has all 6 levels");

// ─── 5. Security policy enforces literal false ────────────────────────────────
if (!typesSrc.includes("rawPiiLoggingAllowed: false")) {
  fail("MoodleWsSecurityPolicy must declare rawPiiLoggingAllowed: false (literal type)");
}
if (!typesSrc.includes("rawMoodleResponseStorageAllowed: false")) {
  fail("MoodleWsSecurityPolicy must declare rawMoodleResponseStorageAllowed: false (literal type)");
}
ok("MoodleWsSecurityPolicy enforces literal false for PII and response logging");

// ─── 6. Base file: no live evidence without evidenceRef ──────────────────────
// Governance rule: evidenceType "live" requires a non-null evidenceRef.
// Current registry has no live evidence — audit must fail if this changes.
const liveWithNoRef = /evidenceType:\s*["']live["'].{0,400}?evidenceRef:\s*null/s;
if (liveWithNoRef.test(baseSrc)) {
  fail("base registry: capability has evidenceType 'live' with null evidenceRef — forbidden");
}
ok("no live evidence without evidenceRef in base registry");

// ─── 7. Base file: no BLOCKED capability claims live evidence ─────────────────
const blockedLive = /status:\s*["']BLOCKED["'].{0,600}?evidenceType:\s*["']live["']/s;
if (blockedLive.test(baseSrc)) {
  fail("base registry: BLOCKED capability claims evidenceType 'live' — forbidden");
}
ok("no BLOCKED capability claims live evidence");

// ─── 8. Governance overrides: no synthetic live evidence ─────────────────────
// Governance overrides must not set evidenceRef on BLOCKED/missing capabilities.
// Confirmed via GOVERNANCE_AUDIT_METADATA flag.
if (!govSrc.includes("no_live_evidence_without_evidence_ref: true")) {
  fail("governance: no_live_evidence_without_evidence_ref must be true");
}
if (!govSrc.includes("no_blocked_capability_claims_live_evidence: true")) {
  fail("governance: no_blocked_capability_claims_live_evidence must be true");
}
ok("governance metadata confirms evidence governance invariants");

// ─── 9. Moodle Web Services security policy present ──────────────────────────
if (!govSrc.includes("MOODLE_WS_SECURITY_POLICY")) {
  fail("MOODLE_WS_SECURITY_POLICY const missing from governance file");
}
if (!govSrc.includes("moodle_ws_security_policy_present: true")) {
  fail("GOVERNANCE_AUDIT_METADATA: moodle_ws_security_policy_present must be true");
}
if (!/rawPiiLoggingAllowed\s*:\s*false/.test(govSrc)) {
  fail("governance: MOODLE_WS_SECURITY_POLICY.rawPiiLoggingAllowed must be false");
}
if (!/rawMoodleResponseStorageAllowed\s*:\s*false/.test(govSrc)) {
  fail("governance: MOODLE_WS_SECURITY_POLICY.rawMoodleResponseStorageAllowed must be false");
}
ok("MOODLE_WS_SECURITY_POLICY present with correct PII/response constraints");

// ─── 10. Teacher Release gate remains BLOCKED/NO ─────────────────────────────
if (!govSrc.includes('teacher_release_status: "BLOCKED"')) {
  fail("governance: teacher_release_status must be BLOCKED");
}
if (!govSrc.includes("teacher_release_ready: false")) {
  fail("governance: teacher_release_ready must be false");
}
ok("Teacher Release remains BLOCKED and teacher_release_ready is false");

// ─── 11. Critical blocked capabilities remain BLOCKED ────────────────────────
if (!govSrc.includes('practice_time_status: "BLOCKED"')) {
  fail("governance: practice_time_status must be BLOCKED");
}
if (!govSrc.includes('moodle_web_services_status: "BLOCKED"')) {
  fail("governance: moodle_web_services_status must be BLOCKED");
}
ok("practice_time and moodle_web_services remain BLOCKED in governance metadata");

// ─── 12. All 5 governed selectors exported ────────────────────────────────────
const selectors = [
  "getGovernedAutomationCapabilities",
  "getGovernedCapabilityById",
  "getGovernedTeacherVisibleCapabilities",
  "getGovernedBlockedCapabilities",
  "getGovernedStaleCapabilities",
];
for (const fn of selectors) {
  if (!govSrc.includes("export function " + fn)) {
    fail("governed selector missing: " + fn);
  }
}
ok("all 5 governed selectors exported");

// ─── 13. No secrets in any governance file ────────────────────────────────────
const secretPats = [
  /MOODLE_WS_TOKEN\s*=\s*["'][^"']+["']/,
  /SUPABASE.*KEY\s*=\s*["'][^"']+["']/i,
  /password\s*=\s*["'][^"']+["']/i,
];
for (const f of [typesSrc, govSrc]) {
  for (const pat of secretPats) {
    if (pat.test(f)) fail("secret value detected in governance/types file");
  }
}
ok("no secret values in governance or types files");

console.log("\nCONTRACT_AUDIT_OK");
