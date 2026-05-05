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

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function getPublicBaseUrl(req) {
  const configured = env("APP_BASE_URL", env("PUBLIC_BASE_URL", ""));
  if (configured) return configured.replace(/\/+$/, "");
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`.replace(/\/+$/, "");
}

function rfc3986(input) {
  return encodeURIComponent(String(input))
    .replace(/[!'()*]/g, ch => "%" + ch.charCodeAt(0).toString(16).toUpperCase());
}

function normalizeUrl(url) {
  const u = new URL(url);
  u.hash = "";
  u.search = "";
  const protocol = u.protocol.toLowerCase();
  const hostname = u.hostname.toLowerCase();
  const port = u.port && !((protocol === "http:" && u.port === "80") || (protocol === "https:" && u.port === "443")) ? `:${u.port}` : "";
  return `${protocol}//${hostname}${port}${u.pathname}`;
}

function collectOAuthParams(req, launchUrl) {
  const params = [];
  const body = req.body || {};
  const url = new URL(launchUrl);
  for (const [k, v] of Object.entries(body)) {
    if (k === "oauth_signature") continue;
    if (Array.isArray(v)) {
      for (const item of v) params.push([k, item]);
    } else {
      params.push([k, v]);
    }
  }
  for (const [k, v] of url.searchParams.entries()) {
    if (k === "oauth_signature") continue;
    params.push([k, v]);
  }
  return params
    .map(([k, v]) => [rfc3986(k), rfc3986(v ?? "")])
    .sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
}

function oauthBaseString(req, launchUrl) {
  const normalized = normalizeUrl(launchUrl);
  const paramString = collectOAuthParams(req, launchUrl).map(([k, v]) => `${k}=${v}`).join("&");
  return ["POST", rfc3986(normalized), rfc3986(paramString)].join("&");
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function verifyLti11Signature(req, launchUrl) {
  const secret = env("LTI_SHARED_SECRET", "");
  const expectedKey = env("LTI_CONSUMER_KEY", "");

  if (!secret) {
    return { ok: false, status: 503, code: "MISSING_LTI_SHARED_SECRET", message: "LTI shared secret is not configured." };
  }

  const body = req.body || {};
  if (!body.oauth_signature) {
    return { ok: false, status: 401, code: "MISSING_OAUTH_SIGNATURE", message: "Missing OAuth signature." };
  }

  if (!body.oauth_consumer_key) {
    return { ok: false, status: 401, code: "MISSING_CONSUMER_KEY", message: "Missing OAuth consumer key." };
  }

  if (expectedKey && body.oauth_consumer_key !== expectedKey) {
    return { ok: false, status: 401, code: "BAD_CONSUMER_KEY", message: "OAuth consumer key does not match configured key." };
  }

  if (!body.oauth_nonce || !body.oauth_timestamp) {
    return { ok: false, status: 401, code: "MISSING_NONCE_OR_TIMESTAMP", message: "Missing OAuth nonce or timestamp." };
  }

  const ts = Number(body.oauth_timestamp);
  const now = Math.floor(Date.now() / 1000);
  const allowOldTimestamp = env("LTI_ALLOW_OLD_TIMESTAMP", "false") === "true";
  if (!allowOldTimestamp && (!Number.isFinite(ts) || Math.abs(now - ts) > 600)) {
    return { ok: false, status: 401, code: "STALE_OAUTH_TIMESTAMP", message: "OAuth timestamp is outside the allowed 10-minute window." };
  }

  const method = String(body.oauth_signature_method || "").toUpperCase();
  if (method !== "HMAC-SHA1") {
    return { ok: false, status: 401, code: "UNSUPPORTED_SIGNATURE_METHOD", message: "Only HMAC-SHA1 is supported for LTI 1.0/1.1." };
  }

  const base = oauthBaseString(req, launchUrl);
  const signingKey = `${rfc3986(secret)}&`;
  const expected = crypto.createHmac("sha1", signingKey).update(base).digest("base64");

  if (!safeEqual(expected, body.oauth_signature)) {
    return { ok: false, status: 401, code: "BAD_OAUTH_SIGNATURE", message: "OAuth signature verification failed." };
  }

  return { ok: true, code: "OAUTH_VERIFIED", baseString: base };
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
    settings: {
      allowTeacherSettingsView: true,
      allowExport: true,
      lastSyncAt: null
    }
  };
}

function ensureStore() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(emptyStore(), null, 2), "utf8");
  }
}

function loadStore() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
    return { ...emptyStore(), ...parsed };
  } catch {
    const s = emptyStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(s, null, 2), "utf8");
    return s;
  }
}

