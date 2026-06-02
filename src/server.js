import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { buildBatchProvenance } from "./provenance.js";
import { buildPracticeTimeGate, MIN_LOG_EVENTS_FOR_PRACTICE_TIME } from "./practiceTime.js";

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
      teacher_display_name: session.teacherName || null,
      moodle_username: session.moodleUsername || null,
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

function getSupabaseClient() {
  const url = env("VITE_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getSupabaseCounts() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const tableNames = [
    "students",
    "import_batches",
    "grade_items",
    "grade_results",
    "log_events",
    "teachers",
    "courses",
    "teacher_sessions",
    "lti_launches"
  ];

  try {
    const settled = await Promise.allSettled(
      tableNames.map(table => supabase.from(table).select("*", { count: "exact", head: true }))
    );

    const counts = {};
    for (let i = 0; i < tableNames.length; i += 1) {
      const result = settled[i];
      counts[tableNames[i]] =
        result.status === "fulfilled" && !result.value.error
          ? (result.value.count ?? 0)
          : null;
    }

    return counts;
  } catch {
    return null;
  }
}

function stableUuidFromText(value) {
  const h = crypto.createHash("sha256").update(String(value || "")).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${"89ab"[parseInt(h[16], 16) & 3]}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}


function compactRow(row) {
  return Object.fromEntries(Object.entries(row || {}).filter(([, value]) => value !== undefined));
}

function mapImportSourceKind(value) {
  const raw = String(value || "file").toLowerCase();
  if (raw === "paste") return "paste";
  if (raw === "upload") return "file";
  if (raw === "file") return "file";
  return "file";
}

function buildStudentSupabaseRow(student, batchId, session = null, variant = "full") {
  const baseId = stableUuidFromText(student.id);
  const base = {
    id: baseId,
    full_name: student.full_name,
    email: student.email || null,
    external_id: student.external_id || null,
    external_username: student.external_username || null,
    moodle_user_id: student.moodle_user_id || null,
    lis_person_sourcedid: student.lis_person_sourcedid || null,
    id_number: student.id_number || null,
    space_id: student.space_id || session?.spaceId || null,
    source: student.source || "moodle-participants-import",
    import_batch_id: batchId || null,
    created_at: student.updated_at || new Date().toISOString(),
    updated_at: student.updated_at || new Date().toISOString()
  };

  if (variant === "minimal") {
    return compactRow({
      id: base.id,
      full_name: base.full_name,
      email: base.email,
      external_id: base.external_id,
      external_username: base.external_username,
      import_batch_id: base.import_batch_id,
      created_at: base.created_at,
      updated_at: base.updated_at
    });
  }

  if (variant === "ultra_minimal") {
    return compactRow({
      id: base.id,
      full_name: base.full_name,
      email: base.email,
      created_at: base.created_at,
      updated_at: base.updated_at
    });
  }

  return compactRow(base);
}

function buildImportBatchSupabaseRow(batch, session, teacherResult = null, courseResult = null, variant = "full") {
  const now = batch.created_at || new Date().toISOString();
  const courseIdCandidate =
    courseResult?.course_id ||
    session?.courseId ||
    session?.course_id ||
    session?.contextId ||
    "0";

  const base = {
    id: batch.id,
    course_id: String(courseIdCandidate || "0"),
    teacher_id: teacherResult?.teacher_id || null,
    report_type: batch.report_type || "students",
    source_kind: mapImportSourceKind(batch.source_kind),
    status: batch.status || "completed",
    row_count: batch.row_count || 0,
    file_name: batch.file_name || null,
    detection_confidence: typeof batch.detection_confidence === "number" ? batch.detection_confidence : null,
    warnings: Array.isArray(batch.warnings) ? batch.warnings : [],
    imported_by_username: batch.imported_by_username || session?.moodleUsername || null,
    created_at: now
  };

  if (variant === "no_teacher") {
    const { teacher_id, ...rest } = base;
    return compactRow(rest);
  }

  if (variant === "minimal") {
    return compactRow({
      id: base.id,
      course_id: base.course_id,
      report_type: base.report_type,
      source_kind: base.source_kind,
      status: base.status,
      row_count: base.row_count,
      file_name: base.file_name,
      created_at: base.created_at
    });
  }

  if (variant === "ultra_minimal") {
    return compactRow({
      id: base.id,
      report_type: base.report_type,
      source_kind: base.source_kind,
      status: base.status,
      row_count: base.row_count,
      created_at: base.created_at
    });
  }

  return compactRow(base);
}

async function ensureTeacher(supabase, session) {
  const moodleUserId = String(session?.moodleUserId || session?.moodle_user_id || "");
  const username = String(session?.moodleUsername || session?.teacherName || "");
  if (!moodleUserId && !username) return { ok: true, skipped: true };

  const teacherId = stableUuidFromText("teacher|" + (moodleUserId || username));
  const now = new Date().toISOString();

  const variants = [
    { id: teacherId, moodle_user_id: moodleUserId || null, username: username || null, created_at: now, updated_at: now },
    { id: teacherId, username: username || null, created_at: now, updated_at: now },
    { id: teacherId, created_at: now, updated_at: now }
  ];

  let lastError = null;
  for (const row of variants) {
    const { error } = await supabase.from("teachers").upsert(compactRow(row), { onConflict: "id" });
    if (!error) return { ok: true, teacher_id: teacherId };
    lastError = error;
  }

  return {
    ok: false,
    reason: "TEACHER_UPSERT_FAILED",
    detail: String(lastError?.message || "").slice(0, 300),
    code: lastError?.code || null
  };
}

async function ensureCourse(supabase, session) {
  const moodleCourseId = String(session?.courseId || session?.course_id || session?.contextId || "");
  if (!moodleCourseId) return { ok: true, skipped: true };

  const courseId = stableUuidFromText("course|" + moodleCourseId);
  const now = new Date().toISOString();
  const title = session?.courseTitle || session?.spaceTitle || null;

  const variants = [
    { id: courseId, moodle_course_id: moodleCourseId, title, created_at: now, updated_at: now },
    { id: courseId, title, created_at: now, updated_at: now },
    { id: courseId, created_at: now, updated_at: now }
  ];

  let lastError = null;
  for (const row of variants) {
    const { error } = await supabase.from("courses").upsert(compactRow(row), { onConflict: "id" });
    if (!error) return { ok: true, course_id: courseId };
    lastError = error;
  }

  return {
    ok: false,
    reason: "COURSE_UPSERT_FAILED",
    detail: String(lastError?.message || "").slice(0, 300),
    code: lastError?.code || null
  };
}

async function tryInsertImportBatch(supabase, batch, session, teacherResult, courseResult) {
  const variants = ["full", "no_teacher", "minimal", "ultra_minimal"];
  let lastError = null;
  let lastVariant = null;

  for (const variant of variants) {
    const row = buildImportBatchSupabaseRow(batch, session, teacherResult, courseResult, variant);
    const { error } = await supabase.from("import_batches").upsert(row, { onConflict: "id" });
    if (!error) return { ok: true, variant };
    lastError = error;
    lastVariant = variant;
  }

  return {
    ok: false,
    reason: "IMPORT_BATCH_INSERT_FAILED",
    detail: String(lastError?.message || "").slice(0, 700),
    code: lastError?.code || null,
    variant: lastVariant
  };
}

async function tryUpsertStudents(supabase, students, batchId, session) {
  if (!students.length) return { ok: true, students_written: 0, variant: "none" };

  const variants = ["full", "minimal", "ultra_minimal"];
  let lastError = null;
  let lastVariant = null;

  for (const variant of variants) {
    const rows = students.map(s => buildStudentSupabaseRow(s, batchId, session, variant));
    const { error } = await supabase.from("students").upsert(rows, { onConflict: "id" });
    if (!error) return { ok: true, students_written: rows.length, variant };
    lastError = error;
    lastVariant = variant;
  }

  return {
    ok: false,
    reason: "STUDENTS_UPSERT_FAILED",
    detail: String(lastError?.message || "").slice(0, 700),
    code: lastError?.code || null,
    variant: lastVariant
  };
}

async function writeImportToSupabase(batch, students, session) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, skipped: true, reason: "SUPABASE_NOT_CONFIGURED" };

  const [teacherResult, courseResult] = await Promise.all([
    ensureTeacher(supabase, session),
    ensureCourse(supabase, session)
  ]);

  const batchWrite = await tryInsertImportBatch(supabase, batch, session, teacherResult, courseResult);
  if (!batchWrite.ok) return { ok: false, skipped: false, ...batchWrite };

  const studentsWrite = await tryUpsertStudents(supabase, students, batch.id, session);
  if (!studentsWrite.ok) return { ok: false, skipped: false, ...studentsWrite };

  return {
    ok: true,
    skipped: false,
    students_written: studentsWrite.students_written,
    import_batch_variant: batchWrite.variant,
    students_variant: studentsWrite.variant,
    teacher_result: teacherResult.ok ? "ok" : teacherResult.reason,
    course_result: courseResult.ok ? "ok" : courseResult.reason
  };
}


// >>> MTH_WIDE_GRADEBOOK_IMPORT_V1 >>>
function isWideGradebookStudentHeader(header) {
  const h = String(header || "").trim();
  return [
    "שם פרטי",
    "שם משפחה",
    "שם מלא",
    "מספר זיהוי",
    "מספר זהות",
    "מספר מזהה",
    "מוסד",
    "מחלקה",
    "דוא\"ל",
    "דוא״ל",
    "Email",
    "Email address"
  ].some(name => normalizeImportKey(name) === normalizeImportKey(h));
}

function isWideGradebookIgnoredHeader(header) {
  const h = String(header || "");
  return isWideGradebookStudentHeader(h)
    || /תאריך הפקת הדוח/i.test(h)
    || /report generated/i.test(h)
    || !h.trim();
}

function isWideGradebookGradeHeader(header) {
  const h = String(header || "").trim();
  if (isWideGradebookIgnoredHeader(h)) return false;
  return /^(בוחן|תוכן אינטראקטיבי H5P|דפי עבודה):/.test(h)
    || /^Quiz:/i.test(h)
    || /^Assignment:/i.test(h)
    || /^H5P:/i.test(h)
    || /סך הכל של מרחב/.test(h);
}

function gradebookItemTypeFromHeader(header) {
  const h = String(header || "");
  if (/^בוחן:/.test(h) || /^Quiz:/i.test(h)) return "quiz";
  if (/^תוכן אינטראקטיבי H5P:/.test(h) || /^H5P:/i.test(h)) return "h5p";
  if (/^דפי עבודה:/.test(h) || /^Assignment:/i.test(h)) return "worksheet";
  if (/סך הכל של מרחב/.test(h)) return "course_total";
  return "grade_item";
}

function cleanGradebookItemName(header) {
  return String(header || "")
    .replace(/^בוחן:/, "")
    .replace(/^תוכן אינטראקטיבי H5P:/, "")
    .replace(/^דפי עבודה:/, "")
    .replace(/\(מספרי\)/g, "")
    .trim();
}

function parseWideGradeValue(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^[-–—]+$/.test(raw)) return null;
  if (/לא\s*זמין|לא\s*הוגש|חסר|missing|n\/a/i.test(raw)) return null;

  const normalized = raw
    .replace(/[,%]/g, match => match === "," ? "." : "")
    .replace(/[^\d.\-]/g, "");

  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") return null;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function gradebookCourseId(session) {
  return String(session?.courseId || session?.course_id || session?.contextId || "0");
}

function gradebookStudentFromRow(row, session) {
  const firstName = pickImportValue(row, ["שם פרטי", "First name", "Firstname", "first_name"]);
  const lastName = pickImportValue(row, ["שם משפחה", "Surname", "Last name", "lastname", "last_name"]);
  const fullName = pickImportValue(row, ["שם מלא", "Full name", "Name", "שם"]) || [firstName, lastName].filter(Boolean).join(" ").trim();
  const email = pickImportValue(row, ["דוא\"ל", "דוא״ל", "דואל", "כתובת דואל", "כתובת דוא״ל", "Email address", "Email"]);
  const idNumber = pickImportValue(row, ["מספר זיהוי", "מספר זהות", "מספר מזהה", "ID number", "idnumber"]);
  const username = pickImportValue(row, ["שם משתמש", "Username", "User name"]);
  const identity = idNumber || email || username || fullName;
  const spaceId = session?.spaceId || "unknown-space";

  if (!fullName || !identity) return null;

  const importedStudentId = stableId("student", spaceId + "|" + identity);
  return {
    full_name: fullName,
    email: email || null,
    id_number: idNumber || null,
    username: username || null,
    identifier: identity,
    student_id: stableUuidFromText(importedStudentId)
  };
}

function buildWideGradebookImport(rows, session, meta = {}) {
  const input = Array.isArray(rows) ? rows : [];
  const headers = Array.from(new Set(input.flatMap(row => Object.keys(row || {}))));
  const gradeHeaders = headers.filter(isWideGradebookGradeHeader);
  const now = new Date().toISOString();
  const courseId = gradebookCourseId(session);
  const batchId = crypto.randomUUID();

  const warnings = [];
  if (!input.length) warnings.push("Gradebook payload is empty.");
  if (!gradeHeaders.length) warnings.push("No wide grade columns were detected.");

  const gradeItems = gradeHeaders.map((header, index) => ({
    id: stableUuidFromText("grade_item|" + courseId + "|" + header),
    course_id: courseId,
    import_batch_id: batchId,
    name: cleanGradebookItemName(header),
    raw_header: header,
    item_type: gradebookItemTypeFromHeader(header),
    position: index + 1,
    max_grade: null,
    created_at: now
  }));

  const gradeResults = [];
  let skipped_students = 0;
  let skipped_empty_grades = 0;

  for (const row of input) {
    const student = gradebookStudentFromRow(row, session);
    if (!student) {
      skipped_students += 1;
      continue;
    }

    for (const item of gradeItems) {
      const rawValue = row[item.raw_header];
      const numeric = parseWideGradeValue(rawValue);
      if (numeric === null) {
        skipped_empty_grades += 1;
        continue;
      }

      gradeResults.push({
        id: stableUuidFromText("grade_result|" + courseId + "|" + student.identifier + "|" + item.raw_header + "|" + batchId),
        grade_item_id: item.id,
        import_batch_id: batchId,
        course_id: courseId,
        student_id: student.student_id,
        student_full_name: student.full_name,
        student_email: student.email,
        student_identifier: student.identifier,
        grade: numeric,
        raw_value: String(rawValue ?? ""),
        source: "moodle-wide-gradebook-import",
        created_at: now
      });
    }
  }

  if (!gradeResults.length) warnings.push("No numeric grade cells were found. Empty/missing cells were not converted to 0.");

  return {
    ok: input.length > 0 && gradeHeaders.length > 0,
    batch: {
      id: batchId,
      report_type: "grades",
      file_name: meta.file_name || null,
      row_count: gradeResults.length,
      status: gradeResults.length ? "completed" : "partial",
      imported_by_username: session?.moodleUsername || session?.teacherName || null,
      detection_confidence: typeof meta.detection_confidence === "number" ? meta.detection_confidence : null,
      source_kind: meta.source_kind || "file",
      warnings,
      created_at: now,
      ...buildBatchProvenance({
        import_batch_id: batchId,
        source_kind: meta.source_kind || "file",
        source_name: meta.file_name || null,
        status: gradeResults.length ? "completed" : "partial",
        row_count: gradeResults.length
      }, session)
    },
    headers,
    grade_headers: gradeHeaders,
    grade_items: gradeItems,
    grade_results: gradeResults,
    warnings,
    skipped_students,
    skipped_empty_grades
  };
}

async function upsertChunked(supabase, table, rows, options = {}) {
  if (!rows.length) return { ok: true, written: 0 };
  let written = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase.from(table).upsert(chunk, options);
    if (error) {
      return {
        ok: false,
        reason: table.toUpperCase() + "_UPSERT_FAILED",
        detail: String(error.message || "").slice(0, 700),
        code: error.code || null,
        written
      };
    }
    written += chunk.length;
  }
  return { ok: true, written };
}

async function writeWideGradebookToSupabase(gradebook, session) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, skipped: true, reason: "SUPABASE_NOT_CONFIGURED" };

  const [teacherResult, courseResult] = await Promise.all([
    ensureTeacher(supabase, session),
    ensureCourse(supabase, session)
  ]);

  const batchWrite = await tryInsertImportBatch(supabase, gradebook.batch, session, teacherResult, courseResult);
  if (!batchWrite.ok) return { ok: false, skipped: false, ...batchWrite };

  const itemsWrite = await upsertChunked(supabase, "grade_items", gradebook.grade_items, { onConflict: "id" });
  if (!itemsWrite.ok) return { ok: false, skipped: false, ...itemsWrite };

  const resultsWrite = await upsertChunked(supabase, "grade_results", gradebook.grade_results, { onConflict: "id" });
  if (!resultsWrite.ok) return { ok: false, skipped: false, ...resultsWrite };

  return {
    ok: true,
    skipped: false,
    import_batch_variant: batchWrite.variant,
    grade_items_written: itemsWrite.written,
    grade_results_written: resultsWrite.written,
    teacher_result: teacherResult.ok ? "ok" : teacherResult.reason,
    course_result: courseResult.ok ? "ok" : courseResult.reason
  };
}
// <<< MTH_WIDE_GRADEBOOK_IMPORT_V1 <<<


// >>> MTH_MOODLE_LOGS_IMPORT_V1 >>>
function parseMoodleLogTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, dd, mm, yyyy, hh, min, ss] = match;
    const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss)));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
}

function extractMoodleUserIdFromDescription(value) {
  const text = String(value || "");
  const match = text.match(/user with id '([^']+)'/i) || text.match(/userid[=:]\s*([0-9]+)/i);
  return match ? String(match[1]) : null;
}

function buildMoodleLogEvent(row, session, batchId, index) {
  const rawTime = pickImportValue(row, ["זמן", "Time", "Date", "תאריך", "תאריך ושעה"]);
  const eventTime = parseMoodleLogTime(rawTime);
  if (!eventTime) return null;

  const actor = pickImportValue(row, ["שם מלא", "Full name", "User full name", "שם המשתמש"]);
  const affectedUser = pickImportValue(row, ["משתמש מושפע", "Affected user"]);
  const context = pickImportValue(row, ["הארוע מתייחס ל:", "האירוע מתייחס ל:", "Event context", "Context"]);
  const component = pickImportValue(row, ["רכיב", "Component"]);
  const eventName = pickImportValue(row, ["שם האירוע", "Event name"]);
  const description = pickImportValue(row, ["תיאור", "Description"]);
  const origin = pickImportValue(row, ["מקור", "Origin", "Source"]);
  const ipAddress = pickImportValue(row, ["כתובת IP", "IP address", "IP"]);

  if (!actor && !eventName && !description) return null;

  const courseId = String(session?.courseId || session?.course_id || session?.contextId || "0");
  const moodleUserId = extractMoodleUserIdFromDescription(description);
  const identity = actor || affectedUser || moodleUserId || "unknown-user";
  const uniqueText = [
    courseId,
    rawTime,
    identity,
    affectedUser,
    context,
    component,
    eventName,
    description,
    origin,
    ipAddress,
    index
  ].join("|");

  return compactRow({
    id: stableUuidFromText("log_event|" + uniqueText),
    course_id: courseId,
    import_batch_id: batchId,
    event_time: eventTime,
    raw_time: rawTime,
    actor_full_name: actor || null,
    affected_user: affectedUser && affectedUser !== "-" ? affectedUser : null,
    context: context || null,
    component: component || null,
    event_name: eventName || null,
    description: description || null,
    origin: origin || null,
    ip_address: ipAddress || null,
    moodle_user_id: moodleUserId,
    source: "moodle-logs-import",
    created_at: new Date().toISOString()
  });
}

