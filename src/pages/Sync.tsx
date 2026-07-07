import React, { useState } from 'react';
import { SafePage } from '@/components/SafePage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, Lock, Zap,
  Clock, Users, BarChart2, ListChecks, BookOpen, FileText, Loader2,
  ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { useLtiSession } from '@/hooks/useLtiSession';
import { useSyncStatus, useSyncBatches, useSyncLogs, triggerSync, DOMAIN_LABELS } from '@/hooks/useSync';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SyncDomain = 'students' | 'grades' | 'tasks' | 'chapters' | 'logs' | 'completions';

const DOMAINS: SyncDomain[] = ['students', 'grades', 'tasks', 'chapters', 'logs', 'completions'];

const DOMAIN_ICONS: Record<SyncDomain, React.ReactNode> = {
  students: <Users className="h-4 w-4" />,
  grades: <BarChart2 className="h-4 w-4" />,
  tasks: <ListChecks className="h-4 w-4" />,
  chapters: <BookOpen className="h-4 w-4" />,
  logs: <FileText className="h-4 w-4" />,
  completions: <CheckCircle2 className="h-4 w-4" />,
};

function BlockedBanner({ reason }: { reason: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
      <Lock className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">{reason}</p>
        <p className="text-sm mt-1 opacity-80">
          ניתן לייבא נתונים באופן ידני בעמוד{' '}
          <a href="/import" className="underline font-medium">ייבוא נתונים</a>{' '}
          או להגדיר Web Service token ב-Moodle.
        </p>
      </div>
    </div>
  );
}

function DomainCard({
  domain,
  synced,
  blocked,
  blockedReason
}: {
  domain: SyncDomain;
  synced: number;
  blocked: boolean;
  blockedReason: string;
}) {
  const label = DOMAIN_LABELS[domain];
  const icon = DOMAIN_ICONS[domain];

  if (blocked) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50 opacity-60">
        <div className="text-slate-400">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-slate-400 truncate">{blockedReason}</p>
        </div>
        <Lock className="h-4 w-4 text-slate-400 shrink-0" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white">
      <div className="text-primary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {synced > 0 ? `${synced.toLocaleString('he-IL')} פריטים` : 'אין נתונים'}
        </p>
      </div>
      {synced > 0 && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
    </div>
  );
}