const store = loadStore();
const sessions = new Map();
const tokenSessions = new Map();

function saveStore() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function stableId(prefix, value) {
  const hash = crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, 20);
  return `${prefix}_${hash}`;
}

function required(body, key) {
  const value = body?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function upsertTeacherFromLti(body) {
  const externalId = required(body, "user_id") || required(body, "lis_person_sourcedid") || required(body, "lis_person_contact_email_primary");
  if (!externalId) throw new Error("MISSING_REAL_TEACHER_ID_FROM_MOODLE");
  const id = stableId("teacher", externalId);
  const name = required(body, "lis_person_name_full") || required(body, "lis_person_name_given") || "שם מורה לא התקבל ממודל";
  let teacher = store.teachers.find(x => x.id === id);
  if (!teacher) {
    teacher = { id, externalId, name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.teachers.push(teacher);
  } else {
    teacher.name = name;
    teacher.updatedAt = new Date().toISOString();
  }
  return teacher;
}

function upsertSpaceFromLti(body) {
  const externalId = required(body, "context_id") || required(body, "resource_link_id");
  if (!externalId) throw new Error("MISSING_REAL_CONTEXT_ID_FROM_MOODLE");
  const id = stableId("space", externalId);
  const title = required(body, "context_title") || required(body, "resource_link_title") || "שם מרחב לא התקבל ממודל";
  let space = store.spaces.find(x => x.id === id);
  if (!space) {
    space = { id, externalId, title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.spaces.push(space);
  } else {
    space.title = title;
    space.updatedAt = new Date().toISOString();
  }
  return space;
}

function setSession(res, data) {
  const sid = crypto.randomUUID();
  sessions.set(sid, data);
  if (data?.sessionToken) tokenSessions.set(data.sessionToken, data);

  const secure = env("COOKIE_SECURE", env("NODE_ENV", "") === "production" ? "true" : "false") === "true";
  res.cookie("sid", sid, {
    httpOnly: true,
    sameSite: secure ? "none" : "lax",
    secure
  });
  return sid;
}

function getSession(req) {
  const sid = req.cookies?.sid;
  return sid ? sessions.get(sid) || null : null;
}

function getSessionFromToken(token) {
  if (!token || typeof token !== "string") return null;
  return tokenSessions.get(token) || null;
}

function numericCourseId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function buildNodeContextPayload(sessionData) {
  return {
    ok: true,
    session: {
      id: sessionData.sessionToken,
      course_id: numericCourseId(sessionData.courseId),
      course_title: sessionData.courseTitle || sessionData.spaceTitle || null,
      moodle_username: sessionData.moodleUsername || sessionData.teacherName || null,
      moodle_user_id: numericCourseId(sessionData.moodleUserId),
      role: sessionData.role || "teacher",
      launched_at: sessionData.createdAt,
      expires_at: sessionData.expiresAt || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    },
    site: {
      id: sessionData.siteId || "moodlemoe",
      site_url: sessionData.siteUrl || "https://moodlemoe.lms.education.gov.il",
      site_name: sessionData.siteName || "Moodle משרד החינוך",
      consumer_guid: sessionData.consumerGuid || null,
      lti_configured: true,
      ws_configured: false,
      ws_token_status: "blocked-no-token",
      last_probed_at: null
    },
    probes: []
  };
}

async function recordSupabaseSession(sessionRecord) {
  const supabaseUrl = env("VITE_SUPABASE_URL", "");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY", "");
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, skipped: true, reason: "SUPABASE_NOT_CONFIGURED" };
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.from("teacher_sessions").insert(sessionRecord);
  if (error) return { ok: false, skipped: false, reason: error.message };
  return { ok: true, skipped: false, reason: "" };
}

function captureMoodlePayload(source, body, verificationCode) {
  const payload = body || {};
  const record = {
    id: crypto.randomUUID(),
    source,
    verificationCode,
    createdAt: new Date().toISOString(),
    keys: Object.keys(payload).sort(),
    important: {
      user_id: payload.user_id ?? null,
      roles: payload.roles ?? null,
      context_id: payload.context_id ?? null,
      context_title: payload.context_title ?? null,
      lis_person_name_full: payload.lis_person_name_full ?? null,
      oauth_consumer_key: payload.oauth_consumer_key ?? null,
      resource_link_id: payload.resource_link_id ?? null,
      resource_link_title: payload.resource_link_title ?? null,
      lis_person_contact_email_primary: payload.lis_person_contact_email_primary ?? null
    },
    rawCount: Object.keys(payload).length
  };
  store.moodleCaptures.push(record);
  if (store.moodleCaptures.length > 100) store.moodleCaptures.splice(0, store.moodleCaptures.length - 100);
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();
  return record;
}

function buildGradesCsv() {
  const studentMap = Object.fromEntries(store.students.map(s => [s.id, s.fullName || s.name || s.id]));
  const taskMap = Object.fromEntries(store.tasks.map(t => [t.id, t.name || t.id]));
  let csv = '\uFEFF"שם תלמיד","שם משימה","ציון","ניסיונות","תאריך עדכון"\n';
  for (const r of store.grades) {
    const sName = studentMap[r.studentId] || r.studentId || "";
    const tName = taskMap[r.taskId] || r.taskId || "";
    csv += `"${String(sName).replaceAll('"','""')}","${String(tName).replaceAll('"','""')}","${r.grade ?? ""}","${r.attempts ?? ""}","${r.updatedAt ?? ""}"\n`;
  }
  return csv;
}

const app = express();
app.set("trust proxy", true);
app.use(helmet({ contentSecurityPolicy: false, frameguard: false }));

// MTH iframe allowlist: Moodle embeds external tools in an iframe.
app.use((_req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://moodlemoe.lms.education.gov.il https://*.lms.education.gov.il;");
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static(path.join(ROOT, "public")));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "moodle-teacher-hub",
    canonicalLtiEndpoint: CANONICAL_LTI_ENDPOINT,
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
      moodleCaptures: store.moodleCaptures.length
    },
    now: new Date().toISOString()
  });
});

