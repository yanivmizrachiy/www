import { useCallback, useEffect, useState } from "react";
import { getLtiToken } from "@/hooks/useLtiSession";

export interface SyncStatus {
  ok: boolean;
  version: string;
  teacher_release_ready: boolean;
  no_fake_data: boolean;
  no_private_rows_returned: boolean;
  session_exists: boolean;
  counts: {
    students: number;
    chapters: number;
    tasks: number;
    grade_items: number;
    grades: number;
    log_events: number;
    import_batches: number;
  };
  next_actions_he: string[];
  capabilities: {
    participants: string;
    tasks: string;
    grades: string;
    logs: string;
  };
  sync_run?: {
    ok: boolean;
    mode: string;
    note_he: string;
  };
}

async function requestSyncStatus(method: "GET" | "POST"): Promise<SyncStatus> {
  const token = getLtiToken();
  const endpoint = method === "POST" ? "/api/sync/run" : "/api/sync/status";
  const url = token ? `${endpoint}?t=${encodeURIComponent(token)}` : endpoint;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: token ? { "x-lti-session": token } : undefined,
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
      const payload = await requestSyncStatus("GET");
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "sync_status_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
    setRunning(true);
    try {
      const payload = await requestSyncStatus("POST");
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

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, running, error, refresh, runSync };
}
