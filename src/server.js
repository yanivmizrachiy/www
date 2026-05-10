import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { persistenceStatus, persistParticipantsImportIfConfigured } from "./persistence/supabasePersistence.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);
const PORT = Number(process.env.PORT || 3000);
const STORE_PATH = path.join(ROOT, "data", "store.json");
const CANONICAL_LTI_ENDPOINT = "/api/lti/launch";
const LTI13_DIAGNOSTIC_VERSION = "2026-05-07-lti13-readiness-diagnostics-v2";
const LTI_ROUTING_FIX_VERSION = "2026-05-06-render-lti-routing-cache-v3";

const sessions = new Map();
const tokenSessions = new Map();

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function publicBaseUrl(req) {
  const configured = env("APP_BASE_URL", env("PUBLIC_BASE_URL", ""));
  if (configured) return configured.replace(/\/+$/, "");
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`.replace(/\/+$/, "");
}

function rfc3986(value) {
  return encodeURIComponent(String(value)).replace(/[!'()*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
}

function normalizedUrl(url) {
  const u = new URL(url);
  u.hash = "";
  u.search = "";
  const protocol = u.protocol.toLowerCase();
  const hostname = u.hostname.toLowerCase();
  const port = u.port && !((protocol === "http:" && u.port === "80") || (protocol === "https:" && u.port === "443")) ? `:${u.port}` : "";
  return `${protocol}//${hostname}${port}${u.pathname}`;
}

function oauthParams(req, launchUrl) {
  const params = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    if (key === "oauth_signature") continue;
    if (Array.isArray(value)) value.forEach(v => params.push([key, v]));
    else params.push([key, value]);
  }
  for (const [key, value] of new URL(launchUrl).searchParams.entries()) {
    if (key !== "oauth_signature") params.push([key, value]);
  }
  return params
    .map(([key, value]) => [rfc3986(key), rfc3986(value ?? "")])
    .sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
}

function verifyLti(req, launchUrl) {
  const secret = env("LTI_SHARED_SECRET");
  const expectedKey = env("LTI_CONSUMER_KEY");
  const body = req.body || {};

  if (!secret) return { ok: false, status: 503, code: "MISSING_LTI_SHARED_SECRET" };
  if (!body.oauth_signature) return { ok: false, status: 401, code: "MISSING_OAUTH_SIGNATURE" };
  if (!body.oauth_consumer_key) return { ok: false, status: 401, code: "MISSING_CONSUMER_KEY" };
  if (expectedKey && body.oauth_consumer_key !== expectedKey) return { ok: false, status: 401, code: "BAD_CONSUMER_KEY" };
  if (!body.oauth_nonce || !body.oauth_timestamp) return { ok: false, status: 401, code: "MISSING_NONCE_OR_TIMESTAMP" };
  if (String(body.oauth_signature_method || "").toUpperCase() !== "HMAC-SHA1") return { ok: false, status: 401, code: "UNSUPPORTED_SIGNATURE_METHOD" };

  const timestamp = Number(body.oauth_timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (env("LTI_ALLOW_OLD_TIMESTAMP", "false") !== "true" && (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 600)) {
    return { ok: false, status: 401, code: "STALE_OAUTH_TIMESTAMP" };
  }

  const paramString = oauthParams(req, launchUrl).map(([key, value]) => `${key}=${value}`).join("&");
  const baseString = ["POST", rfc3986(normalizedUrl(launchUrl)), rfc3986(paramString)].join("&");
  const expected = crypto.createHmac("sha1", `${rfc3986(secret)}&`).update(baseString).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(body.oauth_signature || ""));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, status: 401, code: "BAD_OAUTH_SIGNATURE" };

  return { ok: true, code: "OAUTH_VERIFIED" };
}


function lti13NoStore(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function lti13EnvStatus() {
  const required = [
    "LTI13_PRIVATE_KEY_PEM",
    "LTI13_KEY_ID",
    "LTI13_ISSUER",
    "LTI13_CLIENT_ID",
    "LTI13_DEPLOYMENT_ID",
    "LTI13_AUTH_LOGIN_URL",
    "LTI13_TOKEN_URL",
    "LTI13_PLATFORM_JWKS_URL"
  ];
  const present = Object.fromEntries(required.map(name => [name, !!env(name)]));
  return {
    required,
    present,
    configured: required.every(name => !!env(name)),
    missing: required.filter(name => !env(name))
  };
}

function lti13PublicJwks() {
  const privateKeyPem = env("LTI13_PRIVATE_KEY_PEM");
  const kid = env("LTI13_KEY_ID", "moodle-teacher-hub-lti13-dev-key");
  if (!privateKeyPem) {
    return { ok: false, error: "LTI13_PRIVATE_KEY_PEM_NOT_CONFIGURED", keys: [] };
  }
  try {
    const normalizedPem = privateKeyPem.includes("\n") ? privateKeyPem.replace(/\n/g, String.fromCharCode(10)) : privateKeyPem;
    const privateKey = crypto.createPrivateKey(normalizedPem);
    const publicKey = crypto.createPublicKey(privateKey);
    const jwk = publicKey.export({ format: "jwk" });
    return {
      ok: true,
      error: null,
      keys: [{ ...jwk, kid, use: "sig", alg: "RS256" }]
    };
  } catch (error) {
    return { ok: false, error: "LTI13_PUBLIC_JWKS_EXPORT_FAILED", detail: error.message, keys: [] };
  }
}


function emptyStore() {
  return {
    launches: [],
    teachers: [],
    spaces: [],
    students: [],
    tasks: [],
    grades: [],
    activitySessions: [],
    moodleCaptures: [],
    importBatches: [],
    gradeItems: [],
    chapters: [],
    logEvents: [],
    completionRows: [],
    settings: { allowTeacherSettingsView: true, allowExport: true, lastSyncAt: null }
  };
}

function loadStore() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  if (!fs.existsSync(STORE_PATH)) fs.writeFileSync(STORE_PATH, JSON.stringify(emptyStore(), null, 2), "utf8");
  try {
    return { ...emptyStore(), ...JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) };
  } catch {
    const store = emptyStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
    return store;
  }
}

const store = loadStore();

function saveStore() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function stableId(prefix, value) {
  return `${prefix}_${crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, 20)}`;
}

