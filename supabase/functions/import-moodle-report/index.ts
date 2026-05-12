// Supabase Edge Function: import-moodle-report
// Status: source code only. Do not deploy until the reviewed Supabase schema is applied.
//
// Purpose:
// Receives real Moodle report rows from the frontend Import screen, validates an LTI session token,
// records an import batch, and returns a truthful response. It does not create demo data and does not
// claim success unless the database insert succeeds.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ReportType = "students" | "grades" | "logs" | "completion" | "unknown";
type SourceKind = "upload" | "paste";

type ImportBody = {
  report_type?: ReportType;
  file_name?: string | null;
  file_size_bytes?: number | null;
  source_kind?: SourceKind;
  detection_confidence?: number | null;
  column_mapping?: Record<string, string> | null;
  payload?: unknown;
};

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-lti-session",
  "access-control-allow-methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function normalizeRows(payload: unknown): Record<string, unknown>[] {
  if (!Array.isArray(payload)) return [];
  return payload.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object" && !Array.isArray(row));
}

function validateBody(body: ImportBody): { ok: true; rows: Record<string, unknown>[]; reportType: ReportType } | { ok: false; status: number; error: string; message_he: string } {
  const reportType = body.report_type ?? "unknown";
  if (!["students", "grades", "logs", "completion", "unknown"].includes(reportType)) {
    return { ok: false, status: 400, error: "unsupported_report_type", message_he: "סוג הדוח אינו נתמך." };
  }

  const rows = normalizeRows(body.payload);
  if (rows.length === 0) {
    return { ok: false, status: 400, error: "empty_payload", message_he: "לא התקבלו שורות אמיתיות לייבוא." };
  }

  return { ok: true, rows, reportType };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed", message_he: "נקודת הייבוא מקבלת רק POST." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        ok: false,
        error: "missing_server_environment",
        message_he: "חסרה הגדרת Supabase בצד השרת. לא ניתן לשמור ייבוא אמיתי.",
      },
      503,
    );
  }

  const token = req.headers.get("x-lti-session")?.trim();
  if (!token) {
    return jsonResponse(
      {
        ok: false,
        error: "missing_session",
        message_he: "אין סשן Moodle מאומת. יש לפתוח את הכלי מתוך Moodle לפני ייבוא נתונים.",
      },
      401,
    );
  }

  let body: ImportBody;
  try {
    body = await req.json();
  } catch (_err) {
    return jsonResponse({ ok: false, error: "invalid_json", message_he: "גוף הבקשה אינו JSON תקין." }, 400);
  }

  const validation = validateBody(body);
  if (!validation.ok) {
    return jsonResponse({ ok: false, error: validation.error, message_he: validation.message_he }, validation.status);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: session, error: sessionError } = await supabase
    .from("teacher_sessions")
    .select("id, site_id, course_id, course_title, moodle_username, role, expires_at")
    .eq("session_token", token)
    .maybeSingle();

  if (sessionError) {
    return jsonResponse(
      {
        ok: false,
        error: "session_lookup_failed",
        detail: sessionError.message,
        message_he: "בדיקת הסשן מול Supabase נכשלה.",
      },
      500,
    );
  }

  if (!session) {
    return jsonResponse(
      {
        ok: false,
        error: "invalid_session",
        message_he: "סשן Moodle לא נמצא או אינו תקף.",
      },
      401,
    );
  }

  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
    return jsonResponse(
      {
        ok: false,
        error: "expired_session",
        message_he: "סשן Moodle פג תוקף. יש לפתוח את הכלי מחדש מתוך Moodle.",
      },
      401,
    );
  }

  if (!session.site_id || session.course_id === null || session.course_id === undefined) {
    return jsonResponse(
      {
        ok: false,
        error: "incomplete_session_context",
        message_he: "חסר site_id או course_id בסשן. אי אפשר לשמור נתונים בלי הפרדה בין מרחבים.",
      },
      409,
    );
  }

  const warnings: string[] = [];
  if (validation.reportType === "unknown") warnings.push("סוג הדוח לא זוהה בביטחון ולכן נשמר רק רישום אצווה עד מיפוי עמודות ידני.");

  const { data: batch, error: batchError } = await supabase
    .from("import_batches")
    .insert({
      site_id: session.site_id,
      course_id: session.course_id,
      session_id: session.id,
      report_type: validation.reportType,
      source_kind: body.source_kind ?? (body.file_name ? "upload" : "paste"),
      status: "completed",
      row_count: validation.rows.length,
      file_name: body.file_name ?? null,
      file_size_bytes: body.file_size_bytes ?? null,
      detection_confidence: body.detection_confidence ?? null,
      column_mapping: body.column_mapping ?? null,
      warnings,
      imported_by_username: session.moodle_username ?? null,
    })
    .select("id, row_count, warnings")
    .single();

  if (batchError) {
    return jsonResponse(
      {
        ok: false,
        error: "import_batch_insert_failed",
        detail: batchError.message,
        message_he: "שמירת הייבוא נכשלה. ייתכן שסכמת Supabase עדיין לא הופעלה או לא תואמת לקוד.",
      },
      500,
    );
  }

  return jsonResponse({
    ok: true,
    batch_id: batch.id,
    row_count: batch.row_count,
    warnings: batch.warnings ?? warnings,
    message_he: "אצוות הייבוא נשמרה בהצלחה. עיבוד שורות מלא לפי סוג דוח יתווסף רק אחרי אישור סכמת Supabase.",
  });
});
