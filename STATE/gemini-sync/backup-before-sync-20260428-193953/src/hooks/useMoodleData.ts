import { useCallback, useEffect, useState } from "react";
import { getLtiToken } from "@/hooks/useLtiSession";

export function useMoodleData<T = unknown>(dataType: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!enabled || !token) { setData(null); setLoading(false); return; }
    const base = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!base || !key) { setError("missing_supabase_env"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${base}/functions/v1/moodle-proxy`, { method:"POST", headers:{"Content-Type":"application/json","x-lti-session":token, apikey:key, Authorization:`Bearer ${key}`}, body: JSON.stringify({ data_type: dataType }) });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `http_${res.status}`);
      setError(null); setData((json.data ?? json) as T);
    } catch (e) { setError(e instanceof Error ? e.message : "unknown"); setData(null); }
    finally { setLoading(false); }
  }, [dataType, enabled]);
  useEffect(()=>{ refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}
