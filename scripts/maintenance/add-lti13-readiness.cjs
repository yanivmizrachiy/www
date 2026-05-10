const fs = require('fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function must(text, needle, label) {
  if (!text.includes(needle)) throw new Error('Missing expected anchor: ' + label);
}

function block(lines) {
  return lines.join('\n') + '\n';
}

let server = read('src/server.js');

must(server, 'const CANONICAL_LTI_ENDPOINT = "/api/lti/launch";', 'LTI 1.1 endpoint must remain');
must(server, 'function publicBaseUrl(req)', 'publicBaseUrl helper');
must(server, 'app.post(CANONICAL_LTI_ENDPOINT', 'existing LTI 1.1 launch route');
must(server, 'const distPath = path.join(ROOT, "dist");', 'static frontend anchor');

const versionLine = 'const LTI13_DIAGNOSTIC_VERSION = "2026-05-07-lti13-readiness-diagnostics-v2";';
if (!server.includes('const LTI13_DIAGNOSTIC_VERSION')) {
  server = server.replace(
    'const CANONICAL_LTI_ENDPOINT = "/api/lti/launch";',
    'const CANONICAL_LTI_ENDPOINT = "/api/lti/launch";\n' + versionLine
  );
} else {
  server = server.replace(/const LTI13_DIAGNOSTIC_VERSION = "[^"]+";/, versionLine);
}

const helperBlock = block([
  '',
  'function lti13NoStore(res) {',
  '  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");',
  '  res.setHeader("Pragma", "no-cache");',
  '  res.setHeader("Expires", "0");',
  '}',
  '',
  'function lti13EnvStatus() {',
  '  const required = [',
  '    "LTI13_PRIVATE_KEY_PEM",',
  '    "LTI13_KEY_ID",',
  '    "LTI13_ISSUER",',
  '    "LTI13_CLIENT_ID",',
  '    "LTI13_DEPLOYMENT_ID",',
  '    "LTI13_AUTH_LOGIN_URL",',
  '    "LTI13_TOKEN_URL",',
  '    "LTI13_PLATFORM_JWKS_URL"',
  '  ];',
  '  const present = Object.fromEntries(required.map(name => [name, !!env(name)]));',
  '  return {',
  '    required,',
  '    present,',
  '    configured: required.every(name => !!env(name)),',
  '    missing: required.filter(name => !env(name))',
  '  };',
  '}',
  '',
  'function lti13PublicJwks() {',
  '  const privateKeyPem = env("LTI13_PRIVATE_KEY_PEM");',
  '  const kid = env("LTI13_KEY_ID", "moodle-teacher-hub-lti13-dev-key");',
  '  if (!privateKeyPem) {',
  '    return { ok: false, error: "LTI13_PRIVATE_KEY_PEM_NOT_CONFIGURED", keys: [] };',
  '  }',
  '  try {',
  '    const normalizedPem = privateKeyPem.includes("\\n") ? privateKeyPem.replace(/\\n/g, String.fromCharCode(10)) : privateKeyPem;',
  '    const privateKey = crypto.createPrivateKey(normalizedPem);',
  '    const publicKey = crypto.createPublicKey(privateKey);',
  '    const jwk = publicKey.export({ format: "jwk" });',
  '    return {',
  '      ok: true,',
  '      error: null,',
  '      keys: [{ ...jwk, kid, use: "sig", alg: "RS256" }]',
  '    };',
  '  } catch (error) {',
  '    return { ok: false, error: "LTI13_PUBLIC_JWKS_EXPORT_FAILED", detail: error.message, keys: [] };',
  '  }',
  '}',
  ''
]);