function buildMoodleLogsImport(rows, session, meta = {}) {
  const input = Array.isArray(rows) ? rows : [];
  const batchId = crypto.randomUUID();
  const now = new Date().toISOString();
  const warnings = [];

  const events = [];
  let skipped = 0;

  input.forEach((row, index) => {
    const ev = buildMoodleLogEvent(row, session, batchId, index);
    if (ev) events.push(ev);
    else skipped += 1;
  });

  if (!input.length) warnings.push("Logs payload is empty.");
  if (!events.length) warnings.push("No valid Moodle log events were detected.");

  const batch = {
    id: batchId,
    report_type: "logs",
    file_name: meta.file_name || null,
    row_count: events.length,
    status: events.length ? "completed" : "partial",
    imported_by_username: session?.moodleUsername || session?.teacherName || null,
    detection_confidence: typeof meta.detection_confidence === "number" ? meta.detection_confidence : null,
    source_kind: meta.source_kind || "file",
    warnings,
    created_at: now,
    ...buildBatchProvenance({
      import_batch_id: batchId,
      source_kind: meta.source_kind || "file",
      source_name: meta.file_name || null,
      status: events.length ? "completed" : "partial",
      row_count: events.length
    }, session)
  };

  return {
    ok: events.length > 0,
    batch,
    log_events: events,
    skipped_rows: skipped,
    warnings
  };
}

async function writeMoodleLogsToSupabase(logsImport, session) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, skipped: true, reason: "SUPABASE_NOT_CONFIGURED" };

  const [teacherResult, courseResult] = await Promise.all([
    ensureTeacher(supabase, session),
    ensureCourse(supabase, session)
  ]);

  const batchWrite = await tryInsertImportBatch(supabase, logsImport.batch, session, teacherResult, courseResult);
  if (!batchWrite.ok) return { ok: false, skipped: false, ...batchWrite };

  const fullRows = logsImport.log_events;
  const minimalRows = fullRows.map(row => compactRow({
    id: row.id,
    course_id: row.course_id,
    import_batch_id: row.import_batch_id,
    event_time: row.event_time,
    actor_full_name: row.actor_full_name,
    context: row.context,
    component: row.component,
    event_name: row.event_name,
    description: row.description,
    origin: row.origin,
    created_at: row.created_at
  }));

  const variants = [
    { name: "full", rows: fullRows },
    { name: "minimal", rows: minimalRows }
  ];

  let lastError = null;
  let lastVariant = null;

  for (const variant of variants) {
    let written = 0;
    let failed = false;

    for (let i = 0; i < variant.rows.length; i += 1000) {
      const chunk = variant.rows.slice(i, i + 1000);
      const { error } = await supabase.from("log_events").upsert(chunk, { onConflict: "id" });
      if (error) {
        lastError = error;
        lastVariant = variant.name;
        failed = true;
        break;
      }
      written += chunk.length;
    }

    if (!failed) {
      return {
        ok: true,
        skipped: false,
        log_events_written: written,
        log_events_variant: variant.name,
        import_batch_variant: batchWrite.variant,
        teacher_result: teacherResult.ok ? "ok" : teacherResult.reason,
        course_result: courseResult.ok ? "ok" : courseResult.reason
      };
    }
  }

  return {
    ok: false,
    skipped: false,
    reason: "LOG_EVENTS_UPSERT_FAILED",
    detail: String(lastError?.message || "").slice(0, 900),
    code: lastError?.code || null,
    variant: lastVariant
  };
}
// <<< MTH_MOODLE_LOGS_IMPORT_V1 <<<


// >>> MTH_COURSE_STRUCTURE_IMPORT_V1 >>>
const COURSE_STRUCTURE_IDENTITY_NORMALIZED = [
  "שםפרטי", "firstname", "first_name",
  "שםמשפחה", "surname", "lastname", "last_name",
  "שםמלא", "fullname", "name", "שם",
  "מספרזיהוי", "מספרזהות", "מספרמזהה", "idnumber",
  "כתובתדואל", "כתובתדוא״ל", "דואל", "דוא״ל", "דואראלקטרוני",
  "emailaddress", "email",
  "שםמשתמש", "username", "login",
  "מוסד", "institution",
  "מחלקה", "department",
  "תאריךהפקתהדוח", "dateofreport"
];

// Column headers that signal a dedicated section/chapter name column.
const COURSE_SECTION_COLUMN_NORMALIZED = ["פרק", "section", "sections", "sectionname", "chapter", "chaptername", "סעיף", "קטע", "יחידה"];

function isCourseStructureIdentityHeader(header) {
  const n = normalizeImportKey(header);
  return COURSE_STRUCTURE_IDENTITY_NORMALIZED.includes(n);
}

function isSectionColumnHeader(header) {
  return COURSE_SECTION_COLUMN_NORMALIZED.includes(normalizeImportKey(header));
}

function parseCourseCompletionStatus(rawValue) {
  const raw = String(rawValue ?? "").trim().toLowerCase();
  if (!raw || raw === "-") return "unknown";
  if (raw === "הושלם" || raw === "completed" || raw === "✓" || raw === "true" || raw === "1") return "complete";
  if (raw.startsWith("הושלם") || raw.startsWith("completed")) return "complete";
  if (raw === "לא הושלם" || raw === "not completed" || raw === "✗" || raw === "false" || raw === "0") return "incomplete";
  return "incomplete";
}

// Parse optional "SectionName: TaskName" or "SectionName — TaskName" prefix from an activity column header.
// Returns { sectionName, taskName } — sectionName is null when no prefix pattern is found.
function parseSectionPrefix(header) {
  const separators = [/^(.+?):\s+(.+)$/, /^(.+?)\s+[—–-]{1,2}\s+(.+)$/];
  for (const re of separators) {
    const m = header.match(re);
    if (m && m[1].length > 1 && m[2].length > 1) {
      return { sectionName: m[1].trim(), taskName: m[2].trim() };
    }
  }
  return { sectionName: null, taskName: header.trim() };
}

function buildCourseStructureImport(rows, session, meta = {}) {
  const input = Array.isArray(rows) ? rows : [];
  const headers = Array.from(new Set(input.flatMap(row => Object.keys(row || {}))));
  const courseId = gradebookCourseId(session);
  const batchId = crypto.randomUUID();
  const now = new Date().toISOString();
  const warnings = [];

  if (!input.length) warnings.push("Course structure payload is empty.");

  // Detect a dedicated section column if one is present.
  const sectionColumnHeader = headers.find(isSectionColumnHeader) ?? null;

  // Activity columns = all headers that are neither identity nor dedicated section column.
  const activityHeaders = headers.filter(h => !isCourseStructureIdentityHeader(h) && !isSectionColumnHeader(h));

  if (!activityHeaders.length) warnings.push("No activity columns detected. Expected non-identity columns after student name/ID columns.");

  // Build sections map: sectionName → course_section row.
  // Strategy priority:
  //  1. Dedicated section column: use distinct values from the rows.
  //  2. Prefix pattern in activity header: e.g. "Week 1: Quiz".
  //  3. No section info → sections = empty, all tasks uncategorized.
  const sectionMap = new Map(); // sectionName → { id, chapter_name, position }

  function getOrCreateSection(sectionName) {
    if (!sectionName) return null;
    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, {
        id: stableUuidFromText("course_section|" + courseId + "|" + sectionName),
        course_id: courseId,
        import_batch_id: batchId,
        chapter_name: sectionName,
        position: sectionMap.size + 1,
        created_at: now
      });
    }
    return sectionMap.get(sectionName);
  }

  // If no dedicated section column, try to parse section prefix from activity headers.
  // This is done once at import time (column-level), not per-student-row.
  const activityMeta = activityHeaders.map(header => {
    const { sectionName, taskName } = parseSectionPrefix(header);
    return { header, sectionName, taskName };
  });

  // Populate sections from activity header prefixes when no dedicated section column exists.
  if (!sectionColumnHeader) {
    for (const am of activityMeta) {
      if (am.sectionName) getOrCreateSection(am.sectionName);
    }
  }

  // Build tasks. chapter_id resolves after sections are known.
  const tasks = activityMeta.map((am, index) => {
    const section = sectionColumnHeader ? null : (am.sectionName ? sectionMap.get(am.sectionName) : null);
    return {
      id: stableUuidFromText("course_task|" + courseId + "|" + am.header),
      course_id: courseId,
      import_batch_id: batchId,
      chapter_id: section?.id ?? null,
      task_name: am.taskName,
      task_type: null,
      position: index + 1,
      due_date: null,
      created_at: now
    };
  });

  // Build completions per student.
  const completions = [];
  let skippedStudents = 0;

  for (const row of input) {
    const student = gradebookStudentFromRow(row, session);
    if (!student) { skippedStudents++; continue; }

    // If there is a dedicated section column, resolve section from the row value.
    // (Per-row section column is unusual but supported — it overrides the task's chapter_id.)
    const rowSectionName = sectionColumnHeader ? pickImportValue(row, [sectionColumnHeader]) || null : null;
    if (rowSectionName) getOrCreateSection(rowSectionName);

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const rawValue = row[activityHeaders[i]];
      const status = parseCourseCompletionStatus(rawValue);

      completions.push({
        id: stableUuidFromText("task_completion|" + courseId + "|" + student.identifier + "|" + task.id),
        course_id: courseId,
        import_batch_id: batchId,
        task_id: task.id,
        chapter_id: task.chapter_id,
        student_id: student.student_id,
        student_full_name: student.full_name,
        student_identifier: student.identifier,
        is_complete: status === "complete",
        status,
        completed_at: status === "complete" ? now : null,
        created_at: now
      });
    }
  }

  // When a section column exists but is row-level, activity columns cannot be safely mapped
  // to a section (each row may have a different section value). Tasks stay uncategorized.
  if (sectionColumnHeader) {
    warnings.push("Section column found, but it is row-level and cannot safely map activity columns to sections. Tasks saved uncategorized.");
  }

  const sections = [...sectionMap.values()];

  if (tasks.length === 0) warnings.push("No tasks were created. Verify the file contains activity columns.");
  if (completions.length === 0 && input.length > 0) warnings.push("No completion rows created. Verify rows contain student identity fields.");
  if (sections.length === 0 && tasks.length > 0) warnings.push("No section/chapter data found. Tasks saved as uncategorized.");

  const batch = {
    id: batchId,
    report_type: "completion",
    file_name: meta.file_name || null,
    row_count: tasks.length,
    status: tasks.length > 0 ? "completed" : "partial",
    imported_by_username: session?.moodleUsername || session?.teacherName || null,
    detection_confidence: typeof meta.detection_confidence === "number" ? meta.detection_confidence : null,
    source_kind: meta.source_kind || "file",
    warnings,
    created_at: now,
    ...buildBatchProvenance({
      import_batch_id: batchId,
      source_kind: meta.source_kind || "file",
      source_name: meta.file_name || null,
      status: tasks.length > 0 ? "completed" : "partial",
      row_count: tasks.length
    }, session)
  };

  return {
    ok: tasks.length > 0,
    batch,
    sections,
    tasks,
    completions,
    activity_headers: activityHeaders,
    section_column_used: sectionColumnHeader,
    warnings,
    skipped_students: skippedStudents
  };
}

async function writeCourseStructureToSupabase(courseImport, session) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, skipped: true, reason: "SUPABASE_NOT_CONFIGURED" };

  const [teacherResult, courseResult] = await Promise.all([
    ensureTeacher(supabase, session),
    ensureCourse(supabase, session)
  ]);

  const batchWrite = await tryInsertImportBatch(supabase, courseImport.batch, session, teacherResult, courseResult);
  if (!batchWrite.ok) return { ok: false, skipped: false, ...batchWrite };

  // Write sections first (tasks reference them by chapter_id).
  let sectionsWritten = 0;
  if (courseImport.sections.length > 0) {
    const sectionsWrite = await upsertChunked(supabase, "course_sections", courseImport.sections, { onConflict: "id" });
    if (!sectionsWrite.ok) return { ok: false, skipped: false, ...sectionsWrite };
    sectionsWritten = sectionsWrite.written;
  }

  const tasksWrite = await upsertChunked(supabase, "course_tasks", courseImport.tasks, { onConflict: "id" });
  if (!tasksWrite.ok) return { ok: false, skipped: false, ...tasksWrite };

  // task_completions: gracefully skip if the table doesn't exist yet.
  let completionsWritten = 0;
  let completionsSkipped = false;
  if (courseImport.completions.length > 0) {
    const result = await upsertChunked(supabase, "task_completions", courseImport.completions, { onConflict: "id" });
    if (result.ok) {
      completionsWritten = result.written;
    } else {
      completionsSkipped = true;
    }
  }

  return {
    ok: true,
    skipped: false,
    import_batch_variant: batchWrite.variant,
    sections_written: sectionsWritten,
    tasks_written: tasksWrite.written,
    completions_written: completionsWritten,
    completions_skipped: completionsSkipped,
    teacher_result: teacherResult.ok ? "ok" : teacherResult.reason,
    course_result: courseResult.ok ? "ok" : courseResult.reason
  };
}
// <<< MTH_COURSE_STRUCTURE_IMPORT_V1 <<<

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
  const normalizedStudents = [];
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
    normalizedStudents.push(student);
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
  return { row_count: inserted + updated, inserted, updated, skipped, warnings, students: normalizedStudents };
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
app.use(express.urlencoded({ extended: true, limit: "80mb" }));
app.use(express.json({ limit: "80mb" }));
app.use(cookieParser());
app.use("/public", express.static(path.join(ROOT, "public")));


// >>> MTH_SYNC_STATUS_API_V1 >>>
function buildSyncStatus(req, sbCounts) {
  const session = importSessionFromRequest(req) || sessionFromRequest(req);
  const hasSession = Boolean(session);
  const studentCount = sbCounts?.students != null ? sbCounts.students : (Array.isArray(store.students) ? store.students.length : 0);
  const batchCount = sbCounts?.import_batches != null ? sbCounts.import_batches : (Array.isArray(store.importBatches) ? store.importBatches.length : 0);
  const gradeItemsCount = sbCounts?.grade_items != null ? sbCounts.grade_items : (Array.isArray(store.gradeItems) ? store.gradeItems.length : 0);
  const gradeResultsCount = sbCounts?.grade_results != null ? sbCounts.grade_results : (Array.isArray(store.grades) ? store.grades.length : 0);
  const logEventsCount = sbCounts?.log_events != null ? sbCounts.log_events : (Array.isArray(store.logEvents) ? store.logEvents.length : 0);
  const hasStudents = studentCount > 0;
  const hasTasks = (Array.isArray(store.tasks) && store.tasks.length > 0) || (Array.isArray(store.chapters) && store.chapters.length > 0);
  const hasGrades = gradeItemsCount > 0 || gradeResultsCount > 0;
  const hasLogs = logEventsCount > 0;
  const missingActions = [
    !hasStudents ? "ייבא דוח Participants ממודל כדי להציג רשימת תלמידים אמיתית." : null,
    !hasTasks ? "ייבא דוח Activity Completion או מבנה קורס כדי להציג פרקים ומשימות אמיתיים." : null,
    !hasGrades ? "ייבא Gradebook ממודל כדי להציג ציונים ודוחות ציונים אמיתיים." : null,
    !hasLogs ? "ייבא דוח Logs ממודל כדי לחשב זמני תרגול אמיתיים." : null
  ].filter(Boolean);

  return {
    ok: true,
    version: "MTH_SYNC_STATUS_API_V1",
    teacher_release_ready: false,
    persistence: buildPersistenceStatus(),
    no_fake_data: true,
    no_private_rows_returned: true,
    session_exists: hasSession,
    counts: {
      students: studentCount,
      chapters: Array.isArray(store.chapters) ? store.chapters.length : 0,
      tasks: Array.isArray(store.tasks) ? store.tasks.length : 0,
      grade_items: gradeItemsCount,
      grades: gradeResultsCount,
      log_events: logEventsCount,
      import_batches: batchCount
    },
    next_actions_he: hasSession
      ? (missingActions.length ? missingActions : ["כל מקורות הנתונים הבסיסיים זמינים. אפשר להמשיך לעבודה ודוחות, ועדיין נדרשת בדיקת מורה אמיתית לפני הפצה רחבה."])
      : ["פתח את הכלי מתוך Moodle כדי להתחיל סנכרון אמת."],
    capability_details: [
      {
        key: "participants",
        label_he: "משתתפים",
        status: hasStudents ? "available" : "missing_required_report",
        priority: 1,
        required_report_he: hasStudents ? null : "Participants / משתתפים",
        target_href: hasStudents ? "/students" : "/missing-data",
        teacher_message_he: hasStudents ? "רשימת תלמידים אמיתית קיימת." : "חסרה רשימת תלמידים אמיתית."
      },
      {
        key: "tasks",
        label_he: "פרקים ומשימות",
        status: hasTasks ? "available" : "missing_required_report",
        priority: 2,
        required_report_he: hasTasks ? null : "Activity Completion או מבנה קורס",
        target_href: hasTasks ? "/tasks" : "/missing-data",
        teacher_message_he: hasTasks ? "קיימים פרקים או משימות מנתוני אמת." : "חסר מקור נתונים אמיתי לפרקים ומשימות."
      },
      {
        key: "grades",
        label_he: "ציונים",
        status: hasGrades ? "available" : "missing_required_report",
        priority: 3,
        required_report_he: hasGrades ? null : "Gradebook / גיליון ציונים",
        target_href: hasGrades ? "/grades" : "/missing-data",
        teacher_message_he: hasGrades ? "ציונים אמיתיים קיימים במערכת." : "חסר Gradebook אמיתי."
      },
      {
        key: "logs",
        label_he: "זמנים ולוגים",
        status: hasLogs ? "available" : "missing_required_report",
        priority: 4,
        required_report_he: hasLogs ? null : "Logs / לוגים",
        target_href: hasLogs ? "/activity" : "/missing-data",
        teacher_message_he: hasLogs ? "קיימים לוגים לחישוב זמן תרגול." : "חסרים לוגים ולכן אי אפשר לחשב זמן תרגול."
      }
    ],
    capabilities: {
      participants: hasStudents ? "available" : "missing_participants_report",
      tasks: hasTasks ? "available" : "missing_completion_or_course_report",
      grades: hasGrades ? "available" : "missing_gradebook_report",
      logs: hasLogs ? "available" : "missing_logs_report"
    }
  };
}

app.get("/api/sync/status", async (req, res) => {
  noStore(res);
  const sbCounts = await getSupabaseCounts();
  res.json(buildSyncStatus(req, sbCounts));
});

app.post("/api/sync/run", async (req, res) => {
  noStore(res);
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();
  const sbCounts = await getSupabaseCounts();
  res.json({
    ...buildSyncStatus(req, sbCounts),
    sync_run: {
      ok: true,
      mode: "capability-detection-only",
      note_he: "לא נוצרו נתונים מזויפים. בוצעה רק בדיקת יכולות וחוסרים."
    }
  });
});
// <<< MTH_SYNC_STATUS_API_V1 <<<



// >>> MTH_PERSISTENCE_CORE_V1_STATUS >>>
function buildPersistenceStatus() {
  const hasSupabaseUrl = Boolean(env("VITE_SUPABASE_URL"));
  const hasServiceRole = Boolean(env("SUPABASE_SERVICE_ROLE_KEY"));
  const hasLocalRuntimeStore = fs.existsSync(STORE_PATH);

  const productionReady = hasSupabaseUrl && hasServiceRole;

  return {
    ok: true,
    version: "MTH_PERSISTENCE_CORE_V1_STATUS",
    production_persistence_ready: productionReady,
    active_mode: productionReady ? "supabase-production-candidate" : "local-runtime-store",
    local_runtime_store_present: hasLocalRuntimeStore,
    local_runtime_store_tracked_in_git: false,
    supabase_url_configured: hasSupabaseUrl,
    supabase_service_role_configured: hasServiceRole,
    teacher_release_blocker: !productionReady,
    teacher_message_he: productionReady
      ? "קיימת תצורת Supabase ל־production persistence, אך עדיין נדרשת בדיקת שמירה אמיתית למורה/מרחב."
      : "כרגע השמירה אינה production persistence מלא. לפני הפצה למורים צריך לאמת שמירה קבועה לפי מורה ומרחב.",
    next_actions_he: productionReady
      ? [
          "להריץ בדיקת כתיבה/קריאה בטוחה מול Supabase ללא נתוני תלמידים אמיתיים.",
          "לאמת הפרדה בין מורה למורה ובין מרחב למרחב.",
          "לתעד תוצאת בדיקה ב־STATE."
        ]
      : [
          "להגדיר Supabase production persistence בסביבת השרת בלבד.",
          "לא להכניס service role key לגיטהאב או לצ׳אט.",
          "להוסיף בדיקת כתיבה/קריאה בטוחה לפני הפצה למורים."
        ],
    safety: {
      no_secret_values_returned: true,
      no_student_rows_returned: true,
      no_fake_persistence_claim: true
    }
  };
}

