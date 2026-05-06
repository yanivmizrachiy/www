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

let server = read('src/server.js');

must(server, 'const CANONICAL_LTI_ENDPOINT = "/api/lti/launch";', 'canonical endpoint');
must(server, 'function sessionFromRequest(req)', 'sessionFromRequest');
must(server, 'app.post(CANONICAL_LTI_ENDPOINT', 'POST LTI launch route');
must(server, 'app.get("/api/bootstrap"', 'bootstrap route');
must(server, 'app.get("/api/imports/overview"', 'imports overview route');

if (!server.includes('function noStore(res)')) {
  server = server.replace(
    'function numberOrZero(value) {',
    `function noStore(res) {\n  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");\n  res.setHeader("Pragma", "no-cache");\n  res.setHeader("Expires", "0");\n}\n\nfunction numberOrZero(value) {`
  );
}

if (!server.includes('app.get(CANONICAL_LTI_ENDPOINT')) {
  const getRescue = `\napp.get(CANONICAL_LTI_ENDPOINT, (req, res) => {\n  noStore(res);\n  const session = sessionFromRequest(req);\n  if (session?.sessionToken) {\n    return res.redirect(303, publicBaseUrl(req) + "/lti?t=" + encodeURIComponent(session.sessionToken) + "&next=" + encodeURIComponent("/import"));\n  }\n  return res.redirect(303, publicBaseUrl(req) + "/setup?reason=direct-lti-get");\n});\n`;
  server = server.replace('app.post(CANONICAL_LTI_ENDPOINT', getRescue + '\napp.post(CANONICAL_LTI_ENDPOINT');
}

server = server.replace(
  '    setSession(res, session);\n    res.redirect(`/lti?t=${encodeURIComponent(sessionToken)}&course=${encodeURIComponent(space.title)}`);',
  '    setSession(res, session);\n    noStore(res);\n    res.redirect(303, publicBaseUrl(req) + "/lti?t=" + encodeURIComponent(sessionToken) + "&course=" + encodeURIComponent(space.title) + "&next=" + encodeURIComponent("/import"));'
);

server = server.replace(
  'app.get("/api/bootstrap", (req, res) => {\n  const session = sessionFromRequest(req);',
  'app.get("/api/bootstrap", (req, res) => {\n  noStore(res);\n  const session = sessionFromRequest(req);'
);

server = server.replace(
  'app.post("/api/import", (req, res) => {\n  const session = importSessionFromRequest(req);',
  'app.post("/api/import", (req, res) => {\n  noStore(res);\n  const session = importSessionFromRequest(req);'
);

server = server.replace(
  'app.get("/api/imports/students", (req, res) => {\n  const session = importSessionFromRequest(req);',
  'app.get("/api/imports/students", (req, res) => {\n  noStore(res);\n  const session = importSessionFromRequest(req);'
);

server = server.replace(
  'app.get("/api/imports/overview", (req, res) => {\n  if (!sessionFromRequest(req)) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });',
  'app.get("/api/imports/overview", (req, res) => {\n  noStore(res);\n  if (!sessionFromRequest(req)) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });'
);

write('src/server.js', server);

let lti = read('src/pages/LtiBootstrap.tsx');
must(lti, 'const token = params.get("t")', 'LtiBootstrap token line');

if (!lti.includes('const nextPath')) {
  lti = lti.replace(
    '    const token = params.get("t") || new URLSearchParams(window.location.hash.split("?")[1] || "").get("t");\n    if (token) { ',
    '    const hashParams = new URLSearchParams(window.location.hash.split("?")[1] || "");\n    const token = params.get("t") || hashParams.get("t");\n    const nextPath = params.get("next") || hashParams.get("next") || "/import";\n    if (token) { '
  );
  lti = lti.replace(
    '      setTimeout(() => navigate("/", { replace:true }), 1000); ',
    '      setTimeout(() => navigate(nextPath.startsWith("/") ? nextPath : "/import", { replace:true }), 250); '
  );
}

write('src/pages/LtiBootstrap.tsx', lti);

console.log('FIX_LTI_ROUTING_REDIRECT_CACHE_OK');
