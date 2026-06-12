import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLtiToken, nrpsPreviewUrl } from "@/hooks/useLtiSession";

export interface ImportBatch {
  id: string;
  report_type: "students" | "grades" | "logs" | "completion" | "unknown";
  file_name: string | null;
  row_count: number;
  status: "completed" | "failed" | "partial";
  imported_by_username: string | null;
  detection_confidence: number | null;
  created_at: string;
  warnings: string[];
}

const EMPTY_IMPORTS_OVERVIEW: ImportsOverview = {
  students_count: 0,
  grade_items_count: 0,
  grades_count: 0,
  chapters_count: 0,
  tasks_count: 0,
  log_events_count: 0,
  batches: [],
};

export interface ImportsOverview {
  students_count: number;
  grade_items_count: number;
  grades_count: number;
  chapters_count: number;
  tasks_count: number;
  log_events_count: number;
  batches: ImportBatch[];
}

type Rpc = (fn: string, args: Record<string, unknown>) =>
  Promise<{ data: unknown; error: { message: string } | null }>;

export function useImportsOverview() {
  const [data, setData] = useState<ImportsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) {
      setLoading(false);
      setError(null);
      setData(EMPTY_IMPORTS_OVERVIEW);
      return;
    }

    setLoading(true);
    try {
      const nodeRes = await fetch(`/api/imports/overview?t=${encodeURIComponent(token)}`, {
        credentials: "include",
      });

      // 401 means server lost this token (restart/cold-start).
      // Do NOT fall through to Supabase RPC: lti_get_imports_overview does not
      // exist in production and produces a 404. Return empty cleanly.
      if (nodeRes.status === 401) {
        setError(null);
        setData(EMPTY_IMPORTS_OVERVIEW);
        setLoading(false);
        return;
      }

      if (nodeRes.ok) {
        const nodePayload = await nodeRes.json();
        if (nodePayload && !nodePayload.error) {
          setError(null);
          setData(nodePayload as ImportsOverview);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Network error - return empty rather than calling non-existent RPC.
      setError(null);
      setData(EMPTY_IMPORTS_OVERVIEW);
      setLoading(false);
      return;
    }

    // Fallback: connected Moodle session with no imported data yet.
    setError(null);
    setData(EMPTY_IMPORTS_OVERVIEW);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export interface ImportedStudent {
  id: string;
  full_name: string;
  email: string | null;
  external_username: string | null;
  external_id: string | null;
  updated_at: string;
}

export function useImportedStudents() {
  const [data, setData] = useState<ImportedStudent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) {
      setLoading(false);
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const nodeRes = await fetch("/api/imports/students?t=" + encodeURIComponent(token), {
        credentials: "include"
      });
      // 401: server lost token - do NOT call lti_list_students RPC (does not exist)
      if (nodeRes.status === 401) {
        setError(null);
        setData([]);
        setLoading(false);
        return;
      }
      if (nodeRes.ok) {
        const nodePayload = await nodeRes.json();
        if (nodePayload && !nodePayload.error) {
          setError(null);
          setData(nodePayload.students ?? []);
          setLoading(false);
          return;
        }
      }
    } catch {
      setError(null);
      setData([]);
      setLoading(false);
      return;
    }
    setError(null);
    setData([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}


export interface GradesMatrix {
  students: { id: string; full_name: string }[];
  items: { id: string; item_name: string; item_type: string | null; max_grade: number | null }[];
  grades: { student_id: string; grade_item_id: string; raw_value: string | null; numeric_value: number | null; is_missing: boolean; }[];
}

export function useGradesMatrix() {
  const [data, setData] = useState<GradesMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const nodeRes = await fetch("/api/imports/grades-matrix?t=" + encodeURIComponent(token), { credentials: "include" });
      if (nodeRes.status === 401) {
        setError(null); setData({ students: [], items: [], grades: [] }); setLoading(false); return;
      }
      if (nodeRes.ok) {
        const p = await nodeRes.json();
        if (p && p.ok && !p.error) {
          setError(null); setData({ students: p.students ?? [], items: p.items ?? [], grades: p.grades ?? [] }); setLoading(false); return;
        }
      }
    } catch { /* fall through */ }
    setError(null); setData({ students: [], items: [], grades: [] }); setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}

export async function postImport(body: {
  report_type: "students" | "grades" | "logs" | "completion";
  file_name?: string;
  file_size_bytes?: number;
  source_kind?: "upload" | "paste";
  detection_confidence?: number;
  column_mapping?: Record<string, string>;
  payload: unknown;
}): Promise<{ ok: boolean; batch_id?: string; row_count?: number; warnings?: string[]; error?: string; detail?: string }> {
  const token = getLtiToken();
  if (!token) return { ok: false, error: "missing_session" };
  try {
    const nodeRes = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lti-session": token },
      credentials: "include",
      body: JSON.stringify({ ...body, token }),
    });
    const nodePayload = await nodeRes.json().catch(() => null);
    if (nodeRes.ok && nodePayload) return nodePayload;
    if (body.report_type === "students" && nodePayload) return nodePayload;
  } catch { /* fall through */ }
  const url = String(import.meta.env.VITE_SUPABASE_URL || "") + "/functions/v1/import-moodle-report";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-lti-session": token,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: "Bearer " + import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export interface CourseChapter { id: string; chapter_name: string; position: number | null }
export interface CourseTask {
  id: string; chapter_id: string | null; task_name: string; task_type: string | null;
  position: number | null; due_date: string | null;
  moodle_url?: string | null; status?: string | null;
}
export interface CourseCompletionSummary { complete: number; incomplete: number; unknown: number; total: number }
export interface CourseStructure { chapters: CourseChapter[]; tasks: CourseTask[]; completion_summary: Record<string, CourseCompletionSummary>; }

export function useCourseStructure() {
  const [data, setData] = useState<CourseStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_get_course_structure", { _token: token });
    setLoading(false);
    if (e) { setError(null); setData(null); return; }
    const p = d as { error?: string } & CourseStructure;
    if (p?.error) { setError(null); setData(null); return; }
    setError(null); setData(p);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}

export interface PerStudentActivity { key: string; full_name: string; student_id: string | null; event_count: number; first_event: string | null; last_event: string | null; active_days: number; }
export interface RecentEvent { id: string; occurred_at: string; event_name: string | null; event_context: string | null; component: string | null; student_name: string; }
export interface ActivityOverview { events_count: number; first_event: string | null; last_event: string | null; per_student: PerStudentActivity[]; recent: RecentEvent[]; }

export function useActivityOverview() {
  const [data, setData] = useState<ActivityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_get_activity_overview", { _token: token });
    setLoading(false);
    if (e) { setError(null); setData(null); return; }
    const p = d as { error?: string } & ActivityOverview;
    if (p?.error) { setError(null); setData(null); return; }
    setError(null); setData(p);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}

export interface StudentReportRow { student_id: string; full_name: string; external_username: string | null; graded_items: number; avg_grade: number | null; tasks_complete: number; tasks_incomplete: number; tasks_unknown: number; event_count: number; active_days: number; last_event: string | null; }

export function useStudentReports() {
  const [data, setData] = useState<StudentReportRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_get_student_reports", { _token: token });
    setLoading(false);
    if (e || !d) return;
    const p = d as { students?: StudentReportRow[]; error?: string };
    if (p.error) return;
    setData(p.students ?? []);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export type CompletionState = "complete" | "incomplete" | "unknown";
export interface TaskCompletionRow { task_id: string; student_id: string | null; student_name: string | null; is_complete: boolean | null; status: string | null; completed_at: string | null; }
export interface TaskCompletionDetail { tasks: { id: string; task_name: string; task_type: string | null; chapter_id: string | null; position: number | null }[]; rows: TaskCompletionRow[]; }

export function useTaskCompletionDetail() {
  const [data, setData] = useState<TaskCompletionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_get_task_completion_detail", { _token: token });
    setLoading(false);
    if (e || !d) return;
    const p = d as { error?: string } & TaskCompletionDetail;
    if (p.error) return;
    setData(p);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export interface DailyActivityRow { day: string; events: number; active_students: number }

export function useDailyActivity() {
  const [data, setData] = useState<DailyActivityRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_get_daily_activity", { _token: token });
    setLoading(false);
    if (e || !d) return;
    const p = d as { days?: DailyActivityRow[]; error?: string };
    if (p.error) return;
    setData(p.days ?? []);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export async function deleteImportBatch(batchId: string): Promise<{ ok: boolean; error?: string }> {
  const token = getLtiToken();
  if (!token) return { ok: false, error: "missing_session" };
  const { data, error } = await (supabase.rpc as unknown as Rpc)("lti_delete_batch", { _token: token, _batch_id: batchId });
  if (error) return { ok: false, error: error.message };
  const p = data as { ok?: boolean; error?: string };
  if (p?.error) return { ok: false, error: p.error };
  return { ok: !!p?.ok };
}

export interface PracticeWindow { started_at: string; ended_at: string; duration_seconds: number; event_count: number; }
export interface PracticeDayRow { day: string; student_id: string; student_name: string | null; total_seconds: number; event_count: number; session_count: number; first_at: string | null; last_at: string | null; windows: PracticeWindow[]; }
export interface PracticePerStudentRow { student_id: string; student_name: string | null; total_seconds: number; event_count: number; session_count: number; active_days: number; first_at: string | null; last_at: string | null; }
export interface PracticeMeta { gap_seconds: number; from: string | null; to: string | null; student_id: string | null; has_official_duration?: boolean; time_basis?: "official" | "estimate"; rows_with_official_duration?: number; log_event_count?: number; min_log_events?: number; enough_logs?: boolean; no_official_duration_message_he?: string | null; events_last_24h?: number; events_last_week?: number; }
export interface PracticeOverview { meta: PracticeMeta; days: PracticeDayRow[]; per_student: PracticePerStudentRow[]; }

export function usePracticeTime(opts?: { from?: string | null; to?: string | null; studentId?: string | null }) {
  const [data, setData] = useState<PracticeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const from = opts?.from ?? null;
  const to = opts?.to ?? null;
  const studentId = opts?.studentId ?? null;

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ t: token });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (studentId) params.set("student_id", studentId);
      const nodeRes = await fetch(`/api/imports/time-range?${params.toString()}`, { credentials: "include" });
      if (nodeRes.status === 401) { setError(null); setData(null); setLoading(false); return; }
      if (nodeRes.ok) {
        const p = await nodeRes.json();
        if (p && !p.error) { setError(null); setData(p as PracticeOverview); setLoading(false); return; }
      }
    } catch { /* fall through to RPC */ }
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_get_practice_time", { _token: getLtiToken(), _from: from, _to: to, _student_id: studentId });
    setLoading(false);
    if (e) { setError(null); setData(null); return; }
    const p = d as { error?: string } & PracticeOverview;
    if (p?.error) { setError(null); setData(null); return; }
    setError(null); setData(p);
  }, [from, to, studentId]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}