app.get("/api/persistence/status", (_req, res) => {
  noStore(res);
  res.json(buildPersistenceStatus());
});
// <<< MTH_PERSISTENCE_CORE_V1_STATUS <<<




// >>> MTH_PERSISTENCE_LIVE_VALIDATION_V1 >>>
const PERSISTENCE_REQUIRED_TABLES_V1 = [
  "teachers",
  "courses",
  "import_batches",
  "students",
  "nrps_members",
  "student_matches",
  "course_sections",
  "course_tasks",
  "grade_items",
  "grade_results",
  "log_events",
  "practice_time_summaries",
  "teacher_sessions",
  "lti_launches"
];

function safeSupabaseHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

async function buildPersistenceLiveValidation() {
  const url = env("VITE_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");

  const result = {
    ok: false,
    mode: "persistence-live-validation",
    version: "MTH_PERSISTENCE_LIVE_VALIDATION_V1",
    provider: "supabase",
    configured: Boolean(url && key),
    supabase_host: safeSupabaseHost(url),
    production_persistence_ready: false,
    required_tables: PERSISTENCE_REQUIRED_TABLES_V1,
    tables: [],
    missing_tables: [],
    checked_at: new Date().toISOString(),
    safety: {
      no_secret_values_returned: true,
      no_student_rows_returned: true,
      aggregate_counts_only: true
    }
  };

  if (!url || !key) {
    result.blocker = "SUPABASE_ENV_NOT_CONFIGURED";
    return result;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  for (const table of PERSISTENCE_REQUIRED_TABLES_V1) {
    const { error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    const ok = !error;
    result.tables.push({
      table,
      ok,
      count: ok ? (count ?? 0) : null,
      error_code: error?.code || null,
      error_message: error?.message ? String(error.message).slice(0, 180) : null
    });

    if (!ok) result.missing_tables.push(table);
  }

  result.ok = result.missing_tables.length === 0;
  result.production_persistence_ready = result.ok;
  result.blocker = result.ok ? null : "MISSING_OR_INACCESSIBLE_SUPABASE_TABLES";
  return result;
}



// >>> MTH_SAFE_IMPORT_SCHEMA_DIAGNOSTICS_V1 >>>
async function probeSupabaseSelect(table, columns) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      table,
      ok: false,
      configured: false,
      columns,
      error_code: "SUPABASE_NOT_CONFIGURED",
      error_message: "Supabase client is not configured"
    };
  }

  try {
    const { error, count } = await supabase
      .from(table)
      .select(columns.join(","), { count: "exact", head: true })
      .limit(0);

    return {
      table,
      ok: !error,
      configured: true,
      columns,
      count: count ?? null,
      error_code: error?.code || null,
      error_message: error?.message || null
    };
  } catch (error) {
    return {
      table,
      ok: false,
      configured: true,
      columns,
      count: null,
      error_code: "PROBE_THROWN",
      error_message: String(error?.message || error).slice(0, 500)
    };
  }
}

async function buildImportSchemaDiagnostics() {
  const probes = [];

  probes.push(await probeSupabaseSelect("import_batches", [
    "id",
    "course_id",
    "teacher_id",
    "report_type",
    "source_kind",
    "status",
    "row_count",
    "file_name",
    "detection_confidence",
    "warnings",
    "imported_by_username",
    "created_at"
  ]));

  probes.push(await probeSupabaseSelect("import_batches", [
    "id",
    "course_id",
    "report_type",
    "source_kind",
    "status",
    "row_count",
    "file_name",
    "created_at"
  ]));

  probes.push(await probeSupabaseSelect("import_batches", [
    "id",
    "report_type",
    "source_kind",
    "status",
    "row_count",
    "created_at"
  ]));

  probes.push(await probeSupabaseSelect("students", [
    "id",
    "full_name",
    "email",
    "external_id",
    "external_username",
    "moodle_user_id",
    "lis_person_sourcedid",
    "id_number",
    "space_id",
    "source",
    "import_batch_id",
    "created_at",
    "updated_at"
  ]));

  probes.push(await probeSupabaseSelect("students", [
    "id",
    "full_name",
    "email",
    "external_id",
    "external_username",
    "import_batch_id",
    "created_at",
    "updated_at"
  ]));

  probes.push(await probeSupabaseSelect("students", [
    "id",
    "full_name",
    "email",
    "created_at",
    "updated_at"
  ]));

  probes.push(await probeSupabaseSelect("teachers", [
    "id",
    "moodle_user_id",
    "username",
    "created_at",
    "updated_at"
  ]));

  probes.push(await probeSupabaseSelect("courses", [
    "id",
    "moodle_course_id",
    "title",
    "created_at",
    "updated_at"
  ]));

  return {
    ok: true,
    mode: "safe-import-schema-diagnostics",
    version: "MTH_SAFE_IMPORT_SCHEMA_DIAGNOSTICS_V1",
    probes,
    summary: {
      import_batches_any_ok: probes.filter(p => p.table === "import_batches").some(p => p.ok),
      students_any_ok: probes.filter(p => p.table === "students").some(p => p.ok),
      teachers_any_ok: probes.filter(p => p.table === "teachers").some(p => p.ok),
      courses_any_ok: probes.filter(p => p.table === "courses").some(p => p.ok)
    },
    safety: {
      no_writes_performed: true,
      no_deletes_performed: true,
      no_sql_executed: true,
      no_student_rows_returned: true,
      aggregate_or_schema_only: true
    },
    checked_at: new Date().toISOString()
  };
}

app.get("/api/import/schema-diagnostics", async (req, res) => {
  noStore(res);
  res.json(await buildImportSchemaDiagnostics());
});
// <<< MTH_SAFE_IMPORT_SCHEMA_DIAGNOSTICS_V1 <<<

app.get("/api/persistence/validate", async (_req, res) => {
  noStore(res);
  try {
    res.json(await buildPersistenceLiveValidation());
  } catch (error) {
    res.status(500).json({
      ok: false,
      mode: "persistence-live-validation",
      version: "MTH_PERSISTENCE_LIVE_VALIDATION_V1",
      provider: "supabase",
      production_persistence_ready: false,
      blocker: "PERSISTENCE_VALIDATION_EXCEPTION",
      error_message: error?.message ? String(error.message).slice(0, 180) : "unknown error",
      safety: {
        no_secret_values_returned: true,
        no_student_rows_returned: true,
        aggregate_counts_only: true
      }
    });
  }
});
// <<< MTH_PERSISTENCE_LIVE_VALIDATION_V1 >>>


// >>> MTH_RELEASE_READINESS_GATE_V2 >>>
function buildReleaseReadiness(req, sbCounts) {
  const sync = buildSyncStatus(req, sbCounts);
  const persistence = buildPersistenceStatus();

  const blockers = [];

  if (!sync.session_exists) {
    blockers.push({
      key: "moodle_launch_missing",
      severity: "required",
      message_he: "צריך לפתוח את הכלי מתוך Moodle כדי לזהות מורה ומרחב."
    });
  }

  if (!persistence.production_persistence_ready) {
    blockers.push({
      key: "production_persistence_missing",
      severity: "required",
      message_he: "אין עדיין production persistence מלא. חייבים שמירה קבועה לפי מורה ומרחב."
    });
  }

  const capabilityDetails = Array.isArray(sync.capability_details) ? sync.capability_details : [];
  for (const item of capabilityDetails) {
    if (item.status !== "available") {
      blockers.push({
        key: "missing_" + item.key,
        severity: "data_required",
        message_he: item.teacher_message_he,
        required_report_he: item.required_report_he,
        target_href: item.target_href
      });
    }
  }

  // Reports must enter through the real import flow — not just exist in memory
  const durableBatchCount = sbCounts?.import_batches != null ? sbCounts.import_batches : (Array.isArray(store.importBatches) ? store.importBatches.length : 0);
  if (durableBatchCount === 0) {
    blockers.push({
      key: "no_real_import_batch",
      severity: "data_required",
      message_he: "לא בוצע ייבוא אמיתי של דוחות. נדרש ייבוא Participants, Gradebook ו-Logs מ-Moodle."
    });
  }

  // Logs exist but carry no duration field — practice time cannot be computed
  const releaseGateLogEvents = Array.isArray(store.logEvents) ? store.logEvents : [];
  if (releaseGateLogEvents.length > 0) {
    const logsHaveDuration = releaseGateLogEvents.some(ev => {
      const raw = ev.duration_seconds ?? ev.duration ?? ev.timeDiff ?? null;
      return raw !== null && Number.isFinite(Number(raw)) && Number(raw) > 0;
    });
    if (!logsHaveDuration) {
      blockers.push({
        key: "practice_time_no_duration_field",
        severity: "data_required",
        message_he: "קיימים לוגים אך אין שדה משך זמן — לא ניתן לחשב זמן תרגול אמיתי."
      });
    }
  }

  // Always-on hardcoded gates — require explicit human sign-off
  blockers.push({
    key: "deploy_live_validation_missing",
    severity: "required",
    message_he: "נדרשת בדיקת deploy/live אמיתית על הקישור הציבורי."
  });

  blockers.push({
    key: "multi_teacher_isolation_not_validated",
    severity: "required",
    message_he: "נדרש אימות בידוד נתונים: לפחות שני מורים או שני מרחבים שונים, ללא ערבוב נתונים."
  });

  blockers.push({
    key: "real_moodle_end_to_end_missing",
    severity: "required",
    message_he: "נדרשת בדיקה אמיתית מקצה לקצה מתוך Moodle עם נתוני אמת."
  });

  blockers.push({
    key: "repo_and_infra_manual_check_required",
    severity: "required",
    message_he: "נדרשת בדיקה ידנית של repo ו-infra: ללא סודות, ללא נתוני תלמידים, ללא ערכי env ב-code."
  });

  return {
    ok: true,
    version: "MTH_RELEASE_READINESS_GATE_V2",
    teacher_release_ready: false,
    broad_release_ready: false,
    automation_core_percent: 78,
    teacher_release_readiness_percent: 60,
    checked_at: new Date().toISOString(),
    blockers,
    blockers_count: blockers.length,
    sync_summary: {
      version: sync.version,
      session_exists: sync.session_exists,
      counts: sync.counts,
      capabilities: sync.capabilities,
      next_actions_he: sync.next_actions_he
    },
    persistence_summary: persistence,
    safety: {
      no_fake_release_claim: true,
      no_secret_values_returned: true,
      no_student_rows_returned: true
    },
    next_actions_he: blockers.map(item => item.message_he)
  };
}



// >>> MTH_LTI_SAFE_DIAGNOSTICS_V1 >>>
app.get("/api/lti/diagnostics", async (req, res) => {
  noStore(res);
  const session = sessionFromRequest(req);
  const sbCounts = await getSupabaseCounts();

  res.json({
    ok: true,
    mode: "lti-safe-diagnostics",
    version: "MTH_LTI_SAFE_DIAGNOSTICS_V1",
    teacher_release_ready: false,
    canonical_lti_endpoint: CANONICAL_LTI_ENDPOINT,
    active_runtime: env("NODE_ENV", "development"),
    app_base_url_configured: Boolean(env("APP_BASE_URL")),
    lti_configured: Boolean(env("LTI_SHARED_SECRET") && env("LTI_CONSUMER_KEY")),
    cookie_present: Boolean(req.cookies?.sid),
    session_exists_for_this_browser: Boolean(session),
    safe_counts: {
      memory_sessions: sessions instanceof Map ? sessions.size : 0,
      token_sessions: tokenSessions instanceof Map ? tokenSessions.size : 0,
      store_launches: Array.isArray(store.launches) ? store.launches.length : 0,
      moodle_captures: Array.isArray(store.moodleCaptures) ? store.moodleCaptures.length : 0,
      teachers: Array.isArray(store.teachers) ? store.teachers.length : 0,
      spaces: Array.isArray(store.spaces) ? store.spaces.length : 0,
      students: sbCounts?.students != null ? sbCounts.students : (Array.isArray(store.students) ? store.students.length : 0),
      import_batches: sbCounts?.import_batches != null ? sbCounts.import_batches : (Array.isArray(store.importBatches) ? store.importBatches.length : 0)
    },
    last_capture_safe: Array.isArray(store.moodleCaptures) && store.moodleCaptures.length
      ? {
          source: store.moodleCaptures[store.moodleCaptures.length - 1].source || null,
          verificationCode: store.moodleCaptures[store.moodleCaptures.length - 1].verificationCode || null,
          createdAt: store.moodleCaptures[store.moodleCaptures.length - 1].createdAt || null,
          rawCount: store.moodleCaptures[store.moodleCaptures.length - 1].rawCount || 0,
          keys_count: Array.isArray(store.moodleCaptures[store.moodleCaptures.length - 1].keys)
            ? store.moodleCaptures[store.moodleCaptures.length - 1].keys.length
            : 0
        }
      : null,
    safety: {
      no_secret_values_returned: true,
      no_student_rows_returned: true,
      no_names_or_emails_returned: true,
      aggregate_counts_only: true
    }
  });
});
// <<< MTH_LTI_SAFE_DIAGNOSTICS_V1 >>>

app.get("/api/release/readiness", async (req, res) => {
  noStore(res);
  const sbCounts = await getSupabaseCounts();
  res.json(buildReleaseReadiness(req, sbCounts));
});
// <<< MTH_RELEASE_READINESS_GATE_V2 <<<

// >>> MTH_TEACHER_DASHBOARD_CONTEXT_V1 >>>
app.get("/api/teacher/dashboard-context", (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req) || sessionFromRequest(req);
  const hasSession = Boolean(session);

  const hasStudents = Array.isArray(store.students) && store.students.length > 0;
  const hasTasks = (Array.isArray(store.tasks) && store.tasks.length > 0) || (Array.isArray(store.chapters) && store.chapters.length > 0);
  const hasGrades = gradeItemsCount > 0 || gradeResultsCount > 0;
  const hasLogs = logEventsCount > 0;

  const availableSections = [];
  const missingSections = [];
  if (hasStudents) availableSections.push("participants");
  else missingSections.push("participants");
  if (hasTasks) availableSections.push("tasks");
  else missingSections.push("tasks");
  if (hasGrades) availableSections.push("grades");
  else missingSections.push("grades");
  if (hasLogs) availableSections.push("logs");
  else missingSections.push("logs");

  const blockerKeys = [];
  if (!hasSession) blockerKeys.push("missing_moodle_launch");
  if (!hasStudents) blockerKeys.push("missing_participants_report");
  if (!hasGrades) blockerKeys.push("missing_gradebook_report");
  if (!hasLogs) blockerKeys.push("missing_logs_report");

  const lastLaunch = Array.isArray(store.launches) ? store.launches.at(-1) : null;

  res.json({
    ok: true,
    version: "MTH_TEACHER_DASHBOARD_CONTEXT_V1",
    teacher_release_ready: false,
    teacher_context_status: hasSession ? "session_active" : "no_moodle_session",
    course_context_status: (hasStudents && hasTasks) ? "partial" : "missing_required_data",
    connection_status: hasSession ? "connected" : "not_connected",
    last_sync_at: lastLaunch?.createdAt ?? null,
    available_sections: availableSections,
    missing_sections: missingSections,
    safe_counts: {
      students: Array.isArray(store.students) ? store.students.length : 0,
      tasks: Array.isArray(store.tasks) ? store.tasks.length : 0,
      chapters: Array.isArray(store.chapters) ? store.chapters.length : 0,
      grades: Array.isArray(store.grades) ? store.grades.length : 0,
      log_events: Array.isArray(store.logEvents) ? store.logEvents.length : 0,
      launches: Array.isArray(store.launches) ? store.launches.length : 0
    },
    blocker_key: blockerKeys.length > 0 ? blockerKeys[0] : null,
    blocker_keys: blockerKeys
  });
});
// <<< MTH_TEACHER_DASHBOARD_CONTEXT_V1 <<<

// >>> MTH_CAPABILITY_DETECTOR_V1 >>>
app.get("/api/capabilities/status", async (req, res) => {
  noStore(res);

  const lti11Configured = !!(env("LTI_SHARED_SECRET") && env("LTI_CONSUMER_KEY"));
  const lti13Env = lti13EnvStatus();
  const moodleWsConfigured = !!env("MOODLE_WS_TOKEN");

  const session = importSessionFromRequest(req) || sessionFromRequest(req);
  const lti13Sessions = lti13DiagnosticSessionsSnapshot();
  const latestLti13 = lti13Sessions.length ? lti13Sessions[lti13Sessions.length - 1] : null;
  const services = latestLti13?.automaticServices || { has_nrps: false, has_ags: false };

  const sbCounts = await getSupabaseCounts();
  const studentCount = sbCounts?.students != null ? sbCounts.students : (Array.isArray(store.students) ? store.students.length : 0);
  const batchCount = sbCounts?.import_batches != null ? sbCounts.import_batches : (Array.isArray(store.importBatches) ? store.importBatches.length : 0);
  const gradeItemsCount = sbCounts?.grade_items != null ? sbCounts.grade_items : (Array.isArray(store.gradeItems) ? store.gradeItems.length : 0);
  const gradeResultsCount = sbCounts?.grade_results != null ? sbCounts.grade_results : (Array.isArray(store.grades) ? store.grades.length : 0);
  const logEventsCount = sbCounts?.log_events != null ? sbCounts.log_events : (Array.isArray(store.logEvents) ? store.logEvents.length : 0);
  const hasStudents = studentCount > 0;
  const hasGrades = gradeItemsCount > 0 || gradeResultsCount > 0;
  const hasLogs = logEventsCount > 0;
  const hasImportBatches = batchCount > 0;

  const lti11Status = lti11Configured ? "configured" : "missing";
  const lti13Status = lti13Env.configured ? "configured" : (lti13Env.missing.length === lti13Env.required.length ? "missing" : "partial");
  const moodleWsStatus = moodleWsConfigured ? "configured" : "missing";
  const nrpsStatus = !!services.has_nrps ? "available" : (latestLti13 ? "unavailable" : "unknown");
  const agsStatus = !!services.has_ags ? "available" : (latestLti13 ? "unavailable" : "unknown");
  const gradebookStatus = hasGrades ? "available" : (hasImportBatches ? "partial" : "missing");
  const logsStatus = hasLogs ? "available" : "missing";
  const manualReportImportStatus = "available";

  const capabilityMap = {
    lti11: lti11Status,
    lti13: lti13Status,
    moodle_ws: moodleWsStatus,
    nrps: nrpsStatus,
    ags: agsStatus,
    gradebook: gradebookStatus,
    logs: logsStatus,
    manual_report_import: manualReportImportStatus
  };

  const availableCapabilities = Object.entries(capabilityMap)
    .filter(([, v]) => v === "available" || v === "configured")
    .map(([k]) => k);

  const missingCapabilities = Object.entries(capabilityMap)
    .filter(([, v]) => v === "missing")
    .map(([k]) => k);

  const blockerKeys = [];
  if (!lti11Configured && !lti13Env.configured) blockerKeys.push("no_lti_configured");
  if (!moodleWsConfigured) blockerKeys.push("moodle_ws_token_missing");
  if (!hasStudents) blockerKeys.push("missing_participants_report");
  if (!hasGrades) blockerKeys.push("missing_gradebook_report");
  if (!hasLogs) blockerKeys.push("missing_logs_report");

  res.json({
    ok: true,
    version: "MTH_CAPABILITY_DETECTOR_V1",
    teacher_release_ready: false,
    lti11_status: lti11Status,
    lti13_status: lti13Status,
    moodle_ws_status: moodleWsStatus,
    nrps_status: nrpsStatus,
    ags_status: agsStatus,
    gradebook_status: gradebookStatus,
    logs_status: logsStatus,
    manual_report_import_status: manualReportImportStatus,
    available_capabilities: availableCapabilities,
    missing_capabilities: missingCapabilities,
    blocker_keys: blockerKeys,
    safety: {
      no_secrets_returned: true,
      no_fake_nrps_ags: true,
      teacher_release_ready: false
    },
    checked_at: new Date().toISOString()
  });
});


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


