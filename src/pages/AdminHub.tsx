import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Instagram,
  GraduationCap,
  Wrench,
  Database,
  Zap,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// Public teacher presentation — safe to link anywhere.
const GUIDE_URL = 'https://www-tijc.onrender.com/guide';
// Public install-instructions page to send teachers (renders without a session).
const INSTALL_URL = 'https://www-tijc.onrender.com/setup';
// LTI values a teacher pastes into Moodle when self-installing (public — the
// Shared Secret is NOT here and is delivered separately).
const TOOL_URL = 'https://www-tijc.onrender.com/api/lti/launch';
const CONSUMER_KEY = 'yaniv-lti-tool';
const INSTAGRAM_URL = 'https://www.instagram.com/yani__raz';

// Plain-Hebrew labels for the real DB tables the tool depends on. Anything the
// live /api/persistence/validate reports that isn't listed here is shown by its
// raw name as a safe fallback (never hidden, never faked).
const TABLE_LABELS_HE: Record<string, string> = {
  teachers: 'מורים',
  courses: 'קורסים',
  students: 'תלמידים',
  import_batches: 'ייבואים',
  grade_items: 'פריטי ציון',
  grade_results: 'ציונים',
  log_events: 'יומני פעילות',
  course_sections: 'פרקים',
  course_tasks: 'משימות',
  task_completions: 'השלמות משימות',
};

type PersistenceTable = { table: string; count: number | null; exists?: boolean; ok?: boolean };
type Persistence = {
  ok?: boolean;
  production_persistence_ready?: boolean;
  tables?: PersistenceTable[];
  missing_tables?: string[];
} | null;

type Health = {
  ok?: boolean;
  supabaseConfigured?: boolean;
  oauthVerification?: string;
  readyForMoodleUse?: boolean;
} | null;

type Blocker = { key: string; severity?: string; message_he?: string };
type Readiness = {
  teacher_release_readiness_percent?: number;
  automation_core_percent?: number;
  blockers?: Blocker[];
} | null;

// Live self-report from /api/lti13/status. `mode` is "diagnostic-only" until the
// 1.3 launch path is certified against the real Moodle; capabilities flip to true
// only once verified. Nothing here is faked — it mirrors the server verbatim.
type Lti13Status = {
  configured?: boolean;
  mode?: string;
  missing?: string[];
  capabilities?: {
    oidc_login?: boolean;
    jwt_launch_validation?: boolean;
    nrps_roster_sync?: boolean;
    ags_grade_sync?: boolean;
    jwks_available?: boolean;
  };
} | null;

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ' +
        (ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
      }
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

// Generic copy-to-clipboard button (shared by every "copy this link/value"
// action here, so there's one implementation, not several).
function CopyLink({ text, idleLabel, doneLabel = 'הועתק', variant = 'outline' }: { text: string; idleLabel: string; doneLabel?: string; variant?: 'outline' | 'ghost' }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <Button variant={variant} onClick={copy} className="gap-2">
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {copied ? doneLabel : idleLabel}
    </Button>
  );
}

// One labelled field the admin copies (Tool URL / Consumer Key).
function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-slate-500">{label}</div>
        <div dir="ltr" className="truncate text-left font-mono text-xs font-bold text-slate-800">{value}</div>
      </div>
      <CopyLink text={value} idleLabel="העתק" variant="ghost" />
    </div>
  );
}