export interface StudentProfileGradeRow { grade_item_id: string; item_name: string; item_type: string | null; max_grade: number | null; raw_value: string | null; numeric_value: number | null; is_missing: boolean; }
export interface StudentProfileCompletionRow { task_id: string; task_name: string; task_type: string | null; chapter_id: string | null; is_complete: boolean | null; status: string | null; completed_at: string | null; }
export interface StudentProfileActivity { event_count: number; first_event: string | null; last_event: string | null; active_days: number; top_components: { component: string; events: number }[]; }
export interface StudentProfile { student: { id: string; full_name: string; email: string | null; external_username: string | null; external_id: string | null; updated_at: string; }; grades: StudentProfileGradeRow[]; completion: StudentProfileCompletionRow[]; activity: StudentProfileActivity; practice: PracticeOverview; }

export function useStudentProfile(studentId: string | null | undefined) {
  const [data, setData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token || !studentId) { setLoading(false); return; }
    setLoading(true);
    try {
      const nodeRes = await fetch(`/api/imports/student-profile?t=${encodeURIComponent(token)}&student_id=${encodeURIComponent(studentId)}`, { credentials: "include" });
      if (nodeRes.status === 401) { setError(null); setData(null); setLoading(false); return; }
      if (nodeRes.ok) {
        const p = await nodeRes.json();
        if (p && p.ok && p.student) {
          setError(null);
          setData({ student: p.student, grades: p.grades ?? [], completion: p.completion ?? [], activity: p.activity ?? { event_count: 0, first_event: null, last_event: null, active_days: 0, top_components: [] }, practice: { total_minutes: 0, days: [], source: "none" } as unknown as PracticeOverview });
          setLoading(false); return;
        }
      }
    } catch { /* fall through */ }
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_get_student_profile", { _token: getLtiToken(), _student_id: studentId });
    setLoading(false);
    if (e) { setError(null); setData(null); return; }
    const p = d as { error?: string } & StudentProfile;
    if (p?.error) { setError(null); setData(null); return; }
    setError(null); setData(p);
  }, [studentId]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}

