import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

/**
 * Moodle Teacher Hub server source.
 * Runtime server is src/server.js.
 * Canonical LTI endpoint: /api/lti/launch
 * Production rule: no fake sessions, no demo fallback, OAuth1 HMAC-SHA1 is required.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const CANONICAL_LTI_ENDPOINT = "/api/lti/launch";

function rfc3986(input: unknown): string {
  return encodeURIComponent(String(input))
    .replace(/[!'()*]/g, ch => "%" + ch.charCodeAt(0).toString(16).toUpperCase());
}

function normalizeUrl(url: string): string {
  const u = new URL(url);
  u.hash = "";
  u.search = "";
  const protocol = u.protocol.toLowerCase();
  const hostname = u.hostname.toLowerCase();
  const port = u.port && !((protocol === "http:" && u.port === "80") || (protocol === "https:" && u.port === "443")) ? `:${u.port}` : "";
  return `${protocol}//${hostname}${port}${u.pathname}`;
}

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function getPublicBaseUrl(req: express.Request): string {
  const configured = process.env.APP_BASE_URL || process.env.PUBLIC_BASE_URL || "";
  if (configured) return configured.replace(/\/+$/, "");
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "http");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host);
  return `${proto}://${host}`.replace(/\/+$/, "");
}

function collectOAuthParams(req: express.Request, launchUrl: string): [string, string][] {
  const params: [string, string][] = [];
  const body = (req.body || {}) as Record<string, unknown>;
  const url = new URL(launchUrl);

  for (const [k, v] of Object.entries(body)) {
    if (k === "oauth_signature") continue;
    if (Array.isArray(v)) {
      for (const item of v) params.push([rfc3986(k), rfc3986(item)]);
    } else {
      params.push([rfc3986(k), rfc3986(v ?? "")]);
    }
  }

  for (const [k, v] of url.searchParams.entries()) {
    if (k === "oauth_signature") continue;
    params.push([rfc3986(k), rfc3986(v)]);
  }

  return params.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
}

function oauthBaseString(req: express.Request, launchUrl: string): string {
  const normalized = normalizeUrl(launchUrl);
  const paramString = collectOAuthParams(req, launchUrl).map(([k, v]) => `${k}=${v}`).join("&");
  return ["POST", rfc3986(normalized), rfc3986(paramString)].join("&");
}

function verifyLti11Signature(req: express.Request, launchUrl: string): { ok: true; code: string } | { ok: false; status: number; code: string; message: string } {
  const secret = process.env.LTI_SHARED_SECRET || "";
  const expectedKey = process.env.LTI_CONSUMER_KEY || "";
  const body = (req.body || {}) as Record<string, string>;

  if (!secret) return { ok: false, status: 503, code: "MISSING_LTI_SHARED_SECRET", message: "LTI shared secret is not configured." };
  if (!body.oauth_signature) return { ok: false, status: 401, code: "MISSING_OAUTH_SIGNATURE", message: "Missing OAuth signature." };
  if (!body.oauth_consumer_key) return { ok: false, status: 401, code: "MISSING_CONSUMER_KEY", message: "Missing OAuth consumer key." };
  if (expectedKey && body.oauth_consumer_key !== expectedKey) return { ok: false, status: 401, code: "BAD_CONSUMER_KEY", message: "OAuth consumer key does not match." };
  if (!body.oauth_nonce || !body.oauth_timestamp) return { ok: false, status: 401, code: "MISSING_NONCE_OR_TIMESTAMP", message: "Missing OAuth nonce or timestamp." };
  if (String(body.oauth_signature_method || "").toUpperCase() !== "HMAC-SHA1") return { ok: false, status: 401, code: "UNSUPPORTED_SIGNATURE_METHOD", message: "Only HMAC-SHA1 is supported." };

  const ts = Number(body.oauth_timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (process.env.LTI_ALLOW_OLD_TIMESTAMP !== "true" && (!Number.isFinite(ts) || Math.abs(now - ts) > 600)) {
    return { ok: false, status: 401, code: "STALE_OAUTH_TIMESTAMP", message: "OAuth timestamp is outside the allowed window." };
  }

  const base = oauthBaseString(req, launchUrl);
  const expected = crypto.createHmac("sha1", `${rfc3986(secret)}&`).update(base).digest("base64");
  if (!safeEqual(expected, body.oauth_signature)) return { ok: false, status: 401, code: "BAD_OAUTH_SIGNATURE", message: "OAuth signature verification failed." };

  return { ok: true, code: "OAUTH_VERIFIED" };
}

async function startServer(): Promise<void> {
  const app = express();
  app.set("trust proxy", true);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "moodle-teacher-hub",
      canonicalLtiEndpoint: CANONICAL_LTI_ENDPOINT,
      oauthVerification: "required",
      readyForMoodleUse: !!(process.env.LTI_SHARED_SECRET && process.env.LTI_CONSUMER_KEY),
      now: new Date().toISOString()
    });
  });

  app.post(CANONICAL_LTI_ENDPOINT, async (req, res) => {
    const base = getPublicBaseUrl(req);
    const launchUrl = `${base}${CANONICAL_LTI_ENDPOINT}`;
    const verification = verifyLti11Signature(req, launchUrl);

    if (!verification.ok) {
      return res.status(verification.status).send(`Moodle Teacher Hub blocked launch: ${verification.code}`);
    }

    const sessionToken = crypto.randomUUID();
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
      await supabase.from("teacher_sessions").insert({
        session_token: sessionToken,
        course_id: req.body.context_id,
        course_title: req.body.context_title,
        moodle_username: req.body.ext_user_username || req.body.lis_person_name_full || req.body.user_id,
        role: "teacher",
        created_at: new Date().toISOString()
      });
    }

    res.redirect(`/lti-bootstrap?t=${encodeURIComponent(sessionToken)}&course=${encodeURIComponent(req.body.context_title || "")}`);
  });

  const distPath = path.join(ROOT, "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`moodle-teacher-hub running on port ${PORT}`);
    console.log(`canonical LTI endpoint: ${CANONICAL_LTI_ENDPOINT}`);
  });
}

startServer();
