import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function sha256(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  return crypto.createHash("sha256").update(text.toLowerCase()).digest("hex");
}

function persistenceConfig() {
  const url = env("VITE_SUPABASE_URL");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");

  return {
    configured: Boolean(url && serviceRoleKey),
    urlHost: url ? (() => { try { return new URL(url).host; } catch { return "INVALID_URL"; } })() : null,
    missing: [
      !url ? "VITE_SUPABASE_URL" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null
    ].filter(Boolean)
  };
}

function supabaseAdminClient() {
  const cfg = persistenceConfig();
  if (!cfg.configured) return null;

  return createClient(env("VITE_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false }
  });
}

function sourceContext(session = {}) {
  return {
    issuer: session.issuer || session.platformIssuer || "unknown-issuer",
    client_id: session.clientId || session.client_id || "unknown-client",
    deployment_id: session.deploymentId || session.deployment_id || "unknown-deployment",
    context_id: String(session.contextId || session.context_id || session.courseId || session.spaceId || "unknown-context"),
    course_title: session.courseTitle || session.spaceTitle || null,
    lti_user_id: String(session.moodleUserId || session.userId || session.teacherId || "unknown-teacher"),
    display_name: session.teacherName || session.moodleUsername || null
  };
}

function studentRowsForPersistence(students = [], courseId, importBatchId) {
  return students.map((student) => {
    const email = student.email || null;
    return {
      course_id: courseId,
      import_batch_id: importBatchId,
      full_name: student.full_name || student.fullName || student.name || "Unknown student",
      email,
      email_hash: sha256(email),
      external_username: student.external_username || student.externalUsername || null,
      external_id: student.external_id || student.externalId || null,
      moodle_user_id: student.moodle_user_id || student.moodleUserId || null,
      lis_person_sourcedid: student.lis_person_sourcedid || student.lisPersonSourcedId || null,
      nrps_user_id: student.nrps_user_id || student.nrpsUserId || null,
      source_type: "participants"
    };
  });
}

export function persistenceStatus() {
  const cfg = persistenceConfig();
  return {
    ok: true,
    mode: "moodle-teacher-hub-persistence-status",
    configured: cfg.configured,
    url_host: cfg.urlHost,
    missing: cfg.missing,
    writes_enabled: cfg.configured,
    privacy: {
      no_service_role_key_returned: true,
      no_student_names_returned: true,
      no_student_emails_returned: true,
      no_write_performed: true
    }
  };
}

export async function persistParticipantsImportIfConfigured({ session, batch, students }) {
  const cfg = persistenceConfig();

  if (!cfg.configured) {
    return {
      ok: false,
      skipped: true,
      reason: "SUPABASE_PERSISTENCE_NOT_CONFIGURED",
      missing: cfg.missing
    };
  }

  const supabase = supabaseAdminClient();
  const ctx = sourceContext(session);

  const { data: teacher, error: teacherError } = await supabase
    .from("mth_teachers")
    .upsert({
      issuer: ctx.issuer,
      client_id: ctx.client_id,
      deployment_id: ctx.deployment_id,
      lti_user_id: ctx.lti_user_id,
      display_name: ctx.display_name,
      email: null,
      email_hash: null,
      updated_at: new Date().toISOString()
    }, { onConflict: "issuer,client_id,deployment_id,lti_user_id" })
    .select("id")
    .single();

  if (teacherError) return { ok: false, skipped: false, stage: "teacher", reason: teacherError.message };

  const { data: course, error: courseError } = await supabase
    .from("mth_courses")
    .upsert({
      issuer: ctx.issuer,
      client_id: ctx.client_id,
      deployment_id: ctx.deployment_id,
      context_id: ctx.context_id,
      course_title: ctx.course_title,
      updated_at: new Date().toISOString()
    }, { onConflict: "issuer,client_id,deployment_id,context_id" })
    .select("id")
    .single();

  if (courseError) return { ok: false, skipped: false, stage: "course", reason: courseError.message };

  const { data: importBatch, error: batchError } = await supabase
    .from("mth_import_batches")
    .insert({
      teacher_id: teacher.id,
      course_id: course.id,
      source_type: "participants",
      original_filename_hash: sha256(batch?.file_name || batch?.fileName || ""),
      row_count: Number(batch?.row_count ?? batch?.rowCount ?? students.length ?? 0),
      accepted_count: Number(batch?.accepted_count ?? batch?.acceptedCount ?? students.length ?? 0),
      skipped_count: Number(batch?.skipped_count ?? batch?.skippedCount ?? 0),
      status: "completed",
      warnings: Array.isArray(batch?.warnings) ? batch.warnings : []
    })
    .select("id")
    .single();

  if (batchError) return { ok: false, skipped: false, stage: "batch", reason: batchError.message };

  const rows = studentRowsForPersistence(students, course.id, importBatch.id);

  if (rows.length === 0) {
    return { ok: true, skipped: false, stage: "students", persisted_students: 0, import_batch_id: importBatch.id };
  }

  const { error: studentsError } = await supabase
    .from("mth_students")
    .insert(rows);

  if (studentsError) return { ok: false, skipped: false, stage: "students", reason: studentsError.message };

  return {
    ok: true,
    skipped: false,
    stage: "done",
    persisted_students: rows.length,
    import_batch_id: importBatch.id,
    privacy: {
      no_student_names_returned: true,
      no_student_emails_returned: true,
      no_service_role_key_returned: true
    }
  };
}
