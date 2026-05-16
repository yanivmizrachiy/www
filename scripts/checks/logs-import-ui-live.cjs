#!/usr/bin/env node
const https = require("node:https");
const base = (process.env.MTH_LIVE_BASE_URL || "https://www-tijc.onrender.com").replace(/\/+$/, "");

function getText(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ ok: true, status: res.statusCode, body }));
    });
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: 0, body: "", error: "TIMEOUT" }); });
    req.on("error", (err) => resolve({ ok: false, status: 0, body: "", error: String(err.message || err) }));
  });
}

(async () => {
  const home = await getText(base + "/");
  const match = home.body.match(/\/assets\/index-[^"]+\.js/);
  const asset = match ? match[0] : null;
  let markerFound = false;
  if (asset) {
    const js = await getText(base + asset);
    markerFound = js.body.includes("MTH_MOODLE_LOGS_IMPORT_UI_V1");
  }

  console.log(JSON.stringify({
    ok: true,
    mode: "moodle-logs-import-ui-live-check",
    version: "MTH_LOGS_IMPORT_UI_CHECK_V1",
    marker_found: markerFound,
    expected_marker: "MTH_MOODLE_LOGS_IMPORT_UI_V1",
    route: "/logs-import",
    asset,
    checked_at: new Date().toISOString(),
    safety: {
      no_writes_performed: true,
      no_sql_executed: true,
      no_student_rows_returned: true,
      no_secret_values_returned: true
    }
  }, null, 2));
  process.exit(markerFound ? 0 : 2);
})();
