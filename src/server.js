import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);
const PORT = Number(process.env.PORT || 3000);
const STORE_PATH = path.join(ROOT, "data", "store.json");

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const i = s.indexOf("=");
    if (i === -1) continue;
    out[s.slice(0, i).trim()] = s.slice(i + 1).trim();
  }
  return out;
}

const ENV = loadEnvFile();
const APP_BASE_URL = ENV.APP_BASE_URL || `http://127.0.0.1:${PORT}`;

function defaultStore() {
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

function ensureStoreDir() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
}

function loadStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch {
    ensureStoreDir();
    const s = defaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(s, null, 2), "utf8");
    return s;
  }
}

const store = loadStore();

function saveStore() {
  ensureStoreDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

const sessions = new Map();

function setSession(res, data) {
  const sid = uuidv4();
  sessions.set(sid, data);
  res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", secure: false });
}

function getSession(req) {
  const sid = req.cookies?.sid;
  return sid ? (sessions.get(sid) || null) : null;
}

function upsertTeacher(name, externalId = "teacher-demo") {
  let t = store.teachers.find(x => x.externalId === externalId);
  if (!t) {
    t = {
      id: uuidv4(),
      externalId,
      name: name || "מורה",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.teachers.push(t);
  } else {
    t.name = name || t.name;
    t.updatedAt = new Date().toISOString();
  }
  return t;
}

function upsertSpace(title, externalId = "space-demo") {
  let s = store.spaces.find(x => x.externalId === externalId);
  if (!s) {
    s = {
      id: uuidv4(),
      externalId,
      title: title || "מרחב Moodle",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.spaces.push(s);
  } else {
    s.title = title || s.title;
    s.updatedAt = new Date().toISOString();
  }
  return s;
}

function logLaunch(type, ok, teacherName, spaceTitle, error = "") {
  store.launches.push({
    id: uuidv4(),
    type,
    ok,
    teacherName: teacherName || "",
    spaceTitle: spaceTitle || "",
    error,
    createdAt: new Date().toISOString()
  });
  if (store.launches.length > 500) {
    store.launches.splice(0, store.launches.length - 500);
  }
  saveStore();
}

function captureMoodlePayload(source, body) {
  const payload = body || {};
  const record = {
    id: uuidv4(),
    source,
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
  if (store.moodleCaptures.length > 100) {
    store.moodleCaptures.splice(0, store.moodleCaptures.length - 100);
  }
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
    csv += `"${sName}","${tName}","${r.grade ?? ""}","${r.attempts ?? ""}","${r.updatedAt ?? ""}"\n`;
  }
  return csv;
}

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static(path.join(ROOT, "public")));

// Serve the built React SPA (Vite dist). API/LTI routes below still take
// precedence because they are registered before the SPA fallback.
const DIST_DIR = path.join(ROOT, "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");
const HAS_DIST = fs.existsSync(DIST_INDEX);
if (HAS_DIST) {
  app.use(express.static(DIST_DIR));
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "moodle-teacher-hub",
    appBaseUrl: APP_BASE_URL,
    lti11Ready: {
      key: !!ENV.LTI11_KEY,
      secret: !!ENV.LTI11_SECRET,
      launch_url: `${APP_BASE_URL}/lti/launch-1p1`
    },
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

app.get("/lti11/config", (_req, res) => {
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"
  xmlns:blti="http://www.imsglobal.org/xsd/imsbasiclti_v1p0"
  xmlns:lticm="http://www.imsglobal.org/xsd/imslticm_v1p0"
  xmlns:lticp="http://www.imsglobal.org/xsd/imslticp_v1p0">
  <blti:title>Moodle Teacher Hub</blti:title>
  <blti:description>ממשק מורה מתקדם בעברית</blti:description>
  <blti:launch_url>${APP_BASE_URL}/lti/launch-1p1</blti:launch_url>
  <blti:secure_launch_url>${APP_BASE_URL}/lti/launch-1p1</blti:secure_launch_url>
  <blti:extensions platform="moodle.example.com">
    <lticm:property name="tool_type">BasicLTI</lticm:property>
  </blti:extensions>
</cartridge_basiclti_link>`;
  res.setHeader("Content-Type", "application/xml");
  res.send(xmlBody);
});

app.get("/dev/login", (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).send("Not found");
  }
  const teacher = upsertTeacher("מורה לדוגמה");
  const space = upsertSpace("מרחב לדוגמה");
  logLaunch("dev-login", true, teacher.name, space.title, "");
  setSession(res, {
    teacherName: teacher.name,
    teacherId: teacher.id,
    spaceTitle: space.title,
    spaceId: space.id,
    source: "dev-login"
  });
  res.redirect("/");
});

app.post("/lti/launch-1p1", (req, res) => {
  const body = req.body || {};
  const teacher = upsertTeacher(body.lis_person_name_full || body.user_id || "מורה", body.user_id || "lti11-user");
  const space = upsertSpace(body.context_title || "מרחב Moodle", body.context_id || "lti11-space");
  captureMoodlePayload("lti11", body);
  logLaunch("lti11", true, teacher.name, space.title, "");
  setSession(res, {
    teacherName: teacher.name,
    teacherId: teacher.id,
    spaceTitle: space.title,
    spaceId: space.id,
    source: "lti11"
  });
  res.redirect("/");
});

app.get("/api/bootstrap", (req, res) => {
  const s = getSession(req);
  if (!s) {
    return res.status(401).json({ ok: false, error: "NO_SESSION" });
  }

  const lastLaunch = store.launches.length ? store.launches[store.launches.length - 1] : null;
  const lastCapture = store.moodleCaptures.length ? store.moodleCaptures[store.moodleCaptures.length - 1] : null;

  res.json({
    ok: true,
    teacher: { name: s.teacherName, id: s.teacherId },
    space: { title: s.spaceTitle, id: s.spaceId },
    source: s.source,
    dataReady: {
      hasRealLaunch: store.moodleCaptures.some(c => c.source === "lti11"),
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

app.get("/api/launches", (_req, res) => res.json([...store.launches].reverse()));
app.get("/api/students", (_req, res) => res.json(store.students));
app.get("/api/tasks", (_req, res) => res.json(store.tasks));
app.get("/api/grades", (_req, res) => res.json(store.grades));
app.get("/api/activity", (_req, res) => res.json({ sessions: store.activitySessions, dailySummaries: [] }));
app.get("/api/settings", (_req, res) => res.json(store.settings));

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

app.get("/api/moodle-captures", (_req, res) => res.json([...store.moodleCaptures].reverse()));

app.get("/api/export/grades.csv", (_req, res) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=grades-export.csv");
  res.send(buildGradesCsv());
});

// SPA fallback: any non-API GET route returns the React app so client-side
// routing (e.g. /guide) works on a full-page load. Falls back to the legacy
// dashboard.html only if the Vite build is missing.
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  }
  if (HAS_DIST) {
    return res.sendFile(DIST_INDEX);
  }
  res.sendFile(path.join(ROOT, "src", "ui", "dashboard", "dashboard.html"));
});

app.listen(PORT, () => {
  console.log(`moodle-teacher-hub running on ${APP_BASE_URL}`);
});