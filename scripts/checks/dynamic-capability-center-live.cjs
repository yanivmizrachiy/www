#!/usr/bin/env node
const https = require("node:https");

const base = (process.env.MTH_LIVE_BASE_URL || "https://www-tijc.onrender.com").replace(/\/+$/, "");
const EXPECTED_MARKER = "MTH_DYNAMIC_MOODLE_CAPABILITY_CENTER_V1";
const ENDPOINTS = [
  "/api/sync/status",
  "/api/capabilities/status",
  "/api/release/readiness",
  "/api/practice-time/status",
  "/api/persistence/status"
];

function getText(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 30000, headers: { Accept: "application/json,text/html,*/*" } }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ ok: true, status: res.statusCode || 0, body }));
    });
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: 0, body: "", error: "TIMEOUT" }); });
    req.on("error", (err) => resolve({ ok: false, status: 0, body: "", error: String(err.message || err) }));
  });
}

function safeJsonParse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function hasForbiddenPrivateLeak(body) {
  const text = String(body || "");
  return /SUPABASE_SERVICE_ROLE_KEY|LTI_SHARED_SECRET|MOODLE_WS_TOKEN|PRIVATE_KEY_PEM|access_token/i.test(text)
    || /student_full_name|student_email|id_number|raw_logs/i.test(text);
}

(async () => {
  const startedAt = new Date().toISOString();
  const home = await getText(base + "/");
  const assetMatch = home.body.match(/\/assets\/index-[^"']+\.js/);
  const asset = assetMatch ? assetMatch[0] : null;

  let markerFound = false;
  let assetStatus = 0;
  if (asset) {
    const js = await getText(base + asset);
    assetStatus = js.status;
    markerFound = js.body.includes(EXPECTED_MARKER);
  }

  const endpoints = [];
  for (const endpoint of ENDPOINTS) {
    const response = await getText(base + endpoint);
    const json = safeJsonParse(response.body);
    endpoints.push({
      endpoint,
      http_status: response.status,
      json_ok: Boolean(json && typeof json === "object"),
      version: json && typeof json === "object" ? json.version || null : null,
      teacher_release_ready: json && typeof json === "object" && "teacher_release_ready" in json ? json.teacher_release_ready : undefined,
      forbidden_private_leak: hasForbiddenPrivateLeak(response.body)
    });
  }

  const endpointFailures = endpoints.filter(item => item.http_status < 200 || item.http_status >= 500 || !item.json_ok || item.forbidden_private_leak);
  const ok = home.status >= 200 && home.status < 500 && Boolean(asset) && markerFound && endpointFailures.length === 0;

  const result = {
    ok,
    mode: "dynamic-capability-center-live-validation",
    version: "MTH_DYNAMIC_CAPABILITY_CENTER_LIVE_CHECK_V1",
    base,
    home_http_status: home.status,
    asset,
    asset_http_status: assetStatus,
    marker_found: markerFound,
    expected_marker: EXPECTED_MARKER,
    endpoints,
    endpoint_failures_count: endpointFailures.length,
    checked_at: startedAt,
    safety: {
      no_writes_performed: true,
      no_sql_executed: true,
      no_student_rows_returned: true,
      no_secret_values_returned: true,
      aggregate_or_status_only: true
    }
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(ok ? 0 : 2);
})();