// Real, live system status — reads the same-origin diagnostic endpoints the
// server already exposes. Every number here is a real aggregate count from the
// live database (no student rows, no secrets, no invented data). Empty = 0.
function LiveSystemStatus() {
  const [loading, setLoading] = useState(true);
  const [persistence, setPersistence] = useState<Persistence>(null);
  const [health, setHealth] = useState<Health>(null);
  const [readiness, setReadiness] = useState<Readiness>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [pRes, hRes, rRes] = await Promise.all([
        fetch('/api/persistence/validate', { cache: 'no-store' }),
        fetch('/health', { cache: 'no-store' }),
        fetch('/api/release/readiness', { cache: 'no-store' }),
      ]);
      setPersistence(await pRes.json().catch(() => null));
      setHealth(await hRes.json().catch(() => null));
      setReadiness(await rRes.json().catch(() => null));
    } catch (e) {
      setError('לא ניתן לטעון את מצב המערכת כרגע.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const tables = persistence?.tables ?? [];
  const readinessPct = readiness?.teacher_release_readiness_percent;
  const blockers = (readiness?.blockers ?? []).filter((b) => b?.message_he);

  return (
    <Card className="border-2 border-slate-100 shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-black">מצב המערכת — נתונים חיים</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-2 text-slate-500">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            רענון
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> טוען מצב חי מהשרת...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap gap-2">
              <StatusPill ok={Boolean(health?.ok)} label={health?.ok ? 'השרת פעיל' : 'השרת לא מגיב'} />
              <StatusPill
                ok={Boolean(health?.supabaseConfigured)}
                label={health?.supabaseConfigured ? 'מסד הנתונים מחובר' : 'מסד הנתונים לא מוגדר'}
              />
              <StatusPill
                ok={Boolean(health?.readyForMoodleUse)}
                label={health?.readyForMoodleUse ? 'מוכן לשימוש מ-Moodle' : 'לא מוכן לשימוש'}
              />
              <StatusPill
                ok={Boolean(persistence?.production_persistence_ready)}
                label={persistence?.production_persistence_ready ? 'שמירה קבועה מוכנה' : 'שמירה קבועה לא מלאה'}
              />
            </div>

            {typeof readinessPct === 'number' && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">מוכנות לשחרור למורים</span>
                  <span className="text-sm font-black text-slate-900">{readinessPct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={
                      'h-full rounded-full transition-all ' +
                      (readinessPct >= 100 ? 'bg-emerald-500' : readinessPct >= 60 ? 'bg-amber-500' : 'bg-rose-500')
                    }
                    style={{ width: `${Math.max(0, Math.min(100, readinessPct))}%` }}
                  />
                </div>
                {blockers.length > 0 && (
                  <ul className="pt-1 space-y-1.5">
                    {blockers.map((b) => (
                      <li key={b.key} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                        <XCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        {b.message_he}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tables.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tables.map((t) => {
                  const exists = t.exists !== false && t.count !== null;
                  return (
                    <div
                      key={t.table}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm font-bold text-slate-700">
                        {TABLE_LABELS_HE[t.table] ?? t.table}
                      </span>
                      {exists ? (
                        <span className="text-sm font-black text-slate-900">{t.count ?? 0}</span>
                      ) : (
                        <span className="text-xs font-bold text-rose-600">חסר</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                אין עדיין נתונים במערכת. מספרים יופיעו כאן ברגע שמורים יתחילו להשתמש בכלי מתוך Moodle.
              </p>
            )}

            <p className="text-xs font-medium text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
              המספרים כאן הם סכומים אמיתיים מהמסד החי בלבד — ללא שמות תלמידים, ללא סודות, ללא נתונים מומצאים.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Automation-readiness panel. "Maximum automation" for teachers = one-click add
// from Moodle's activity chooser, which needs the LTI 1.3 path certified. This
// shows the real, live 1.3 capabilities so the rollout state is honest, never
// assumed. It is read-only (a non-PII diagnostic) and changes no Moodle setting.
function AutomationStatus() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Lti13Status>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/lti13/status', { cache: 'no-store' });
      setStatus(await r.json().catch(() => null));
    } catch {
      setError('לא ניתן לטעון את מצב האוטומציה כרגע.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const caps = status?.capabilities ?? {};
  const certified = !!caps.oidc_login && !!caps.jwt_launch_validation;
  const infra = !!status?.configured && !!caps.jwks_available;

  return (
    <Card className="border-2 border-slate-100 shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-black">מצב אוטומציה — התקנה בלחיצה אחת (LTI 1.3)</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-2 text-slate-500">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            רענון
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> טוען מצב חי מהשרת...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap gap-2">
              <StatusPill ok={infra} label={infra ? 'תשתית מוכנה (מפתחות + JWKS חי)' : 'תשתית חסרה'} />
              <StatusPill ok={certified} label={certified ? 'נתיב 1.3 מאושר — לחיצה אחת פעילה' : 'נתיב 1.3 ממתין לאישור חי'} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['כניסת OIDC', caps.oidc_login],
                ['אימות launch (JWT)', caps.jwt_launch_validation],
                ['מפתח ציבורי (JWKS)', caps.jwks_available],
                ['סנכרון משתתפים (NRPS)', caps.nrps_roster_sync],
              ].map(([label, ok]) => (
                <div key={label as string} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{label as string}</span>
                  {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-slate-300" />}
                </div>
              ))}
            </div>

            {!certified && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-medium text-blue-900 leading-relaxed">
                כדי לפתוח התקנה בלחיצה אחת למורים צריך <b>אישור חי אחד</b>: הרצת launch אמיתי של הכלי כ-LTI 1.3
                בתוך קורס Moodle של משרד החינוך. זו לחיצת-יד בין השרת שלנו לשרת של משרד החינוך — לכן צריך את
                המרחב האמיתי. עד לאישור, המורים מתקינים בדרך הבדוקה (1.1) המופיעה בדף ההתקנה.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminHub() {
  return (
    <div dir="rtl" className="text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white shadow-md">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black">מרכז השליטה של יניב</h1>
          <p className="text-sm font-medium text-slate-500">אזור ניהול פרטי — מנהל מחובר בלבד.</p>
        </div>

        {/* Live system status — real DB + server data */}
        <LiveSystemStatus />

        {/* Automation readiness — live LTI 1.3 one-click-install status */}
        <AutomationStatus />

        {/* Guide */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500 text-white shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black">מצגת הדרכה למורים</h3>
              <p className="text-sm font-medium text-slate-500">קישור ציבורי — מוכן לשליחה למורים.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-2">
                <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer">
                  פתיחה
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <CopyLink text={GUIDE_URL} idleLabel="העתקת קישור למצגת" doneLabel="הקישור הועתק" />
            </div>
          </CardContent>
        </Card>

        {/* Install link for teachers */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500 text-white shrink-0">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black">קישור התקנה למורים</h3>
                <p className="text-sm font-medium text-slate-500">
                  הקישור להוראות התקנת הכלי במרחב Moodle — מוכן לשליחה למורים.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="gap-2">
                  <a href={INSTALL_URL} target="_blank" rel="noopener noreferrer">
                    פתיחת ההוראות
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <CopyLink text={INSTALL_URL} idleLabel="העתקת קישור התקנה" doneLabel="הקישור הועתק" />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <CopyField label="כתובת הכלי (Tool URL)" value={TOOL_URL} />
              <CopyField label="מפתח צרכן (Consumer Key)" value={CONSUMER_KEY} />
            </div>
            <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 leading-relaxed">
              ה-Shared Secret נמסר בנפרד ובאופן מאובטח — לעולם לא בצ'אט, מייל או צילום מסך.
              הדרך המהירה ביותר: אם מנהל ה-Moodle של משרד החינוך רשם את הכלי ברמת האתר,
              המורה מוסיף אותו בלחיצה אחת מרשימת הכלים — בלי להזין כלום.
            </p>
          </CardContent>
        </Card>

        {/* Teacher Hub */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-primary text-white shrink-0">
              <Wrench className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black">כלי הנתונים למורה</h3>
              <p className="text-sm font-medium text-slate-500">
                נפתח על ידי מורה מתוך מרחב Moodle. מעבר לתצוגת הכלי:
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a href="/">מעבר לכלי</a>
            </Button>
          </CardContent>
        </Card>

        {/* Security boundary */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 flex items-start gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black">גבולות אבטחה</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                אזור זה נגיש רק למנהל מחובר. הגישה מאומתת בשרת, לא בהסתרת קישור. כלי המורה
                מציג נתונים רק בהקשר Moodle תקין, ומורה רואה אך ורק את הקורס שלו.
              </p>
            </div>
          </CardContent>
        </Card>

        <footer className="pt-6 border-t border-slate-200 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-bold text-slate-600">האתר מנוהל ע״י יניב רז</p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
          >
            <Instagram className="h-4 w-4" />
            yani__raz@
          </a>
        </footer>
      </div>
    </div>
  );
}
