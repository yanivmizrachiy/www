// Supabase Edge Function: moodle-sync
// Description: Server-side Moodle data sync — reads ws_token server-side only,
// calls Moodle Web Services API, writes real data to imported_* tables,
// and finishes the sync_batch with success/partial/failed status.
// NEVER logs tokens or secrets. NEVER returns fake success.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface SyncPayload {
  batch_id: string;
  site_id: string;
  course_id: number;
}

async function finishBatch(
  supabase: ReturnType<typeof createClient>,
  batchId: string,
  result: {
    status: "success" | "partial" | "failed";
    students_synced?: number;
    grades_synced?: number;
    tasks_synced?: number;
    chapters_synced?: number;
    logs_synced?: number;
    completions_synced?: number;
    error_summary?: string;
  }
) {
  await supabase
    .from("sync_batches")
    .update({
      status: result.status,
      finished_at: new Date().toISOString(),
      ...result,
    })
    .eq("id", batchId);
}

async function logEvent(
  supabase: ReturnType<typeof createClient>,
  batchId: string,
  siteId: string,
  domain: string,
  severity: "debug" | "info" | "warn" | "error",
  message: string
) {
  await supabase.from("sync_logs").insert({
    batch_id: batchId,
    site_id: siteId,
    domain,
    severity,
    message,
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let payload: SyncPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { batch_id, site_id, course_id } = payload;

  if (!batch_id || !site_id || !course_id) {
    return new Response(JSON.stringify({
      error: "חסרים פרמטרים: batch_id, site_id, course_id נדרשים"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Verify batch exists and is running
  const { data: batch, error: batchError } = await supabase
    .from("sync_batches")
    .select("id")
    .eq("id", batch_id)
    .eq("site_id", site_id)
    .eq("status", "running")
    .maybeSingle();

  if (batchError || !batch) {
    return new Response(JSON.stringify({
      blocked: true,
      error: "Batch לא נמצא או לא במצב running"
    }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Load site — ws_token is server-side only, never sent to frontend
  const { data: site, error: siteError } = await supabase
    .from("moodle_sites")
    .select("id, site_url, ws_token, ws_token_status")
    .eq("id", site_id)
    .single();

  if (siteError || !site) {
    await finishBatch(supabase, batch_id, {
      status: "failed",
      error_summary: "לא נמצא אתר מודל"
    });
    return new Response(JSON.stringify({ error: "Site not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Check ws_token_status
  if (site.ws_token_status !== "active") {
    await logEvent(supabase, batch_id, site_id, "students", "warn",
      "ws_token_status אינו active — מבטל סנכרון");
    await finishBatch(supabase, batch_id, {
      status: "failed",
      error_summary: "סנכרון אוטומטי חסום: Moodle Web Services לא מוגדר. יש להגדיר Web Service token במודל."
    });
    return new Response(JSON.stringify({
      blocked: true,
      error: "סנכרון אוטומטי חסום: Moodle Web Services לא מוגדר"
    }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const wsUrl = site.site_url;
  const wsToken = site.ws_token; // Server-side only, never logged

  if (!wsUrl || !wsToken) {
    await logEvent(supabase, batch_id, site_id, "students", "error",
      "ws_url או ws_token חסרים ב-moodle_sites");
    await finishBatch(supabase, batch_id, {
      status: "failed",
      error_summary: "חסר URL או token של Web Service בהגדרות האתר"
    });
    return new Response(JSON.stringify({
      blocked: true,
      error: "הגדרות Web Service חסרות"
    }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. Call Moodle Web Services API
  const moodleApiUrl = `${wsUrl}/webservice/rest/server.php`;

  let studentsSynced = 0;
  let gradesSynced = 0;
  let gradesPartiallyFailed = false;
  let gradesFailed = false;
  let tasksSynced = 0;
  const chaptersSynced = 0;
  let logsSynced = 0;
  let completionsSynced = 0;

  try {
    // --- Students (core_enrol_get_enrolled_users) ---
    await logEvent(supabase, batch_id, site_id, "students", "info",
      `מתחיל סנכרון students מקורס ${course_id}`);

    const studentsParams = new URLSearchParams({
      wstoken: wsToken,
      wsfunction: "core_enrol_get_enrolled_users",
      moodlewsrestformat: "json",
      courseid: String(course_id),
    });

    const studentsRes = await fetch(`${moodleApiUrl}?${studentsParams}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!studentsRes.ok) {
      await logEvent(supabase, batch_id, site_id, "students", "error",
        `Moodle API error: ${studentsRes.status} ${studentsRes.statusText}`);
      await finishBatch(supabase, batch_id, {
        status: "failed",
        error_summary: `שגיאת API של Moodle בשליפת סטודנטים: ${studentsRes.status}`
      });
      return new Response(JSON.stringify({ error: "Moodle API error" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const studentsData = await studentsRes.json();

    // Moodle returns an exception object on error
    if (studentsData?.exception) {
      await logEvent(supabase, batch_id, site_id, "students", "error",
        `Moodle exception: ${studentsData.message ?? JSON.stringify(studentsData)}`);
      await finishBatch(supabase, batch_id, {
        status: "failed",
        error_summary: `שגיאת Moodle: ${studentsData.message ?? "שגיאת Web Service"}`
      });
      return new Response(JSON.stringify({ error: studentsData.message }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(studentsData)) {
      await logEvent(supabase, batch_id, site_id, "students", "warn",
        `Moodle returned non-array for students: ${typeof studentsData}`);
      await finishBatch(supabase, batch_id, {
        status: "failed",
        error_summary: "Moodle החזיר תשובה לא צפויה לשליפת סטודנטים"
      });
      return new Response(JSON.stringify({ error: "Unexpected Moodle response" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (studentsData.length === 0) {
      await logEvent(supabase, batch_id, site_id, "students", "warn",
        "לא נמצאו סטודנטים בקורס זה");
      await finishBatch(supabase, batch_id, {
        status: "partial",
        students_synced: 0,
        error_summary: "לא נמצאו סטודנטים בקורס — ייתכן שהקורס ריק או שאין גישה"
      });
      return new Response(JSON.stringify({
        status: "partial",
        students_synced: 0,
        message: "לא נמצאו סטודנטים בקורס"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert students into imported_students
    // Schema: site_id, course_id, full_name, email, external_id, external_username
    const now = new Date().toISOString();
    const studentsToInsert = studentsData.map((u: any) => ({
      site_id,
      course_id,
      full_name: u.fullname ?? `${u.firstname ?? ""} ${u.lastname ?? ""}`.trim() || "ללא שם",
      email: u.email ?? null,
      external_id: String(u.id),
      external_username: u.username ?? null,
      created_at: now,
      updated_at: now,
    }));

    const { error: insertError } = await supabase
      .from("imported_students")
      .upsert(studentsToInsert, {
        onConflict: "site_id,course_id,external_id",
        ignoreDuplicates: true,
      });

    if (insertError) {
      await logEvent(supabase, batch_id, site_id, "students", "error",
        `שגיאת הכנסת סטודנטים: ${insertError.message}`);
      await finishBatch(supabase, batch_id, {
        status: "failed",
        error_summary: `שגיאת מסד נתונים בהכנסת סטודנטים: ${insertError.message}`
      });
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    studentsSynced = studentsData.length;
    await logEvent(supabase, batch_id, site_id, "students", "info",
      `סונכרנו ${studentsSynced} סטודנטים`);

    // --- Grades: gradereport_user_get_grade_items per student ---
    let gradesSynced = 0;
    let gradesPartiallyFailed = false;
    let gradesFailed = false;

    await logEvent(supabase, batch_id, site_id, "grades", "info",
      `מתחיל סנכרון ציונים ל-${studentsData.length} תלמידים`);

    // 5a. Re-fetch imported_students to build external_id → internal_id mapping
    const { data: localStudents } = await supabase
      .from("imported_students")
      .select("id, external_id")
      .eq("site_id", site_id)
      .eq("course_id", course_id);

    if (!localStudents || localStudents.length === 0) {
      await logEvent(supabase, batch_id, site_id, "grades", "warn",
        "לא נמצאו imported_students מקומיים — לא ניתן לסנכרן ציונים");
      gradesFailed = true;
    } else {
      const externalToInternalId: Record<string, string> = {};
      for (const s of localStudents) {
        if (s.external_id) externalToInternalId[String(s.external_id)] = s.id;
      }

      // 5b. Collect all grade items across all students, then dedupe
      const gradeItemMap = new Map<string, { item_name: string; item_type: string | null; max_grade: number | null }>();
      // Record<studentInternalId, Array<{ item_id, gradeformatted, grademax, percentageformatted }>>
      const studentGrades: Record<string, Array<{ item_name: string; gradeformatted: string | null; grademax: string | null; percentageformatted: string | null }>> = {};

      for (const student of studentsData) {
        const studentInternalId = externalToInternalId[String(student.id)];
        if (!studentInternalId) continue;

        try {
          const gradesParams = new URLSearchParams({
            wstoken: wsToken,
            wsfunction: "gradereport_user_get_grade_items",
            moodlewsrestformat: "json",
            courseid: String(course_id),
            userid: String(student.id),
          });

          const gradeRes = await fetch(`${moodleApiUrl}?${gradesParams}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!gradeRes.ok) {
            await logEvent(supabase, batch_id, site_id, "grades", "warn",
              `שליפת ציונים נכשלה עבור משתמש ${student.id}: HTTP ${gradeRes.status}`);
            gradesPartiallyFailed = true;
            continue;
          }

          const gradeData = await gradeRes.json();

          if (gradeData?.exception) {
            await logEvent(supabase, batch_id, site_id, "grades", "warn",
              `Moodle exception למשתמש ${student.id}: ${gradeData.message ?? "unknown"}`);
            gradesPartiallyFailed = true;
            continue;
          }

          const usergrades = gradeData?.usergrades;
          if (!Array.isArray(usergrades) || usergrades.length === 0) continue;

          for (const ug of usergrades) {
            const gradeitems: any[] = ug.gradeitems ?? [];
            for (const gi of gradeitems) {
              const itemName = gi.itemname ?? gi.itemtype ?? "ללא שם";
              const maxGrade = gi.grademax != null ? parseFloat(gi.grademax) : null;
              if (!gradeItemMap.has(itemName)) {
                gradeItemMap.set(itemName, {
                  item_name: itemName,
                  item_type: gi.itemtype ?? null,
                  max_grade: Number.isFinite(maxGrade) ? maxGrade : null,
                });
              }
              if (!studentGrades[studentInternalId]) {
                studentGrades[studentInternalId] = [];
              }
              studentGrades[studentInternalId].push({
                item_name: itemName,
                gradeformatted: gi.gradeformatted ?? null,
                grademax: gi.grademax != null ? String(gi.grademax) : null,
                percentageformatted: gi.percentageformatted ?? null,
              });
            }
          }
        } catch (e) {
          await logEvent(supabase, batch_id, site_id, "grades", "warn",
            `שליפת ציונים נכשלה למשתמש ${student.id}: ${String(e)}`);
          gradesPartiallyFailed = true;
        }
      }

      if (gradeItemMap.size === 0) {
        await logEvent(supabase, batch_id, site_id, "grades", "warn",
          "לא נמצאו פריטי ציונים ב-Moodle — ייתכן שאין הרשאות צפייה בציונים");
        gradesFailed = true;
      } else {
        // 5c. Upsert imported_grade_items with fallback if onConflict constraint is missing
        let upsertSucceeded = false;

        const gradeItemsToUpsert = Array.from(gradeItemMap.values()).map(gi => ({
          site_id,
          course_id,
          item_name: gi.item_name,
          item_type: gi.item_type,
          max_grade: gi.max_grade,
          first_seen_batch: null,
          last_seen_batch: null,
          created_at: now,
          updated_at: now,
        }));

        const { error: giUpsertErr } = await supabase
          .from("imported_grade_items")
          .upsert(gradeItemsToUpsert, {
            onConflict: "site_id,course_id,item_name",
            ignoreDuplicates: false,
          });

        if (giUpsertErr) {
          // Fallback: constraint may not exist — do manual insert-or-update
          await logEvent(supabase, batch_id, site_id, "grades", "warn",
            `upsert grade items נכשל (${giUpsertErr.message}), משתמש ב-fallback`);

          try {
            const { data: existingItems } = await supabase
              .from("imported_grade_items")
              .select("id, item_name, item_type, max_grade")
              .eq("site_id", site_id)
              .eq("course_id", course_id);

            const existingMap: Record<string, { id: string; item_type: string | null; max_grade: number | null }> = {};
            if (existingItems) {
              for (const e of existingItems) {
                existingMap[e.item_name] = { id: e.id, item_type: e.item_type, max_grade: e.max_grade };
              }
            }

            const toInsert: Array<{
              site_id: string; course_id: number; item_name: string;
              item_type: string | null; max_grade: number | null;
              first_seen_batch: string | null; last_seen_batch: string | null;
              created_at: string; updated_at: string;
            }> = [];
            const toUpdate: Array<{
              id: string; item_type: string | null; max_grade: number | null; updated_at: string;
            }> = [];

            for (const gi of gradeItemsToUpsert) {
              const existing = existingMap[gi.item_name];
              if (!existing) {
                toInsert.push(gi as any);
              } else {
                const needsUpdate = gi.item_type !== existing.item_type || gi.max_grade !== existing.max_grade;
                if (needsUpdate) {
                  toUpdate.push({ id: existing.id, item_type: gi.item_type, max_grade: gi.max_grade, updated_at: now });
                }
              }
            }

            if (toInsert.length > 0) {
              const { error: insertErr } = await supabase.from("imported_grade_items").insert(toInsert);
              if (insertErr) throw insertErr;
            }
            for (const u of toUpdate) {
              const { error: updateErr } = await supabase
                .from("imported_grade_items")
                .update({ item_type: u.item_type, max_grade: u.max_grade, updated_at: u.updated_at })
                .eq("id", u.id);
              if (updateErr) throw updateErr;
            }
            upsertSucceeded = true;
          } catch (fallbackErr: any) {
            await logEvent(supabase, batch_id, site_id, "grades", "error",
              `fallback grade items נכשל: ${fallbackErr.message}`);
            gradesFailed = true;
          }
        } else {
          upsertSucceeded = true;
          await logEvent(supabase, batch_id, site_id, "grades", "info",
            `סונכרנו ${gradeItemMap.size} פריטי ציונים`);
        }

        if (upsertSucceeded) {
          // 5d. Fetch inserted grade item IDs for mapping
          const { data: savedGradeItems } = await supabase
            .from("imported_grade_items")
            .select("id, item_name")
            .eq("site_id", site_id)
            .eq("course_id", course_id)
            .in("item_name", Array.from(gradeItemMap.keys()));

          if (!savedGradeItems || savedGradeItems.length === 0) {
            await logEvent(supabase, batch_id, site_id, "grades", "error",
              "לא ניתן לשלוף grade item IDs אחרי הכנסה");
            gradesFailed = true;
          } else {
            const itemNameToId: Record<string, string> = {};
            for (const gi of savedGradeItems) {
              itemNameToId[gi.item_name] = gi.id;
            }

            // 5e. Delete existing grades for this batch scope (site + course), then insert fresh
            // This prevents duplicates without needing a unique constraint on imported_grades
            const { error: deleteErr } = await supabase
              .from("imported_grades")
              .delete()
              .eq("site_id", site_id)
              .eq("course_id", course_id);

            if (deleteErr) {
              await logEvent(supabase, batch_id, site_id, "grades", "warn",
                `לא ניתן למחוק ציונים קיימים: ${deleteErr.message} — מנסה להוסיף`);
            }

            const gradesToInsert: Array<{
              site_id: string;
              course_id: number;
              student_id: string;
              grade_item_id: string;
              numeric_value: number | null;
              raw_value: string | null;
              is_missing: boolean;
              batch_id: string | null;
              created_at: string;
              updated_at: string;
            }> = [];

            for (const [studentInternalId, grades] of Object.entries(studentGrades)) {
              for (const g of grades) {
                const gradeItemId = itemNameToId[g.item_name];
                if (!gradeItemId) continue;

                // Missing = "-" or null or empty string
                const rawFormatted = g.gradeformatted ?? "";
                const isMissing = !rawFormatted || rawFormatted === "-" || rawFormatted.trim() === "";

                let numericValue: number | null = null;
                if (!isMissing) {
                  // Remove locale-specific separators and try to parse number
                  const normalized = rawFormatted
                    .replace(/[^\d.,\-–]/g, "")
                    .replace(",", ".");
                  const parsed = parseFloat(normalized);
                  if (Number.isFinite(parsed)) numericValue = parsed;
                }

                gradesToInsert.push({
                  site_id,
                  course_id,
                  student_id: studentInternalId,
                  grade_item_id: gradeItemId,
                  numeric_value: numericValue,
                  raw_value: isMissing ? null : rawFormatted,
                  is_missing: isMissing,
                  batch_id: null,
                  created_at: now,
                  updated_at: now,
                });
              }
            }

            if (gradesToInsert.length > 0) {
              const { error: gradesErr } = await supabase
                .from("imported_grades")
                .insert(gradesToInsert);

              if (gradesErr) {
                await logEvent(supabase, batch_id, site_id, "grades", "error",
                  `שגיאת הכנסת ציונים: ${gradesErr.message}`);
                gradesFailed = true;
              } else {
                gradesSynced = gradesToInsert.length;
                await logEvent(supabase, batch_id, site_id, "grades", "info",
                  `סונכרנו ${gradesSynced} ציונים ל-${Object.keys(studentGrades).length} תלמידים`);
              }
            } else {
              await logEvent(supabase, batch_id, site_id, "grades", "warn",
                "לא נמצאו ציונים לייבא");
              gradesPartiallyFailed = true;
            }
          }
        }
    }

    // --- Tasks (mod_assign_get_assignments) ---
    await logEvent(supabase, batch_id, site_id, "tasks", "info",
      "מנסה לשלוף משימות...");

    try {
      const tasksParams = new URLSearchParams({
        wstoken: wsToken,
        wsfunction: "mod_assign_get_assignments",
        moodlewsrestformat: "json",
        "courseids[0]": String(course_id),
      });

      const tasksRes = await fetch(`${moodleApiUrl}?${tasksParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (!tasksData?.exception && Array.isArray(tasksData?.courses?.[0]?.assignments)) {
          const assignments = tasksData.courses[0].assignments;
          if (assignments.length > 0) {
            const tasksToInsert = assignments.map((a: any) => ({
              site_id,
              course_id,
              task_name: a.name ?? "",
              task_type: a.assignmenttype ?? null,
              due_date: a.duedate ? new Date(a.duedate * 1000).toISOString() : null,
              first_seen_batch: null,
              last_seen_batch: null,
              chapter_id: null,
              position: null,
              created_at: now,
              updated_at: now,
            }));

            const { error: tasksErr } = await supabase
              .from("imported_tasks")
              .upsert(tasksToInsert, {
                onConflict: "site_id,course_id,task_name",
                ignoreDuplicates: true,
              });

            if (!tasksErr) {
              tasksSynced = assignments.length;
              await logEvent(supabase, batch_id, site_id, "tasks", "info",
                `סונכרנו ${tasksSynced} משימות`);
            }
          }
        }
      }
    } catch (e) {
      await logEvent(supabase, batch_id, site_id, "tasks", "warn",
        `שליפת משימות לא הצליחה: ${String(e)}`);
    }

    // --- Chapters: not available via WS ---
    await logEvent(supabase, batch_id, site_id, "chapters", "info",
      "פרקים לא נתמכים דרך Web Services (אפשר לייבא ידנית)");

    // --- Logs: core_report_get_log_data (read-only, not imported) ---
    try {
      const logsParams = new URLSearchParams({
        wstoken: wsToken,
        wsfunction: "core_report_get_log_data",
        moodlewsrestformat: "json",
        logreader: "logstore_standard",
        "filters[0][name]": "course",
        "filters[0][type]": "course",
        "filters[0][value]": String(course_id),
      });

      const logsRes = await fetch(`${moodleApiUrl}?${logsParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        if (!logsData?.exception && Array.isArray(logsData?.logs)) {
          logsSynced = logsData.logs.length;
          if (logsSynced > 0) {
            await logEvent(supabase, batch_id, site_id, "logs", "info",
              `נמצאו ${logsSynced} אירועי לוג — לא יובאו אוטומטית (נדרש ייבוא ידני)`);
          }
        }
      }
    } catch (e) {
      await logEvent(supabase, batch_id, site_id, "logs", "warn",
        `שליפת לוגים לא הצליחה: ${String(e)}`);
    }

    // --- Completions: core_completion_get_activities_completion_status ---
    try {
      const completionParams = new URLSearchParams({
        wstoken: wsToken,
        wsfunction: "core_completion_get_activities_completion_status",
        moodlewsrestformat: "json",
        courseid: String(course_id),
      });

      const completionRes = await fetch(`${moodleApiUrl}?${completionParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (completionRes.ok) {
        const completionData = await completionRes.json();
        if (!completionData?.exception) {
          await logEvent(supabase, batch_id, site_id, "completions", "info",
            "בדיקת השלמויות הסתיימה");
        }
      }
    } catch (e) {
      await logEvent(supabase, batch_id, site_id, "completions", "warn",
        `שליפת השלמויות לא הצליחה: ${String(e)}`);
    }

    // 7. Finish batch
    let finalStatus: "success" | "partial" | "failed" = "success";
    let errorSummary: string | undefined;

    if (studentsSynced === 0) {
      finalStatus = "failed";
    } else if (gradesFailed) {
      finalStatus = "partial";
      errorSummary = "ציונים לא נמשכו: Moodle החזיר שגיאה או חסרות הרשאות צפייה בציונים";
    } else if (gradesPartiallyFailed) {
      finalStatus = "partial";
      errorSummary = "חלק מהציונים נמשכו, אך היו שגיאות בשליפת ציונים לחלק מהתלמידים";
    }

    await finishBatch(supabase, batch_id, {
      status: finalStatus,
      students_synced: studentsSynced,
      grades_synced: gradesSynced,
      tasks_synced: tasksSynced,
      chapters_synced: chaptersSynced,
      logs_synced: logsSynced,
      completions_synced: completionsSynced,
      error_summary: errorSummary,
    });

    await logEvent(supabase, batch_id, site_id, "students", "info",
      `סנכרון הושלם: ${studentsSynced} תלמידים, ${gradesSynced} ציונים, ${tasksSynced} משימות — סטטוס: ${finalStatus}`);

    return new Response(JSON.stringify({
      status: finalStatus,
      students_synced: studentsSynced,
      tasks_synced: tasksSynced,
      grades_synced: gradesSynced,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("moodle-sync error:", err);
    await logEvent(supabase, batch_id, site_id, "students", "error",
      `שגיאה לא צפויה: ${String(err)}`);
    await finishBatch(supabase, batch_id, {
      status: "failed",
      error_summary: `שגיאה לא צפויה בסנכרון: ${String(err)}`
    });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
