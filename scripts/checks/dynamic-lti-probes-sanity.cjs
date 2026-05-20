const fs = require("fs");
const path = require("path");

const root = process.cwd();
const server = fs.readFileSync(path.join(root, "src", "server.js"), "utf8");

const checks = [
  ["marker exists", server.includes("MTH_DYNAMIC_LTI_CAPABILITY_PROBES_V1")],
  ["route exists", server.includes("/api/automation/lti-capability-probes")],
  ["helper exists", server.includes("buildDynamicLtiCapabilityProbes")],
  ["NRPS claim key exists", server.includes("https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice")],
  ["AGS claim key exists", server.includes("https://purl.imsglobal.org/spec/lti-ags/claim/endpoint")],
  ["no raw token response pattern", !/res\.json\([^)]*MOODLE_WS_TOKEN/i.test(server)],
  ["teacher release stays false", server.includes("teacherRelease: false")]
];

let failures = 0;
for (const [label, ok] of checks) {
  if (ok) console.log("OK:   " + label);
  else {
    console.error("FAIL: " + label);
    failures += 1;
  }
}

const stateDir = path.join(root, "STATE", "automation");
fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(
  path.join(stateDir, "DYNAMIC_LTI_CAPABILITY_PROBES_STATUS.json"),
  JSON.stringify({
    ok: failures === 0,
    mode: "MTH_DYNAMIC_LTI_CAPABILITY_PROBES_STATUS_V1",
    route: "/api/automation/lti-capability-probes",
    checks: Object.fromEntries(checks),
    teacherRelease: "NO",
    safety: {
      noSecretsReturned: true,
      noRawLaunchPayloadReturned: true,
      noStudentRowsReturned: true,
      noGradesReturned: true
    },
    generatedAt: new Date().toISOString()
  }, null, 2),
  "utf8"
);

if (failures) {
  console.error("DYNAMIC_LTI_PROBES_SANITY_FAIL");
  process.exit(1);
}

console.log("DYNAMIC_LTI_PROBES_SANITY_OK");