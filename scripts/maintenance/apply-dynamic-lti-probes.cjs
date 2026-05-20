const fs = require("fs");
const path = require("path");

const serverPath = path.join(process.cwd(), "src", "server.js");
let server = fs.readFileSync(serverPath, "utf8");

const marker = "// >>> MTH_DYNAMIC_LTI_CAPABILITY_PROBES_V1 >>>";

const block = `
// >>> MTH_DYNAMIC_LTI_CAPABILITY_PROBES_V1 >>>
function safeUrlParts(value) {
  try {
    if (!value) return { host: null, pathnameHint: null };
    const u = new URL(String(value));
    return { host: u.host || null, pathnameHint: u.pathname || null };
  } catch {
    return { host: null, pathnameHint: null };
  }
}

function compactString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function pickFromObjects(objects, keys) {
  for (const obj of objects) {
    if (!obj || typeof obj !== "object") continue;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null && obj[key] !== "") {
        return obj[key];
      }
    }
  }
  return null;
}

function claimBags(session) {
  return [
    session,
    session?.claims,
    session?.ltiClaims,
    session?.lti13Claims,
    session?.idTokenClaims,
    session?.launchClaims,
    session?.rawClaims,
    session?.services
  ].filter(Boolean);
}

function asStringArray(value) {
  if (Array.isArray(value)) return value.map(v => String(v)).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function readClaimValue(session, keys) {
  return pickFromObjects(claimBags(session), keys);
}

function readClaimObject(session, keys) {
  const value = readClaimValue(session, keys);
  return value && typeof value === "object" ? value : null;
}

function normalizeCourseIdFromSession(session) {
  const contextClaim = readClaimValue(session, [
    "https://purl.imsglobal.org/spec/lti/claim/context",
    "context",
    "context_id",
    "contextId",
    "courseId",
    "course_id"
  ]);

  if (contextClaim && typeof contextClaim === "object") {
    return compactString(contextClaim.id || contextClaim.context_id || contextClaim.courseId || "");
  }

  return compactString(contextClaim || session?.courseId || session?.course_id || session?.contextId || "");
}

function normalizeRolesFromSession(session) {
  const roles = readClaimValue(session, [
    "https://purl.imsglobal.org/spec/lti/claim/roles",
    "roles",
    "role"
  ]) || session?.roles || session?.role;
  return asStringArray(roles);
}

function buildDynamicLtiCapabilityProbes(session) {
  const connected = Boolean(session);
  const courseId = connected ? normalizeCourseIdFromSession(session) : "";
  const roles = connected ? normalizeRolesFromSession(session) : [];

  const issuer = compactString(readClaimValue(session, ["iss", "issuer", "platformIssuer"]) || session?.siteUrl || session?.siteId || "unknown-platform");
  const deploymentId = compactString(readClaimValue(session, [
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id",
    "deployment_id",
    "deploymentId"
  ]) || session?.deploymentId || "unknown-deployment");
  const clientIdRaw = readClaimValue(session, ["aud", "client_id", "clientId"]) || "unknown-client";
  const clientId = Array.isArray(clientIdRaw) ? compactString(clientIdRaw[0]) : compactString(clientIdRaw);

  const userSub = compactString(readClaimValue(session, ["sub", "user_id", "userId"]) || session?.moodleUserId || session?.moodleUsername || session?.teacherName || "");
  const resourceClaim = readClaimValue(session, [
    "https://purl.imsglobal.org/spec/lti/claim/resource_link",
    "resource_link",
    "resource_link_id",
    "resourceLinkId"
  ]);
  const resourceLinkId = compactString(
    resourceClaim && typeof resourceClaim === "object"
      ? (resourceClaim.id || resourceClaim.resource_link_id || "")
      : (resourceClaim || session?.resourceLinkId || session?.resource_link_id || "unknown-resource-link")
  );

  const platformKey = connected ? stableId("platform", issuer + "|" + clientId + "|" + deploymentId) : null;
  const deploymentKey = connected ? stableId("deployment", platformKey + "|" + deploymentId) : null;
  const contextKey = connected && courseId ? stableId("context", deploymentKey + "|" + courseId) : null;
  const resourceLinkKey = connected ? stableId("resource", (contextKey || deploymentKey || platformKey || "") + "|" + resourceLinkId) : null;
  const userKey = connected && userSub ? stableId("user", platformKey + "|" + userSub) : null;

  const nrpsClaim = readClaimObject(session, [
    "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice",
    "namesroleservice",
    "namesRoleService",
    "nrps",
    "nrpsClaim"
  ]);

  const agsClaim = readClaimObject(session, [
    "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint",
    "endpoint",
    "ags",
    "agsClaim",
    "agsEndpoint"
  ]);

  const nrpsUrl = nrpsClaim?.context_memberships_url || nrpsClaim?.membershipUrl || nrpsClaim?.url || nrpsClaim?.endpoint || null;
  const nrpsParts = safeUrlParts(nrpsUrl);
  const nrpsScopes = asStringArray(nrpsClaim?.scope || nrpsClaim?.scopes || nrpsClaim?.service_versions);

  const agsLineItems = agsClaim?.lineitems || agsClaim?.lineItems || agsClaim?.lineitems_url || null;
  const agsLineItem = agsClaim?.lineitem || agsClaim?.lineItem || null;
  const agsParts = safeUrlParts(agsLineItems || agsLineItem);
  const agsScopes = asStringArray(agsClaim?.scope || agsClaim?.scopes);

  const nrpsAvailable = Boolean(nrpsParts.host && nrpsParts.pathnameHint);
  const agsAvailable = Boolean(agsParts.host && agsParts.pathnameHint);
  const moodleWsConfigured = !!env("MOODLE_WS_TOKEN");

  const ltiVersion = connected
    ? (nrpsClaim || agsClaim || readClaimValue(session, ["https://purl.imsglobal.org/spec/lti/claim/version", "lti_version", "ltiVersion"]) ? "1.3_or_advantage_candidate" : "1.1_or_unknown")
    : null;

  const blockerKeys = [];
  if (!connected) blockerKeys.push("missing_lti_session");
  if (connected && !courseId) blockerKeys.push("missing_context");
  if (connected && !nrpsAvailable) blockerKeys.push("nrps_missing");
  if (connected && !agsAvailable) blockerKeys.push("ags_missing");
  if (!moodleWsConfigured) blockerKeys.push("webservices_missing");

  return {
    ok: true,
    connected,
    ltiSessionAvailable: connected,
    launchMode: connected ? "lti" : "direct",
    ltiVersion,
    hasContext: Boolean(courseId),
    course: {
      id: courseId || null,
      name: connected ? (session?.courseTitle || session?.spaceTitle || null) : null,
      present: Boolean(courseId)
    },
    actor: {
      hasUser: Boolean(userKey),
      hasRoles: roles.length > 0,
      roleKinds: roles.map(role => String(role).split("/").pop()).slice(0, 12)
    },
    normalizedKeys: {
      platformKeyPresent: Boolean(platformKey),
      deploymentKeyPresent: Boolean(deploymentKey),
      contextKeyPresent: Boolean(contextKey),
      resourceLinkKeyPresent: Boolean(resourceLinkKey),
      userKeyPresent: Boolean(userKey)
    },
    services: {
      nrps: {
        status: !connected ? "blocked_no_lti_session" : nrpsAvailable ? "ready_for_safe_probe" : "missing",
        claimPresent: Boolean(nrpsClaim),
        scopeCount: nrpsScopes.length,
        host: nrpsParts.host,
        pathnameHint: nrpsParts.pathnameHint,
        safeProbeEligible: nrpsAvailable
      },
      ags: {
        status: !connected ? "blocked_no_lti_session" : agsAvailable ? "ready_for_safe_probe" : "missing",
        claimPresent: Boolean(agsClaim),
        scopeCount: agsScopes.length,
        host: agsParts.host,
        pathnameHint: agsParts.pathnameHint,
        safeProbeEligible: agsAvailable
      },
      moodleWebServices: {
        status: moodleWsConfigured ? "configured_not_verified" : "missing",
        configured: moodleWsConfigured,
        verified: false
      }
    },
    blockerKeys,
    nextBestAction: !connected
      ? "open_from_moodle_lti_context"
      : !courseId
        ? "fix_lti_context_claims"
        : nrpsAvailable || agsAvailable
          ? "run_safe_nrps_ags_read_only_probe"
          : "use_manual_exports_or_request_admin_enablement",
    safety: {
      rawLaunchHidden: true,
      tokensHidden: true,
      piiHidden: true,
      studentRowsHidden: true,
      gradesHidden: true,
      logsHidden: true,
      teacherRelease: false
    },
    teacherRelease: false,
    checkedAt: new Date().toISOString()
  };
}

app.get("/api/automation/lti-capability-probes", (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req) || sessionFromRequest(req);
  res.json(buildDynamicLtiCapabilityProbes(session));
});
// <<< MTH_DYNAMIC_LTI_CAPABILITY_PROBES_V1 <<<
`;

if (!server.includes(marker)) {
  const anchor = 'app.get("/api/automation/capabilities", async (req, res) => {';
  if (!server.includes(anchor)) {
    throw new Error("Cannot find automation capabilities endpoint anchor");
  }
  server = server.replace(anchor, block + "\n\n" + anchor);
  fs.writeFileSync(serverPath, server, "utf8");
}

console.log("PATCH_DYNAMIC_LTI_PROBES_OK");