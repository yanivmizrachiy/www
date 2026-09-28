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

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

const ENV = loadEnvFile();
const APP_BASE_URL = ENV.APP_BASE_URL || `http://127.0.0.1:${PORT}`;
const STORE_DIR = path.join(ROOT, "data");
const STORE_PATH = path.join(STORE_DIR, "store.json");

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });

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

function normalizeStore(raw) {
  const d = defaultStore();
  return {
    launches: Array.isArray(raw.launches) ? raw.launches : d.launches,
    teachers: Array.isArray(raw.teachers) ? raw.teachers : d.teachers,
    spaces: Array.isArray(raw.spaces) ? raw.spaces : d.spaces,
    students: Array.isArray(raw.students) ? raw.students : d.students,
    tasks: Array.isArray(raw.tasks) ? raw.tasks : d.tasks,
    grades: Array.isArray(raw.grades) ? raw.grades : d.grades,
    activitySessions: Array.isArray(raw.activitySessions) ? raw.activitySessions : d.activitySessions,
    moodleCaptures: Array.isArray(raw.moodleCaptures) ? raw.moodleCaptures : d.moodleCaptures,
    settings: typeof raw.settings === "object" && raw.settings ? { ...d.settings, ...raw.settings } : d.settings
  };
}

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    const s = defaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(s, null, 2), "utf8");
    return s;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
    const s = normalizeStore(raw);
    fs.writeFileSync(STORE_PATH, JSON.stringify(s, null, 2), "utf8");
    return s;
  } catch {
    const s = defaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(s, null, 2), "utf8");
    return s;
  }
}

const store = loadStore();