function BatchRow({ batch }: { batch: any }) {
  const [expanded, setExpanded] = useState(false);
  const { logs } = useSyncLogs(batch.id);

  const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
    running: { label: 'בריצה', class: 'bg-blue-100 text-blue-700', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    success: { label: 'הושלם', class: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
    partial: { label: 'חלקי', class: 'bg-amber-100 text-amber-700', icon: <AlertTriangle className="h-3 w-3" /> },
    failed: { label: 'נכשל', class: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  };

  const cfg = statusConfig[batch.status] ?? statusConfig.partial;

  const countFields: { key: keyof typeof batch; label: string }[] = [
    { key: 'students_synced', label: 'תלמידים' },
    { key: 'grades_synced', label: 'ציונים' },
    { key: 'tasks_synced', label: 'משימות' },
    { key: 'chapters_synced', label: 'פרקים' },
    { key: 'logs_synced', label: 'לוגים' },
    { key: 'completions_synced', label: 'השלמות' },
  ];

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-right"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${cfg.class}`}>
          {cfg.icon}
          {cfg.label}
        </div>
        <div className="flex-1 min-w-0 text-sm">
          <span className="text-muted-foreground">
            {new Date(batch.started_at).toLocaleString('he-IL')}
          </span>
          {batch.trigger === 'manual' && (
            <Badge variant="outline" className="mr-2 text-xs">ידני</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {countFields.map(f => {
            const val = batch[f.key] as number;
            return val > 0 ? (
              <span key={String(f.key)} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {val} {f.label}
              </span>
            ) : null;
          })}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="border-t p-4 bg-slate-50/50">
          {batch.error_summary && (
            <div className="flex items-start gap-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{batch.error_summary}</span>
            </div>
          )}
          {logs.length > 0 ? (
            <div className="space-y-1.5">
              {logs.slice(0, 20).map(log => (
                <div key={log.id} className="flex items-start gap-2 text-xs">
                  <span className={`font-bold shrink-0 ${
                    log.severity === 'error' ? 'text-red-500' :
                    log.severity === 'warn' ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {log.severity.toUpperCase()}
                  </span>
                  <span className="text-slate-600">{log.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">אין לוגים</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sync() {
  const { session, site, loading: sessionLoading } = useLtiSession();
  const syncStatus = useSyncStatus();
  const { batches, loading: batchesLoading, refresh: refreshBatches } = useSyncBatches(20);
  const [syncing, setSyncing] = useState(false);
  const [wsChecking, setWsChecking] = useState(false);

  async function handleSync() {
    if (!session) return;
    setSyncing(true);
    toast.info('מתחיל סנכרון...');
    const result = await triggerSync(session.id, session.site_id, session.course_id);
    if (result.ok) {
      toast.success('סנכרון הופעל — בהמתנה לסנכרון');
      refreshBatches();
    } else {
      const blockedResult = result as { ok: false; status: 'BLOCKED'; reason: string };
      const errorResult = result as { ok: false; status: 'ERROR'; error: string };
      if (blockedResult.status === 'BLOCKED') {
        toast.error(blockedResult.reason);
      } else {
        toast.error(`שגיאה: ${errorResult.error}`);
      }
    }
    setSyncing(false);
  }

  async function handleCheckConnection() {
    if (!site) return;
    setWsChecking(true);
    toast.info('בודק חיבור ל-Moodle...');

    try {
      const base = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${base}/functions/v1/moodle-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-lti-session': localStorage.getItem('lti_token') ?? '',
          'apikey': key ?? '',
          'Authorization': `Bearer ${key ?? ''}`
        },
        body: JSON.stringify({ data_type: 'ping' })
      });

      if (res.ok) {
        toast.success('החיבור ל-Moodle תקין');
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json?.error ? `שגיאה: ${json.error}` : 'החיבור נכשל');
      }
    } catch (err) {
      toast.error('לא ניתן להתחבר לשרת');
    }

    setWsChecking(false);
  }

  if (sessionLoading || syncStatus.checkLoading) {
    return (
      <SafePage title="סנכרון" description="ניהול סנכרון נתונים מ-Moodle">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SafePage>
    );
  }

  const wsBlocked = !syncStatus.wsConfigured;
  const runningBatch = batches.find(b => b.status === 'running');

  return (
    <SafePage
      title="סנכרון"
      description={session ? `מרחב: ${site?.site_name ?? site?.site_url ?? '—'}` : 'ניהול סנכרון נתונים מ-Moodle'}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* סטטוס חיבור */}
          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">סטטוס חיבור Moodle</CardTitle>
                  <CardDescription className="font-medium">
                    האם המערכת מחוברת ל-API של מודל?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {syncStatus.wsConfigured ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-bold">Web Service מוגדר</p>
                      <p className="text-sm text-muted-foreground">סטטוס: {syncStatus.wsStatus}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-slate-400" />
                    <div>
                      <p className="font-bold">ללא Web Service</p>
                      <p className="text-sm text-muted-foreground">סנכרון אוטומטי לא זמין</p>
                    </div>
                  </>
                )}
              </div>

              {wsBlocked && (
                <BlockedBanner
                  reason="סנכרון אוטומטי חסום: Moodle Web Services לא מוגדר"
                />
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCheckConnection}
                  disabled={wsChecking || !site}
                  className="gap-2"
                >
                  {wsChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  בדוק חיבור
                </Button>
                <Button
                  onClick={handleSync}
                  disabled={syncing || wsBlocked || !session || !!runningBatch}
                  className="gap-2 font-black"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {runningBatch ? 'סנכרון בריצה...' : 'סנכרן עכשיו'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* סטטוס נתונים */}
          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-xl text-white shadow-lg shadow-green-600/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">נתונים במערכת</CardTitle>
                  <CardDescription className="font-medium">
                    ספירות מייבוא אחרון או סנכרון
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DOMAINS.map(domain => {
                  const counts: Record<SyncDomain, number> = {
                    students: batches[0]?.students_synced ?? 0,
                    grades: batches[0]?.grades_synced ?? 0,
                    tasks: batches[0]?.tasks_synced ?? 0,
                    chapters: batches[0]?.chapters_synced ?? 0,
                    logs: batches[0]?.logs_synced ?? 0,
                    completions: batches[0]?.completions_synced ?? 0,
                  };
                  return (
                    <DomainCard
                      key={domain}
                      domain={domain}
                      synced={counts[domain]}
                      blocked={false}
                      blockedReason=""
                    />
                  );
                })}
              </div>

              {!syncStatus.hasData && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl text-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mx-auto mb-1 opacity-50" />
                  אין נתונים במערכת. יש לייבא דוחות מ-Moodle או להפעיל סנכרון.
                  <a href="/import" className="block mt-1 text-primary font-medium">עבור לייבוא נתונים →</a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* היסטוריית סנכרונים */}
          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent rounded-xl text-white shadow-lg shadow-accent/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-black">היסטוריית סנכרונים</CardTitle>
                  <CardDescription className="font-medium">
                    {batches.length > 0
                      ? `${batches.length} סנכרונים אחרונים`
                      : 'אין סנכרונים עדיין'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshBatches} className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  רענן
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {batchesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground space-y-2">
                  <Clock className="h-12 w-12 mx-auto opacity-20" />
                  <p className="font-bold">אין היסטוריה</p>
                  <p className="text-sm">סנכרונים יופיעו כאן לאחר הראשון</p>
                </div>
              ) : (
                batches.map(batch => <BatchRow key={batch.id} batch={batch} />)
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary text-white shadow-luxury">
            <CardContent className="p-8 space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-black leading-tight">סנכרון נתונים</h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                סנכרון מאפשר שליפה אוטומטית של נתונים מ-Moodle. ללא סנכרון, ניתן לייבא נתונים באופן ידני.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 bg-slate-100/50 rounded-[2rem] border border-slate-200 space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-600">מה נדרש לסנכרון</h3>
            <div className="space-y-2 text-sm text-slate-600 font-medium">
              {[
                'גישה ל-API של מודל (Web Services)',
                'משתמש עם token ל-Web Service',
                'הרשאות מנהל להגדרת החיבור',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-black text-xs uppercase tracking-wider">חשוב</span>
            </div>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              סנכרון מייבא נתונים מ-Moodle לפי ה-course_id של המורה. נתונים מסוננים לפי הקורס הנוכחי בלבד.
            </p>
          </div>

          <Button variant="outline" className="w-full gap-2" asChild>
            <a href="/settings">
              נהל הגדרות LTI
            </a>
          </Button>
        </div>
      </div>
    </SafePage>
  );
}