function text(body, key) {
  const value = body?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function upsertTeacher(body) {
  const externalId = text(body, "user_id") || text(body, "lis_person_sourcedid") || text(body, "lis_person_name_full");
  if (!externalId) throw new Error("MISSING_REAL_TEACHER_ID_FROM_MOODLE");
  const id = stableId("teacher", externalId);
  let teacher = store.teachers.find(item => item.id === id);
  if (!teacher) {
    teacher = { id, externalId, name: text(body, "lis_person_name_full") || text(body, "lis_person_name_given") || "שם מורה לא התקבל ממודל", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.teachers.push(teacher);
  } else {
    teacher.name = text(body, "lis_person_name_full") || teacher.name;
    teacher.updatedAt = new Date().toISOString();
  }
  return teacher;
}

function upsertSpace(body) {
  const externalId = text(body, "context_id") || text(body, "resource_link_id");
  if (!externalId) throw new Error("MISSING_REAL_CONTEXT_ID_FROM_MOODLE");
  const id = stableId("space", externalId);
  let space = store.spaces.find(item => item.id === id);
  if (!space) {
    space = { id, externalId, title: text(body, "context_title") || text(body, "resource_link_title") || "שם מרחב לא התקבל ממודל", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.spaces.push(space);
  } else {
    space.title = text(body, "context_title") || text(body, "resource_link_title") || space.title;
    space.updatedAt = new Date().toISOString();
  }
  return space;
}

function setSession(res, data) {
  const sid = crypto.randomUUID();
  sessions.set(sid, data);
  tokenSessions.set(data.sessionToken, data);
  const secure = env("COOKIE_SECURE", env("NODE_ENV") === "production" ? "true" : "false") === "true";
  res.cookie("sid", sid, { httpOnly: true, sameSite: secure ? "none" : "lax", secure });
}

function sessionFromRequest(req) {
  const token = typeof req.query?.t === "string" ? req.query.t : "";
  if (token && tokenSessions.has(token)) return tokenSessions.get(token);
  const sid = req.cookies?.sid;
  return sid ? sessions.get(sid) || null : null;
}

function noStore(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
}

function numberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function contextPayload(session) {
  return {
    ok: true,
    session: {
      id: session.sessionToken,
      course_id: numberOrZero(session.courseId),
      course_title: session.courseTitle || session.spaceTitle || null,
      moodle_username: session.moodleUsername || session.teacherName || null,
      moodle_user_id: numberOrZero(session.moodleUserId),
      role: session.role || "teacher",
      launched_at: session.createdAt,
      expires_at: session.expiresAt
    },
    site: {
      id: session.siteId || "moodlemoe",
      site_url: session.siteUrl || "https://moodlemoe.lms.education.gov.il",
      site_name: session.siteName || "Moodle משרד החינוך",
      consumer_guid: session.consumerGuid || null,
      lti_configured: true,
      ws_configured: false,
      ws_token_status: "blocked-no-token",
      last_probed_at: null
    },
    probes: []
  };
}

async function recordSupabaseSession(record) {
  const url = env("VITE_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return { ok: false, skipped: true, reason: "SUPABASE_NOT_CONFIGURED" };
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("teacher_sessions").insert(record);
  return error ? { ok: false, skipped: false, reason: error.message } : { ok: true, skipped: false, reason: "" };
}

function recordLaunchCapture(body, verificationCode) {
  store.moodleCaptures.push({
    id: crypto.randomUUID(),
    source: "lti11",
    verificationCode,
    createdAt: new Date().toISOString(),
    keys: Object.keys(body || {}).sort(),
    rawCount: Object.keys(body || {}).length
  });
  if (store.moodleCaptures.length > 100) store.moodleCaptures.splice(0, store.moodleCaptures.length - 100);
  store.settings.lastSyncAt = new Date().toISOString();
}

function importSessionFromRequest(req) {
  const body = req.body || {};
  const headerToken = req.headers["x-lti-session"];
  const token =
    (typeof body.token === "string" && body.token) ||
    (typeof req.query?.t === "string" && req.query.t) ||
    (typeof headerToken === "string" && headerToken) ||
    "";

  if (token && tokenSessions.has(token)) return tokenSessions.get(token);
  return sessionFromRequest(req);
}

function normalizeImportKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function pickImportValue(row, candidates) {
  if (!row || typeof row !== "object") return "";
  const lookup = new Map(Object.keys(row).map(key => [normalizeImportKey(key), key]));
  for (const candidate of candidates) {
    const key = lookup.get(normalizeImportKey(candidate));
    if (key && row[key] != null && String(row[key]).trim()) return String(row[key]).trim();
  }
  return "";
}

function normalizeImportedStudent(row, session) {
  const firstName = pickImportValue(row, ["שם פרטי", "First name", "Firstname", "first_name"]);
  const lastName = pickImportValue(row, ["שם משפחה", "Surname", "Last name", "lastname", "last_name"]);
  const fullName = pickImportValue(row, ["שם מלא", "Full name", "שם", "Name"]) || [firstName, lastName].filter(Boolean).join(" ").trim();
  const email = pickImportValue(row, ["כתובת דואל", "כתובת דוא״ל", "דואל", "דוא״ל", "דואר אלקטרוני", "Email address", "Email"]);
  const externalUsername = pickImportValue(row, ["שם משתמש", "Username", "User name", "login", "מזהה משתמש"]);
  const moodleUserId = pickImportValue(row, ["user_id", "User ID", "מזהה משתמש", "ID", "id", "מזהה"]);
  const lisPersonSourcedId = pickImportValue(row, ["lis_person_sourcedid", "lis_person_sourcedId", "sourcedid", "Source ID", "Sourced ID"]);
  const idNumber = pickImportValue(row, ["ID number", "idnumber", "מספר זהות", "תז", "ת.ז.", "מספר מזהה"]);
  const externalId = moodleUserId || lisPersonSourcedId || idNumber || externalUsername || email || fullName;
  const identity = externalId || email || externalUsername || fullName;

  if (!fullName || !identity) return null;

  const spaceId = session?.spaceId || "unknown-space";
  const now = new Date().toISOString();
  return {
    id: stableId("student", spaceId + "|" + identity),
    full_name: fullName,
    fullName,
    email: email || null,
    external_username: externalUsername || null,
    external_id: externalId || identity,
    moodle_user_id: moodleUserId || null,
    lis_person_sourcedid: lisPersonSourcedId || null,
    id_number: idNumber || null,
    space_id: spaceId,
    source: "moodle-participants-import",
    updated_at: now,
    updatedAt: now
  };
}

function upsertImportedStudents(rows, session) {
  const input = Array.isArray(rows) ? rows : [];
  const warnings = [];
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  if (!Array.isArray(store.students)) store.students = [];

  for (const row of input) {
    const student = normalizeImportedStudent(row, session);
    if (!student) {
      skipped += 1;
      continue;
    }

    const index = store.students.findIndex(item => item.id === student.id);
    if (index >= 0) {
      store.students[index] = { ...store.students[index], ...student };
      updated += 1;
    } else {
      store.students.push(student);
      inserted += 1;
    }
  }

  if (skipped > 0) warnings.push("Skipped " + skipped + " rows without a usable student name/identity.");
  return { row_count: inserted + updated, inserted, updated, skipped, warnings };
}

function importedStudentDto(student) {
  return {
    id: student.id,
    full_name: student.full_name || student.fullName || student.name || "",
    email: student.email || null,
    external_username: student.external_username || student.externalUsername || null,
    external_id: student.external_id || student.externalId || null,
    moodle_user_id: student.moodle_user_id || student.moodleUserId || null,
    lis_person_sourcedid: student.lis_person_sourcedid || student.lisPersonSourcedId || null,
    id_number: student.id_number || student.idNumber || null,
    updated_at: student.updated_at || student.updatedAt || null
  };
}

function buildGradesCsv() {
  const studentMap = Object.fromEntries(store.students.map(student => [student.id, student.fullName || student.full_name || student.name || student.id]));
  const taskMap = Object.fromEntries(store.tasks.map(task => [task.id, task.name || task.task_name || task.id]));
  let csv = '\uFEFF"שם תלמיד","שם משימה","ציון","ניסיונות","תאריך עדכון"\n';
  for (const grade of store.grades) {
    const studentName = studentMap[grade.studentId] || studentMap[grade.student_id] || grade.studentId || grade.student_id || "";
    const taskName = taskMap[grade.taskId] || taskMap[grade.task_id] || grade.taskId || grade.task_id || "";
    csv += `"${String(studentName).replaceAll('"','""')}","${String(taskName).replaceAll('"','""')}","${grade.grade ?? grade.raw_value ?? ""}","${grade.attempts ?? ""}","${grade.updatedAt ?? grade.updated_at ?? ""}"\n`;
  }
  return csv;
}


const YANIV_MOODLE_WS_AUTOMATIC_READINESS_V1 = true;

function moodleWsBaseUrl() {
  return env("MOODLE_WS_BASE_URL", "https://moodlemoe.lms.education.gov.il").replace(/\/+$/, "");
}

function moodleWsStatus() {
  const tokenConfigured = !!env("MOODLE_WS_TOKEN");
  let host = "";

  try {
    host = new URL(moodleWsBaseUrl()).host;
  } catch {
    host = "INVALID_MOODLE_WS_BASE_URL";
  }

  return {
    ok: true,
    mode: "moodle-web-services-automatic-readiness",
    configured: tokenConfigured,
    base_url_host: host,
    required_env: ["MOODLE_WS_TOKEN"],
    optional_env: ["MOODLE_WS_BASE_URL"],
    supported_automatic_functions: [
      "core_webservice_get_site_info",
      "core_enrol_get_enrolled_users"
    ],
    privacy: {
      no_token_returned: true,
      no_student_names_returned: true,
      no_emails_returned: true,
      no_save_performed: true
    },
    next_required: tokenConfigured
      ? ["Test /api/moodle-ws/site-info and /api/moodle-ws/enrolled-users-preview."]
      : ["Configure MOODLE_WS_TOKEN in Render only if Ministry Moodle provides a real Web Services token. Do not paste it in chat or GitHub."]
  };
}

async function callMoodleWs(wsfunction, params = {}) {
  const token = env("MOODLE_WS_TOKEN");

  if (!token) {
    return { ok: false, error: "MOODLE_WS_TOKEN_NOT_CONFIGURED" };
  }

  const endpoint = moodleWsBaseUrl() + "/webservice/rest/server.php";
  const form = new URLSearchParams();
  form.set("wstoken", token);
  form.set("wsfunction", wsfunction);
  form.set("moodlewsrestformat", "json");

  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") {
      form.set(key, String(value));
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });

  const textBody = await response.text();
  let json = null;

  try {
    json = JSON.parse(textBody);
  } catch {
    json = { raw: textBody.slice(0, 2000) };
  }

  if (!response.ok) {
    return {
      ok: false,
      http_status: response.status,
      error: "MOODLE_WS_HTTP_ERROR",
      preview: textBody.slice(0, 1000)
    };
  }

  if (json && typeof json === "object" && (json.exception || json.errorcode)) {
    return {
      ok: false,
      http_status: response.status,
      error: "MOODLE_WS_EXCEPTION",
      exception: json.exception || null,
      errorcode: json.errorcode || null,
      message: json.message || null
    };
  }

  return { ok: true, http_status: response.status, data: json };
}

function latestLti13SessionForWs() {
  const values = Array.from(tokenSessions.values()).filter(item => item && item.source === "lti13");
  return values.length ? values[values.length - 1] : null;
}

function extractCourseIdCandidateForWs(session) {
  if (!session) return null;

  const directCandidates = [
    session.courseId,
    session.course_id,
    session.contextId,
    session.context_id
  ];

  for (const item of directCandidates) {
    const n = Number(item);
    if (Number.isFinite(n) && n > 0) return n;
  }

  const serialized = JSON.stringify(session);
  const match = serialized.match(/CourseSection\/(\d+)\/bindings/i);

  if (match && match[1]) {
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }

  return null;
}

function safeWsUserShape(user) {
  const keys = Object.keys(user || {}).sort();
  const roles = Array.isArray(user?.roles)
    ? user.roles.map(role => role?.shortname || role?.roleid || role?.name).filter(Boolean)
    : [];

  const source = String(
    user?.id ??
    user?.userid ??
    user?.username ??
    user?.idnumber ??
    user?.email ??
    user?.fullname ??
    ""
  );

  return {
    user_hash: crypto.createHash("sha256").update(source).digest("hex").slice(0, 16),
    keys,
    roles,
    has_id: user?.id != null || user?.userid != null,
    has_username: Boolean(user?.username),
    has_fullname: Boolean(user?.fullname),
    has_firstname: Boolean(user?.firstname),
    has_lastname: Boolean(user?.lastname),
    has_email: Boolean(user?.email),
    has_idnumber: Boolean(user?.idnumber)
  };
}

const app = express();
app.set("trust proxy", true);
app.use(helmet({ contentSecurityPolicy: false, frameguard: false }));
app.use((_req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://moodlemoe.lms.education.gov.il https://*.lms.education.gov.il;");
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/public", express.static(path.join(ROOT, "public")));

app.get("/api/persistence/status", (_req, res) => {
  res.json(persistenceStatus());
});
app.get("/api/persistence/last-attempt", (_req, res) => {
  res.json({
    ok: true,
    mode: "moodle-teacher-hub-persistence-last-attempt",
    last_attempt: store.settings?.lastPersistenceAttempt || null,
    privacy: {
      no_student_names_returned: true,
      no_student_emails_returned: true,
      no_service_role_key_returned: true
    }
  });
});
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "moodle-teacher-hub",
    canonicalLtiEndpoint: CANONICAL_LTI_ENDPOINT,
    activeRuntime: "render",
    reactRootIsCanonical: true,
    legacyRootDashboardDisabled: true,
    ltiRoutingFixVersion: LTI_ROUTING_FIX_VERSION,
    oauthVerification: "required",
    supabaseConfigured: !!(env("VITE_SUPABASE_URL") && env("SUPABASE_SERVICE_ROLE_KEY")),
    readyForMoodleUse: !!(env("LTI_SHARED_SECRET") && env("LTI_CONSUMER_KEY")),
    counts: {
      launches: store.launches.length,
      teachers: store.teachers.length,
      spaces: store.spaces.length,
      students: store.students.length,
      tasks: store.tasks.length,
      grades: store.grades.length,
      activitySessions: store.activitySessions.length,
      moodleCaptures: store.moodleCaptures.length,
      importBatches: store.importBatches.length
    },
    now: new Date().toISOString()
  });
});