app.get("/api/automation/capabilities", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req) || sessionFromRequest(req);
  const courseId = String(session?.courseId || session?.course_id || session?.contextId || "").trim();
  const courseName = session?.courseTitle || session?.spaceTitle || null;
  const teacherName = String(session?.teacherName || session?.moodleUsername || null || "");
  const moodleUsername = String(session?.moodleUsername || session?.teacherName || null || "");

  const sbCounts = await getSupabaseCounts();
  const studentCount = sbCounts?.students ?? (Array.isArray(store.students) ? store.students.length : 0);
  const gradeItemsCount = sbCounts?.grade_items ?? (Array.isArray(store.gradeItems) ? store.gradeItems.length : 0);
  const gradeResultsCount = sbCounts?.grade_results ?? (Array.isArray(store.grades) ? store.grades.length : 0);
  const logEventsCount = sbCounts?.log_events ?? (Array.isArray(store.logEvents) ? store.logEvents.length : 0);
  const hasStudents = studentCount > 0;
  const hasGradebook = gradeItemsCount > 0 || gradeResultsCount > 0;
  const hasLogs = logEventsCount > 0;
  const hasCourseStructure = (Array.isArray(store.chapters) && store.chapters.length > 0) || (Array.isArray(store.completionRows) && store.completionRows.length > 0);
  const moodleWsConfigured = !!env("MOODLE_WS_TOKEN");
  const connected = Boolean(session);

  const warnings = [];
  if (!connected) warnings.push("הממשק לא זוהה בסשן LTI. פתח מתוך Moodle כדי להתחבר.");
  if (!courseId) warnings.push("פתח את הכלי מתוך מרחב Moodle כדי שנוכל לזהות את הקורס ולבנות קישורי דוחות.");
  if (connected && !hasStudents) warnings.push("עדיין לא יובא דוח Participants אמיתי.");
  if (connected && !hasGradebook) warnings.push("עדיין לא יובא דוח Gradebook אמיתי.");
  if (connected && !hasLogs) warnings.push("עדיין לא יובא דוח Logs אמיתי.");
  if (connected && !hasCourseStructure) warnings.push("עדיין לא יובא דוח Course Structure / Activity Completion אמיתי.");

  const nextBestAction = !courseId
    ? "פתח את הכלי מתוך מרחב Moodle כדי שנוכל לזהות את הקורס ולבנות קישורי דוחות."
    : !hasStudents
      ? "העלה דוח Participants אמיתי כדי לאפשר את כל מסלולי הייבוא והדוחות."
      : !hasGradebook
        ? "העלה דוח Gradebook אמיתי כדי להשלים את סט הייבוא הפנימי."
        : !hasLogs
          ? "העלה דוח Logs אמיתי כדי להשלים את תמונת הפעילות והזמן."
          : !hasCourseStructure
            ? "העלה דוח Course Structure / Activity Completion אמיתי כדי לקבל דוחות מלאים יותר."
            : !moodleWsConfigured
              ? "השלם את הגדרת MOODLE_WS_TOKEN ב-Render כדי לקדם את המסלול האוטומטי."
              : "השתמש בקישורי הדוחות האמיתיים ובדוק את הקורס. סנכרון API מלא עדיין לא הופעל.";

  res.json({
    ok: true,
    connected,
    teacherName: teacherName || null,
    moodleUsername: moodleUsername || null,
    courseId: courseId || null,
    courseName,
    ltiSessionAvailable: connected,
    importsAvailable: {
      participants: hasStudents,
      gradebook: hasGradebook,
      logs: hasLogs,
      courseStructure: hasCourseStructure,
    },
    automationLevels: {
      ltiContext: connected ? "available" : "missing",
      manualReports: (hasStudents || hasGradebook || hasLogs || hasCourseStructure) ? "available" : "missing",
      exportLinks: courseId ? "available" : "missing",
      moodleWebServices: moodleWsConfigured ? "configured" : "missing",
      autoSync: moodleWsConfigured ? "not_verified" : "missing",
    },
    teacherRelease: false,
    warnings,
    nextBestAction,
  });
});

