const fs = require('fs');

const server = fs.readFileSync('src/server.js', 'utf8');
const lti = fs.readFileSync('src/pages/LtiBootstrap.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const checks = [
  ['server has LTI routing fix marker', server.includes('ltiRoutingFixVersion: LTI_ROUTING_FIX_VERSION')],
  ['server has current LTI routing fix version', server.includes('2026-05-06-render-lti-routing-cache-v3')],
  ['server has noStore helper', server.includes('function noStore(res)')],
  ['server has GET rescue for canonical LTI endpoint', server.includes('app.get(CANONICAL_LTI_ENDPOINT')],
  ['server POST launch uses 303 redirect', server.includes('res.redirect(303')],
  ['server redirects to /lti token route', server.includes('/lti?t=')],
  ['server redirects successful launch toward import', server.includes('encodeURIComponent("/import")')],
  ['bootstrap endpoint disables cache', server.includes('app.get("/api/bootstrap", (req, res) => {\n  noStore(res);')],
  ['imports overview disables cache', server.includes('app.get("/api/imports/overview", (req, res) => {\n  noStore(res);')],
  ['import POST disables cache', server.includes('app.post("/api/import", (req, res) => {\n  noStore(res);')],
  ['imported students GET disables cache', server.includes('app.get("/api/imports/students", (req, res) => {\n  noStore(res);')],
  ['SPA static index/fallback disables cache', server.includes('express.static(distPath, {') && server.includes('filePath.endsWith("index.html")') && server.includes('app.get("*", (_req, res) => {\n    noStore(res);')],
  ['React has frontend rescue route', app.includes('path="/api/lti/launch"') && app.includes('to="/import"')],
  ['LtiBootstrap supports safe nextPath', lti.includes('const nextPath') && lti.includes('const safeNextPath')],
  ['LtiBootstrap blocks /api next paths', lti.includes('!nextPath.startsWith("/api/")')],
  ['LtiBootstrap navigates to safeNextPath', lti.includes('navigate(safeNextPath')],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (ok) {
    console.log('OK:', name);
  } else {
    console.error('FAIL:', name);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`VERIFY_LTI_ROUTING_FIX_FAILED: ${failed} checks failed`);
  process.exit(1);
}

console.log('VERIFY_LTI_ROUTING_FIX_OK');
