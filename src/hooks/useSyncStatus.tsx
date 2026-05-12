import { useCallback, useEffect, useState } from "react";
import { getLtiToken } from "@/hooks/useLtiSession";

export type CapabilityStatus =
  | "automatic"
  | "available_from_import"
  | "missing_required_report"
  | "blocked_no_permission"
  | "not_implemented_yet";

export interface SyncCapability {
  status: CapabilityStatus;
  source: string;
  confidence: number;
  teacher_message_he: string;
  next_action_he: string;
  required_report_type: string | null;
  count: number | null;
  last_checked_at: string;
}

export interface SyncStatusPayload {
  ok: boolean;
  mode: string;
  version: string;
  context: {
    has_lti_session: boolean;
    has_nrps_claim: boolean;
    has_moodle_ws_token: boolean;
    has_supabase_persistence_env: boolean;
  };
  counts: {
    students: number;
    import_batches: number;
    chapters: number;
    tasks: number;
    grade_items: number;
    grades: number;
    log_events: number;
  };
  capabilities: Record<string, SyncCapability>;
  main_buttons: {
    label: string;
    capability: string;
    path: string;
    primary?: boolean;
  }[];
  privacy: {
    no_student_names_returned: boolean;
    no_emails_returned: boolean;
    no_tokens_returned: boolean;
    aggregate_only: boolean;
  };
  next_real_milestone: string;
  now: string;
}

export function isCapabilityReady(capability?: SyncCapability) {
  return capability?.status === "automatic" || capability?.status === "available_from_import";
}

export function useSyncStatus() {
  const [data, setData] = useState<SyncStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    setRefreshing(true);

    try {
      const url = token
        ? `/api/sync/status?t=${encodeURIComponent(token)}`
        : "/api/sync/status";

      const res = await fetch(url, { credentials: "include" });
      const payload = await res.json();

      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || "sync_status_failed");
      }

      setData(payload as SyncStatusPayload);
      setError(null);
    } catch {
      setError("לא ניתן לבדוק כרגע את מצב הסנכרון.");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refreshing, error, refresh };
}


export interface SyncRunAction {
  id: string;
  priority: number;
  title_he: string;
  detail_he: string;
  required_report_type: string | null;
  path: string | null;
  created_at: string;
}

export interface SyncRunPayload {
  ok: boolean;
  mode: string;
  version: string;
  teacher_message_he: string;
  readiness: {
    ready_capabilities: number;
    total_capabilities: number;
    percent: number;
  };
  counts: SyncStatusPayload["counts"];
  capabilities: SyncStatusPayload["capabilities"];
  prioritized_next_actions: SyncRunAction[];
  first_next_action: SyncRunAction | null;
  privacy: SyncStatusPayload["privacy"];
  now: string;
}

export function useSyncRun() {
  const [data, setData] = useState<SyncRunPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    const token = getLtiToken();
    setLoading(true);

    try {
      const url = token
        ? `/api/sync/run?t=${encodeURIComponent(token)}`
        : "/api/sync/run";

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      const payload = await res.json();

      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || "sync_run_failed");
      }

      setData(payload as SyncRunPayload);
      setError(null);
      return payload as SyncRunPayload;
    } catch {
      setError("לא ניתן להריץ כרגע סנכרון מרחב.");
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, run };
}