export interface NrpsMember { name: string; role_kind: "learner" | "instructor" | "unknown"; }
export interface NrpsRoster { live: boolean; members: NrpsMember[]; instructors: NrpsMember[]; learners: NrpsMember[]; updated_at: string | null; }

export function useNrpsRoster() {
  const [data, setData] = useState<NrpsRoster | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); setData({ live: false, members: [], instructors: [], learners: [], updated_at: null }); return; }
    setLoading(true);
    try {
      const res = await fetch(nrpsPreviewUrl(), { headers: { Accept: "application/json" }, credentials: "include" });
      const json = await res.json().catch(() => null);
      const live = Boolean(json?.ok);
      const named: Array<{ name?: string; role_kind?: string; is_instructor?: boolean }> = Array.isArray(json?.members_named) ? json.members_named : [];
      const members: NrpsMember[] = named.map((m) => ({ name: String(m?.name || "").trim(), role_kind: (m?.role_kind as NrpsMember["role_kind"]) ?? (m?.is_instructor ? "instructor" : "unknown") })).filter((m) => m.name);
      setData({ live, members, instructors: members.filter((m) => m.role_kind === "instructor"), learners: members.filter((m) => m.role_kind === "learner"), updated_at: live && typeof json?.now === "string" ? json.now : null });
    } catch {
      setData({ live: false, members: [], instructors: [], learners: [], updated_at: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}
