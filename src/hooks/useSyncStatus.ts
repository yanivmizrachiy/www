import { useCallback, useEffect, useState } from "react";
import type { SyncStatusResponse } from "@/shared/capabilities";

function syncStatusUrl(path: "/api/sync/status" | "/api/sync/run") {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("t");
  return token ? `${path}?t=${encodeURIComponent(token)}` : path;
}

export function useSyncStatus() {
  const [data, setData] = useState<SyncStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(syncStatusUrl("/api/sync/status"), {
        headers: { Accept: "application/json" }
      });
      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "SYNC_STATUS_FAILED");
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNC_STATUS_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setError("");

    try {
      const response = await fetch(syncStatusUrl("/api/sync/run"), {
        method: "POST",
        headers: { Accept: "application/json" }
      });
      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "SYNC_RUN_FAILED");
      }

      setData(json);
      return json as SyncStatusResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : "SYNC_RUN_FAILED";
      setError(message);
      throw err;
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, running, error, reload: load, run };
}