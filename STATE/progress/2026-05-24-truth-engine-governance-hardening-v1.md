# Truth Engine Governance Hardening V1

**Date:** 2026-05-24
**Branch:** feat/truth-engine-governance-hardening-v1-20260524
**PR:** pending

## Status

COMPLETE — typecheck clean, all audit scripts updated.

## What Changed

### New files
- `src/lib/automationCapabilityTypes.ts` — canonical type contract (schema v2.0.0)
- `src/lib/automationCapabilityGovernance.ts` — governance wrapper over base Truth Engine
- `scripts/checks/automation-capability-contract-audit.cjs` — contract enforcement audit (13 checks)
- `STATE/progress/2026-05-24-truth-engine-governance-hardening-v1.md` — this file

### Modified files
- `scripts/checks/automation-capabilities-audit.cjs` — 5 new checks (checks 11–15)
- `package.json` — added `audit:automation-capability-contract` script

### Unchanged (preserved exactly)
- `src/lib/automationCapabilities.ts` — base Truth Engine, untouched from main

## Architecture

```
automationCapabilityTypes.ts     ← canonical types (schema v2.0.0)
        ↓
automationCapabilities.ts        ← base Truth Engine (unchanged from PR #120)
        ↓
automationCapabilityGovernance.ts ← governance wrapper (enriches base capabilities)
        ↓
Future UI consumers              ← must read from governed selectors only
```

## Governance Fields Added (via wrapper)

Per capability:
- `verifiedAt: null`
- `evidenceRef: string | null` — points to audit script for "audit" evidence; null for missing
- `verificationMethod: "audit" | "none"`
- `verificationScope: "repo-only" | "none"`
- `environment: "none"` (no live env verified)
- `maturityLevel: "AUDIT_READY" | "DISCOVERED"` (derived from evidenceType)
- `testLevels: TestLevel[]`
- `securityPolicy: MoodleWsSecurityPolicy | null`

## Maturity Baselines (conservative, not upgraded beyond evidence)

| Capability          | Status    | EvidenceType | MaturityLevel |
|---------------------|-----------|--------------|---------------|
| lti_context         | AUTO      | audit        | AUDIT_READY   |
| participants        | AUTO      | audit        | AUDIT_READY   |
| gradebook           | AUTO      | audit        | AUDIT_READY   |
| logs                | SEMI_AUTO | audit        | AUDIT_READY   |
| course_structure    | SEMI_AUTO | audit        | AUDIT_READY   |
| practice_time       | BLOCKED   | missing      | DISCOVERED    |
| moodle_web_services | BLOCKED   | missing      | DISCOVERED    |
| nrps                | BLOCKED   | missing      | DISCOVERED    |
| ags                 | BLOCKED   | missing      | DISCOVERED    |
| teacher_release     | BLOCKED   | missing      | DISCOVERED    |

## Evidence Governance Rules Enforced

- No live evidence without evidenceRef (audit fails if violated)
- evidenceType "audit" = code/audit readiness only, not live Moodle proof
- evidenceType "missing" = feature MUST NOT be claimed as working
- BLOCKED capabilities may not claim evidenceType "live"
- teacher_release_ready remains false

## Security Governance (moodle_web_services)

```
serviceAccountRequired: true
leastPrivilegeRequired: true
tokenStorage: "environment_only"
tokenRotationRequired: true
revokePathRequired: true
rawPiiLoggingAllowed: false          (compile-enforced literal type)
rawMoodleResponseStorageAllowed: false  (compile-enforced literal type)
```

## Teacher Release Gate

**Teacher Release: NO — BLOCKED**
No capability was upgraded. No live evidence was added. No synthetic evidence was invented.

## Checks Run

- npm run typecheck — PASS
- npm run check — PASS
- npm run build — PASS
- npm run doctor — PASS
- npm run audit:multi-teacher-safety — PASS
- npm run audit:moodle-webservices-readiness — PASS
- npm run audit:moodle-automation — PASS
- npm run audit:automation-capabilities — PASS
- npm run audit:automation-capability-contract — PASS