if (!server.includes('function lti13EnvStatus()')) {
  server = server.replace('function emptyStore() {', helperBlock + '\nfunction emptyStore() {');
} else {
  server = server.replace(/function lti13NoStore\(res\) \{[\s\S]*?\n\}\n\nfunction emptyStore\(\) \{/, helperBlock + '\nfunction emptyStore() {');
}

const routesBlock = block([
  '',
  'app.get("/api/lti13/status", (req, res) => {',
  '  lti13NoStore(res);',
  '  const envStatus = lti13EnvStatus();',
  '  const base = publicBaseUrl(req);',
  '  const jwks = lti13PublicJwks();',
  '  res.json({',
  '    ok: true,',
  '    mode: "diagnostic-only",',
  '    lti13DiagnosticVersion: LTI13_DIAGNOSTIC_VERSION,',
  '    existingLti11EndpointKept: CANONICAL_LTI_ENDPOINT,',
  '    configured: envStatus.configured,',
  '    missing: envStatus.missing,',
  '    present: envStatus.present,',
  '    endpoints: {',
  '      login_url: base + "/api/lti13/login",',
  '      launch_url: base + "/api/lti13/launch",',
  '      jwks_url: base + "/api/lti13/jwks",',
  '      config_url: base + "/api/lti13/config"',
  '    },',
  '    capabilities: {',
  '      oidc_login: false,',
  '      jwt_launch_validation: false,',
  '      nrps_roster_sync: false,',
  '      ags_grade_sync: false,',
  '      jwks_available: jwks.ok',
  '    },',
  '    safety: {',
  '      do_not_replace_existing_lti11_tool_yet: true,',
  '      create_separate_test_tool_first: true,',
  '      no_moodle_settings_should_be_saved_until_lti13_status_is_configured: true',
  '    },',
  '    now: new Date().toISOString()',
  '  });',
  '});',
  '',
  'app.get("/api/lti13/config", (req, res) => {',
  '  lti13NoStore(res);',
  '  const base = publicBaseUrl(req);',
  '  res.json({',
  '    ok: true,',
  '    mode: "configuration-helper",',
  '    lti13DiagnosticVersion: LTI13_DIAGNOSTIC_VERSION,',
  '    warning: "Do not use this to replace the working LTI 1.0/1.1 Moodle Teacher Hub tool. Create a separate LTI 1.3 Test tool only after status is configured.",',
  '    suggested_tool_name: "Moodle Teacher Hub — LTI 1.3 Test",',
  '    tool_urls: {',
  '      oidc_login_initiation_url: base + "/api/lti13/login",',
  '      redirect_uri_or_launch_url: base + "/api/lti13/launch",',
  '      public_keyset_jwks_url: base + "/api/lti13/jwks"',
  '    },',
  '    services_to_check_in_moodle: [',
  '      "סינכרון וניהול משתמשים / Names and Roles / Membership service",',
  '      "סינכרון תתי-מטלות וציונים / Assignment and Grade Services",',
  '      "Deep Linking if needed"',
  '    ],',
  '    privacy_to_check_in_moodle: [',
  '      "Share user name only if required",',
  '      "Share user email only if required and approved",',
  '      "Accept grades from tool only if AGS is intentionally enabled"',
  '    ],',
  '    current_limit: "This endpoint only helps configuration. Full LTI 1.3 launch validation and NRPS/AGS calls are not implemented yet."',
  '  });',
  '});',
  '',
  'app.get("/api/lti13/jwks", (_req, res) => {',
  '  lti13NoStore(res);',
  '  const jwks = lti13PublicJwks();',
  '  res.status(jwks.ok ? 200 : 503).json({ keys: jwks.keys, ok: jwks.ok, error: jwks.error || null, detail: jwks.detail || null });',
  '});',
  '',
  'app.get("/api/lti13/login", (req, res) => {',
  '  lti13NoStore(res);',
  '  res.status(501).json({',
  '    ok: false,',
  '    error: "LTI13_OIDC_LOGIN_NOT_IMPLEMENTED_YET",',
  '    detail: "This safe diagnostic endpoint exists so Moodle configuration can be planned without touching the working LTI 1.0/1.1 tool.",',
  '    next_required: "Implement OIDC login initiation, state/nonce handling, and platform authorization redirect after Moodle LTI 1.3 registration details are known.",',
  '    query_keys_received: Object.keys(req.query || {}).sort()',
  '  });',
  '});',
  '',
  'app.all("/api/lti13/launch", (req, res) => {',
  '  lti13NoStore(res);',
  '  res.status(501).json({',
  '    ok: false,',
  '    error: "LTI13_JWT_LAUNCH_NOT_IMPLEMENTED_YET",',
  '    detail: "Do not point the production Moodle Teacher Hub tool here yet. Use only for a separate LTI 1.3 Test tool after implementation.",',
  '    method: req.method,',
  '    body_keys_received: Object.keys(req.body || {}).sort()',
  '  });',
  '});',
  ''
]);

if (!server.includes('app.get("/api/lti13/status"')) {
  server = server.replace('const distPath = path.join(ROOT, "dist");', routesBlock + '\nconst distPath = path.join(ROOT, "dist");');
}

write('src/server.js', server);
console.log('ADD_LTI13_READINESS_DIAGNOSTICS_OK');