// >>> MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1 >>>
// Read-only auto-extraction discovery + source router.
// Returns sanitized metadata only: no secrets, no tokens, no PII, no rows.
// Routing logic mirrors src/lib/autoExtractionSourceRouter.ts (the server
// runs JS, so the pure TS module is kept as the typed contract / future
// frontend import, and the same rules are evaluated here over real signals).
app.get("/api/automation/auto-extraction/sources", async (req, res) => {
  noStore(res);

  // ── Gather REAL signals only ──────────────────────────────────────────────
  const session = importSessionFromRequest(req) || sessionFromRequest(req) || latestLti13SessionForWs();

  const courseId = normalizeCourseIdFromSession(session);
  const roles = normalizeRolesFromSession(session);
  const hasLtiSession = !!session;
  const hasCourseIdentity = !!courseId;
  const hasTeacherIdentity = !!(
    session && (session.teacherId || session.teacherName || session.moodleUsername || session.user_id || session.userId)
  );

  // LTI Advantage live service claims (only true if the real launch carried them)
  const lti13Sessions = lti13DiagnosticSessionsSnapshot();
  const latestLti13 = lti13Sessions.length ? lti13Sessions[lti13Sessions.length - 1] : null;
  const liveServices = latestLti13?.automaticServices || { has_nrps: false, has_ags: false };
  const hasNrpsClaim = !!liveServices.has_nrps;
  const hasAgsClaim = !!liveServices.has_ags;

  // Moodle Web Services — token configured? site-info live verified?
  const wsStatus = moodleWsStatus();
  const wsTokenConfigured = !!wsStatus.configured;
  // Live verification is only true if a real probe recorded it. We do NOT
  // perform a live call here (read-only/no side effects); we reflect the
  // known verified flag, which stays false until a probe records evidence.
  const wsSiteInfoLiveVerified = !!wsStatus.core_webservice_get_site_info_live_verified;

  // Real imported data already persisted (aggregate booleans, never rows)
  const sbCounts = await getSupabaseCounts();
  const hasParticipantsData = (sbCounts?.students ?? 0) > 0;
  const hasGradebookData = ((sbCounts?.grade_items ?? 0) > 0) || ((sbCounts?.grade_results ?? 0) > 0);
  const hasLogsData = (sbCounts?.log_events ?? 0) > 0;
  const hasCourseStructureData =
    ((sbCounts?.course_sections ?? 0) > 0) ||
    ((sbCounts?.course_tasks ?? 0) > 0) ||
    (Array.isArray(store.chapters) && store.chapters.length > 0) ||
    (Array.isArray(store.completionRows) && store.completionRows.length > 0);

  // Practice time: no verified duration source exists today → must refuse.
  const hasVerifiedDurationSource = false;

  // ── Routing helpers (mirror of autoExtractionSourceRouter.ts) ─────────────
  const VER = "MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1";

  const domains = [];

  domains.push({
    domainId: "course_identity",
    labelHe: "זהות קורס / מרחב למידה",
    bestCurrentSource: hasCourseIdentity ? "LTI" : "UNAVAILABLE",
    automationLevel: hasCourseIdentity ? "AUTOMATIC" : "BLOCKED",
    isAutomaticNow: hasCourseIdentity,
    isSemiAutoFallback: false,
    isBlocked: !hasCourseIdentity,
    evidenceType: hasCourseIdentity ? "live" : "missing",
    provingSignalHe: hasCourseIdentity ? "התקבל הקשר LTI חי עם מזהה קורס/מרחב מתוך Moodle." : "אין סשן LTI פעיל עם מזהה קורס.",
    whatIsMissingHe: hasCourseIdentity ? null : "פתיחת הכלי מתוך מרחב Moodle.",
    teacherSeesHe: hasCourseIdentity ? "נשלף אוטומטית" : "נדרשת פתיחה מתוך Moodle",
    adminEnablementHe: null,
    fallbackRoute: null,
    routeAction: hasCourseIdentity ? "use_live_signal" : "open_from_moodle",
    mayShowDataNow: hasCourseIdentity,
    mustRefuseToCalculate: false,
  });

  domains.push({
    domainId: "teacher_identity",
    labelHe: "זהות מורה",
    bestCurrentSource: hasTeacherIdentity ? "LTI" : "UNAVAILABLE",
    automationLevel: hasTeacherIdentity ? "AUTOMATIC" : "BLOCKED",
    isAutomaticNow: hasTeacherIdentity,
    isSemiAutoFallback: false,
    isBlocked: !hasTeacherIdentity,
    evidenceType: hasTeacherIdentity ? "live" : "missing",
    provingSignalHe: hasTeacherIdentity ? "התקבלה זהות מורה מתוך הקשר ה-LTI החי." : "אין זהות מורה בסשן LTI פעיל.",
    whatIsMissingHe: hasTeacherIdentity ? null : "פתיחת הכלי מתוך מרחב Moodle עם זיהוי מורה.",
    teacherSeesHe: hasTeacherIdentity ? "נשלף אוטומטית" : "נדרשת פתיחה מתוך Moodle",
    adminEnablementHe: null,
    fallbackRoute: null,
    routeAction: hasTeacherIdentity ? "use_live_signal" : "open_from_moodle",
    mayShowDataNow: hasTeacherIdentity,
    mustRefuseToCalculate: false,
  });

  // students_roster: live WS > live NRPS > import fallback
  if (wsTokenConfigured && wsSiteInfoLiveVerified) {
    domains.push({
      domainId: "students_roster", labelHe: "רשימת תלמידים (Roster)",
      bestCurrentSource: "MOODLE_WS", automationLevel: "AUTOMATIC",
      isAutomaticNow: true, isSemiAutoFallback: false, isBlocked: false, evidenceType: "live",
      provingSignalHe: "Moodle Web Services מאומת חי (core_webservice_get_site_info).",
      whatIsMissingHe: null, teacherSeesHe: "נשלף אוטומטית", adminEnablementHe: null,
      fallbackRoute: "/import", routeAction: "use_live_signal", mayShowDataNow: true, mustRefuseToCalculate: false,
    });
  } else if (hasNrpsClaim) {
    domains.push({
      domainId: "students_roster", labelHe: "רשימת תלמידים (Roster)",
      bestCurrentSource: "NRPS", automationLevel: "AUTOMATIC_READY",
      isAutomaticNow: false, isSemiAutoFallback: true, isBlocked: false, evidenceType: "inferred",
      provingSignalHe: "claim של NRPS נמצא ב-launch החי. נדרש מימוש שליפה מאומת לפני שמירה.",
      whatIsMissingHe: "מימוש שליפת NRPS מאומת + בדיקת בידוד לפני שמירה אוטומטית.",
      teacherSeesHe: "מוכן לאוטומציה אם Moodle יחשוף הרשאה", adminEnablementHe: null,
      fallbackRoute: "/import", routeAction: "import_report", mayShowDataNow: hasParticipantsData, mustRefuseToCalculate: false,
    });
  } else {
    domains.push({
      domainId: "students_roster", labelHe: "רשימת תלמידים (Roster)",
      bestCurrentSource: "IMPORT", automationLevel: "SEMI_AUTOMATIC",
      isAutomaticNow: false, isSemiAutoFallback: true, isBlocked: false, evidenceType: "audit",
      provingSignalHe: hasParticipantsData ? "קיימים נתוני משתתפים שיובאו מדוח Moodle אמיתי." : "אין claim של NRPS ואין token WS — המסלול הזמין הוא ייבוא דוח Participants אמיתי.",
      whatIsMissingHe: hasParticipantsData ? null : "ייבוא דוח Participants אמיתי ממודל.",
      teacherSeesHe: hasParticipantsData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
      adminEnablementHe: "להפעלת אוטומציה מלאה: מנהל Moodle מפעיל NRPS בהגדרות הכלי, או מנפיק Web Services token.",
      fallbackRoute: "/import", routeAction: "import_report", mayShowDataNow: hasParticipantsData, mustRefuseToCalculate: false,
    });
  }

  // teachers_roles
  {
    const viaWs = wsTokenConfigured && wsSiteInfoLiveVerified;
    domains.push({
      domainId: "teachers_roles", labelHe: "מורים ותפקידים",
      bestCurrentSource: viaWs ? "MOODLE_WS" : hasNrpsClaim ? "NRPS" : "IMPORT",
      automationLevel: viaWs ? "AUTOMATIC" : hasNrpsClaim ? "AUTOMATIC_READY" : "SEMI_AUTOMATIC",
      isAutomaticNow: viaWs, isSemiAutoFallback: !viaWs, isBlocked: false,
      evidenceType: viaWs ? "live" : hasNrpsClaim ? "inferred" : "audit",
      provingSignalHe: viaWs ? "Moodle Web Services מאומת מחזיר תפקידים." : hasNrpsClaim ? "claim של NRPS נמצא ב-launch (כולל תפקידים)." : "תפקידי מורים מגיעים מדוח המשתתפים שיובא.",
      whatIsMissingHe: viaWs ? null : "מקור תפקידים אוטומטי מאומת (WS/NRPS).",
      teacherSeesHe: viaWs ? "נשלף אוטומטית" : hasNrpsClaim ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : "זמין מייבוא דוח אמיתי",
      adminEnablementHe: viaWs ? null : "מנהל Moodle מפעיל NRPS או Web Services.",
      fallbackRoute: "/import", routeAction: viaWs ? "use_live_signal" : "import_report",
      mayShowDataNow: viaWs || hasParticipantsData, mustRefuseToCalculate: false,
    });
  }

  // gradebook
  if (hasAgsClaim) {
    domains.push({
      domainId: "gradebook", labelHe: "גיליון ציונים (Gradebook)",
      bestCurrentSource: "AGS", automationLevel: "AUTOMATIC_READY",
      isAutomaticNow: false, isSemiAutoFallback: true, isBlocked: false, evidenceType: "inferred",
      provingSignalHe: "claim של AGS נמצא ב-launch החי. AGS אינו מחליף את ייצוא ה-Gradebook המלא.",
      whatIsMissingHe: "מימוש שליפת AGS מאומת. AGS מספק ציונים חלקיים בלבד.",
      teacherSeesHe: "מוכן לאוטומציה אם Moodle יחשוף הרשאה", adminEnablementHe: null,
      fallbackRoute: "/gradebook-import", routeAction: "import_report", mayShowDataNow: hasGradebookData, mustRefuseToCalculate: false,
    });
  } else {
    domains.push({
      domainId: "gradebook", labelHe: "גיליון ציונים (Gradebook)",
      bestCurrentSource: "IMPORT", automationLevel: "SEMI_AUTOMATIC",
      isAutomaticNow: false, isSemiAutoFallback: true, isBlocked: false, evidenceType: "audit",
      provingSignalHe: hasGradebookData ? "קיימים נתוני ציונים שיובאו מדוח Gradebook אמיתי." : "אין claim של AGS — המסלול הזמין הוא ייבוא דוח Gradebook אמיתי.",
      whatIsMissingHe: hasGradebookData ? null : "ייבוא דוח Gradebook אמיתי ממודל.",
      teacherSeesHe: hasGradebookData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
      adminEnablementHe: "להפעלת אוטומציה: מנהל Moodle מפעיל AGS (LTI Advantage) או Web Services.",
      fallbackRoute: "/gradebook-import", routeAction: "import_report", mayShowDataNow: hasGradebookData, mustRefuseToCalculate: false,
    });
  }

  // logs
  {
    const viaWs = wsTokenConfigured && wsSiteInfoLiveVerified;
    domains.push({
      domainId: "logs", labelHe: "לוגים (יומן פעילות)",
      bestCurrentSource: viaWs ? "MOODLE_WS" : "IMPORT",
      automationLevel: viaWs ? "AUTOMATIC_READY" : "SEMI_AUTOMATIC",
      isAutomaticNow: false, isSemiAutoFallback: true, isBlocked: false,
      evidenceType: viaWs ? "inferred" : "audit",
      provingSignalHe: viaWs ? "Web Services מאומת — קריאת לוגים אפשרית בכפוף לפונקציות מורשות." : hasLogsData ? "קיימים אירועי לוג שיובאו מדוח Moodle אמיתי." : "המסלול הזמין הוא ייבוא דוח Logs אמיתי.",
      whatIsMissingHe: viaWs ? "מיפוי פונקציית לוגים מורשית ב-WS." : hasLogsData ? null : "ייבוא דוח Logs אמיתי.",
      teacherSeesHe: viaWs ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : hasLogsData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
      adminEnablementHe: viaWs ? null : "מנהל Moodle מפעיל Web Services לקריאת לוגים.",
      fallbackRoute: "/logs-import", routeAction: "import_report", mayShowDataNow: hasLogsData, mustRefuseToCalculate: false,
    });
  }

  // practice_time — REFUSE unless verified duration
  domains.push({
    domainId: "practice_time", labelHe: "זמן תרגול",
    bestCurrentSource: "UNAVAILABLE",
    automationLevel: hasVerifiedDurationSource ? "SEMI_AUTOMATIC" : "REFUSE",
    isAutomaticNow: false, isSemiAutoFallback: hasVerifiedDurationSource, isBlocked: !hasVerifiedDurationSource,
    evidenceType: hasVerifiedDurationSource ? "audit" : "missing",
    provingSignalHe: hasVerifiedDurationSource ? "קיים מקור משך זמן מאומת." : "אין שדה משך זמן רשמי בייצוא הלוגים. חישוב סינתטי אסור.",
    whatIsMissingHe: hasVerifiedDurationSource ? null : "מקור משך זמן רשמי מ-Moodle.",
    teacherSeesHe: hasVerifiedDurationSource ? "זמין ממקור משך מאומת" : "לא ניתן לחשב ללא מקור משך אמיתי",
    adminEnablementHe: null, fallbackRoute: null,
    routeAction: hasVerifiedDurationSource ? "import_report" : "refuse_calculation",
    mayShowDataNow: hasVerifiedDurationSource, mustRefuseToCalculate: !hasVerifiedDurationSource,
  });

  // course_structure
  {
    const viaWs = wsTokenConfigured && wsSiteInfoLiveVerified;
    domains.push({
      domainId: "course_structure", labelHe: "מבנה קורס ופעילויות",
      bestCurrentSource: viaWs ? "MOODLE_WS" : "IMPORT",
      automationLevel: viaWs ? "AUTOMATIC_READY" : "SEMI_AUTOMATIC",
      isAutomaticNow: false, isSemiAutoFallback: true, isBlocked: false,
      evidenceType: viaWs ? "inferred" : "audit",
      provingSignalHe: viaWs ? "Web Services מאומת — קריאת מבנה קורס אפשרית בכפוף לפונקציות מורשות." : hasCourseStructureData ? "קיים מבנה קורס שיובא מדוח Moodle אמיתי." : "המסלול הזמין הוא ייבוא דוח Activity Completion אמיתי.",
      whatIsMissingHe: viaWs ? "מיפוי core_course_get_contents מורשה." : hasCourseStructureData ? null : "ייבוא דוח מבנה קורס אמיתי.",
      teacherSeesHe: viaWs ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : hasCourseStructureData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
      adminEnablementHe: viaWs ? null : "מנהל Moodle מפעיל Web Services לקריאת מבנה קורס.",
      fallbackRoute: "/course-structure-import", routeAction: "import_report", mayShowDataNow: hasCourseStructureData, mustRefuseToCalculate: false,
    });
  }

  // activity_completion
  domains.push({
    domainId: "activity_completion", labelHe: "השלמת פעילויות / התקדמות",
    bestCurrentSource: "IMPORT", automationLevel: "SEMI_AUTOMATIC",
    isAutomaticNow: false, isSemiAutoFallback: true, isBlocked: false, evidenceType: "audit",
    provingSignalHe: hasCourseStructureData ? "השלמת פעילויות נגזרת ממבנה הקורס שיובא." : "נדרש ייבוא דוח Activity Completion אמיתי.",
    whatIsMissingHe: hasCourseStructureData ? null : "ייבוא דוח Activity Completion אמיתי.",
    teacherSeesHe: hasCourseStructureData ? "זמין מייבוא דוח אמיתי" : "נדרש ייבוא דוח זמני",
    adminEnablementHe: "להפעלת אוטומציה: Web Services עם core_completion מורשה.",
    fallbackRoute: "/course-structure-import", routeAction: "import_report", mayShowDataNow: hasCourseStructureData, mustRefuseToCalculate: false,
  });

  // moodle_web_services
  {
    const verified = wsTokenConfigured && wsSiteInfoLiveVerified;
    const configuredOnly = wsTokenConfigured && !wsSiteInfoLiveVerified;
    domains.push({
      domainId: "moodle_web_services", labelHe: "שירותי Web מודל (אוטומציה מלאה)",
      bestCurrentSource: verified ? "MOODLE_WS" : "UNAVAILABLE",
      automationLevel: verified ? "AUTOMATIC" : "BLOCKED",
      isAutomaticNow: verified, isSemiAutoFallback: false, isBlocked: !verified,
      evidenceType: verified ? "live" : "missing",
      provingSignalHe: verified ? "core_webservice_get_site_info אומת חי." : configuredOnly ? "MOODLE_WS_TOKEN מוגדר אך core_webservice_get_site_info טרם אומת חי." : "MOODLE_WS_TOKEN לא מוגדר באף סביבה מאומתת.",
      whatIsMissingHe: verified ? null : configuredOnly ? "אימות חי של core_webservice_get_site_info." : "token + הפעלת Web Services.",
      teacherSeesHe: verified ? "נשלף אוטומטית" : "נדרש חיבור מנהל מערכת",
      adminEnablementHe: verified ? null : "מנהל Moodle מפעיל Web Services + REST, יוצר משתמש שירות, מנפיק token, ומקצה core_webservice_get_site_info. הגדר MOODLE_WS_TOKEN ב-Render בלבד.",
      fallbackRoute: null, routeAction: verified ? "use_live_signal" : "await_token",
      mayShowDataNow: verified, mustRefuseToCalculate: false,
    });
  }

  // nrps
  domains.push({
    domainId: "nrps", labelHe: "NRPS (רשימת משתתפים אוטומטית)",
    bestCurrentSource: hasNrpsClaim ? "NRPS" : "UNAVAILABLE",
    automationLevel: hasNrpsClaim ? "AUTOMATIC_READY" : "BLOCKED",
    isAutomaticNow: false, isSemiAutoFallback: hasNrpsClaim, isBlocked: !hasNrpsClaim,
    evidenceType: hasNrpsClaim ? "inferred" : "missing",
    provingSignalHe: hasNrpsClaim ? "claim של namesroleservice נמצא ב-launch החי." : "claim של NRPS לא התקבל מ-Moodle ב-launch האחרון.",
    whatIsMissingHe: hasNrpsClaim ? "מימוש שליפת חברות מאומת." : "הפעלת NRPS בהגדרות הכלי ב-Moodle.",
    teacherSeesHe: hasNrpsClaim ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : "נדרש חיבור מנהל מערכת",
    adminEnablementHe: hasNrpsClaim ? null : "מנהל Moodle מפעיל Names and Roles Provisioning Service בהגדרות הכלי החיצוני, שומר, ומפעיל מחדש.",
    fallbackRoute: "/import", routeAction: hasNrpsClaim ? "import_report" : "await_admin_enablement",
    mayShowDataNow: false, mustRefuseToCalculate: false,
  });

  // ags
  domains.push({
    domainId: "ags", labelHe: "AGS (ציונים אוטומטיים)",
    bestCurrentSource: hasAgsClaim ? "AGS" : "UNAVAILABLE",
    automationLevel: hasAgsClaim ? "AUTOMATIC_READY" : "BLOCKED",
    isAutomaticNow: false, isSemiAutoFallback: hasAgsClaim, isBlocked: !hasAgsClaim,
    evidenceType: hasAgsClaim ? "inferred" : "missing",
    provingSignalHe: hasAgsClaim ? "claim של AGS נמצא ב-launch החי." : "claim של AGS לא התקבל מ-Moodle ב-launch האחרון.",
    whatIsMissingHe: hasAgsClaim ? "מימוש שליפת ציונים מאומת. AGS אינו מחליף ייצוא Gradebook מלא." : "הפעלת AGS בהגדרות הכלי ב-Moodle.",
    teacherSeesHe: hasAgsClaim ? "מוכן לאוטומציה אם Moodle יחשוף הרשאה" : "נדרש חיבור מנהל מערכת",
    adminEnablementHe: hasAgsClaim ? null : "מנהל Moodle מפעיל Assignment and Grade Services (LTI Advantage) בהגדרות הכלי.",
    fallbackRoute: "/gradebook-import", routeAction: hasAgsClaim ? "import_report" : "await_admin_enablement",
    mayShowDataNow: false, mustRefuseToCalculate: false,
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  const byLevel = (lvl) => domains.filter((d) => d.automationLevel === lvl).map((d) => d.labelHe);
  let nextBestAutomationStepHe;
  if (!hasLtiSession) {
    nextBestAutomationStepHe = "פתח את הכלי מתוך מרחב Moodle כדי לקבל הקשר חי.";
  } else if (!wsTokenConfigured && !hasNrpsClaim && !hasAgsClaim) {
    nextBestAutomationStepHe = "בקש ממנהל Moodle להפעיל Web Services (token) או NRPS/AGS. עד אז המסלול הוא ייבוא דוחות אמיתיים.";
  } else if (wsTokenConfigured && !wsSiteInfoLiveVerified) {
    nextBestAutomationStepHe = "אמת את ה-token דרך core_webservice_get_site_info כדי לפתוח שאיבה אוטומטית.";
  } else if (hasNrpsClaim) {
    nextBestAutomationStepHe = "ממש שליפת NRPS מאומתת + בדיקת בידוד לפני שמירה אוטומטית.";
  } else {
    nextBestAutomationStepHe = "המשך עם ייבוא דוחות אמיתיים. שדרוג לאוטומציה ייפתח עם הרשאות Moodle.";
  }

  res.json({
    ok: true,
    version: VER,
    teacher_release: "NO",
    teacher_release_ready: false,
    generated_at: new Date().toISOString(),
    signals_summary: {
      has_lti_session: hasLtiSession,
      has_course_identity: hasCourseIdentity,
      has_teacher_identity: hasTeacherIdentity,
      has_nrps_claim: hasNrpsClaim,
      has_ags_claim: hasAgsClaim,
      ws_token_configured: wsTokenConfigured,
      ws_site_info_live_verified: wsSiteInfoLiveVerified,
      roles_present: roles.length > 0,
    },
    domains,
    summary: {
      automatic_now_he: byLevel("AUTOMATIC"),
      automatic_ready_he: byLevel("AUTOMATIC_READY"),
      semi_auto_fallback_he: byLevel("SEMI_AUTOMATIC"),
      blocked_he: domains.filter((d) => d.automationLevel === "BLOCKED" || d.automationLevel === "REFUSE").map((d) => d.labelHe),
      next_best_automation_step_he: nextBestAutomationStepHe,
    },
    safety: {
      read_only: true,
      no_secrets: true,
      no_token_values: true,
      no_raw_student_rows: true,
      no_raw_grade_rows: true,
      no_raw_logs: true,
      no_pii: true,
      teacher_release_remains_no: true,
    },
  });
});
// <<< MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1 <<<

app.get("/api/automation/export-links", (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req) || sessionFromRequest(req);
  const courseId = String(session?.courseId || session?.course_id || session?.contextId || "").trim();

  if (!courseId) {
    return res.json({
      ok: false,
      error: "missing_course_id",
      message: "פתח את הכלי מתוך מרחב Moodle כדי שנוכל לזהות את הקורס ולהשלים את קישורי הדוחות.",
    });
  }

  const encoded = encodeURIComponent(courseId);
  res.json({
    ok: true,
    courseId,
    links: {
      activityCompletion: `/report/progress/index.php?course=${encoded}&activityinclude=all&activityorder=orderincourse&activitysection=-1`,
      gradebook: `/grade/report/grader/index.php?id=${encoded}`,
      gradebookExport: `/grade/export/txt/index.php?id=${encoded}`,
      logs: `/report/log/index.php?chooselog=1&id=${encoded}`,
      participants: `/user/index.php?id=${encoded}`,
    },
  });
});

// <<< MTH_CAPABILITY_DETECTOR_V1 <<<

// >>> MTH_PRACTICE_TIME_TRUTH_GATE_V1 >>>
app.get("/api/practice-time/status", (_req, res) => {
  noStore(res);
  const gate = buildPracticeTimeGate(store.logEvents, store.activitySessions, store.importBatches);
  res.json({
    ok: true,
    version: "MTH_PRACTICE_TIME_TRUTH_GATE_V1",
    teacher_release_ready: false,
    ...gate,
    safety: {
      no_student_rows_returned: true,
      no_synthetic_time: true,
      no_fake_logs: true,
      aggregate_only: true
    },
    checked_at: new Date().toISOString()
  });
});
// <<< MTH_PRACTICE_TIME_TRUTH_GATE_V1 <<<


// >>> MTH_MOODLE_WS_READINESS_V1 >>>
function buildMoodleWsReadinessResponse({ configured, probeResult = null }) {
  const baseUrl = env("MOODLE_WS_BASE_URL", "https://moodlemoe.lms.education.gov.il");
  let host = "unknown";
  try { host = new URL(baseUrl).hostname; } catch { /* keep unknown */ }

  const safety = {
    no_token_returned: true,
    no_student_rows: true,
    no_grades: true,
    no_emails: true,
    no_user_ids: true,
    no_raw_moodle_response: true
  };

  if (!configured) {
    return {
      ok: true,
      version: "MTH_MOODLE_WS_READINESS_V1",
      configured: false,
      verified: false,
      status: "missing_env",
      host,
      function_checked: "core_webservice_get_site_info",
      checkedAt: new Date().toISOString(),
      failure_category: null,
      moodle_release: null,
      functions_available_count: null,
      required_env: ["MOODLE_WS_TOKEN"],
      required_admin_steps: [
        "Enable Web Services: Moodle Site Administration > Advanced features > Enable web services: YES",
        "Enable REST protocol: Site Administration > Plugins > Web services > Manage protocols > Enable 'REST protocol'",
        "Create a dedicated web service user with appropriate Moodle capabilities",
        "Create a token: Site Administration > Plugins > Web services > Manage tokens > Add token",
        "Assign at minimum: core_webservice_get_site_info capability to the token",
        "Set MOODLE_WS_TOKEN in Render environment variables — never commit to GitHub"
      ],
      safety
    };
  }

  if (!probeResult) {
    return {
      ok: true,
      version: "MTH_MOODLE_WS_READINESS_V1",
      configured: true,
      verified: false,
      status: "configured_not_verified",
      host,
      function_checked: "core_webservice_get_site_info",
      checkedAt: new Date().toISOString(),
      failure_category: null,
      moodle_release: null,
      functions_available_count: null,
      required_env: [],
      required_admin_steps: [],
      safety
    };
  }

  return {
    ok: probeResult.ok,
    version: "MTH_MOODLE_WS_READINESS_V1",
    configured: true,
    verified: probeResult.verified || false,
    status: probeResult.status,
    host,
    function_checked: "core_webservice_get_site_info",
    checkedAt: new Date().toISOString(),
    failure_category: probeResult.failure_category || null,
    moodle_release: probeResult.moodle_release || null,
    functions_available_count: probeResult.functions_available_count ?? null,
    required_env: [],
    required_admin_steps: probeResult.required_admin_steps || [],
    safety
  };
}

async function probeMoodleWsSiteInfo() {
  const token = env("MOODLE_WS_TOKEN");
  const baseUrl = env("MOODLE_WS_BASE_URL", "https://moodlemoe.lms.education.gov.il");
  if (!token) return null;

  if (typeof fetch !== "function") {
    return { ok: false, verified: false, status: "runtime_error", failure_category: "fetch_not_available", required_admin_steps: [] };
  }

  const endpoint = `${baseUrl.replace(/\/+$/, "")}/webservice/rest/server.php`;
  const body = new URLSearchParams({
    wstoken: token,
    wsfunction: "core_webservice_get_site_info",
    moodlewsrestformat: "json"
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let rawRes;
  try {
    rawRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && err.name === "AbortError") {
      return { ok: false, verified: false, status: "timeout", failure_category: "timeout", required_admin_steps: [] };
    }
    const msg = String(err?.message || "").toLowerCase().slice(0, 120);
    const category = msg.includes("econnrefused") ? "connection_refused"
      : msg.includes("enotfound") ? "dns_error"
      : "network_error";
    return { ok: false, verified: false, status: "network_error", failure_category: category, required_admin_steps: [] };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!rawRes.ok) {
    return { ok: false, verified: false, status: "http_error", failure_category: `http_${rawRes.status}`, required_admin_steps: [] };
  }

  let parsed;
  try { parsed = await rawRes.json(); } catch {
    return { ok: false, verified: false, status: "json_parse_error", failure_category: "json_parse_error", required_admin_steps: [] };
  }

  if (parsed && parsed.errorcode) {
    const code = String(parsed.errorcode || "").toLowerCase();
    if (code.includes("invalidtoken") || code.includes("accessdenied")) {
      return {
        ok: false, verified: false, status: "invalid_token", failure_category: "invalid_token",
        required_admin_steps: ["Verify the token value is correct and has not expired in Moodle."]
      };
    }
    if (code.includes("webservicesdisabled") || code.includes("enablewsdescription") || code.includes("servicenotavailable")) {
      return {
        ok: false, verified: false, status: "blocked_by_admin_enablement", failure_category: "webservices_disabled",
        required_admin_steps: [
          "Enable Web Services: Site Administration > Advanced features > Enable web services: YES",
          "Enable REST protocol: Site Administration > Plugins > Web services > Manage protocols > Enable 'REST protocol'"
        ]
      };
    }
    return { ok: false, verified: false, status: "moodle_error", failure_category: code.slice(0, 60), required_admin_steps: [] };
  }

  const release = typeof parsed.release === "string" ? parsed.release.slice(0, 40) : null;
  const funcsCount = Array.isArray(parsed.functions) ? parsed.functions.length : null;

  return {
    ok: true,
    verified: true,
    status: "verified_site_info",
    moodle_release: release,
    functions_available_count: funcsCount,
    failure_category: null,
    required_admin_steps: []
  };
}

app.get("/api/automation/moodle-webservices/readiness", async (req, res) => {
  noStore(res);
  const configured = Boolean(env("MOODLE_WS_TOKEN"));
  const probeResult = configured ? await probeMoodleWsSiteInfo() : null;
  res.json(buildMoodleWsReadinessResponse({ configured, probeResult }));
});
// <<< MTH_MOODLE_WS_READINESS_V1 <<<


// MTH_KEEPALIVE_V1 — prevents Render cold start
app.get("/ping", (_req, res) => { res.json({ ok: true, t: Date.now() }); });

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
    return res.redirect(303, base + "/lti?t=" + encodeURIComponent(session.sessionToken) + "&next=" + encodeURIComponent("/"));
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
      moodleUsername: body.ext_user_username || null,
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

    await recordSupabaseSession({ session_token: sessionToken, course_id: body.context_id, course_title: body.context_title, moodle_username: body.ext_user_username || null, role: "teacher", created_at: new Date().toISOString() });

    setSession(res, session);
    noStore(res);
    return res.redirect(303, publicBaseUrl(req) + "/lti?t=" + encodeURIComponent(sessionToken) + "&course=" + encodeURIComponent(space.title) + "&next=" + encodeURIComponent("/"));
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

app.post("/api/import", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const body = req.body || {};
  const reportType = body.report_type || body.reportType;
  if (reportType === "logs") {
    const logsImport = buildMoodleLogsImport(Array.isArray(body.payload) ? body.payload : [], session, {
      file_name: body.file_name || null,
      source_kind: body.source_kind || "file",
      detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null
    });

    if (!logsImport.ok) {
      return res.status(400).json({
        ok: false,
        error: "MOODLE_LOGS_IMPORT_NOT_READY",
        detail: logsImport.warnings.join(" | "),
        rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
        skipped_rows: logsImport.skipped_rows,
        safety: {
          no_fake_logs: true,
          no_practice_time_invented: true,
          no_teacher_release_change: true
        }
      });
    }

    const sbWrite = await writeMoodleLogsToSupabase(logsImport, session);
    if (!sbWrite.ok && !sbWrite.skipped) {
      return res.status(502).json({
        ok: false,
        error: sbWrite.reason,
        detail: sbWrite.detail || null,
        code: sbWrite.code || null,
        note: "Logs import was NOT persisted to durable storage.",
        safety: {
          no_fake_logs: true,
          no_practice_time_invented: true,
          no_teacher_release_change: true
        }
      });
    }

    if (!Array.isArray(store.importBatches)) store.importBatches = [];
    if (!Array.isArray(store.logEvents)) store.logEvents = [];

    store.importBatches.push(logsImport.batch);
    store.logEvents = [
      ...store.logEvents.filter(item => !logsImport.log_events.some(next => next.id === item.id)),
      ...logsImport.log_events
    ];

    store.settings.lastSyncAt = new Date().toISOString();
    saveStore();

    return res.json({
      ok: true,
      mode: "moodle-logs-import",
      version: "MTH_MOODLE_LOGS_IMPORT_V1",
      batch_id: logsImport.batch.id,
      rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
      log_events_written: sbWrite.skipped ? 0 : sbWrite.log_events_written,
      skipped_rows: logsImport.skipped_rows,
      warnings: logsImport.warnings,
      supabase: sbWrite.skipped
        ? { written: false, reason: sbWrite.reason }
        : {
            written: true,
            log_events_written: sbWrite.log_events_written,
            log_events_variant: sbWrite.log_events_variant,
            import_batch_variant: sbWrite.import_batch_variant
          },
      safety: {
        no_fake_logs: true,
        no_practice_time_invented: true,
        no_teacher_release_change: true,
        raw_logs_not_returned: true
      }
    });
  }

  if (reportType === "grades") {
    const gradebook = buildWideGradebookImport(Array.isArray(body.payload) ? body.payload : [], session, {
      file_name: body.file_name || null,
      source_kind: body.source_kind || "file",
      detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null
    });

    if (!gradebook.ok) {
      return res.status(400).json({
        ok: false,
        error: "GRADEBOOK_WIDE_IMPORT_NOT_READY",
        detail: gradebook.warnings.join(" | "),
        grade_headers_detected: gradebook.grade_headers.length,
        rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
        safety: {
          no_missing_grades_as_zero: true,
          no_fake_grades: true,
          no_teacher_release_change: true
        }
      });
    }

    const sbWrite = await writeWideGradebookToSupabase(gradebook, session);
    if (!sbWrite.ok && !sbWrite.skipped) {
      return res.status(502).json({
        ok: false,
        error: sbWrite.reason,
        detail: sbWrite.detail || null,
        code: sbWrite.code || null,
        note: "Gradebook import was NOT persisted to durable storage.",
        safety: {
          no_missing_grades_as_zero: true,
          no_fake_grades: true,
          no_teacher_release_change: true
        }
      });
    }

    if (!Array.isArray(store.importBatches)) store.importBatches = [];
    if (!Array.isArray(store.gradeItems)) store.gradeItems = [];
    if (!Array.isArray(store.grades)) store.grades = [];

    store.importBatches.push(gradebook.batch);
    store.gradeItems = [
      ...store.gradeItems.filter(item => !gradebook.grade_items.some(next => next.id === item.id)),
      ...gradebook.grade_items
    ];
    store.grades = [
      ...store.grades.filter(item => !gradebook.grade_results.some(next => next.id === item.id)),
      ...gradebook.grade_results.map(result => ({
        id: result.id,
        student_id: result.student_id,
        studentId: result.student_id,
        grade_item_id: result.grade_item_id,
        task_id: result.grade_item_id,
        taskId: result.grade_item_id,
        raw_value: result.raw_value,
        grade: result.grade,
        numeric_value: result.grade,
        updated_at: result.created_at,
        updatedAt: result.created_at
      }))
    ];

    store.settings.lastSyncAt = new Date().toISOString();
    saveStore();

    return res.json({
      ok: true,
      mode: "wide-gradebook-import",
      version: "MTH_WIDE_GRADEBOOK_IMPORT_V1",
      batch_id: gradebook.batch.id,
      rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
      grade_columns_detected: gradebook.grade_headers.length,
      grade_items_written: sbWrite.skipped ? 0 : sbWrite.grade_items_written,
      grade_results_written: sbWrite.skipped ? 0 : sbWrite.grade_results_written,
      skipped_students: gradebook.skipped_students,
      skipped_empty_grades: gradebook.skipped_empty_grades,
      warnings: gradebook.warnings,
      supabase: sbWrite.skipped
        ? { written: false, reason: sbWrite.reason }
        : {
            written: true,
            grade_items_written: sbWrite.grade_items_written,
            grade_results_written: sbWrite.grade_results_written,
            import_batch_variant: sbWrite.import_batch_variant
          },
      safety: {
        no_missing_grades_as_zero: true,
        no_fake_grades: true,
        no_teacher_release_change: true
      }
    });
  }

  if (reportType === "completion") {
    const courseImport = buildCourseStructureImport(Array.isArray(body.payload) ? body.payload : [], session, {
      file_name: body.file_name || null,
      source_kind: body.source_kind || "file",
      detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null
    });

    if (!courseImport.ok) {
      return res.status(400).json({
        ok: false,
        error: "COURSE_STRUCTURE_IMPORT_NOT_READY",
        detail: courseImport.warnings.join(" | "),
        activity_headers_detected: courseImport.activity_headers.length,
        rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
        safety: { no_fake_tasks: true, no_teacher_release_change: true }
      });
    }

    const sbWrite = await writeCourseStructureToSupabase(courseImport, session);
    if (!sbWrite.ok && !sbWrite.skipped) {
      return res.status(502).json({
        ok: false,
        error: sbWrite.reason,
        detail: sbWrite.detail || null,
        code: sbWrite.code || null,
        note: "Course structure import was NOT persisted to durable storage.",
        safety: { no_fake_tasks: true, no_teacher_release_change: true }
      });
    }

    if (!Array.isArray(store.importBatches)) store.importBatches = [];
    if (!Array.isArray(store.tasks)) store.tasks = [];
    if (!Array.isArray(store.chapters)) store.chapters = [];

    store.importBatches.push(courseImport.batch);
    store.chapters = [
      ...store.chapters.filter(c => !courseImport.sections.some(next => next.id === c.id)),
      ...courseImport.sections
    ];
    store.tasks = [
      ...store.tasks.filter(t => !courseImport.tasks.some(next => next.id === t.id)),
      ...courseImport.tasks
    ];
    store.settings.lastSyncAt = new Date().toISOString();
    saveStore();

    return res.json({
      ok: true,
      mode: "course-structure-import",
      version: "MTH_COURSE_STRUCTURE_IMPORT_V1",
      batch_id: courseImport.batch.id,
      rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
      activity_headers_detected: courseImport.activity_headers.length,
      sections_found: courseImport.sections.length,
      sections_written: sbWrite.skipped ? 0 : sbWrite.sections_written,
      tasks_written: sbWrite.skipped ? 0 : sbWrite.tasks_written,
      completions_written: sbWrite.skipped ? 0 : sbWrite.completions_written,
      skipped_students: courseImport.skipped_students,
      section_column_used: courseImport.section_column_used,
      warnings: courseImport.warnings,
      supabase: sbWrite.skipped
        ? { written: false, reason: sbWrite.reason }
        : {
            written: true,
            sections_written: sbWrite.sections_written,
            tasks_written: sbWrite.tasks_written,
            completions_written: sbWrite.completions_written,
            completions_skipped: sbWrite.completions_skipped,
            import_batch_variant: sbWrite.import_batch_variant
          },
      safety: { no_fake_tasks: true, no_fake_sections: true, no_teacher_release_change: true }
    });
  }

  if (reportType !== "students") {
    return res.status(400).json({
      ok: false,
      error: "UNSUPPORTED_REPORT_TYPE_FOR_RENDER_IMPORT",
      detail: "Supported now: Participants/Students and wide Gradebook. Logs and completion are still intentionally blocked until implemented from real Moodle exports."
    });
  }

  const result = upsertImportedStudents(Array.isArray(body.payload) ? body.payload : [], session);

  if (!Array.isArray(store.importBatches)) store.importBatches = [];
  const batchId = crypto.randomUUID();
  const batchStatus = result.skipped > 0 ? "partial" : "completed";
  const batchSourceKind = body.source_kind || "unknown";
  const batch = {
    id: batchId,
    report_type: "students",
    file_name: body.file_name || null,
    row_count: result.row_count,
    status: batchStatus,
    imported_by_username: session.moodleUsername || session.teacherName || null,
    detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null,
    source_kind: batchSourceKind,
    warnings: result.warnings,
    created_at: new Date().toISOString(),
    ...buildBatchProvenance({ import_batch_id: batchId, source_kind: batchSourceKind, source_name: body.file_name || null, status: batchStatus, row_count: result.row_count }, session)
  };

  const sbWrite = await writeImportToSupabase(batch, result.students, session);
  if (!sbWrite.ok && !sbWrite.skipped) {
    return res.status(502).json({
      ok: false,
      error: sbWrite.reason,
      detail: sbWrite.detail || null,
      code: sbWrite.code || null,
      note: "Import was NOT persisted to durable storage. Retry or contact admin."
    });
  }

  store.importBatches.push(batch);
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();

  res.json({
    ok: true,
    batch_id: batch.id,
    row_count: result.row_count,
    inserted: result.inserted,
    updated: result.updated,
    skipped: result.skipped,
    warnings: result.warnings,
    supabase: sbWrite.skipped
      ? { written: false, reason: sbWrite.reason }
      : { written: true, students_written: sbWrite.students_written }
  });
});

// >>> MTH_COURSE_STRUCTURE_ENDPOINT_V1 >>>
app.post("/api/import/course-structure", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const body = req.body || {};
  const courseImport = buildCourseStructureImport(Array.isArray(body.payload) ? body.payload : [], session, {
    file_name: body.file_name || null,
    source_kind: body.source_kind || "file",
    detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null
  });

  if (!courseImport.ok) {
    return res.status(400).json({
      ok: false,
      error: "COURSE_STRUCTURE_IMPORT_NOT_READY",
      detail: courseImport.warnings.join(" | "),
      activity_headers_detected: courseImport.activity_headers.length,
      rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
      safety: { no_fake_tasks: true, no_teacher_release_change: true }
    });
  }

  const sbWrite = await writeCourseStructureToSupabase(courseImport, session);
  if (!sbWrite.ok && !sbWrite.skipped) {
    return res.status(502).json({
      ok: false,
      error: sbWrite.reason,
      detail: sbWrite.detail || null,
      code: sbWrite.code || null,
      note: "Course structure import was NOT persisted to durable storage.",
      safety: { no_fake_tasks: true, no_teacher_release_change: true }
    });
  }

  if (!Array.isArray(store.importBatches)) store.importBatches = [];
  if (!Array.isArray(store.tasks)) store.tasks = [];
  if (!Array.isArray(store.chapters)) store.chapters = [];

  store.importBatches.push(courseImport.batch);
  store.chapters = [
    ...store.chapters.filter(c => !courseImport.sections.some(next => next.id === c.id)),
    ...courseImport.sections
  ];
  store.tasks = [
    ...store.tasks.filter(t => !courseImport.tasks.some(next => next.id === t.id)),
    ...courseImport.tasks
  ];
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();

  return res.json({
    ok: true,
    mode: "course-structure-import",
    version: "MTH_COURSE_STRUCTURE_ENDPOINT_V1",
    batch_id: courseImport.batch.id,
    rows_seen: Array.isArray(body.payload) ? body.payload.length : 0,
    activity_headers_detected: courseImport.activity_headers.length,
    sections_found: courseImport.sections.length,
    sections_written: sbWrite.skipped ? 0 : sbWrite.sections_written,
    tasks_written: sbWrite.skipped ? 0 : sbWrite.tasks_written,
    completions_written: sbWrite.skipped ? 0 : sbWrite.completions_written,
    skipped_students: courseImport.skipped_students,
    section_column_used: courseImport.section_column_used,
    warnings: courseImport.warnings,
    supabase: sbWrite.skipped
      ? { written: false, reason: sbWrite.reason }
      : {
          written: true,
          sections_written: sbWrite.sections_written,
          tasks_written: sbWrite.tasks_written,
          completions_written: sbWrite.completions_written,
          completions_skipped: sbWrite.completions_skipped,
          import_batch_variant: sbWrite.import_batch_variant
        },
    safety: { no_fake_tasks: true, no_fake_sections: true, no_teacher_release_change: true }
  });
});
// <<< MTH_COURSE_STRUCTURE_ENDPOINT_V1 <<<