function saveStore() {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function sendHtmlFile(res, filePath, status = 200) {
  res.status(status);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.sendFile(filePath);
}

function sendHtml(res, html, status = 200) {
  res.status(status);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(html);
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
  const allowed = {};
  const keys = [
    "user_id","roles","context_id","context_title","resource_link_id",
    "lis_person_name_full","lis_person_contact_email_primary",
    "custom_canvas_course_id","tool_consumer_instance_name",
    "tool_consumer_info_product_family_code","oauth_consumer_key"
  ];
  for (const k of keys) {
    if (body[k] !== undefined) allowed[k] = body[k];
  }
  const record = {
    id: uuidv4(),
    source,
    createdAt: new Date().toISOString(),
    keys: Object.keys(body).sort(),
    important: allowed,
    rawCount: Object.keys(body).length
  };
  store.moodleCaptures.push(record);
  if (store.moodleCaptures.length > 100) {
    store.moodleCaptures.splice(0, store.moodleCaptures.length - 100);
  }
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();
  return record;
}

function getSession(req) {
  const sid = req.cookies?.sid;
  if (!sid) return null;
  return sessions.get(sid) || null;
}

function setSession(res, data) {
  const sid = uuidv4();
  sessions.set(sid, data);
  res.cookie("sid", sid, { httpOnly: true, sameSite: "none", secure: true });
}

function toCsv(rows) {
  return rows.map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

function groupByDate(activityRows) {
  const map = new Map();
  for (const row of activityRows) {
    if (!row.startedAt || !row.endedAt) continue;
    const start = new Date(row.startedAt);
    const end = new Date(row.endedAt);
    const key = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,"0")}-${String(start.getDate()).padStart(2,"0")}`;
    const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    const cur = map.get(key) || { date: key, totalMinutes: 0, ranges: [] };
    cur.totalMinutes += mins;
    cur.ranges.push({
      start: `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}`,
      end: `${String(end.getHours()).padStart(2,"0")}:${String(end.getMinutes()).padStart(2,"0")}`,
      minutes: mins
    });
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));
}

const app = express();
const sessions = new Map();

app.use(helmet({ contentSecurityPolicy: false, frameguard: false, crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => { res.removeHeader("X-Frame-Options"); next(); });

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "moodle-teacher-hub",
    appBaseUrl: APP_BASE_URL,
    lti11Ready: {
      key: !!ENV.LTI11_KEY,
      secret: !!ENV.LTI11_SECRET,
      launch_url: !!APP_BASE_URL
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
  res.json({
    ok: true,
    version: "LTI 1.1",
    launch_url: `${APP_BASE_URL}/lti/launch-1p1`,
    consumer_key: ENV.LTI11_KEY || "",
    shared_secret: ENV.LTI11_SECRET || ""
  });
});

app.get("/dev/login", (_req, res) => {
  const teacher = upsertTeacher("מורה לדוגמה", "teacher-demo");
  const space = upsertSpace("מרחב לדוגמה", "space-demo");
  logLaunch("dev-login", true, teacher.name, space.title, "");
  setSession(res, {
    teacherName: teacher.name,
    teacherId: teacher.id,
    spaceTitle: space.title,
    spaceId: space.id,
    source: "dev-login"
  });
  return res.redirect("/");
});

app.get("/lti/launch-1p1", (_req, res) => {
  return sendHtmlFile(res, path.join(__dirname, "views", "landing.html"));
});

app.post("/lti/launch-1p1", (req, res) => {
  const teacherName = req.body.lis_person_name_full || "מורה";
  const teacherExt = req.body.user_id || "lti11-user";
  const spaceTitle = req.body.context_title || "מרחב Moodle";
  const spaceExt = req.body.context_id || "lti11-space";

  const teacher = upsertTeacher(teacherName, teacherExt);
  const space = upsertSpace(spaceTitle, spaceExt);
  const cap = captureMoodlePayload("lti11", req.body);

  logLaunch("lti11", true, teacher.name, space.title, "");
  setSession(res, {
    teacherName: teacher.name,
    teacherId: teacher.id,
    spaceTitle: space.title,
    spaceId: space.id,
    source: "lti11",
    captureId: cap.id
  });
  return res.redirect("/");
});

app.get("/api/bootstrap", (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_SESSION" });

  res.json({
    ok: true,
    teacher: { name: session.teacherName, id: session.teacherId },
    space: { title: session.spaceTitle, id: session.spaceId },
    source: session.source,
    dashboard: {
      launches: store.launches.length,
      totalStudents: store.students.length,
      totalTasks: store.tasks.length,
      missingSubmissions: 0,
      missingScores: 0
    }
  });
});

app.get("/api/launches", (_req, res) => {
  res.json(store.launches.slice().reverse());
});

app.get("/api/students", (_req, res) => {
  res.json(store.students);
});

app.get("/api/tasks", (_req, res) => {
  res.json(store.tasks);
});

app.get("/api/grades", (_req, res) => {
  res.json(store.grades);
});

app.get("/api/activity", (_req, res) => {
  const studentId = String(_req.query.studentId || "");
  const rows = studentId ? store.activitySessions.filter(x => x.studentId === studentId) : store.activitySessions;
  res.json({
    sessions: rows,
    dailySummaries: groupByDate(rows)
  });
});

app.get("/api/settings", (_req, res) => {
  res.json(store.settings);
});

app.get("/api/moodle-captures", (_req, res) => {
  res.json(store.moodleCaptures.slice().reverse());
});

app.get("/api/moodle-summary", (_req, res) => {
  const last = store.moodleCaptures.length ? store.moodleCaptures[store.moodleCaptures.length - 1] : null;
  res.json({
    capturesCount: store.moodleCaptures.length,
    lastCaptureAt: last ? last.createdAt : null,
    lastSource: last ? last.source : null,
    availableKeys: last ? last.keys : [],
    important: last ? last.important : {}
  });
});

app.get("/api/export/grades.csv", (_req, res) => {
  const rows = [
    ["שם תלמיד","קבוצה","משימה","ציון","תאריך"],
    ...store.grades.map(x => [x.studentName || "", x.groupName || "", x.taskName || "", x.grade ?? "", x.date || ""])
  ];
  const csv = toCsv(rows);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=grades-export.csv");
  res.send("\uFEFF" + csv);
});

app.get("/", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return sendHtml(res, `
      <!doctype html>
      <html lang="he" dir="rtl">
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>מרכז משימות ודוחות</title></head>
      <body style="font-family:Arial,sans-serif;padding:30px;background:#f4f7fb">
        <h1>מרכז משימות ודוחות</h1>
        <p>אין session פעיל.</p>
        <p><a href="/dev/login">כניסת בדיקה</a></p>
      </body>
      </html>
    `);
  }
  return sendHtmlFile(res, path.join(__dirname, "views", "dashboard.html"));
});

app.listen(PORT, () => {
  console.log(`moodle-teacher-hub running on http://127.0.0.1:${PORT}`);
});