app.get("/lti11/config", (req, res) => {
  const base = getPublicBaseUrl(req);
  const launch = `${base}${CANONICAL_LTI_ENDPOINT}`;
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"
  xmlns:blti="http://www.imsglobal.org/xsd/imsbasiclti_v1p0"
  xmlns:lticm="http://www.imsglobal.org/xsd/imslticm_v1p0"
  xmlns:lticp="http://www.imsglobal.org/xsd/imslticp_v1p0">
  <blti:title>Moodle Teacher Hub</blti:title>
  <blti:description>מרכז מורה עברי לנתוני Moodle אמיתיים</blti:description>
  <blti:launch_url>${launch}</blti:launch_url>
  <blti:secure_launch_url>${launch}</blti:secure_launch_url>
</cartridge_basiclti_link>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(xmlBody);
});

app.post(CANONICAL_LTI_ENDPOINT, async (req, res) => {
  try {
    const base = getPublicBaseUrl(req);
    const launchUrl = `${base}${CANONICAL_LTI_ENDPOINT}`;
    const verification = verifyLti11Signature(req, launchUrl);
    if (!verification.ok) {
      store.launches.push({
        id: crypto.randomUUID(),
        type: "lti11",
        ok: false,
        error: verification.code,
        message: verification.message,
        createdAt: new Date().toISOString()
      });
      saveStore();
      return res.status(verification.status).send(`Moodle Teacher Hub blocked launch: ${verification.code}`);
    }

    const body = req.body || {};
    const roles = String(body.roles || "");
    if (!/Instructor|Teacher|Mentor|Administrator/i.test(roles)) {
      return res.status(403).send("Moodle Teacher Hub is available to teacher roles only.");
    }

    const teacher = upsertTeacherFromLti(body);
    const space = upsertSpaceFromLti(body);
    const sessionToken = crypto.randomUUID();

    const sessionData = {
      sessionToken,
      teacherName: teacher.name,
      teacherId: teacher.id,
      spaceTitle: space.title,
      spaceId: space.id,
      courseId: body.context_id ?? null,
      courseTitle: body.context_title || space.title,
      moodleUsername: body.ext_user_username || body.lis_person_contact_email_primary || body.lis_person_name_full || body.user_id || null,
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

    store.launches.push({
      id: crypto.randomUUID(),
      type: "lti11",
      ok: true,
      teacherName: teacher.name,
      spaceTitle: space.title,
      verificationCode: verification.code,
      createdAt: new Date().toISOString()
    });

    captureMoodlePayload("lti11", body, verification.code);
    saveStore();

    await recordSupabaseSession({
      session_token: sessionToken,
      course_id: body.context_id,
      course_title: body.context_title,
      moodle_username: body.ext_user_username || body.lis_person_name_full || body.user_id,
      role: "teacher",
      created_at: new Date().toISOString()
    });

    setSession(res, sessionData);
    res.redirect(`/lti?t=${encodeURIComponent(sessionToken)}&course=${encodeURIComponent(space.title)}`);
  } catch (error) {
    console.error("LTI Launch Error:", error);
    res.status(500).send("שגיאת שרת בחיבור Moodle Teacher Hub");
  }
});

app.get("/api/bootstrap", (req, res) => {
  const token = typeof req.query?.t === "string" ? req.query.t : "";
  const sessionData = getSessionFromToken(token) || getSession(req);
  if (!sessionData) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const lastLaunch = store.launches.length ? store.launches[store.launches.length - 1] : null;
  const lastCapture = store.moodleCaptures.length ? store.moodleCaptures[store.moodleCaptures.length - 1] : null;
  const context = buildNodeContextPayload(sessionData);

  res.json({
    ...context,
    teacher: { name: sessionData.teacherName, id: sessionData.teacherId },
    space: { title: sessionData.spaceTitle, id: sessionData.spaceId },
    source: sessionData.source,
    verified: !!sessionData.verified,
    dataReady: {
      hasRealLaunch: store.moodleCaptures.some(c => c.source === "lti11" && c.verificationCode === "OAUTH_VERIFIED"),
      hasStudents: store.students.length > 0,
      hasTasks: store.tasks.length > 0,
      hasGrades: store.grades.length > 0,
      hasActivity: store.activitySessions.length > 0
    },
    lastLaunchAt: lastLaunch?.createdAt ?? null,
    lastCaptureAt: lastCapture?.createdAt ?? null,
    dashboard: {
      launches: store.launches.length,
      totalStudents: store.students.length,
      totalTasks: store.tasks.length,
      totalGrades: store.grades.length,
      totalSessions: store.activitySessions.length,
      moodleCaptures: store.moodleCaptures.length,
      missingSubmissions: 0,
      missingScores: 0
    }
  });
});


app.get("/api/imports/overview", (req, res) => {
  const token = typeof req.query?.t === "string" ? req.query.t : "";
  const sessionData = getSessionFromToken(token) || getSession(req);
  if (!sessionData) {
    return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  }

  const importBatches = Array.isArray(store.importBatches) ? store.importBatches : [];
  const gradeItems = Array.isArray(store.gradeItems) ? store.gradeItems : [];
  const chapters = Array.isArray(store.chapters) ? store.chapters : [];
  const logEvents = Array.isArray(store.logEvents) ? store.logEvents : [];

  res.json({
    students_count: Array.isArray(store.students) ? store.students.length : 0,
    grade_items_count: gradeItems.length || (Array.isArray(store.tasks) ? store.tasks.length : 0),
    grades_count: Array.isArray(store.grades) ? store.grades.length : 0,
    chapters_count: chapters.length,
    tasks_count: Array.isArray(store.tasks) ? store.tasks.length : 0,
    log_events_count: logEvents.length || (Array.isArray(store.activitySessions) ? store.activitySessions.length : 0),
    batches: [...importBatches].reverse()
  });
});

app.get("/api/launches", (_req, res) => res.json([...store.launches].reverse()));
app.get("/api/students", (_req, res) => res.json(store.students));
app.get("/api/tasks", (_req, res) => res.json(store.tasks));
app.get("/api/grades", (_req, res) => res.json(store.grades));
app.get("/api/activity", (_req, res) => res.json({ sessions: store.activitySessions, dailySummaries: [] }));
app.get("/api/settings", (_req, res) => res.json(store.settings));
app.get("/api/moodle-captures", (_req, res) => res.json([...store.moodleCaptures].reverse()));

app.get("/api/moodle-summary", (_req, res) => {
  const last = store.moodleCaptures.length ? store.moodleCaptures[store.moodleCaptures.length - 1] : null;
  res.json({
    capturesCount: store.moodleCaptures.length,
    lastCaptureAt: last?.createdAt ?? null,
    lastSource: last?.source ?? null,
    availableKeys: last?.keys ?? [],
    important: last?.important ?? {}
  });
});

app.get("/api/export/grades.csv", (_req, res) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=grades-export.csv");
  res.send(buildGradesCsv());
});

app.get("/", (_req, res, next) => {
  const dashboardPath = path.join(ROOT, "src", "ui", "dashboard", "dashboard.html");
  if (fs.existsSync(dashboardPath)) return res.sendFile(dashboardPath);
  next();
});

const distPath = path.join(ROOT, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
} else {
  app.get("*", (_req, res) => {
    res.status(404).send("Moodle Teacher Hub frontend build not found. Run npm run build.");
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`moodle-teacher-hub running on port ${PORT}`);
  console.log(`canonical LTI endpoint: ${CANONICAL_LTI_ENDPOINT}`);
});