// MTH_API_IMPORTS_STUDENTS_FROM_SUPABASE_V1
// Known issue #6: this endpoint previously read the volatile in-memory
// `store.students` (which resets to [] on Render cold-start) before any
// Supabase fallback. It now queries the persisted `students` rows directly,
// scoped to the verified import session's space_id, ordered by full_name and
// capped at 500, and falls back to the in-memory store only when Supabase is
// unconfigured or the query errors. The { ok, students } response contract and
// importedStudentDto shape are unchanged.
app.get("/api/imports/students", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const spaceId = session.spaceId || "unknown-space";

  const fromStore = () =>
    store.students
      .filter(student => !student.space_id || student.space_id === spaceId)
      .map(importedStudentDto)
      .filter(student => student.full_name);

  const supabase = getSupabaseClient();
  if (!supabase) return res.json({ ok: true, students: fromStore() });

  try {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, email, external_username, external_id, updated_at")
      .eq("space_id", spaceId)
      .order("full_name", { ascending: true })
      .limit(500);
    if (error) return res.json({ ok: true, students: fromStore() });
    const students = (Array.isArray(data) ? data : [])
      .map(importedStudentDto)
      .filter(student => student.full_name);
    return res.json({ ok: true, students });
  } catch {
    return res.json({ ok: true, students: fromStore() });
  }
});

/* MTH_NRPS_SERVER_OWNED_SYNC_V1
   Server-owned roster sync. The roster of record is the live NRPS membership the
   SERVER fetches for the current verified LTI 1.3 session (via the shared
   lti13FetchCurrentNrpsMembers + classifyNrpsMember), NOT a client-supplied list.
   The client should now POST token-only. Only role_kind === "learner" members are
   persisted (space-isolated); instructors and unknown/ambiguous roles are counted
   but never stored as students. No invented data; numbers come only from the live
   NRPS response.

   Persisted identity is derived with nrpsMemberIdHash (the same hash the preview
   exposed as members_named[].id), so learners synced by the legacy client path keep
   the exact same stable student id and are UPDATED in place — the existing synced
   learners are preserved, not duplicated.

   Backward compatibility: if the server cannot fetch NRPS itself (env not
   configured, no live NRPS claim for the session, or token/membership failure) the
   endpoint falls back to a client-supplied `students` payload when present. This
   legacy payload is treated as compat/fallback only and is NOT authoritative.
   Manual report import remains a separate, untouched path. */
function persistNrpsLearners(members, spaceId) {
  const now = new Date().toISOString();
  if (!Array.isArray(store.students)) store.students = [];
  let inserted = 0;
  let updated = 0;
  let learnersSeen = 0;
  let instructorsSeen = 0;
  let unknownSeen = 0;

  for (const member of members) {
    const fullName = nrpsMemberFullName(member);
    const roleKind = classifyNrpsMember(member);
    if (roleKind === "instructor") { instructorsSeen += 1; continue; }
    if (roleKind !== "learner") { unknownSeen += 1; continue; }
    learnersSeen += 1;
    if (!fullName) continue;
    // Identity: a raw NRPS member is hashed to the 16-char id the preview
    // exposed; a legacy client member already carries that hash in `precomputedId`
    // (sent originally as members_named[].id) so we must NOT hash it again. Either
    // way the resulting stable student id matches the previously synced learners.
    const identity = member?.precomputedId != null
      ? String(member.precomputedId)
      : nrpsMemberIdHash(member);
    const id = stableId("student", spaceId + "|nrps|" + identity);
    const record = {
      id,
      full_name: fullName,
      fullName,
      email: null,
      external_username: null,
      external_id: identity,
      moodle_user_id: null,
      lis_person_sourcedid: null,
      id_number: null,
      space_id: spaceId,
      source: "moodle-nrps-sync",
      updated_at: now,
      updatedAt: now
    };
    const index = store.students.findIndex(item => item.id === id);
    if (index >= 0) {
      store.students[index] = { ...store.students[index], ...record };
      updated += 1;
    } else {
      store.students.push(record);
      inserted += 1;
    }
  }

  // Store a counts-only teacher/team breakdown in the existing settings object
  // (no new schema, no names, no PII). This is the "safe existing place" for the
  // instructor/unknown breakdown so the dashboard can read truthful aggregates.
  if (!store.settings || typeof store.settings !== "object") store.settings = {};
  store.settings.nrpsRosterBreakdown = {
    space_id: spaceId,
    learners: learnersSeen,
    instructors: instructorsSeen,
    unknown: unknownSeen,
    total_members: learnersSeen + instructorsSeen + unknownSeen,
    updated_at: now
  };

  if (inserted || updated) {
    store.settings.lastSyncAt = now;
  }
  // Always persist so the counts-only breakdown survives even on a zero-delta sync.
  saveStore();

  return { inserted, updated, learnersSeen, instructorsSeen, unknownSeen };
}

// Legacy client-supplied roster shaped like members_named -> classify-equivalent
// member objects so persistNrpsLearners can treat both paths identically.
function legacyClientRosterToMembers(incoming) {
  return (Array.isArray(incoming) ? incoming : []).map(m => {
    const name = String(m?.name || "").trim();
    let roles;
    if (typeof m?.role_kind === "string") {
      roles = m.role_kind === "instructor" ? ["Instructor"]
        : m.role_kind === "learner" ? ["Learner"]
        : ["__unknown__"];
    } else {
      roles = m?.is_instructor ? ["Instructor"] : ["Learner"];
    }
    // Preserve the client-sent hashed id (already a members_named[].id hash) so the
    // stable student id matches the original client-path behavior without re-hashing.
    return { name, roles, precomputedId: m?.id != null ? String(m.id) : undefined };
  });
}

app.post("/api/imports/nrps-sync", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const spaceId = session.spaceId || "unknown-space";

  let members = null;
  let mode = "server-owned-nrps";
  let serverFetchStage = null;

  try {
    const result = await lti13FetchCurrentNrpsMembers(req);
    if (result.ok) {
      members = result.members;
    } else {
      serverFetchStage = result.stage || "unknown";
    }
  } catch (error) {
    serverFetchStage = "unexpected";
  }

  // Backward-compatibility fallback: only when the server could not own the
  // fetch. The client payload is NOT authoritative; manual import is unaffected.
  let usedLegacyPayload = false;
  if (!Array.isArray(members)) {
    const incoming = Array.isArray(req.body?.students) ? req.body.students : [];
    if (incoming.length) {
      members = legacyClientRosterToMembers(incoming);
      mode = "legacy-client-payload-fallback";
      usedLegacyPayload = true;
    }
  }

  if (!Array.isArray(members)) {
    return res.status(200).json({
      ok: false,
      mode: "server-owned-nrps",
      error: "NO_SERVER_OWNED_NRPS_AND_NO_CLIENT_FALLBACK",
      server_fetch_stage: serverFetchStage,
      next_required: [
        "Open המודל החכם from Moodle so a live LTI 1.3 NRPS session exists, then retry.",
        "If NRPS is unavailable in this space, use manual report import."
      ],
      no_fake_data: true
    });
  }

  const counts = persistNrpsLearners(members, spaceId);

  res.json({
    ok: true,
    mode,
    used_legacy_payload: usedLegacyPayload,
    learners_inserted: counts.inserted,
    learners_updated: counts.updated,
    instructors_seen: counts.instructorsSeen,
    unknown_seen: counts.unknownSeen,
    total_members: members.length,
    // Legacy fields kept so existing clients that read them keep working.
    inserted: counts.inserted,
    updated: counts.updated,
    total: counts.inserted + counts.updated,
    skipped_instructor: counts.instructorsSeen,
    skipped_unknown: counts.unknownSeen,
    no_fake_data: true
  });
});
/* MTH_NRPS_SERVER_OWNED_SYNC_V1_END */

app.get("/api/imports/student-profile", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const studentId = String(req.query.student_id || req.query.s || "");
  if (!studentId) return res.status(400).json({ ok: false, error: "MISSING_STUDENT_ID" });

  const spaceId = session.spaceId || "unknown-space";
  const inSpace = (row) => !row || !row.space_id && !row.course_id || row.space_id === spaceId || row.course_id === spaceId;

  // Resolve the student record. The listing endpoint prefers Supabase, so a
  // student id shown there may not exist in the local store. To guarantee every
  // listed student opens a valid profile, fall back to a space-isolated Supabase
  // lookup before treating the id as unknown. Grades/completion/logs still come
  // only from the local store (their datasets live there); when none exist the
  // profile renders the calm empty-data state, not an error.
  let rawStudent = store.students.find(s => s.id === studentId && (!s.space_id || s.space_id === spaceId));
  if (!rawStudent) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, full_name, email, external_username, external_id, updated_at")
          .eq("space_id", spaceId)
          .eq("id", studentId)
          .limit(1)
          .maybeSingle();
        if (!error && data && data.id) rawStudent = data;
      } catch {
        // Fall through to STUDENT_NOT_FOUND below.
      }
    }
  }
  if (!rawStudent) return res.json({ ok: false, error: "STUDENT_NOT_FOUND" });
  const student = importedStudentDto(rawStudent);

  const itemNameById = Object.fromEntries(
    (Array.isArray(store.gradeItems) ? store.gradeItems : [])
      .filter(inSpace)
      .map(it => [it.id, { name: it.name || it.item_name || it.raw_header || "", type: it.item_type || null, max: typeof it.max_grade === "number" ? it.max_grade : null }])
  );

  const grades = (Array.isArray(store.grades) ? store.grades : [])
    .filter(inSpace)
    .filter(g => (g.student_id || g.studentId) === studentId)
    .map(g => {
      const itemId = g.grade_item_id || g.gradeItemId || g.task_id || g.taskId || "";
      const meta = itemNameById[itemId] || { name: g.student_full_name ? "" : "", type: null, max: null };
      const numeric = typeof g.grade === "number" ? g.grade : typeof g.numeric_value === "number" ? g.numeric_value : null;
      return {
        grade_item_id: itemId,
        item_name: meta.name || itemId,
        item_type: meta.type,
        max_grade: meta.max,
        raw_value: g.raw_value != null ? String(g.raw_value) : (g.grade != null ? String(g.grade) : null),
        numeric_value: numeric,
        is_missing: numeric === null
      };
    });

  const completion = (Array.isArray(store.completionRows) ? store.completionRows : [])
    .filter(inSpace)
    .filter(c => (c.student_id || c.studentId) === studentId)
    .map(c => ({
      task_id: c.task_id || c.taskId || "",
      task_name: c.task_name || c.taskName || c.task_id || "",
      task_type: c.task_type || null,
      chapter_id: c.chapter_id || c.section_id || null,
      is_complete: typeof c.is_complete === "boolean" ? c.is_complete : (c.completed_at ? true : null),
      status: c.status || null,
      completed_at: c.completed_at || c.completedAt || null
    }));

  const events = (Array.isArray(store.logEvents) ? store.logEvents : [])
    .filter(inSpace)
    .filter(e => (e.student_id || e.studentId) === studentId);
  const eventTimes = events.map(e => e.timestamp || e.created_at || e.time).filter(Boolean).sort();
  const days = new Set(eventTimes.map(t => String(t).slice(0, 10)));

  res.json({
    ok: true,
    student: {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      external_username: student.external_username,
      external_id: student.external_id,
      updated_at: student.updated_at || new Date().toISOString()
    },
    grades,
    completion,
    activity: {
      event_count: events.length,
      first_event: eventTimes[0] || null,
      last_event: eventTimes[eventTimes.length - 1] || null,
      active_days: days.size,
      top_components: []
    }
  });
});

app.get("/api/imports/grades-matrix", (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const spaceId = session.spaceId || "unknown-space";
  const inSpace = (row) => !row || !row.space_id && !row.course_id || row.space_id === spaceId || row.course_id === spaceId;

  const students = store.students
    .filter(s => !s.space_id || s.space_id === spaceId)
    .map(importedStudentDto)
    .filter(s => s.full_name)
    .map(s => ({ id: s.id, full_name: s.full_name }));

  const items = (Array.isArray(store.gradeItems) ? store.gradeItems : [])
    .filter(inSpace)
    .map(it => ({
      id: it.id,
      item_name: it.name || it.item_name || it.raw_header || "",
      item_type: it.item_type || null,
      max_grade: typeof it.max_grade === "number" ? it.max_grade : null
    }))
    .filter(it => it.item_name);

  const grades = (Array.isArray(store.grades) ? store.grades : [])
    .filter(inSpace)
    .map(g => {
      const numeric = typeof g.grade === "number" ? g.grade
        : typeof g.numeric_value === "number" ? g.numeric_value : null;
      return {
        student_id: g.student_id || g.studentId || null,
        grade_item_id: g.grade_item_id || g.gradeItemId || g.task_id || g.taskId || null,
        raw_value: g.raw_value != null ? String(g.raw_value) : (g.grade != null ? String(g.grade) : null),
        numeric_value: numeric,
        is_missing: numeric === null
      };
    })
    .filter(g => g.student_id && g.grade_item_id);

  res.json({ ok: true, students, items, grades });
});

