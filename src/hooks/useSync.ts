import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLtiSession } from './useLtiSession';
import type { Tables } from '@/integrations/supabase/types';

export type SyncBatch = Tables<'sync_batches'>;
export type SyncLog = Tables<'sync_logs'>;

export type SyncDomain = 'students' | 'grades' | 'tasks' | 'chapters' | 'logs' | 'completions';

const DOMAIN_LABELS: Record<SyncDomain, string> = {
  students: 'תלמידים',
  grades: 'ציונים',
  tasks: 'משימות',
  chapters: 'פרקים',
  logs: 'לוגים',
  completions: 'השלמות',
};

const DOMAIN_ICONS: Record<SyncDomain, string> = {
  students: '👥',
  grades: '📊',
  tasks: '✓',
  chapters: '📚',
  logs: '📋',
  completions: '✅',
};

export { DOMAIN_LABELS, DOMAIN_ICONS };

export function useSyncBatches(limit = 10) {
  const { session } = useLtiSession();
  const [batches, setBatches] = useState<SyncBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    if (!session) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('sync_batches')
        .select('*')
        .eq('site_id', session.site_id)
        .order('started_at', { ascending: false })
        .limit(limit);
      if (err) throw err;
      setBatches(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session, limit]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  return { batches, loading, error, refresh: fetchBatches };
}

export function useSyncLogs(batchId?: string) {
  const { session } = useLtiSession();
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!session) { setLoading(false); return; }
      setLoading(true);
      let query = supabase
        .from('sync_logs')
        .select('*')
        .eq('site_id', session.site_id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (batchId) query = query.eq('batch_id', batchId);
      const { data, error } = await query;
      if (!error) setLogs(data ?? []);
      setLoading(false);
    }
    fetch();
  }, [session, batchId]);

  return { logs, loading };
}

export function useSyncStatus() {
  const { session, site } = useLtiSession();
  const [status, setStatus] = useState<{
    wsConfigured: boolean;
    wsStatus: string;
    runningBatch: boolean;
    lastBatch: SyncBatch | null;
    hasData: boolean;
    checkLoading: boolean;
  }>({
    wsConfigured: false,
    wsStatus: 'not_configured',
    runningBatch: false,
    lastBatch: null,
    hasData: false,
    checkLoading: true,
  });

  useEffect(() => {
    async function check() {
      if (!session) {
        setStatus(s => ({ ...s, checkLoading: false }));
        return;
      }

      const wsConfigured = !!(site?.ws_token && site?.ws_token_status === 'active');
      const wsStatus = site?.ws_token_status ?? 'not_configured';

      const { data: running } = await supabase
        .from('sync_batches')
        .select('*')
        .eq('site_id', session.site_id)
        .eq('status', 'running')
        .limit(1)
        .single();

      const { data: last } = await supabase
        .from('sync_batches')
        .select('*')
        .eq('site_id', session.site_id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      const { count: studentsCount } = await supabase
        .from('imported_students')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', session.site_id);

      setStatus({
        wsConfigured,
        wsStatus,
        runningBatch: !!running,
        lastBatch: last ?? null,
        hasData: (studentsCount ?? 0) > 0,
        checkLoading: false,
      });
    }

    check();
  }, [session, site]);

  return status;
}

export async function triggerSync(sessionId: string, siteId: string, courseId: number): Promise<{ ok: boolean; batchId?: string; error?: string }> {
  try {
    const { data: batch, error: batchErr } = await supabase
      .from('sync_batches')
      .insert({
        site_id: siteId,
        course_id: courseId,
        status: 'running',
        trigger: 'manual',
        lti_launch_id: sessionId,
      })
      .select()
      .single();

    if (batchErr) throw batchErr;

    await supabase.from('sync_logs').insert({
      batch_id: batch.id,
      site_id: siteId,
      domain: 'students',
      severity: 'info',
      message: 'סנכרון ידני הופעל',
    });

    return { ok: true, batchId: batch.id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function finishSyncBatch(
  batchId: string,
  result: {
    status: 'success' | 'partial' | 'failed';
    students_synced?: number;
    grades_synced?: number;
    tasks_synced?: number;
    chapters_synced?: number;
    logs_synced?: number;
    completions_synced?: number;
    error_summary?: string;
  }
) {
  const { error } = await supabase
    .from('sync_batches')
    .update({
      status: result.status,
      finished_at: new Date().toISOString(),
      duration_ms: null,
      ...result,
    })
    .eq('id', batchId);
  if (error) console.error('Failed to finish sync batch:', error);
}

export async function logSyncEvent(
  batchId: string,
  siteId: string,
  domain: SyncDomain,
  severity: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  detail?: import('@/integrations/supabase/types').Json
) {
  await supabase.from('sync_logs').insert({
    batch_id: batchId,
    site_id: siteId,
    domain,
    severity,
    message,
    detail,
  });
}