app.get("/lti11/config", (req, res) => {
  const launch = `${publicBaseUrl(req)}${CANONICAL_LTI_ENDPOINT}`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0" xmlns:blti="http://www.imsglobal.org/xsd/imsbasiclti_v1p0">
  <blti:title>Moodle Teacher Hub</blti:title>
  <blti:description>מרכז מורה עברי לנתוני Moodle אמיתיים</blti:description>
  <blti:launch_url>${launch}</blti:launch_url>
  <blti:secure_launch_url>${launch}</blti:secure_launch_url>
</cartridge_basiclti_link>`);
});


app.get(CANONICAL_LTI_ENDPOINT, (req, res) => {
  noStore(res);
  const session = sessionFromRequest(req);
  const base = publicBaseUrl(req);
  if (session?.sessionToken) {
    return res.redirect(303, base + "/lti?t=" + encodeURIComponent(session.sessionToken) + "&next=" + encodeURIComponent("/import"));
  }
  return res.redirect(303, base + "/setup?reason=direct-lti-get");
});

app.post(CANONICAL_LTI_ENDPOINT, async (req, res) => {
  try {
    const launchUrl = `${publicBaseUrl(req)}${CANONICAL_LTI_ENDPOINT}`;
    const verification = verifyLti(req, launchUrl);
    if (!verification.ok) {
      store.launches.push({ id: crypto.randomUUID(), type: "lti11", ok: false, error: verification.code, createdAt: new Date().toISOString() });
      saveStore();
      return res.status(verification.status).send(`Moodle Teacher Hub blocked launch: ${verification.code}`);
    }

    const body = req.body || {};
    const roles = String(body.roles || "");
    if (!/Instructor|Teacher|Mentor|Administrator/i.test(roles)) return res.status(403).send("Moodle Teacher Hub is available to teacher roles only.");

    const teacher = upsertTeacher(body);
    const space = upsertSpace(body);
    const sessionToken = crypto.randomUUID();
    const session = {
      sessionToken,
      teacherName: teacher.name,
      teacherId: teacher.id,
      spaceTitle: space.title,
      spaceId: space.id,
      courseId: body.context_id ?? null,
      courseTitle: body.context_title || space.title,
      moodleUsername: body.ext_user_username || body.lis_person_name_full || body.user_id || null,
      moodleUserId: body.user_id ?? null,
      role: roles || "teacher",
      siteId: stableId("site", body.tool_consumer_instance_guid || body.tool_consumer_instance_url || "moodlemoe"),
      siteUrl: body.tool_consumer_instance_url || "https://moodlemoe.lms.education.gov.il",
      siteName: body.tool_consumer_instance_name || "Moodle משרד החינוך",
      consumerGuid: body.tool_consumer_instance_guid || null,
      source: "lti11",
      verified: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    };

    store.launches.push({ id: crypto.randomUUID(), type: "lti11", ok: true, teacherName: teacher.name, spaceTitle: space.title, verificationCode: verification.code, createdAt: new Date().toISOString() });
    recordLaunchCapture(body, verification.code);
    saveStore();

    await recordSupabaseSession({ session_token: sessionToken, course_id: body.context_id, course_title: body.context_title, moodle_username: body.ext_user_username || body.lis_person_name_full || body.user_id, role: "teacher", created_at: new Date().toISOString() });

    setSession(res, session);
    noStore(res);
    return res.redirect(303, publicBaseUrl(req) + "/lti?t=" + encodeURIComponent(sessionToken) + "&course=" + encodeURIComponent(space.title) + "&next=" + encodeURIComponent("/import"));
  } catch (error) {
    console.error("LTI Launch Error:", error);
    res.status(500).send("שגיאת שרת בחיבור Moodle Teacher Hub");
  }
});

app.get("/api/bootstrap", (req, res) => {
  noStore(res);
  const session = sessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  const context = contextPayload(session);
  res.json({
    ...context,
    teacher: { name: session.teacherName, id: session.teacherId },
    space: { title: session.spaceTitle, id: session.spaceId },
    source: session.source,
    verified: !!session.verified,
    automaticServices: session.automaticServices || { has_nrps: false, has_ags: false, nrps: { available: false }, ags: { available: false } },
    dataReady: { hasRealLaunch: store.moodleCaptures.some(item => item.source === "lti11" && item.verificationCode === "OAUTH_VERIFIED"), hasStudents: store.students.length > 0, hasTasks: store.tasks.length > 0, hasGrades: store.grades.length > 0, hasActivity: store.activitySessions.length > 0 },
    lastLaunchAt: store.launches.at(-1)?.createdAt ?? null,
    lastCaptureAt: store.moodleCaptures.at(-1)?.createdAt ?? null,
    dashboard: { launches: store.launches.length, totalStudents: store.students.length, totalTasks: store.tasks.length, totalGrades: store.grades.length, totalSessions: store.activitySessions.length, moodleCaptures: store.moodleCaptures.length, missingSubmissions: 0, missingScores: 0 }
  });
});

app.post("/api/import", (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const body = req.body || {};
  const reportType = body.report_type || body.reportType;
  if (reportType !== "students") {
    return res.status(400).json({
      ok: false,
      error: "UNSUPPORTED_REPORT_TYPE_FOR_RENDER_IMPORT",
      detail: "Render-first import currently supports Participants/Students only. Grades, logs and completion are intentionally blocked until students import is verified."
    });
  }

  const result = upsertImportedStudents(Array.isArray(body.payload) ? body.payload : [], session);

  const importBodyForPersistence = typeof body !== "undefined" ? body : (req.body || {});
  const studentsForPersistence = store.students.filter(student => student.space_id === (session?.spaceId || "unknown-space"));
  void persistParticipantsImportIfConfigured({
    session,
    batch: {
      file_name: importBodyForPersistence.file_name || importBodyForPersistence.fileName || importBodyForPersistence.filename || null,
      row_count: result.row_count,
      accepted_count: Number(result.inserted || 0) + Number(result.updated || 0),
      skipped_count: result.skipped,
      warnings: result.warnings
    },
    students: studentsForPersistence
  }).then((persistenceAttempt) => {
    store.settings.lastPersistenceAttempt = {
      at: new Date().toISOString(),
      source_type: "participants",
      ok: !!persistenceAttempt?.ok,
      skipped: !!persistenceAttempt?.skipped,
      reason: persistenceAttempt?.reason || null,
      stage: persistenceAttempt?.stage || null,
      persisted_students: persistenceAttempt?.persisted_students || 0,
      student_count: studentsForPersistence.length,
      privacy: {
        no_student_names_returned: true,
        no_student_emails_returned: true,
        no_service_role_key_returned: true
      }
    };
    saveStore();
  }).catch((error) => {
    store.settings.lastPersistenceAttempt = {
      at: new Date().toISOString(),
      source_type: "participants",
      ok: false,
      skipped: false,
      reason: "PERSISTENCE_BACKGROUND_ERROR",
      stage: "background",
      detail: String(error?.message || error).slice(0, 300),
      student_count: studentsForPersistence.length,
      privacy: {
        no_student_names_returned: true,
        no_student_emails_returned: true,
        no_service_role_key_returned: true
      }
    };
    saveStore();
  });
  if (!Array.isArray(store.importBatches)) store.importBatches = [];
  const batch = {
    id: crypto.randomUUID(),
    report_type: "students",
    file_name: body.file_name || null,
    row_count: result.row_count,
    status: result.skipped > 0 ? "partial" : "completed",
    imported_by_username: session.moodleUsername || session.teacherName || null,
    detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null,
    source_kind: body.source_kind || "unknown",
    warnings: result.warnings,
    created_at: new Date().toISOString()
  };

  store.importBatches.push(batch);
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();

  res.json({ ok: true, batch_id: batch.id, row_count: result.row_count, inserted: result.inserted, updated: result.updated, skipped: result.skipped, warnings: result.warnings });
});

app.get("/api/imports/students", (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const spaceId = session.spaceId || "unknown-space";
  const students = store.students
    .filter(student => !student.space_id || student.space_id === spaceId)
    .map(importedStudentDto)
    .filter(student => student.full_name);

  res.json({ ok: true, students });
});

app.get("/api/imports/overview", (req, res) => {
  noStore(res);
  if (!sessionFromRequest(req)) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  res.json({ students_count: store.students.length, grade_items_count: store.gradeItems.length || store.tasks.length, grades_count: store.grades.length, chapters_count: store.chapters.length, tasks_count: store.tasks.length, log_events_count: store.logEvents.length || store.activitySessions.length, batches: [...store.importBatches].reverse() });
});


const YANIV_MOODLE_WS_AUTOMATIC_ROUTES_V1 = true;

app.get("/api/moodle-ws/status", (_req, res) => {
  noStore(res);
  res.json({
    ...moodleWsStatus(),
    now: new Date().toISOString()
  });
});

app.get("/api/moodle-ws/site-info", async (_req, res) => {
  noStore(res);

  try {
    const status = moodleWsStatus();

    if (!status.configured) {
      return res.status(503).json({
        ok: false,
        mode: "moodle-web-services-site-info",
        error: "MOODLE_WS_TOKEN_NOT_CONFIGURED",
        status,
        privacy: {
          no_token_returned: true,
          no_student_names_returned: true,
          no_emails_returned: true,
          no_save_performed: true
        }
      });
    }

    const result = await callMoodleWs("core_webservice_get_site_info");

    if (!result.ok) {
      return res.status(502).json({
        ok: false,
        mode: "moodle-web-services-site-info",
        ...result,
        privacy: {
          no_token_returned: true,
          no_student_names_returned: true,
          no_emails_returned: true,
          no_save_performed: true
        }
      });
    }

    const data = result.data || {};
    let siteurlHost = null;

    try {
      siteurlHost = data.siteurl ? new URL(data.siteurl).host : null;
    } catch {
      siteurlHost = "INVALID_SITE_URL";
    }

    res.json({
      ok: true,
      mode: "moodle-web-services-site-info",
      http_status: result.http_status,
      site: {
        sitename_present: Boolean(data.sitename),
        siteurl_host: siteurlHost,
        userid_present: data.userid != null,
        username_present: Boolean(data.username),
        fullname_present: Boolean(data.fullname),
        functions_count: Array.isArray(data.functions) ? data.functions.length : null,
        has_core_enrol_get_enrolled_users: Array.isArray(data.functions)
          ? data.functions.some(fn => fn && fn.name === "core_enrol_get_enrolled_users")
          : null
      },
      privacy: {
        no_token_returned: true,
        no_student_names_returned: true,
        no_emails_returned: true,
        no_save_performed: true
      },
      now: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mode: "moodle-web-services-site-info",
      error: "MOODLE_WS_SITE_INFO_FAILED",
      message: error.message,
      privacy: {
        no_token_returned: true,
        no_student_names_returned: true,
        no_emails_returned: true,
        no_save_performed: true
      }
    });
  }
});

app.get("/api/moodle-ws/enrolled-users-preview", async (req, res) => {
  noStore(res);

  try {
    const status = moodleWsStatus();

    if (!status.configured) {
      return res.status(503).json({
        ok: false,
        mode: "moodle-web-services-enrolled-users-preview-no-save",
        error: "MOODLE_WS_TOKEN_NOT_CONFIGURED",
        status,
        privacy: {
          no_token_returned: true,
          no_student_names_returned: true,
          no_emails_returned: true,
          no_save_performed: true
        }
      });
    }

    const session = sessionFromRequest(req) || latestLti13SessionForWs();
    const queryCourseId = typeof req.query?.courseid === "string" ? Number(req.query.courseid) : null;
    const courseId = Number.isFinite(queryCourseId) && queryCourseId > 0
      ? queryCourseId
      : extractCourseIdCandidateForWs(session);

    if (!courseId) {
      return res.status(409).json({
        ok: false,
        mode: "moodle-web-services-enrolled-users-preview-no-save",
        error: "NO_COURSE_ID_CANDIDATE",
        next_required: [
          "Open the Moodle LTI tool first.",
          "If the course id is still missing, pass ?courseid=<real Moodle course id> after verifying it from Moodle."
        ],
        privacy: {
          no_token_returned: true,
          no_student_names_returned: true,
          no_emails_returned: true,
          no_save_performed: true
        }
      });
    }

    const result = await callMoodleWs("core_enrol_get_enrolled_users", { courseid: courseId });

    if (!result.ok) {
      return res.status(502).json({
        ok: false,
        mode: "moodle-web-services-enrolled-users-preview-no-save",
        courseid_candidate: courseId,
        ...result,
        privacy: {
          no_token_returned: true,
          no_student_names_returned: true,
          no_emails_returned: true,
          no_save_performed: true
        }
      });
    }

    const users = Array.isArray(result.data) ? result.data : [];
    const roleCounts = {};

    for (const user of users) {
      const roles = Array.isArray(user?.roles) ? user.roles : [];
      if (!roles.length) roleCounts.NO_ROLE = (roleCounts.NO_ROLE || 0) + 1;

      for (const role of roles) {
        const key = String(role?.shortname || role?.name || role?.roleid || "UNKNOWN_ROLE");
        roleCounts[key] = (roleCounts[key] || 0) + 1;
      }
    }

    res.json({
      ok: true,
      mode: "moodle-web-services-enrolled-users-preview-no-save",
      courseid_candidate: courseId,
      users_count: users.length,
      role_counts: roleCounts,
      field_presence: {
        has_id_count: users.filter(user => user?.id != null || user?.userid != null).length,
        has_username_count: users.filter(user => Boolean(user?.username)).length,
        has_fullname_count: users.filter(user => Boolean(user?.fullname)).length,
        has_firstname_count: users.filter(user => Boolean(user?.firstname)).length,
        has_lastname_count: users.filter(user => Boolean(user?.lastname)).length,
        has_email_count: users.filter(user => Boolean(user?.email)).length,
        has_idnumber_count: users.filter(user => Boolean(user?.idnumber)).length,
        keys_union: Array.from(new Set(users.flatMap(user => Object.keys(user || {})))).sort().slice(0, 120)
      },
      sample_users_sanitized: users.slice(0, 8).map(safeWsUserShape),
      privacy: {
        no_token_returned: true,
        no_student_names_returned: true,
        no_emails_returned: true,
        no_save_performed: true
      },
      next_required: [
        "If users_count > 0 and has_fullname_count > 0, implement reviewed automatic save from Moodle Web Services.",
        "Do not save until course isolation and privacy are verified."
      ],
      now: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mode: "moodle-web-services-enrolled-users-preview-no-save",
      error: "MOODLE_WS_ENROLLED_USERS_PREVIEW_FAILED",
      message: error.message,
      privacy: {
        no_token_returned: true,
        no_student_names_returned: true,
        no_emails_returned: true,
        no_save_performed: true
      }
    });
  }
});

app.get("/api/launches", (_req, res) => res.json([...store.launches].reverse()));
app.get("/api/students", (_req, res) => res.json(store.students));
app.get("/api/tasks", (_req, res) => res.json(store.tasks));
app.get("/api/grades", (_req, res) => res.json(store.grades));
app.get("/api/activity", (_req, res) => res.json({ sessions: store.activitySessions, dailySummaries: [] }));
app.get("/api/settings", (_req, res) => res.json(store.settings));
app.get("/api/moodle-captures", (_req, res) => res.json([...store.moodleCaptures].reverse()));
app.get("/api/moodle-summary", (_req, res) => res.json({ capturesCount: store.moodleCaptures.length, lastCaptureAt: store.moodleCaptures.at(-1)?.createdAt ?? null, lastSource: store.moodleCaptures.at(-1)?.source ?? null, availableKeys: store.moodleCaptures.at(-1)?.keys ?? [] }));
app.get("/api/export/grades.csv", (_req, res) => { res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", "attachment; filename=grades-export.csv"); res.send(buildGradesCsv()); });

app.get("/legacy-dashboard", (_req, res) => {
  const dashboardPath = path.join(ROOT, "src", "ui", "dashboard", "dashboard.html");
  if (fs.existsSync(dashboardPath)) return res.sendFile(dashboardPath);
  return res.status(404).send("Legacy dashboard is not available in this branch. React app is the canonical UI.");
});



function lti13Base64UrlJson(part) {
  const normalized = String(part || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

function lti13ReadParams(req) {
  return Object.assign({}, req.query || {}, req.body || {});
}

function lti13PublicBase(req) {
  if (typeof publicBaseUrl === "function") return publicBaseUrl(req);
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return proto + "://" + host;
}

function lti13PlatformAuthUrl(iss) {
  if (process.env.LTI13_PLATFORM_AUTH_URL) return process.env.LTI13_PLATFORM_AUTH_URL;
  try {
    return new URL("/mod/lti/auth.php", String(iss)).toString();
  } catch {
    return "";
  }
}





/* YANIV_LTI13_TOKEN_MATRIX_DIAG_20260510_START */
function lti13TokenMatrixB64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function lti13TokenMatrixB64UrlJson(obj) {
  return lti13TokenMatrixB64Url(JSON.stringify(obj));
}

function lti13TokenMatrixSafeText(value, max = 900) {
  return String(value || "")
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi, "Bearer ***")
    .replace(/access_token["']?\s*[:=]\s*["']?[^"',}\s]+/gi, "access_token:***")
    .slice(0, max);
}

function lti13TokenMatrixBodyKind(text) {
  const t = String(text || "").trimStart();
  if (t.startsWith("{")) return "json";
  if (/<!doctype html|<html/i.test(t)) return "html";
  return "other";
}

function lti13TokenMatrixHtmlTitle(text) {
  const match = String(text || "").match(/<title>(.*?)<\/title>/is);
  return match ? match[1].replace(/\s+/g, " ").trim().slice(0, 180) : null;
}

app.get("/api/lti13/token-matrix", async (req, res) => {
  lti13NoStore(res);

  const envStatus = lti13EnvStatus();
  if (!envStatus.configured) {
    return res.status(503).json({
      ok: false,
      mode: "lti13-token-matrix-no-save",
      stage: "env",
      missing: envStatus.missing,
      privacy: { no_secrets_returned: true, no_tokens_returned: true, no_student_names_returned: true, no_save_performed: true }
    });
  }

  try {
    const configuredTokenUrl = env("LTI13_TOKEN_URL");
    const clientId = env("LTI13_CLIENT_ID");
    const keyId = env("LTI13_KEY_ID");
    const deploymentId = env("LTI13_DEPLOYMENT_ID");
    const privateKeyRaw = env("LTI13_PRIVATE_KEY_PEM");
    const privateKeyPem = privateKeyRaw.includes("\n")
      ? privateKeyRaw.replace(/\n/g, String.fromCharCode(10))
      : privateKeyRaw;

    const discoveryUrl = env(
      "LTI13_OPENID_CONFIGURATION_URL",
      env("LTI13_ISSUER").replace(/\/+$/, "") + "/mod/lti/openid-configuration.php"
    );

    let tokenUrl = configuredTokenUrl;
    let discovery = {
      url: discoveryUrl,
      http_status: null,
      token_endpoint_source: "env",
      token_endpoint_path: new URL(configuredTokenUrl).pathname,
      scopes_has_nrps: false,
      error_preview: null
    };

    try {
      const discoveryResponse = await fetch(discoveryUrl, { headers: { Accept: "application/json" } });
      discovery.http_status = discoveryResponse.status;
      const discoveryText = await discoveryResponse.text();
      if (discoveryResponse.ok) {
        const discoveryJson = JSON.parse(discoveryText);
        if (discoveryJson.token_endpoint) {
          tokenUrl = discoveryJson.token_endpoint;
          discovery.token_endpoint_source = "openid-configuration";
          discovery.token_endpoint_path = new URL(tokenUrl).pathname;
        }
        const scopes = Array.isArray(discoveryJson.scopes_supported) ? discoveryJson.scopes_supported : [];
        discovery.scopes_has_nrps = scopes.includes("https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly");
      } else {
        discovery.error_preview = lti13TokenMatrixSafeText(discoveryText, 500);
      }
    } catch (error) {
      discovery.error_preview = lti13TokenMatrixSafeText(error?.message || error, 500);
    }

    async function tryVariant(variant) {
      const now = Math.floor(Date.now() / 1000);

      const header = { alg: "RS256", typ: "JWT" };
      if (variant.includeKid) header.kid = keyId;

      const payload = {
        iss: clientId,
        sub: clientId,
        aud: variant.audArray ? [tokenUrl] : tokenUrl,
        iat: now - 5,
        exp: now + 60,
        jti: crypto.randomUUID()
      };

      if (variant.includeDeploymentId) {
        payload["https://purl.imsglobal.org/spec/lti/claim/deployment_id"] = deploymentId;
      }

      const signingInput =
        lti13TokenMatrixB64UrlJson(header) + "." + lti13TokenMatrixB64UrlJson(payload);

      const signature = crypto
        .sign("RSA-SHA256", Buffer.from(signingInput), privateKeyPem)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const clientAssertion = signingInput + "." + signature;

      const entries = {
        grant_type: "client_credentials",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: clientAssertion,
        scope: "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"
      };

      if (variant.includeClientIdInBody) entries.client_id = clientId;

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: new URLSearchParams(entries).toString()
      });

      const text = await response.text();
      let json = {};
      try { json = JSON.parse(text); } catch {}

      return {
        name: variant.name,
        http_status: response.status,
        ok_http: response.ok,
        got_access_token: Boolean(json.access_token),
        body_kind: lti13TokenMatrixBodyKind(text),
        html_title: lti13TokenMatrixHtmlTitle(text),
        json_error: json.error || null,
        json_error_description_preview: lti13TokenMatrixSafeText(json.error_description || "", 500) || null,
        body_preview: json.access_token ? null : lti13TokenMatrixSafeText(text, 350),
        variant: {
          aud: variant.audArray ? "array" : "string",
          include_deployment_id: variant.includeDeploymentId,
          include_client_id_body: variant.includeClientIdInBody,
          include_kid: variant.includeKid
        }
      };
    }

    const variants = [];
    for (const audArray of [false, true]) {
      for (const includeDeploymentId of [true, false]) {
        for (const includeClientIdInBody of [false, true]) {
          variants.push({
            name: "aud_" + (audArray ? "array" : "string") +
              "__deployment_" + (includeDeploymentId ? "yes" : "no") +
              "__clientidbody_" + (includeClientIdInBody ? "yes" : "no") +
              "__kid_yes",
            audArray,
            includeDeploymentId,
            includeClientIdInBody,
            includeKid: true
          });
        }
      }
    }

    const results = [];
    for (const variant of variants) {
      results.push(await tryVariant(variant));
    }

    const winner = results.find(item => item.got_access_token) || null;

    return res.json({
      ok: Boolean(winner),
      mode: "lti13-token-matrix-no-save",
      stage: winner ? "token-issued" : "token-failed",
      discovery,
      results,
      winner: winner ? {
        name: winner.name,
        variant: winner.variant,
        http_status: winner.http_status
      } : null,
      privacy: {
        no_access_token_returned: true,
        no_private_key_returned: true,
        no_client_assertion_returned: true,
        no_student_names_returned: true,
        no_save_performed: true
      },
      now: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mode: "lti13-token-matrix-no-save",
      stage: "unexpected",
      error: "TOKEN_MATRIX_FAILED",
      detail: lti13TokenMatrixSafeText(error?.message || error, 900),
      privacy: { no_secrets_returned: true, no_tokens_returned: true, no_save_performed: true }
    });
  }
});
/* YANIV_LTI13_TOKEN_MATRIX_DIAG_20260510_END */

/* YANIV_NRPS_PREVIEW_SAFE_20260509_START */
function nrpsPreviewBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function nrpsPreviewBase64UrlJson(obj) {
  return nrpsPreviewBase64Url(JSON.stringify(obj));
}

function nrpsPreviewSafeText(value, max = 800) {
  return String(value || "")
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi, "Bearer ***")
    .replace(/access_token["']?\s*[:=]\s*["']?[^"',}\s]+/gi, "access_token:***")
    .slice(0, max);
}

function nrpsPreviewSanitizeMember(member) {
  const identity =
    member?.user_id ||
    member?.sub ||
    member?.person_sourcedid ||
    member?.lis_person_sourcedid ||
    member?.email ||
    JSON.stringify(member || {});

  const hash = crypto
    .createHash("sha256")
    .update(String(identity || ""))
    .digest("hex")
    .slice(0, 16);

  const roles = Array.isArray(member?.roles)
    ? member.roles.map(role => String(role).split("#").pop()).filter(Boolean).slice(0, 8)
    : [];

  return {
    user_hash: hash,
    roles,
    status: member?.status || null,
    has_name: Boolean(member?.name || member?.given_name || member?.family_name),
    has_email: Boolean(member?.email),
    has_user_id: Boolean(member?.user_id || member?.sub),
    has_lis_result_sourcedid: Boolean(member?.lis_result_sourcedid)
  };
}

app.get("/api/lti13/nrps-preview", async (req, res) => {
  lti13NoStore(res);

  const envStatus = lti13EnvStatus();
  if (!envStatus.configured) {
    return res.status(503).json({
      ok: false,
      mode: "lti13-nrps-preview-no-save",
      stage: "env",
      error: "LTI13_ENV_NOT_CONFIGURED",
      missing: envStatus.missing,
      privacy: {
        no_secrets_returned: true,
        no_student_names_returned: true,
        no_save_performed: true
      }
    });
  }

  try {
    const statusUrl = publicBaseUrl(req) + "/api/lti13/services-status";
    const statusResponse = await fetch(statusUrl, { headers: { Accept: "application/json" } });
    const statusText = await statusResponse.text();

    let statusJson = null;
    try {
      statusJson = JSON.parse(statusText);
    } catch {
      return res.status(502).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "services-status",
        error: "SERVICES_STATUS_NOT_JSON",
        http_status: statusResponse.status,
        body_preview: nrpsPreviewSafeText(statusText),
        privacy: {
          no_secrets_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    const membershipUrl = statusJson?.service_claims?.nrps?.context_memberships_url || "";
    if (!statusJson?.has_latest_lti13_session || !membershipUrl) {
      return res.status(409).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "session-or-nrps-claim",
        error: "NO_LIVE_LTI13_NRPS_SESSION",
        has_latest_lti13_session: Boolean(statusJson?.has_latest_lti13_session),
        has_nrps: Boolean(statusJson?.has_nrps),
        has_ags: Boolean(statusJson?.has_ags),
        next_required: [
          "Open Moodle Teacher Hub — LTI 1.3 Test from Moodle, then call this endpoint again."
        ],
        privacy: {
          no_secrets_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    /* YANIV_NRPS_TOKEN_DISCOVERY_FIX_20260509_START */
    const configuredTokenUrl = env("LTI13_TOKEN_URL");
    const discoveryUrl = env(
      "LTI13_OPENID_CONFIGURATION_URL",
      env("LTI13_ISSUER").replace(/\/+$/, "") + "/mod/lti/openid-configuration.php"
    );

    let tokenUrl = configuredTokenUrl;
    let tokenEndpointSource = "env";
    let discoveryHttpStatus = null;
    let discoveryErrorPreview = "";
    let discoveryTokenEndpoint = "";
    let discoveryAuthorizationEndpoint = "";
    let discoveryJwksUri = "";
    let discoveryScopes = [];

    try {
      const discoveryResponse = await fetch(discoveryUrl, {
        headers: { Accept: "application/json" }
      });
      discoveryHttpStatus = discoveryResponse.status;
      const discoveryText = await discoveryResponse.text();

      if (discoveryResponse.ok) {
        const discoveryJson = JSON.parse(discoveryText);
        discoveryTokenEndpoint = discoveryJson.token_endpoint || "";
        discoveryAuthorizationEndpoint = discoveryJson.authorization_endpoint || "";
        discoveryJwksUri = discoveryJson.jwks_uri || "";
        discoveryScopes = Array.isArray(discoveryJson.scopes_supported) ? discoveryJson.scopes_supported : [];
        if (discoveryTokenEndpoint) {
          tokenUrl = discoveryTokenEndpoint;
          tokenEndpointSource = "openid-configuration";
        }
      } else {
        discoveryErrorPreview = nrpsPreviewSafeText(discoveryText, 600);
      }
    } catch (error) {
      discoveryErrorPreview = nrpsPreviewSafeText(error?.message || error, 600);
    }
    /* YANIV_NRPS_TOKEN_DISCOVERY_FIX_20260509_END */
    const clientId = env("LTI13_CLIENT_ID");
    const keyId = env("LTI13_KEY_ID");
    const privateKeyRaw = env("LTI13_PRIVATE_KEY_PEM");
    const privateKeyPem = privateKeyRaw.includes("\n")
      ? privateKeyRaw.replace(/\n/g, String.fromCharCode(10))
      : privateKeyRaw;

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT", kid: keyId };
    const payload = {
      iss: clientId,
      sub: clientId,
      aud: tokenUrl,
      "https://purl.imsglobal.org/spec/lti/claim/deployment_id": env("LTI13_DEPLOYMENT_ID"),
      iat: now - 5,
      exp: now + 60,
      jti: crypto.randomUUID()
    };
    /* YANIV_NRPS_DEPLOYMENT_CLAIM_20260509 */

    const signingInput = nrpsPreviewBase64UrlJson(header) + "." + nrpsPreviewBase64UrlJson(payload);
    const signature = crypto
      .sign("RSA-SHA256", Buffer.from(signingInput), privateKeyPem)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const clientAssertion = signingInput + "." + signature;

    /* YANIV_NRPS_TOKEN_CLIENT_ID_DIAG_20260509_START */
    function buildTokenBody(includeClientId) {
      const entries = {
        grant_type: "client_credentials",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: clientAssertion,
        scope: "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"
      };
      if (includeClientId) entries.client_id = clientId;
      return new URLSearchParams(entries);
    }

    async function requestTokenVariant(includeClientId) {
      const body = buildTokenBody(includeClientId);
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: body.toString()
      });
      const text = await response.text();
      let json = {};
      try { json = JSON.parse(text); } catch {}
      return {
        includeClientId,
        response,
        text,
        json,
        ok: response.ok && Boolean(json.access_token)
      };
    }

    let tokenAttempt = await requestTokenVariant(false);
    let fallbackAttempt = null;
    if (!tokenAttempt.ok) {
      fallbackAttempt = await requestTokenVariant(true);
      if (fallbackAttempt.ok) tokenAttempt = fallbackAttempt;
    }

    const tokenResponse = tokenAttempt.response;
    const tokenText = tokenAttempt.text;
    const tokenJson = tokenAttempt.json;
    const tokenVariantUsed = tokenAttempt.includeClientId ? "with_client_id" : "without_client_id";
    const tokenFallbackSummary = fallbackAttempt ? {
      tried: true,
      include_client_id: true,
      http_status: fallbackAttempt.response.status,
      got_access_token: Boolean(fallbackAttempt.json?.access_token),
      error: fallbackAttempt.json?.error || null,
      error_description_preview: nrpsPreviewSafeText(fallbackAttempt.json?.error_description || fallbackAttempt.text, 500)
    } : { tried: false };
    /* YANIV_NRPS_TOKEN_CLIENT_ID_DIAG_20260509_END */

    if (!tokenResponse.ok || !tokenJson.access_token) {
      return res.status(502).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "token",
        token_http_status: tokenResponse.status,
        token_error: tokenJson.error || "TOKEN_REQUEST_FAILED",
        token_variant_used: tokenVariantUsed,
        token_fallback_with_client_id: tokenFallbackSummary,
        token_error_description: nrpsPreviewSafeText(tokenJson.error_description || tokenText),
        token_diagnostics: {
          configured_token_url_host: configuredTokenUrl ? new URL(configuredTokenUrl).host : null,
          active_token_url_host: tokenUrl ? new URL(tokenUrl).host : null,
          active_token_url_path: tokenUrl ? new URL(tokenUrl).pathname : null,
          token_endpoint_source: tokenEndpointSource,
          discovery_url: discoveryUrl,
          discovery_http_status: discoveryHttpStatus,
          discovery_error_preview: discoveryErrorPreview || null,
          discovery_token_endpoint_host: discoveryTokenEndpoint ? new URL(discoveryTokenEndpoint).host : null,
          discovery_token_endpoint_path: discoveryTokenEndpoint ? new URL(discoveryTokenEndpoint).pathname : null,
          discovery_authorization_endpoint_host: discoveryAuthorizationEndpoint ? new URL(discoveryAuthorizationEndpoint).host : null,
          discovery_jwks_uri_host: discoveryJwksUri ? new URL(discoveryJwksUri).host : null,
          discovery_scopes_has_nrps: discoveryScopes.includes("https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"),
          client_id_body_variant_tested: true,
          deployment_id_claim_in_assertion: true
        },
        privacy: {
          no_secrets_returned: true,
          no_access_token_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    const memberResponse = await fetch(membershipUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + tokenJson.access_token,
        Accept: "application/vnd.ims.lti-nrps.v2.membershipcontainer+json"
      }
    });

    const memberText = await memberResponse.text();
    let membership = {};
    try { membership = JSON.parse(memberText); } catch {}

    if (!memberResponse.ok) {
      return res.status(502).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "membership",
        membership_http_status: memberResponse.status,
        membership_error_preview: nrpsPreviewSafeText(memberText),
        privacy: {
          no_secrets_returned: true,
          no_access_token_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    const members = Array.isArray(membership.members)
      ? membership.members
      : Array.isArray(membership)
        ? membership
        : [];

    const roleCounts = {};
    for (const member of members) {
      const roles = Array.isArray(member?.roles) ? member.roles : [];
      for (const role of roles) {
        const shortRole = String(role).split("#").pop() || String(role);
        roleCounts[shortRole] = (roleCounts[shortRole] || 0) + 1;
      }
    }

    return res.json({
      ok: true,
      mode: "lti13-nrps-preview-no-save",
      stage: "membership",
      token_http_status: tokenResponse.status,
      token_variant_used: tokenVariantUsed,
      membership_http_status: memberResponse.status,
      members_count: members.length,
      role_counts: roleCounts,
      member_field_presence: {
        has_name_count: members.filter(member => Boolean(member?.name)).length,
        has_given_name_count: members.filter(member => Boolean(member?.given_name)).length,
        has_family_name_count: members.filter(member => Boolean(member?.family_name)).length,
        has_email_count: members.filter(member => Boolean(member?.email)).length,
        has_user_id_count: members.filter(member => Boolean(member?.user_id || member?.userId || member?.sub)).length,
        has_lis_person_sourcedid_count: members.filter(member => Boolean(member?.lis_person_sourcedid || member?.lis_person_sourcedId)).length,
        has_lis_result_sourcedid_count: members.filter(member => Boolean(member?.lis_result_sourcedid || member?.lis_result_sourcedId)).length,
        member_keys_union: Array.from(new Set(members.flatMap(member => Object.keys(member || {})))).sort().slice(0, 80)
      },      sample_members_sanitized: members.slice(0, 8).map(nrpsPreviewSanitizeMember),
      source: {
        issuer: env("LTI13_ISSUER"),
        client_id: clientId,
        deployment_id: env("LTI13_DEPLOYMENT_ID"),
        membership_url_host: new URL(membershipUrl).host,
        token_endpoint_source: tokenEndpointSource,
        active_token_url_host: tokenUrl ? new URL(tokenUrl).host : null,
        active_token_url_path: tokenUrl ? new URL(tokenUrl).pathname : null,
        discovery_http_status: discoveryHttpStatus,
        discovery_scopes_has_nrps: discoveryScopes.includes("https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"),
        service_versions: statusJson?.service_claims?.nrps?.service_versions || []
      },
      privacy: {
        no_names_returned: true,
        no_emails_returned: true,
        no_access_token_returned: true,
        no_save_performed: true
      },
      next_required: [
        "If members_count is greater than 0, implement reviewed mapping into students.",
        "Do not save real students until mapping and privacy separation are verified."
      ],
      now: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mode: "lti13-nrps-preview-no-save",
      stage: "unexpected",
      error: "NRPS_PREVIEW_FAILED",
      detail: nrpsPreviewSafeText(error?.message || error),
      privacy: {
        no_secrets_returned: true,
        no_student_names_returned: true,
        no_save_performed: true
      }
    });
  }
});
/* YANIV_NRPS_PREVIEW_SAFE_20260509_END */

app.get("/api/lti13/status", (req, res) => {
  lti13NoStore(res);
  const envStatus = lti13EnvStatus();
  const base = publicBaseUrl(req);
  const jwks = lti13PublicJwks();
  res.json({
    ok: true,
    mode: "diagnostic-only",
    lti13DiagnosticVersion: LTI13_DIAGNOSTIC_VERSION,
    existingLti11EndpointKept: CANONICAL_LTI_ENDPOINT,
    configured: envStatus.configured,
    missing: envStatus.missing,
    present: envStatus.present,
    endpoints: {
      login_url: base + "/api/lti13/login",
      launch_url: base + "/api/lti13/launch",
      jwks_url: base + "/api/lti13/jwks",
      config_url: base + "/api/lti13/config"
    },
    capabilities: {
      oidc_login: false,
      jwt_launch_validation: false,
      nrps_roster_sync: false,
      ags_grade_sync: false,
      jwks_available: jwks.ok
    },
    safety: {
      do_not_replace_existing_lti11_tool_yet: true,
      create_separate_test_tool_first: true,
      no_moodle_settings_should_be_saved_until_lti13_status_is_configured: true
    },
    now: new Date().toISOString()
  });
});

app.get("/api/lti13/config", (req, res) => {
  lti13NoStore(res);
  const base = publicBaseUrl(req);
  res.json({
    ok: true,
    mode: "configuration-helper",
    lti13DiagnosticVersion: LTI13_DIAGNOSTIC_VERSION,
    warning: "Do not use this to replace the working LTI 1.0/1.1 Moodle Teacher Hub tool. Create a separate LTI 1.3 Test tool only after status is configured.",
    suggested_tool_name: "Moodle Teacher Hub — LTI 1.3 Test",
    tool_urls: {
      oidc_login_initiation_url: base + "/api/lti13/login",
      redirect_uri_or_launch_url: base + "/api/lti13/launch",
      public_keyset_jwks_url: base + "/api/lti13/jwks"
    },
    services_to_check_in_moodle: [
      "סינכרון וניהול משתמשים / Names and Roles / Membership service",
      "סינכרון תתי-מטלות וציונים / Assignment and Grade Services",
      "Deep Linking if needed"
    ],
    privacy_to_check_in_moodle: [
      "Share user name only if required",
      "Share user email only if required and approved",
      "Accept grades from tool only if AGS is intentionally enabled"
    ],
    current_limit: "This endpoint only helps configuration. Full LTI 1.3 launch validation and NRPS/AGS calls are not implemented yet."
  });
});

app.get("/api/lti13/jwks", (_req, res) => {
  lti13NoStore(res);
  const jwks = lti13PublicJwks();
  res.status(jwks.ok ? 200 : 503).json({ keys: jwks.keys, ok: jwks.ok, error: jwks.error || null, detail: jwks.detail || null });
});

app.all("/api/lti13/login", (req, res) => {
  lti13NoStore(res);

  const params = lti13ReadParams(req);
  const required = ["iss", "login_hint", "target_link_uri", "lti_message_hint", "client_id"];
  const missing = required.filter((key) => !params[key]);

  if (missing.length) {
    return res.status(400).json({
      ok: false,
      error: "LTI13_OIDC_LOGIN_PARAMS_MISSING",
      detail: "Moodle reached the LTI 1.3 login endpoint, but required OIDC login-initiation parameters were missing.",
      missing,
      query_keys_received: Object.keys(req.query || {}).sort(),
      body_keys_received: Object.keys(req.body || {}).sort(),
      safety: {
        existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
        no_fake_success: true
      },
      now: new Date().toISOString()
    });
  }

  const state = crypto.randomBytes(24).toString("hex");
  const nonce = crypto.randomBytes(24).toString("hex");
  const redirectUri = lti13PublicBase(req) + "/api/lti13/launch";
  const authUrl = lti13PlatformAuthUrl(params.iss);

  if (!authUrl) {
    return res.status(400).json({
      ok: false,
      error: "LTI13_PLATFORM_AUTH_URL_MISSING",
      detail: "Could not derive Moodle authorization URL. Set LTI13_PLATFORM_AUTH_URL if this Moodle platform uses a custom authorization endpoint.",
      iss: params.iss || null
    });
  }

  res.setHeader("Set-Cookie", [
    "lti13_state=" + encodeURIComponent(state) + "; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=600",
    "lti13_nonce=" + encodeURIComponent(nonce) + "; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=600"
  ]);

  const url = new URL(authUrl);
  url.searchParams.set("scope", "openid");
  url.searchParams.set("response_type", "id_token");
  url.searchParams.set("response_mode", "form_post");
  url.searchParams.set("prompt", "none");
  url.searchParams.set("client_id", String(params.client_id));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("login_hint", String(params.login_hint));
  url.searchParams.set("lti_message_hint", String(params.lti_message_hint));

  return res.redirect(303, url.toString());
});


function lti13Base64UrlBuffer(part) {
  const normalized = String(part || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return Buffer.from(padded, "base64");
}

function lti13ExpectedMoodleJwksUrl(iss) {
  if (process.env.LTI13_PLATFORM_JWKS_URL) return process.env.LTI13_PLATFORM_JWKS_URL;
  try {
    return new URL("/mod/lti/certs.php", String(iss)).toString();
  } catch {
    return "https://moodlemoe.lms.education.gov.il/mod/lti/certs.php";
  }
}

async function lti13VerifyJwtSignature(idToken, header, payload) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "LTI13_JWT_PARTS_INVALID", detail: "JWT must contain header, payload and signature." };
  }

  if (!header || header.alg !== "RS256") {
    return { ok: false, error: "LTI13_UNSUPPORTED_JWT_ALG", alg: header && header.alg ? header.alg : null };
  }

  if (!header.kid) {
    return { ok: false, error: "LTI13_JWT_KID_MISSING" };
  }

  const jwksUrl = lti13ExpectedMoodleJwksUrl(payload && payload.iss ? payload.iss : "");
  const response = await fetch(jwksUrl, { headers: { accept: "application/json" } });

  if (!response.ok) {
    return { ok: false, error: "LTI13_PLATFORM_JWKS_FETCH_FAILED", status: response.status, jwks_url: jwksUrl };
  }

  const jwks = await response.json();
  const keys = Array.isArray(jwks.keys) ? jwks.keys : [];
  const jwk = keys.find((key) => key && key.kid === header.kid);

  if (!jwk) {
    return {
      ok: false,
      error: "LTI13_JWT_KID_NOT_FOUND_IN_PLATFORM_JWKS",
      kid: header.kid,
      jwks_url: jwksUrl,
      available_kids: keys.map((key) => key && key.kid).filter(Boolean)
    };
  }

  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const signedData = Buffer.from(parts[0] + "." + parts[1]);
  const signature = lti13Base64UrlBuffer(parts[2]);
  const verified = crypto.verify("RSA-SHA256", signedData, publicKey, signature);

  return {
    ok: !!verified,
    error: verified ? null : "LTI13_JWT_SIGNATURE_INVALID",
    kid: header.kid,
    jwks_url: jwksUrl
  };
}


function lti13CookieValue(req, name) {
  const raw = String((req.headers && req.headers.cookie) || "");
  const parts = raw.split(";").map((part) => part.trim());
  const prefix = name + "=";
  const found = parts.find((part) => part.startsWith(prefix));
  if (!found) return "";
  try {
    return decodeURIComponent(found.slice(prefix.length));
  } catch {
    return found.slice(prefix.length);
  }
}

function lti13AudContains(aud, expected) {
  if (!expected) return false;
  if (Array.isArray(aud)) return aud.map(String).includes(String(expected));
  return String(aud || "") === String(expected);
}

function lti13Claim(payload, key) {
  return payload["https://purl.imsglobal.org/spec/lti/claim/" + key];
}

function lti13VerifyCoreClaims(req, payload) {
  const expectedIssuer = process.env.LTI13_PLATFORM_ISSUER || "https://moodlemoe.lms.education.gov.il";
  const expectedClientId = process.env.LTI13_CLIENT_ID || "WgIZjAqxrP2zFbz";
  const expectedDeploymentId = process.env.LTI13_DEPLOYMENT_ID || "3";
  const expectedNonce = lti13CookieValue(req, "lti13_nonce");

  const deploymentId = lti13Claim(payload, "deployment_id");
  const messageType = lti13Claim(payload, "message_type");
  const version = lti13Claim(payload, "version");

  const checks = {
    issuer: payload.iss === expectedIssuer,
    audience: lti13AudContains(payload.aud, expectedClientId),
    deployment_id: String(deploymentId || "") === String(expectedDeploymentId),
    message_type: messageType === "LtiResourceLinkRequest",
    version: version === "1.3.0",
    nonce_cookie_present: !!expectedNonce,
    nonce_matches: !!expectedNonce && payload.nonce === expectedNonce
  };

  const ok = Object.values(checks).every(Boolean);

  return {
    ok,
    checks,
    expected: {
      issuer: expectedIssuer,
      client_id: expectedClientId,
      deployment_id: expectedDeploymentId
    },
    actual: {
      issuer: payload.iss || null,
      audience: payload.aud || null,
      deployment_id: deploymentId || null,
      message_type: messageType || null,
      version: version || null,
      nonce_present: !!payload.nonce
    }
  };
}


function lti13ExtractServiceClaims(payload) {
  const nrps =
    payload?.["https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"] ||
    payload?.namesroleservice ||
    null;

  const ags =
    payload?.["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"] ||
    payload?.endpoint ||
    null;

  const contextMembershipsUrl =
    nrps?.context_memberships_url ||
    nrps?.context_membership_url ||
    nrps?.membership_url ||
    null;

  const lineitemsUrl =
    ags?.lineitems ||
    ags?.lineitems_url ||
    null;

  const lineitemUrl =
    ags?.lineitem ||
    ags?.lineitem_url ||
    null;

  const scopes = Array.isArray(ags?.scope)
    ? ags.scope
    : typeof ags?.scope === "string"
      ? [ags.scope]
      : [];

  return {
    has_nrps: !!contextMembershipsUrl,
    has_ags: !!(lineitemsUrl || lineitemUrl || scopes.length),
    nrps: {
      available: !!contextMembershipsUrl,
      context_memberships_url: contextMembershipsUrl,
      service_versions: Array.isArray(nrps?.service_versions) ? nrps.service_versions : []
    },
    ags: {
      available: !!(lineitemsUrl || lineitemUrl || scopes.length),
      lineitems_url: lineitemsUrl,
      lineitem_url: lineitemUrl,
      scopes
    },
    raw_claim_keys: Object.keys(payload || {}).filter(key =>
      key.includes("lti-nrps") ||
      key.includes("lti-ags") ||
      key.toLowerCase().includes("namesrole") ||
      key.toLowerCase().includes("membership") ||
      key.toLowerCase().includes("lineitem") ||
      key.toLowerCase().includes("endpoint")
    ).sort()
  };
}

function lti13BuildVerifiedSession(payload) {
  const context = lti13Claim(payload, "context") || {};
  const resourceLink = lti13Claim(payload, "resource_link") || {};
  const roles = lti13Claim(payload, "roles") || [];
  const deploymentId = lti13Claim(payload, "deployment_id") || "";

  const courseId = String(context.id || "");
  const courseTitle = String(context.title || context.label || "Moodle course");
  const teacherName =
    String(payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(" ") || payload.email || payload.sub || "Moodle teacher");

  const sessionToken = crypto.randomBytes(32).toString("hex");

  const session = {
    token: sessionToken,
    sessionToken,
    source: "lti13",
    automaticServices: lti13ExtractServiceClaims(payload),
    ltiVersion: "1.3",
    role: "teacher",
    roles,
    userId: String(payload.sub || ""),
    moodleUsername: teacherName,
    moodleUserName: teacherName,
    teacherName,
    email: String(payload.email || ""),
    courseId,
    course_id: courseId,
    contextId: courseId,
    context_id: courseId,
    courseTitle,
    course_title: courseTitle,
    contextTitle: courseTitle,
    context_title: courseTitle,
    resourceLinkId: String(resourceLink.id || ""),
    resourceLinkTitle: String(resourceLink.title || ""),
    deploymentId: String(deploymentId),
    deployment_id: String(deploymentId),
    issuer: String(payload.iss || ""),
    clientId: Array.isArray(payload.aud) ? String(payload.aud[0] || "") : String(payload.aud || ""),
    createdAt: new Date().toISOString()
  };

  return { sessionToken, session, courseTitle, courseId, teacherName };
}

app.all("/api/lti13/launch", async (req, res) => {
  lti13NoStore(res);

  const params = lti13ReadParams(req);
  const idToken = params.id_token;

  if (!idToken) {
    return res.status(400).json({
      ok: false,
      error: "LTI13_ID_TOKEN_MISSING",
      detail: "Moodle reached the LTI 1.3 launch endpoint, but no id_token was received.",
      method: req.method,
      query_keys_received: Object.keys(req.query || {}).sort(),
      body_keys_received: Object.keys(req.body || {}).sort(),
      safety: {
        existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
        no_fake_success: true
      },
      now: new Date().toISOString()
    });
  }

  let header = null;
  let payload = null;

  try {
    const parts = String(idToken).split(".");
    if (parts.length < 2) throw new Error("JWT must contain header and payload");
    header = lti13Base64UrlJson(parts[0]);
    payload = lti13Base64UrlJson(parts[1]);
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: "LTI13_ID_TOKEN_DECODE_FAILED",
      detail: String(error && error.message ? error.message : error),
      now: new Date().toISOString()
    });
  }

  const signature = await lti13VerifyJwtSignature(idToken, header, payload);

  if (!signature.ok) {
    return res.status(401).json({
      ok: false,
      mode: "phase3-signature-verification-failed",
      message: "LTI 1.3 id_token was received, but signature verification did not pass.",
      signature,
      header: {
        alg: header.alg || null,
        kid: header.kid || null,
        typ: header.typ || null
      },
      safety: {
        existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
        no_fake_success: true
      },
      now: new Date().toISOString()
    });
  }

  const claimVerification = lti13VerifyCoreClaims(req, payload);

  if (!claimVerification.ok) {
    return res.status(401).json({
      ok: false,
      mode: "phase3-core-claims-verification-failed",
      message: "LTI 1.3 signature is valid, but issuer/client/deployment/nonce checks are not complete.",
      signature,
      claim_verification: claimVerification,
      safety: {
        existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
        no_fake_success: true
      },
      now: new Date().toISOString()
    });
  }

  const built = lti13BuildVerifiedSession(payload);
  const { sessionToken, session, courseTitle, courseId, teacherName } = built;

  try {
    if (typeof recordSupabaseSession === "function") {
      await recordSupabaseSession({
        session_token: sessionToken,
        course_id: courseId,
        course_title: courseTitle,
        moodle_username: teacherName,
        role: "teacher",
        created_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn("LTI 1.3 Supabase session recording warning:", error);
  }

  setSession(res, session);

  const nextPath = "/import";
  const redirectUrl =
    publicBaseUrl(req) +
    "/lti?t=" +
    encodeURIComponent(sessionToken) +
    "&course=" +
    encodeURIComponent(courseTitle) +
    "&next=" +
    encodeURIComponent(nextPath);

  return res.redirect(303, redirectUrl);
});

// LTI 1.3 live service claims status must stay before the React SPA fallback.




app.get("/api/lti13/services-status", (req, res) => {
  const sessions = lti13DiagnosticSessionsSnapshot();
  const latest = sessions.length ? sessions[sessions.length - 1] : null;
  const services = latest?.automaticServices || {
    has_nrps: false,
    has_ags: false,
    nrps: { available: false },
    ags: { available: false },
    raw_claim_keys: []
  };

  res.json({
    ok: true,
    mode: "lti13-live-service-claims-status",
    explanation: "Open the Moodle LTI 1.3 tool first, then this endpoint shows whether the real launch payload contained NRPS/AGS service claims.",
    has_latest_lti13_session: !!latest,
    session_count: sessions.length,
    has_nrps: !!services.has_nrps,
    has_ags: !!services.has_ags,
    service_claims: services,
    latest_session_summary: latest ? {
      source: latest.source || null,
      verified: !!latest.verified,
      user: latest.user || null,
      space: latest.space || null,
      deployment_id: latest.deployment_id || null,
      issuer: latest.issuer || null,
      clientId: latest.clientId || null
    } : null,
    next_required: !latest
      ? ["Open Moodle Teacher Hub — LTI 1.3 Test from Moodle, then call this endpoint again."]
      : services.has_nrps
        ? ["Implement real NRPS membership fetch using Moodle service token."]
        : ["Enable Names and Roles / Membership service in Moodle tool settings, save, relaunch, and check again."],
    safety: {
      no_fake_success: true,
      existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT
    },
    now: new Date().toISOString()
  });
});

const distPath = path.join(ROOT, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) noStore(res);
    }
  }));
  app.get("*", (_req, res) => {
    noStore(res);
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("*", (_req, res) => res.status(404).send("Moodle Teacher Hub frontend build not found. Run npm run build."));
}



function lti13DiagnosticSessionsSnapshot() {
  const fromTokenSessions =
    typeof tokenSessions !== "undefined" && tokenSessions instanceof Map
      ? Array.from(tokenSessions.values())
      : [];

  const fromCookieSessions =
    typeof sessions !== "undefined" && sessions instanceof Map
      ? Array.from(sessions.values())
      : [];

  const combined = [...fromTokenSessions, ...fromCookieSessions]
    .filter(Boolean)
    .filter((session) => session.source === "lti13" || session.automaticServices);

  const seen = new Set();
  return combined
    .filter((session) => {
      const key = session.sessionToken || session.token || JSON.stringify(session);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(-10);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`moodle-teacher-hub running on port ${PORT}`);
  console.log(`canonical LTI endpoint: ${CANONICAL_LTI_ENDPOINT}`);
});
