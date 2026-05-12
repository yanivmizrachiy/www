import { useCallback, useEffect, useState } from "react";
import { getLtiToken } from "@/hooks/useLtiSession";

export type CapabilityStatus =
  | "automatic"
  | "available_from_import"
  | "missing_required_report"
  | "blocked_no_permission"
  | "not_implemented_yet";

export interface CapabilityDomain {
  id: string;
  label_he: string;
  status: CapabilityStatus;
  source: string;
  confidence: number;
  teacher_message_he: string;
  next_action_he: string;
  required_report_type: string | null;
  counts: Record<string, number>;
}

export interface SyncStatus {
  ok: boolean;
  automation_core_version: string;
  generated_at: string;
  no_fake_success: boolean;
  teacher_release_ready: boolean;
  session: {
    source: string | null;
    course_title: string | null;
    teacher_name: string | null;
    launched_at: string | null;
  } | null;
  counts: {
    students: number;
    chapters: number;
    tasks: number;
    grade_items: number;
    grades: number;
    log_events: number;
    import_batches: number;
  };
  domains: CapabilityDomain[];
  next_actions_he: string[];
  teacher_action_budget: {
    ideal_actions_he: string[];
    fallback_allowed_he: string[];
    forbidden_burdens_he: string[];
  };
  safety: {
    no_demo_data: boolean;
    no_fake_counts: boolean;
    no_private_rows_returned: boolean;
    blockers_count: number;
    missing_count: number;
  };
  sync_run?: {
    ok: boolean;
    mode: string;
    performed_at: string;
    note_he: string;
  };
}

const EMPTY_STATUS: SyncStatus = {
  ok: true,
  automation_core_version: "local-empty",
  generated_at: new Date(0).toISOString(),
  no_fake_success: true,
  teacher_release_ready: false,
  session: null,
  counts: {
    students: 0,
    chapters: 0,
    tasks: 0,
    grade_items: 0,
    grades: 0,
    log_events: 0,
    import_batches: 0,
  },
  domains: [],
  next_actions_he: ["פתח את הכלי מתוך Moodle כדי להתחיל סנכרון אמת."],
  teacher_action_budget: {
    ideal_actions_he: ["פתיחת הכלי מתוך Moodle", "לחיצה על סנכרן מרחב"],
    fallback_allowed_he: ["ייבוא דוח Moodle אחד שהמערכת ביקשה במפורש"],
    forbidden_burdens_he: ["לא לנחש דוחות", "לא להתעסק ב־API", "לא להתעסק ב־GitHub"],
  },
  safety: {
    no_demo_data: true,
    no_fake_counts: true,
    no_private_rows_returned: true,
    blockers_count: 0,
    missing_count: 0,
  },
};

async function fetchSyncStatus(method: "GET" | "POST"): Promise<SyncStatus> {
  const token = getLtiToken();
  const endpoint = method === "POST" ? "/api/sync/run" : "/api/sync/status";
  const url = token ? `${endpoint}?t=${encodeURIComponent(token)}` : endpoint;
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: method === "POST" && token ? { "x-lti-session": token } : undefined,
  });
  if (!res.ok) throw new Error(`sync_status_http_${res.status}`);
  return (await res.json()) as SyncStatus;
}

export function useSyncStatus() {
  const [data, setData] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchSyncStatus("GET");
      setData(payload);
      setError(null);
    } catch (err) {
      setData(EMPTY_STATUS);
      setError(err instanceof Error ? err.message : "sync_status_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
    setRunning(true);
    try {
      const payload = await fetchSyncStatus("POST");
      setData(payload);
      setError(null);
      return payload;
    } catch (err) {
      setError(err instanceof Error ? err.message : "sync_run_failed");
      return null;
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, running, error, refresh, runSync };
}
