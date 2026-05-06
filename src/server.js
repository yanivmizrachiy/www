import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);
const PORT = Number(process.env.PORT || 3000);
const STORE_PATH = path.join(ROOT, "data", "store.json");
const CANONICAL_LTI_ENDPOINT = "/api/lti/launch";

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

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "moodle-teacher-hub",
    canonicalLtiEndpoint: CANONICAL_LTI_ENDPOINT,
    activeRuntime: "render",
    reactRootIsCanonical: true,
    legacyRootDashboardDisabled: true,
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
    res.redirect(`/lti?t=${encodeURIComponent(sessionToken)}&course=${encodeURIComponent(space.title)}`);
  } catch (error) {
    console.error("LTI Launch Error:", error);
    res.status(500).send("שגיאת שרת בחיבור Moodle Teacher Hub");
  }
});

app.get("/api/bootstrap", (req, res) => {
  const session = sessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  const context = contextPayload(session);
  res.json({
    ...context,
    teacher: { name: session.teacherName, id: session.teacherId },
    space: { title: session.spaceTitle, id: session.spaceId },
    source: session.source,
    verified: !!session.verified,
    dataReady: { hasRealLaunch: store.moodleCaptures.some(item => item.source === "lti11" && item.verificationCode === "OAUTH_VERIFIED"), hasStudents: store.students.length > 0, hasTasks: store.tasks.length > 0, hasGrades: store.grades.length > 0, hasActivity: store.activitySessions.length > 0 },
    lastLaunchAt: store.launches.at(-1)?.createdAt ?? null,
    lastCaptureAt: store.moodleCaptures.at(-1)?.createdAt ?? null,
    dashboard: { launches: store.launches.length, totalStudents: store.students.length, totalTasks: store.tasks.length, totalGrades: store.grades.length, totalSessions: store.activitySessions.length, moodleCaptures: store.moodleCaptures.length, missingSubmissions: 0, missingScores: 0 }
  });
});

app.get("/api/imports/overview", (req, res) => {
  if (!sessionFromRequest(req)) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  res.json({ students_count: store.students.length, grade_items_count: store.gradeItems.length || store.tasks.length, grades_count: store.grades.length, chapters_count: store.chapters.length, tasks_count: store.tasks.length, log_events_count: store.logEvents.length || store.activitySessions.length, batches: [...store.importBatches].reverse() });
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

const distPath = path.join(ROOT, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
} else {
  app.get("*", (_req, res) => res.status(404).send("Moodle Teacher Hub frontend build not found. Run npm run build."));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`moodle-teacher-hub running on port ${PORT}`);
  console.log(`canonical LTI endpoint: ${CANONICAL_LTI_ENDPOINT}`);
});