// >>> MTH_SCOPED_IMPORTS_OVERVIEW_V2_SUPABASE >>>
app.get("/api/imports/overview", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  const spaceId = session.spaceId || "unknown-space";
  const courseId = session.courseId || session.course_id || spaceId;
  try {
    const [stud, gi, gr, le] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }).eq("space_id", spaceId),
      supabase.from("grade_items").select("id", { count: "exact", head: true }).eq("course_id", courseId),
      supabase.from("grade_results").select("id", { count: "exact", head: true }).eq("course_id", courseId),
      supabase.from("log_events").select("id", { count: "exact", head: true }).eq("course_id", courseId),
    ]);
    return res.json({ students_count: stud.count??0, grade_items_count: gi.count??0, grades_count: gr.count??0, log_events_count: le.count??0, chapters_count: 0, tasks_count: 0, batches: [] });
  } catch(e) {
    const inSpace = (row) => !row||(!row.space_id&&!row.course_id)||row.space_id===spaceId||row.course_id===spaceId;
    return res.json({ students_count: store.students.filter(s=>!s.space_id||s.space_id===spaceId).length, grade_items_count: (Array.isArray(store.gradeItems)?store.gradeItems:[]).filter(inSpace).length, grades_count: (Array.isArray(store.grades)?store.grades:[]).filter(inSpace).length, log_events_count: (Array.isArray(store.logEvents)?store.logEvents:[]).filter(inSpace).length, chapters_count: 0, tasks_count: 0, batches: [] });
  }
});
// <<< MTH_SCOPED_IMPORTS_OVERVIEW_V2_SUPABASE >>>

// >>> MTH_SCOPED_TIME_RANGE_V1_SUPABASE >>>
// Practice/time report reads persisted `log_events` from Supabase, scoped to the
// caller's course_id and an optional [from, to] date range. Practice time is an
// estimate derived by sessionizing real log events (no invented durations): events
// for one student are grouped, ordered by event_time, and split into sessions when
// the gap between consecutive events exceeds PRACTICE_GAP_SECONDS. Falls back to the
// in-memory store only when Supabase is unconfigured or the query errors.
const PRACTICE_GAP_SECONDS = 1800; // 30 minutes between events ends a session

// MTH_LOGS_PRACTICE_TIME_TRUTH_V1
// Detect whether the imported log rows carry an OFFICIAL duration field from
// Moodle. Moodle standard logs record discrete events, not elapsed time, so a
// duration source is normally absent. We never invent one: time is presented as
// an estimate (sessionization heuristic) unless a real duration field exists.
function rowOfficialDurationSeconds(row) {
  const raw = row?.duration_seconds ?? row?.duration ?? row?.timeDiff ?? null;
  const num = Number(raw);
  if (raw === null || raw === undefined || !Number.isFinite(num) || num <= 0) return null;
  return num;
}

function buildPracticeTimeFromLogEvents(rows, { from, to, studentId }) {
  const allRows = Array.isArray(rows) ? rows : [];
  // Truthful source detection — is there any real duration field at all?
  const rowsWithOfficialDuration = allRows.filter(r => rowOfficialDurationSeconds(r) !== null).length;
  const hasOfficialDuration = rowsWithOfficialDuration > 0;

  // Safe activity-event counts (FACT, not duration) for recent windows.
  const nowMs = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  let events24h = 0;
  let eventsWeek = 0;

  const byStudent = new Map();
  for (const row of allRows) {
    const at = row.event_time || row.created_at || null;
    if (!at) continue;
    const key = String(row.moodle_user_id || row.actor_full_name || "unknown");
    if (studentId && key !== studentId) continue;
    const ms = Date.parse(at);
    if (Number.isFinite(ms)) {
      if (nowMs - ms <= DAY_MS) events24h += 1;
      if (nowMs - ms <= 7 * DAY_MS) eventsWeek += 1;
    }
    let bucket = byStudent.get(key);
    if (!bucket) {
      bucket = { student_id: key, student_name: row.actor_full_name || null, events: [] };
      byStudent.set(key, bucket);
    }
    if (!bucket.student_name && row.actor_full_name) bucket.student_name = row.actor_full_name;
    bucket.events.push({ at, ms });
  }

  const days = [];
  const perStudent = [];

  for (const bucket of byStudent.values()) {
    const events = bucket.events.filter(e => Number.isFinite(e.ms)).sort((a, b) => a.ms - b.ms);
    if (!events.length) continue;

    // Split into sessions on gaps, accumulating per ISO day.
    const dayAgg = new Map();
    let sessionStart = events[0];
    let prev = events[0];
    let sessionEventCount = 1;

    const flushSession = (startEvt, endEvt, evtCount) => {
      const day = String(startEvt.at).slice(0, 10);
      const durationSeconds = Math.max(0, Math.round((endEvt.ms - startEvt.ms) / 1000));
      let d = dayAgg.get(day);
      if (!d) {
        d = { day, total_seconds: 0, event_count: 0, session_count: 0, first_ms: startEvt.ms, last_ms: endEvt.ms, windows: [] };
        dayAgg.set(day, d);
      }
      d.total_seconds += durationSeconds;
      d.event_count += evtCount;
      d.session_count += 1;
      d.first_ms = Math.min(d.first_ms, startEvt.ms);
      d.last_ms = Math.max(d.last_ms, endEvt.ms);
      d.windows.push({
        started_at: startEvt.at,
        ended_at: endEvt.at,
        duration_seconds: durationSeconds,
        event_count: evtCount
      });
    };

    for (let i = 1; i < events.length; i += 1) {
      const cur = events[i];
      if ((cur.ms - prev.ms) / 1000 > PRACTICE_GAP_SECONDS) {
        flushSession(sessionStart, prev, sessionEventCount);
        sessionStart = cur;
        sessionEventCount = 1;
      } else {
        sessionEventCount += 1;
      }
      prev = cur;
    }
    flushSession(sessionStart, prev, sessionEventCount);

    let studentTotal = 0;
    let studentEvents = 0;
    let studentSessions = 0;
    let studentFirst = events[0].ms;
    let studentLast = events[events.length - 1].ms;

    for (const d of [...dayAgg.values()].sort((a, b) => (a.day < b.day ? -1 : 1))) {
      studentTotal += d.total_seconds;
      studentEvents += d.event_count;
      studentSessions += d.session_count;
      days.push({
        day: d.day,
        student_id: bucket.student_id,
        student_name: bucket.student_name,
        total_seconds: d.total_seconds,
        event_count: d.event_count,
        session_count: d.session_count,
        first_at: new Date(d.first_ms).toISOString(),
        last_at: new Date(d.last_ms).toISOString(),
        windows: d.windows
      });
    }

    perStudent.push({
      student_id: bucket.student_id,
      student_name: bucket.student_name,
      total_seconds: studentTotal,
      event_count: studentEvents,
      session_count: studentSessions,
      active_days: dayAgg.size,
      first_at: new Date(studentFirst).toISOString(),
      last_at: new Date(studentLast).toISOString()
    });
  }

  perStudent.sort((a, b) => b.total_seconds - a.total_seconds);

  const logCount = allRows.length;
  const enoughLogs = logCount >= MIN_LOG_EVENTS_FOR_PRACTICE_TIME;

  return {
    meta: {
      gap_seconds: PRACTICE_GAP_SECONDS,
      from: from || null,
      to: to || null,
      student_id: studentId || null,
      // Truth flags: time is an ESTIMATE unless an official duration field exists.
      has_official_duration: hasOfficialDuration,
      time_basis: hasOfficialDuration ? "official" : "estimate",
      rows_with_official_duration: rowsWithOfficialDuration,
      log_event_count: logCount,
      min_log_events: MIN_LOG_EVENTS_FOR_PRACTICE_TIME,
      enough_logs: enoughLogs,
      no_official_duration_message_he: hasOfficialDuration
        ? null
        : "אין שדה משך זמן רשמי — לא ניתן לחשב זמן אמיתי.",
      events_last_24h: events24h,
      events_last_week: eventsWeek
    },
    days,
    per_student: perStudent
  };
}

