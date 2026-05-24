const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const evidenceLogPath = path.join(repoRoot, 'STATE', 'evidence-log.md');

function fail(msg) {
  console.error(`EVIDENCE_LOG_AUDIT_FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`EVIDENCE_LOG_AUDIT_OK: ${msg}`);
}

if (!fs.existsSync(evidenceLogPath)) {
  fail('STATE/evidence-log.md missing');
}

let evidenceLog = '';
try {
  evidenceLog = fs.readFileSync(evidenceLogPath, 'utf8');
} catch (err) {
  fail(`STATE/evidence-log.md unreadable: ${err.message}`);
}

if (!evidenceLog.trim()) {
  fail('STATE/evidence-log.md is empty');
}

// ── Secret-scanning helpers ────────────────────────────────────────────────
//
// Strategy: scan line-by-line. For lines that contain a secret-key word
// (token, secret, api_key, …) followed by [:=], inspect the *value* portion.
// Only flag when the value has characteristics of a real credential —
// digits mixed with letters, base64 padding, mixed case, or long length.
// Plain English descriptor words ("not available", "exists", "missing", …)
// are considered safe and do not trigger a failure.

// Words that clearly mean "no value is present" in documentation context.
const SAFE_DESCRIPTOR_WORDS = new Set([
  'not', 'none', 'null', 'missing', 'redacted', 'false', 'true',
  'blocked', 'unknown', 'masked', 'hidden', 'unavailable', 'unverified',
  'absent', 'required', 'present', 'empty', 'exists', 'configured',
  'observed', 'verified', 'disabled', 'enabled', 'available', 'stored',
  'ok', 'yes', 'no', 'na', 'valid', 'invalid', 'set', 'unset',
  'pending', 'denied', 'allowed', 'skipped', 'omitted', 'unused',
  'optional', 'inactive', 'active', 'needed', 'checked', 'seen',
]);

// Returns true when the value is clearly a human-readable descriptor, not a credential.
function isSafeDescriptorValue(value) {
  if (!value || !value.trim()) return true;
  const v = value.trim();
  // Angle-bracket or square-bracket placeholders (<token>, [none]) or asterisk masking
  if (/^[<\[*]/.test(v)) return true;
  // Extract the leading alphabetic run (stops at digit or non-letter)
  const m = v.match(/^([a-zA-Z]+)/);
  if (!m) return false; // starts with digit or special char — not a safe descriptor
  return SAFE_DESCRIPTOR_WORDS.has(m[1].toLowerCase());
}

// Returns true when the value has characteristics of a real credential:
// digit+letter mix, very long, base64 padding, or mixed-case long string.
function looksLikeHighEntropyValue(value) {
  if (!value) return false;
  const v = value.trim();
  // Take the first whitespace/slash/comma-delimited token as the candidate
  const tokenMatch = v.match(/^([^\s\/,;|]+)/);
  const firstToken = tokenMatch ? tokenMatch[1] : '';
  if (firstToken.length < 6) return false;
  // Digits + letters mix: typical of API keys and tokens (e.g. abc123, sk-abc123)
  if (/[0-9]/.test(firstToken) && /[a-zA-Z]/.test(firstToken)) return true;
  // Very long value regardless of composition
  if (firstToken.length >= 20) return true;
  // Base64-style padding sequences (two or more consecutive +, /, or =)
  if (/[+\/=]{2,}/.test(firstToken)) return true;
  // Mixed-case string ≥ 8 chars: characteristic of JWT segments or base64 blobs
  if (/[A-Z]/.test(firstToken) && /[a-z]/.test(firstToken) && firstToken.length >= 8) return true;
  return false;
}

// ── Line-by-line secret scan ───────────────────────────────────────────────

const evidenceLines = evidenceLog.split(/\r?\n/);

for (const rawLine of evidenceLines) {
  const line = rawLine.trim();

  // Private key block headers — always dangerous
  if (/-----BEGIN [A-Z ]+PRIVATE KEY-----/.test(line)) {
    fail('private key block header detected in evidence log');
  }

  // Bearer token: only fail when followed by a high-entropy-looking value
  const bearerMatch = line.match(/\bbearer\s+([^\s,;|]+)/i);
  if (bearerMatch && looksLikeHighEntropyValue(bearerMatch[1])) {
    fail('bearer token with real-looking value detected in evidence log');
  }

  // Secret-key assignments (token, secret, apikey, api_key, password, passwd, pwd).
  // Only fail when the assigned value looks like a real credential — not when it is
  // a policy descriptor like "not available", "exists but masked", "missing", etc.
  const keyMatch = line.match(/\b(token|secret|apikey|api_key|password|passwd|pwd)\s*[:=]\s*(.+)/i);
  if (keyMatch) {
    const value = keyMatch[2];
    if (!isSafeDescriptorValue(value) && looksLikeHighEntropyValue(value)) {
      fail(`potential real credential value detected after key "${keyMatch[1]}": ${line.substring(0, 80)}`);
    }
  }
}

// ── Email address scan (full text) ────────────────────────────────────────

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
if (emailPattern.test(evidenceLog)) {
  fail('raw email address detected in evidence log');
}

// ── Capability evidence block validation ──────────────────────────────────

const blockedCapabilities = [
  'teacherrelease',
  'moodlewebservices',
  'nrps',
  'ags'
];

let current = {
  capabilityId: null,
  evidenceType: null,
  evidenceRef: null,
  verifiedAt: null,
  verifiedBy: null,
  promotionDecision: null
};

function normalize(value) {
  if (value == null) return null;
  return String(value).trim();
}

function checkCurrentBlock() {
  const capabilityId = normalize(current.capabilityId)?.toLowerCase();
  const evidenceType = normalize(current.evidenceType)?.toLowerCase();
  const evidenceRef = normalize(current.evidenceRef)?.toLowerCase();
  const verifiedAt = normalize(current.verifiedAt);
  const verifiedBy = normalize(current.verifiedBy)?.toLowerCase();
  const promotionDecision = normalize(current.promotionDecision)?.toUpperCase();

  if (capabilityId && blockedCapabilities.includes(capabilityId) && evidenceType === 'live') {
    fail(`blocked capability claims live evidenceType: ${capabilityId}`);
  }

  if (promotionDecision === 'PROMOTE_TO_LIVE') {
    if (!evidenceRef || evidenceRef === 'null' || evidenceRef === 'none' || evidenceRef === 'missing') {
      fail(`PROMOTE_TO_LIVE with invalid evidenceRef for capability ${capabilityId || 'unknown'}`);
    }
    if (!verifiedAt || /^null$/i.test(verifiedAt)) {
      fail(`PROMOTE_TO_LIVE with null verifiedAt for capability ${capabilityId || 'unknown'}`);
    }
    if (!verifiedBy || verifiedBy === 'null' || verifiedBy === 'missing' || verifiedBy === 'none') {
      fail(`PROMOTE_TO_LIVE with invalid verifiedBy for capability ${capabilityId || 'unknown'}`);
    }
  }

  const hasRealTimestamp = !!(verifiedAt && !/^null$/i.test(verifiedAt));
  const badVerifiedBy = !verifiedBy || verifiedBy === 'null' || verifiedBy === 'missing' || verifiedBy === 'none';
  if (hasRealTimestamp && badVerifiedBy) {
    fail(`verifiedAt present but verifiedBy missing for capability ${capabilityId || 'unknown'}`);
  }
}

for (const rawLine of evidenceLines) {
  const line = rawLine.trim();

  if (/^---$/.test(line)) {
    checkCurrentBlock();
    current = {
      capabilityId: null,
      evidenceType: null,
      evidenceRef: null,
      verifiedAt: null,
      verifiedBy: null,
      promotionDecision: null
    };
    continue;
  }

  const m = line.match(/^- ([A-Za-z0-9_]+):\s*(.*)$/);
  if (!m) continue;

  const key = m[1];
  const value = m[2];

  if (Object.prototype.hasOwnProperty.call(current, key)) {
    current[key] = value;
  }
}

checkCurrentBlock();
ok('evidence log exists, is readable, has no obvious secrets/emails, and current no-live state is valid');