app.get("/api/imports/time-range", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const courseId = gradebookCourseId(session);
  const from = typeof req.query.from === "string" && req.query.from ? req.query.from : null;
  const to = typeof req.query.to === "string" && req.query.to ? req.query.to : null;
  const studentId = typeof req.query.student_id === "string" && req.query.student_id ? req.query.student_id : null;

  // Inclusive day range: [from 00:00:00, to 23:59:59.999].
  const fromIso = from ? new Date(`${from}T00:00:00.000Z`).toISOString() : null;
  const toIso = to ? new Date(`${to}T23:59:59.999Z`).toISOString() : null;

  const fromStore = () => {
    const rows = (Array.isArray(store.logEvents) ? store.logEvents : [])
      .filter(e => !e.course_id || String(e.course_id) === courseId)
      .map(e => ({
        event_time: e.event_time || e.timestamp || e.time || e.created_at || null,
        created_at: e.created_at || null,
        actor_full_name: e.actor_full_name || e.actor || e.student_name || null,
        moodle_user_id: e.moodle_user_id != null ? String(e.moodle_user_id) : null,
        // Pass through an official duration field only if the source truly carries
        // one. Never invented — normally absent in Moodle event logs.
        duration_seconds: e.duration_seconds ?? e.duration ?? e.timeDiff ?? null
      }))
      .filter(e => {
        if (!e.event_time) return false;
        const ms = Date.parse(e.event_time);
        if (fromIso && ms < Date.parse(fromIso)) return false;
        if (toIso && ms > Date.parse(toIso)) return false;
        return true;
      });
    return res.json(buildPracticeTimeFromLogEvents(rows, { from, to, studentId }));
  };

  const supabase = getSupabaseClient();
  if (!supabase) return fromStore();

  try {
    let query = supabase
      .from("log_events")
      .select("event_time,created_at,actor_full_name,moodle_user_id,course_id")
      .eq("course_id", courseId)
      .order("event_time", { ascending: true });
    if (fromIso) query = query.gte("event_time", fromIso);
    if (toIso) query = query.lte("event_time", toIso);

    const { data, error } = await query;
    if (error) return fromStore();
    return res.json(buildPracticeTimeFromLogEvents(Array.isArray(data) ? data : [], { from, to, studentId }));
  } catch {
    return fromStore();
  }
});
// <<< MTH_SCOPED_TIME_RANGE_V1_SUPABASE >>>


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
// MTH_API_STUDENTS_FROM_SUPABASE_V1
// Known issue #1: this endpoint previously returned the volatile in-memory
// `store.students`, which resets to [] on Render cold-start. It now reads the
// persisted roster from Supabase, scoped to the caller's space_id (LTI session),
// and falls back to the in-memory store only when Supabase is unconfigured or errors.
app.get("/api/students", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  const spaceId = session?.spaceId || "unknown-space";

  const fromStore = () =>
    store.students.filter(student => !student.space_id || student.space_id === spaceId);

  const supabase = getSupabaseClient();
  if (!supabase) return res.json(fromStore());

  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("space_id", spaceId);
    if (error) return res.json(fromStore());
    return res.json(Array.isArray(data) ? data : []);
  } catch {
    return res.json(fromStore());
  }
});
// MTH_API_TASKS_FROM_SUPABASE_V1
// Known issue #1: this endpoint previously returned the volatile in-memory
// `store.tasks`, which resets to [] on Render cold-start. Tasks are the
// `course_tasks` rows the course-structure import persists to Supabase, scoped by
// course_id (`store.tasks` is populated directly from those same rows). It now reads
// the persisted `course_tasks` for the caller's course_id, ordered by position, and
// falls back to the in-memory store only when Supabase is unconfigured or the query errors.
app.get("/api/tasks", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  const courseId = gradebookCourseId(session);

  const inScope = row =>
    !row || (!row.course_id && !row.space_id) || row.course_id === courseId || row.space_id === courseId;
  const fromStore = () => (Array.isArray(store.tasks) ? store.tasks.filter(inScope) : []);

  const supabase = getSupabaseClient();
  if (!supabase) return res.json(fromStore());

  try {
    const { data, error } = await supabase
      .from("course_tasks")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });
    if (error) return res.json(fromStore());
    return res.json(Array.isArray(data) ? data : []);
  } catch {
    return res.json(fromStore());
  }
});
// MTH_API_GRADES_FROM_SUPABASE_V1
// Known issue #1: this endpoint previously returned the volatile in-memory
// `store.grades`, which resets to [] on Render cold-start. It now reads the
// persisted grade results from Supabase, scoped to the caller's course_id (the
// same scope grade_results are written with on Gradebook import), and falls back
// to the in-memory store only when Supabase is unconfigured or the query errors.
app.get("/api/grades", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  const courseId = gradebookCourseId(session);

  const inScope = row =>
    !row || (!row.space_id && !row.course_id) || row.course_id === courseId || row.space_id === courseId;
  const fromStore = () => (Array.isArray(store.grades) ? store.grades.filter(inScope) : []);

  const supabase = getSupabaseClient();
  if (!supabase) return res.json(fromStore());

  try {
    const { data, error } = await supabase
      .from("grade_results")
      .select("*")
      .eq("course_id", courseId);
    if (error) return res.json(fromStore());
    const rows = Array.isArray(data) ? data : [];
    return res.json(
      rows.map(result => ({
        id: result.id,
        student_id: result.student_id,
        studentId: result.student_id,
        grade_item_id: result.grade_item_id,
        task_id: result.grade_item_id,
        taskId: result.grade_item_id,
        raw_value: result.raw_value,
        grade: result.grade,
        numeric_value: result.grade,
        updated_at: result.created_at,
        updatedAt: result.created_at
      }))
    );
  } catch {
    return res.json(fromStore());
  }
});
// MTH_API_ACTIVITY_FROM_SUPABASE_V1
// Known issue #1: this endpoint previously returned the volatile in-memory
// `store.activitySessions`, which is only ever populated at runtime and resets to
// [] on Render cold-start. Activity is derived from the Moodle log events that the
// logs import persists to Supabase (`log_events`, scoped by course_id). It now reads
// those persisted events, scoped to the caller's course_id, and falls back to the
// in-memory store only when Supabase is unconfigured or the query errors.
app.get("/api/activity", async (req, res) => {
  noStore(res);
  const session = importSessionFromRequest(req);
  const courseId = gradebookCourseId(session);

  const fromStore = () =>
    res.json({ sessions: Array.isArray(store.activitySessions) ? store.activitySessions : [], dailySummaries: [] });

  const supabase = getSupabaseClient();
  if (!supabase) return fromStore();

  try {
    const { data, error } = await supabase
      .from("log_events")
      .select("*")
      .eq("course_id", courseId)
      .order("event_time", { ascending: false });
    if (error) return fromStore();
    const rows = Array.isArray(data) ? data : [];
    const sessions = rows.map(row => ({
      id: row.id,
      course_id: row.course_id,
      courseId: row.course_id,
      event_time: row.event_time,
      eventTime: row.event_time,
      actor_full_name: row.actor_full_name,
      actor: row.actor_full_name,
      context: row.context,
      component: row.component,
      event_name: row.event_name,
      eventName: row.event_name,
      description: row.description,
      origin: row.origin,
      moodle_user_id: row.moodle_user_id,
      created_at: row.created_at
    }));
    return res.json({ sessions, dailySummaries: [] });
  } catch {
    return fromStore();
  }
});
app.get("/api/settings", (_req, res) => res.json(store.settings));
app.get("/api/moodle-captures", (_req, res) => res.json([...store.moodleCaptures].reverse()));
app.get("/api/moodle-summary", (_req, res) => res.json({ capturesCount: store.moodleCaptures.length, lastCaptureAt: store.moodleCaptures.at(-1)?.createdAt ?? null, lastSource: store.moodleCaptures.at(-1)?.source ?? null, availableKeys: store.moodleCaptures.at(-1)?.keys ?? [] }));
app.get("/api/export/grades.csv", (_req, res) => { res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", "attachment; filename=grades-export.csv"); res.send(buildGradesCsv()); });


// >>> MTH_RELEASE_READINESS_GATE_LIVE_HOTFIX_V1 >>>
function buildLiveReleaseReadiness(req) {
  const sync = buildSyncStatus(req);
  const persistence = buildPersistenceStatus();
  const blockers = [];

  if (!sync.context?.has_lti_session && !sync.session_exists) {
    blockers.push({
      key: "moodle_launch_missing",
      severity: "required",
      message_he: "צריך לפתוח את הכלי מתוך Moodle כדי לזהות מורה ומרחב."
    });
  }

  if (!persistence.production_persistence_ready && persistence.current_stage !== "verified") {
    blockers.push({
      key: "production_persistence_missing",
      severity: "required",
      message_he: "צריך לאמת שמירה וטעינה מול Supabase לפני סימון מוכן."
    });
  }

  const details = Array.isArray(sync.capability_details) ? sync.capability_details : [];
  for (const item of details) {
    if (item.status && item.status !== "available") {
      blockers.push({
        key: "missing_" + item.key,
        severity: "data_required",
        message_he: item.teacher_message_he || "חסר מקור נתונים אמיתי.",
        required_report_he: item.required_report_he || null,
        target_href: item.target_href || "/missing-data"
      });
    }
  }

  blockers.push({
    key: "real_moodle_end_to_end_missing",
    severity: "required",
    message_he: "נדרשת בדיקה אמיתית מקצה לקצה מתוך Moodle עם נתוני אמת."
  });

  blockers.push({
    key: "multi_teacher_validation_missing",
    severity: "required",
    message_he: "נדרשת בדיקת כמה מורים/כמה מרחבים כדי לוודא שאין ערבוב נתונים."
  });

  return {
    ok: true,
    mode: "release-readiness",
    version: "MTH_RELEASE_READINESS_GATE_LIVE_HOTFIX_V1",
    teacher_release_ready: false,
    broad_release_ready: false,
    checked_at: new Date().toISOString(),
    blockers,
    blockers_count: blockers.length,
    sync_summary: {
      ok: sync.ok,
      mode: sync.mode,
      version: sync.version,
      counts: sync.counts || null
    },
    persistence_summary: {
      ok: persistence.ok,
      mode: persistence.mode,
      configured: persistence.configured,
      provider: persistence.provider,
      current_stage: persistence.current_stage,
      production_persistence_ready: persistence.production_persistence_ready
    },
    safety: {
      no_fake_release_claim: true,
      no_secret_values_returned: true,
      no_student_rows_returned: true
    }
  };
}

app.get("/api/release/readiness", (req, res) => {
  noStore(res);
  res.json(buildLiveReleaseReadiness(req));
});
// <<< MTH_RELEASE_READINESS_GATE_LIVE_HOTFIX_V1 >>>


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
    const liveSession = importSessionFromRequest(req) || sessionFromRequest(req);
    const configuredTokenUrl = env("LTI13_TOKEN_URL");
    const clientId = String(liveSession?.clientId || liveSession?.client_id || env("LTI13_CLIENT_ID"));
    const deploymentIdForAssertion = String(liveSession?.deploymentId || liveSession?.deployment_id || env("LTI13_DEPLOYMENT_ID"));
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

/* MTH_NRPS_ROLE_CLASSIFICATION_V1
   Robust, reusable NRPS role classification shared by the preview, the
   participants-breakdown counts, and the learner sync guard.

   A single member can carry several roles (e.g. both a context Learner role and
   an institution Instructor role). Classification is therefore evaluated over
   ALL of a member's roles, and any staff/team signal wins over a learner signal:
   a Teacher who is also enrolled as a Learner must never be saved as a student.

   Role values may be full IMS URNs/URLs
   (e.g. ".../membership#Instructor", ".../institution/person#Faculty") or bare
   short names ("Instructor", "Student"). We normalize to the trailing segment
   after the last "#" or "/" before matching.

   - isInstructorRole / isManagerRole: teacher/team/staff signals.
   - isLearnerRole: learner-like signals (Learner/Student; Member only when no
     staff/team signal exists on the same member — see classifyNrpsMember).
   - isUnknownRole: not recognized as either.
   - classifyNrpsMember(member): "instructor" | "learner" | "unknown" over the
     member's full role set. Ambiguous -> "unknown" (never silently a student). */
function nrpsShortRole(role) {
  return String(role || "").split(/[#/]/).pop().trim();
}

// Manager / admin / course-creator style roles. Kept separate so callers can
// distinguish a course manager from a teaching role when useful; for the
// learner-vs-team decision these all count as team (non-learner).
function isManagerRole(role) {
  return /^(manager|administrator|admin|coursecreator|sysadmin|accountadmin)$/i.test(nrpsShortRole(role));
}

// Teacher / team / staff roles. Includes manager roles so any single call is a
// complete "is this a team member" test.
function isInstructorRole(role) {
  const short = nrpsShortRole(role);
  if (isManagerRole(role)) return true;
  return /^(instructor|teacher|editingteacher|noneditingteacher|faculty|staff|mentor|teachingassistant|ta|tutor|contentdeveloper)$/i.test(short);
}

// Learner-like roles. "Member" is intentionally excluded here: a bare Member
// signal is only treated as a learner by classifyNrpsMember, and only when the
// member carries no team/staff signal at all.
function isLearnerRole(role) {
  return /^(learner|student|guest)$/i.test(nrpsShortRole(role));
}

function isUnknownRole(role) {
  return !isInstructorRole(role) && !isLearnerRole(role);
}

// Classify a whole NRPS member by its full role set.
// Precedence: any team/staff/manager signal => "instructor"; else any explicit
// learner signal (or a bare "Member" with no team signal) => "learner";
// otherwise "unknown". Ambiguous members are NEVER classified as learners.
function classifyNrpsMember(member) {
  const roles = Array.isArray(member?.roles) ? member.roles : [];
  if (roles.some(isInstructorRole)) return "instructor";
  if (roles.some(isLearnerRole)) return "learner";
  // A bare context "Member" with no team signal is learner-like (Moodle hands a
  // plain membership role to enrolled participants who have no elevated role).
  if (roles.some(role => /^member$/i.test(nrpsShortRole(role)))) return "learner";
  return "unknown";
}
/* MTH_NRPS_ROLE_CLASSIFICATION_V1_END */

/* MTH_NRPS_MEMBER_IDENTITY_V1
   Shared, privacy-safe member identity helpers used by both the NRPS preview
   (members_named) and the server-owned learner sync. Keeping the id-hash and
   full-name logic in one place guarantees the server-owned sync derives the SAME
   stable student id as the legacy client-payload path (which sent the preview's
   hashed `id`), so the previously synced learners are UPDATED in place rather
   than duplicated. The hash is a 16-char SHA-256 prefix over a stable identity
   source (user_id -> sub -> lis_person_sourcedid -> name); no raw id is exposed. */
function nrpsMemberFullName(member) {
  return String(
    member?.name ||
    [member?.given_name, member?.family_name].filter(Boolean).join(" ") ||
    ""
  ).trim();
}

function nrpsMemberIdHash(member) {
  const idSource =
    member?.user_id ||
    member?.sub ||
    member?.lis_person_sourcedid ||
    nrpsMemberFullName(member);
  return crypto.createHash("sha256").update(String(idSource || "")).digest("hex").slice(0, 16);
}
/* MTH_NRPS_MEMBER_IDENTITY_V1_END */

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

/* MTH_NRPS_CURRENT_SESSION_FETCH_V1
   Shared read-only fetch of NRPS membership for the CURRENT verified LTI 1.3
   session only (token/query/header/cookie via importSessionFromRequest, never
   the global/latest session). Performs env check -> discovery -> client-credentials
   token -> membership GET. Returns a discriminated result; never persists anything
   and never returns the access token / client assertion / private key to callers.
   Used by both /api/lti13/nrps-preview and /api/lti13/participants-breakdown so the
   broad token/discovery/membership logic is defined once. */
async function lti13FetchCurrentNrpsMembers(req) {
  const envStatus = lti13EnvStatus();
  if (!envStatus.configured) {
    return { ok: false, stage: "env", error: "LTI13_ENV_NOT_CONFIGURED", httpStatus: 503, missing: envStatus.missing };
  }

  const liveSession = importSessionFromRequest(req) || sessionFromRequest(req);
  const liveServices = liveSession?.automaticServices || {};
  const membershipUrl = liveServices?.nrps?.context_memberships_url || "";
  const statusJson = {
    has_latest_lti13_session: Boolean(liveSession),
    has_nrps: Boolean(membershipUrl),
    has_ags: Boolean(liveServices?.has_ags),
    service_claims: liveServices
  };

  if (!statusJson.has_latest_lti13_session || !membershipUrl) {
    return {
      ok: false,
      stage: "session-or-nrps-claim",
      error: "NO_LIVE_LTI13_NRPS_SESSION",
      httpStatus: 200,
      has_latest_lti13_session: Boolean(statusJson.has_latest_lti13_session),
      has_nrps: Boolean(statusJson.has_nrps),
      has_ags: Boolean(statusJson.has_ags)
    };
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
  const clientId = String(liveSession?.clientId || liveSession?.client_id || env("LTI13_CLIENT_ID"));
  const deploymentIdForAssertion = String(liveSession?.deploymentId || liveSession?.deployment_id || env("LTI13_DEPLOYMENT_ID"));
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
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": deploymentIdForAssertion,
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

  const tokenDiagnostics = {
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
  };

  if (!tokenResponse.ok || !tokenJson.access_token) {
    return {
      ok: false,
      stage: "token",
      httpStatus: 502,
      token_http_status: tokenResponse.status,
      token_error: tokenJson.error || "TOKEN_REQUEST_FAILED",
      token_variant_used: tokenVariantUsed,
      token_fallback_with_client_id: tokenFallbackSummary,
      token_error_description: nrpsPreviewSafeText(tokenJson.error_description || tokenText),
      token_diagnostics: tokenDiagnostics
    };
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
    return {
      ok: false,
      stage: "membership",
      httpStatus: 502,
      membership_http_status: memberResponse.status,
      membership_error_preview: nrpsPreviewSafeText(memberText)
    };
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

  return {
    ok: true,
    stage: "membership",
    liveSession,
    statusJson,
    clientId,
    membershipUrl,
    members,
    roleCounts,
    membership,
    token_http_status: tokenResponse.status,
    token_variant_used: tokenVariantUsed,
    membership_http_status: memberResponse.status,
    token_endpoint_source: tokenEndpointSource,
    active_token_url_host: tokenUrl ? new URL(tokenUrl).host : null,
    active_token_url_path: tokenUrl ? new URL(tokenUrl).pathname : null,
    discovery_http_status: discoveryHttpStatus,
    discovery_scopes_has_nrps: discoveryScopes.includes("https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly")
  };
}

app.get("/api/lti13/nrps-preview", async (req, res) => {
  lti13NoStore(res);

  try {
    const result = await lti13FetchCurrentNrpsMembers(req);

    if (!result.ok && result.stage === "env") {
      return res.status(503).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "env",
        error: "LTI13_ENV_NOT_CONFIGURED",
        missing: result.missing,
        privacy: {
          no_secrets_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    if (!result.ok && result.stage === "session-or-nrps-claim") {
      return res.status(200).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "session-or-nrps-claim",
        error: "NO_LIVE_LTI13_NRPS_SESSION",
        has_latest_lti13_session: Boolean(result.has_latest_lti13_session),
        has_nrps: Boolean(result.has_nrps),
        has_ags: Boolean(result.has_ags),
        next_required: [
          "Open המודל החכם from Moodle, then call this endpoint again."
        ],
        privacy: {
          no_secrets_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    if (!result.ok && result.stage === "token") {
      return res.status(502).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "token",
        token_http_status: result.token_http_status,
        token_error: result.token_error,
        token_variant_used: result.token_variant_used,
        token_fallback_with_client_id: result.token_fallback_with_client_id,
        token_error_description: result.token_error_description,
        token_diagnostics: result.token_diagnostics,
        privacy: {
          no_secrets_returned: true,
          no_access_token_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    if (!result.ok && result.stage === "membership") {
      return res.status(502).json({
        ok: false,
        mode: "lti13-nrps-preview-no-save",
        stage: "membership",
        membership_http_status: result.membership_http_status,
        membership_error_preview: result.membership_error_preview,
        privacy: {
          no_secrets_returned: true,
          no_access_token_returned: true,
          no_student_names_returned: true,
          no_save_performed: true
        }
      });
    }

    const members = result.members;
    const roleCounts = result.roleCounts;
    const clientId = result.clientId;
    const membershipUrl = result.membershipUrl;
    const tokenVariantUsed = result.token_variant_used;
    const statusJson = result.statusJson;

    const membersNamed = members
      .map(member => {
        const name = nrpsMemberFullName(member);
        const roleKind = classifyNrpsMember(member);
        const idHash = nrpsMemberIdHash(member);
        return {
          id: idHash,
          name,
          // role_kind is the robust classification ("learner" | "instructor" |
          // "unknown"); is_instructor stays for backwards compatibility with
          // existing consumers. Only role_kind === "learner" is safe to save.
          role_kind: roleKind,
          is_instructor: roleKind === "instructor",
          has_email: Boolean(member?.email)
        };
      })
      .filter(m => m.name);

    return res.json({
      ok: true,
      mode: "lti13-nrps-preview-no-save",
      stage: "membership",
      token_http_status: result.token_http_status,
      token_variant_used: tokenVariantUsed,
      membership_http_status: result.membership_http_status,
      members_count: members.length,
      role_counts: roleCounts,
      members_named: membersNamed,
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
        token_endpoint_source: result.token_endpoint_source,
        active_token_url_host: result.active_token_url_host,
        active_token_url_path: result.active_token_url_path,
        discovery_http_status: result.discovery_http_status,
        discovery_scopes_has_nrps: result.discovery_scopes_has_nrps,
        service_versions: statusJson?.service_claims?.nrps?.service_versions || []
      },
      privacy: {
        no_names_returned: false,
        names_only_when_moodle_allows: true,
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

/* MTH_PARTICIPANTS_BREAKDOWN_API_V1
   Read-only, counts-only breakdown of the CURRENT LTI 1.3 NRPS session.
   Reuses lti13FetchCurrentNrpsMembers (same current-session token flow as the
   preview). Returns ONLY aggregate counts and safe diagnostics — no names,
   no emails, no raw user IDs, no access token, no client assertion, no secrets.
   Numbers come exclusively from the live NRPS response (never hard-coded).
   Does not persist anything. Uses the shared robust classifier
   classifyNrpsMember (MTH_NRPS_ROLE_CLASSIFICATION_V1). */
app.get("/api/lti13/participants-breakdown", async (req, res) => {
  lti13NoStore(res);

  const privacy = {
    no_emails_returned: true,
    no_raw_ids_returned: true,
    no_access_token_returned: true,
    no_names_returned: true,
    no_save_performed: true
  };

  try {
    const result = await lti13FetchCurrentNrpsMembers(req);

    if (!result.ok && result.stage === "env") {
      return res.status(503).json({
        ok: false,
        source: "nrps",
        stage: "env",
        error: "LTI13_ENV_NOT_CONFIGURED",
        missing: result.missing,
        privacy
      });
    }

    if (!result.ok && result.stage === "session-or-nrps-claim") {
      return res.status(200).json({
        ok: false,
        source: "nrps",
        stage: "session-or-nrps-claim",
        error: "NO_LIVE_LTI13_NRPS_SESSION",
        has_latest_lti13_session: Boolean(result.has_latest_lti13_session),
        has_nrps: Boolean(result.has_nrps),
        has_ags: Boolean(result.has_ags),
        next_required: [
          "Open המודל החכם from Moodle, then call this endpoint again."
        ],
        privacy
      });
    }

    if (!result.ok && result.stage === "token") {
      return res.status(502).json({
        ok: false,
        source: "nrps",
        stage: "token",
        token_http_status: result.token_http_status,
        token_error: result.token_error,
        token_variant_used: result.token_variant_used,
        token_error_description: result.token_error_description,
        token_diagnostics: result.token_diagnostics,
        privacy
      });
    }

    if (!result.ok && result.stage === "membership") {
      return res.status(502).json({
        ok: false,
        source: "nrps",
        stage: "membership",
        membership_http_status: result.membership_http_status,
        membership_error_preview: result.membership_error_preview,
        privacy
      });
    }

    const members = result.members;
    const liveSession = result.liveSession;

    let learnersCount = 0;
    let instructorsCount = 0;
    let unknownCount = 0;
    let hasNamesCount = 0;
    for (const member of members) {
      const kind = classifyNrpsMember(member);
      if (kind === "learner") learnersCount += 1;
      else if (kind === "instructor") instructorsCount += 1;
      else unknownCount += 1;
      if (member?.name || member?.given_name || member?.family_name) hasNamesCount += 1;
    }

    const courseId = String(
      liveSession?.courseId ||
      liveSession?.course_id ||
      liveSession?.contextId ||
      liveSession?.context_id ||
      ""
    );
    const deploymentId = String(
      liveSession?.deploymentId ||
      liveSession?.deployment_id ||
      env("LTI13_DEPLOYMENT_ID") ||
      ""
    );
    // Installation/course diagnostics only — not personal data. resource_link_id
    // and course_title come straight from the current LTI 1.3 launch context and
    // let the isolation-check page prove each space is scoped on its own.
    const resourceLinkId = String(
      liveSession?.resourceLinkId ||
      liveSession?.resource_link_id ||
      ""
    );
    const courseTitle = String(
      liveSession?.courseTitle ||
      liveSession?.course_title ||
      liveSession?.contextTitle ||
      liveSession?.context_title ||
      ""
    );

    return res.json({
      ok: true,
      source: "nrps",
      total_members: members.length,
      learners_count: learnersCount,
      instructors_count: instructorsCount,
      unknown_count: unknownCount,
      role_counts: result.roleCounts,
      has_names: hasNamesCount > 0,
      course_id: courseId || null,
      course_title: courseTitle || null,
      resource_link_id: resourceLinkId || null,
      deployment_id: deploymentId || null,
      client_id: result.clientId || null,
      membership_http_status: result.membership_http_status,
      token_http_status: result.token_http_status,
      updated_at: new Date().toISOString(),
      privacy
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      source: "nrps",
      stage: "unexpected",
      error: "PARTICIPANTS_BREAKDOWN_FAILED",
      detail: nrpsPreviewSafeText(error?.message || error),
      privacy
    });
  }
});

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
    warning: "Do not use this to replace the working LTI 1.0/1.1 Moodle Teacher Hub tool. Create a separate המודל החכם tool only after status is configured.",
    suggested_tool_name: "המודל החכם",
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

  const builtinRegistrations = [
    { client_id: expectedClientId, deployment_id: expectedDeploymentId, label: "primary-env" },
    { client_id: "yaMvBxOoDzpir3I", deployment_id: "6", label: "moodle-imported-course-lti13-v1" }
  ];

  const envRegistrations = String(process.env.LTI13_ALLOWED_REGISTRATIONS || "")
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const parts = item.split(/[|:]/).map((part) => part.trim()).filter(Boolean);
      return parts.length >= 2 ? { client_id: parts[0], deployment_id: parts[1], label: "env-allowlist" } : null;
    })
    .filter(Boolean);

  const registrations = [...builtinRegistrations, ...envRegistrations]
    .filter((item) => item && item.client_id && item.deployment_id)
    .filter((item, index, arr) =>
      arr.findIndex((other) =>
        other.client_id === item.client_id && String(other.deployment_id) === String(item.deployment_id)
      ) === index
    );

  const matchedRegistration = registrations.find((registration) =>
    lti13AudContains(payload.aud, registration.client_id) &&
    String(deploymentId || "") === String(registration.deployment_id)
  );

  const checks = {
    issuer: payload.iss === expectedIssuer,
    audience: registrations.some((registration) => lti13AudContains(payload.aud, registration.client_id)),
    deployment_id: !!matchedRegistration,
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
      registrations: registrations.map((registration) => ({
        client_id: registration.client_id,
        deployment_id: registration.deployment_id,
        label: registration.label
      }))
    },
    actual: {
      issuer: payload.iss || null,
      audience: payload.aud || null,
      deployment_id: deploymentId || null,
      matched_registration: matchedRegistration ? {
        client_id: matchedRegistration.client_id,
        deployment_id: matchedRegistration.deployment_id,
        label: matchedRegistration.label
      } : null,
      message_type: messageType || null,
      version: version || null,
      nonce_present: !!payload.nonce
    }
  };
}

// PR 13 — Build a safe admin diagnostic report when an unknown
// client_id/deployment_id launches LTI 1.3. The report never auto-approves,
// never mutates the allowlist, and never returns secrets, private keys,
// access tokens, client assertions, the JWT body, or PII.
function lti13BuildRegistrationDiagnostic(payload, claimVerification, signature) {
  const audienceRaw = payload && payload.aud;
  const audClientId = Array.isArray(audienceRaw)
    ? compactString(audienceRaw[0])
    : compactString(audienceRaw);
  const deploymentId = compactString(lti13Claim(payload, "deployment_id"));
  const messageType = compactString(lti13Claim(payload, "message_type"));
  const version = compactString(lti13Claim(payload, "version"));
  const issuer = compactString(payload && payload.iss);

  const checks = (claimVerification && claimVerification.checks) || {};
  const signatureOk = !!(signature && signature.ok);
  const nonceOk = !!checks.nonce_matches;
  const matchedAllowlist = !!checks.deployment_id && !!checks.audience;

  // suggested env line for LTI13_ALLOWED_REGISTRATIONS — identifiers only.
  const suggestedEnvLine = audClientId && deploymentId
    ? `${audClientId}:${deploymentId}`
    : null;

  return {
    report_type: "lti13-unknown-registration",
    issuer: issuer || null,
    audience: audClientId || null,
    client_id: audClientId || null,
    deployment_id: deploymentId || null,
    message_type: messageType || null,
    version: version || null,
    signature_ok: signatureOk,
    nonce_ok: nonceOk,
    matched_allowlist: matchedAllowlist,
    suggested_env_line: suggestedEnvLine,
    suggested_env_var: "LTI13_ALLOWED_REGISTRATIONS",
    auto_approved: false,
    allowlist_modified: false,
    privacy: {
      no_secrets: true,
      no_private_key: true,
      no_access_token: true,
      no_client_assertion: true,
      no_jwt_body: true,
      no_pii: true
    },
    admin_action_he:
      "client_id/deployment_id אינם ברשימת ההרשאות. כדי לאשר התקנה זו, " +
      "הוסף את השורה המוצעת ל-LTI13_ALLOWED_REGISTRATIONS ב-Render (לעולם לא ב-GitHub) והפעל מחדש את ה-launch.",
    now: new Date().toISOString()
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
    // PR 13 — unknown client_id/deployment_id: signature is valid but the
    // registration is not in the trusted allowlist. Do not auto-approve and do
    // not modify the allowlist. Return a safe admin diagnostic that excludes
    // secrets, private keys, access tokens, client assertions, the JWT body,
    // and the trusted allowlist contents.
    const checks = claimVerification.checks || {};
    const unknownRegistration = signature.ok && (!checks.audience || !checks.deployment_id);

    if (unknownRegistration) {
      return res.status(403).json({
        ok: false,
        mode: "phase3-unknown-registration",
        message: "LTI 1.3 signature is valid, but this client_id/deployment_id is not in the trusted allowlist. Launch was not auto-approved.",
        registration_diagnostic: lti13BuildRegistrationDiagnostic(payload, claimVerification, signature),
        safety: {
          existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
          no_fake_success: true,
          auto_approved: false,
          allowlist_modified: false
        },
        now: new Date().toISOString()
      });
    }

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
    // MTH_LTI13_CAPTURE_FIX — capture LTI 1.3 launches into store like LTI 1.1 does
try {
  if (typeof recordLaunchCapture === "function") {
    recordLaunchCapture(req.body || {}, "LTI13_VERIFIED");
  }
  if (Array.isArray(store.launches)) {
    store.launches.push({
      id: crypto.randomUUID(),
      type: "lti13",
      ok: true,
      verificationCode: "LTI13_VERIFIED",
      createdAt: new Date().toISOString()
    });
    if (typeof saveStore === "function") saveStore();
  }
} catch (captureErr) {
  console.warn("MTH_LTI13_CAPTURE_WARN", captureErr?.message || String(captureErr));
}

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

  const nextPath = "/";
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
      ? ["Open המודל החכם from Moodle, then call this endpoint again."]
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












