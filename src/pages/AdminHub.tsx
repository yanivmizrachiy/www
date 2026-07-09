import { useState } from 'react';
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
  Activity,
  ListChecks,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Public teacher presentation — safe to link anywhere.
const GUIDE_URL = 'https://www-tijc.onrender.com/guide';
const INSTAGRAM_URL = 'https://www.instagram.com/yani__raz';

// Roadmap items — mirrors PROJECT_MEMORY. These are NOT active features.
const NEXT_STEPS = [
  'ניהול תוכן מצגת ותמונות (טשטוש/אישור) — עתידי',
  'אנליטיקה אמיתית של שימוש במצגת — עתידי',
  'סטטוס Render/deploy דרך סקריפט מאובטח — עתידי',
];

function CopyGuideLink() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(GUIDE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <Button variant="outline" onClick={copy} className="gap-2">
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {copied ? 'הקישור הועתק' : 'העתקת קישור למצגת'}
    </Button>
  );
}

// Real, on-demand availability check — same-origin fetch to /guide.
// No fake "connected" claim: status is only shown after an actual request.
function GuideStatus() {
  const [state, setState] = useState<'idle' | 'checking' | 'up' | 'down'>('idle');
  async function check() {
    setState('checking');
    try {
      const res = await fetch('/guide', { method: 'GET', cache: 'no-store' });
      setState(res.ok ? 'up' : 'down');
    } catch {
      setState('down');
    }
  }
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={check} className="gap-2" disabled={state === 'checking'}>
        {state === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
        בדיקת זמינות מצגת
      </Button>
      {state === 'up' && <span className="text-xs font-bold text-emerald-600">המצגת פעילה (‎/guide‎)</span>}
      {state === 'down' && <span className="text-xs font-bold text-rose-600">לא זמין כרגע</span>}
    </div>
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
              <CopyGuideLink />
            </div>
          </CardContent>
        </Card>

        {/* Teacher Hub */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-primary text-white shrink-0">
              <Wrench className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black">Moodle Teacher Hub</h3>
              <p className="text-sm font-medium text-slate-500">
                כלי הנתונים למורה. נפתח בהקשר Moodle דרך LTI.
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a href="/">מעבר לכלי</a>
            </Button>
          </CardContent>
        </Card>

        {/* System status — real only */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-lg font-black">סטטוס מערכת</h3>
            <GuideStatus />
            <ul className="text-xs font-medium text-slate-500 space-y-1 leading-relaxed pt-2 border-t border-slate-100">
              <li>· Teacher Hub דורש LTI launch תקין — אין נתונים ללא הקשר Moodle.</li>
              <li>· אין סנכרון אוטומטי ללא token של Web Services.</li>
              <li>· אין כאן אנליטיקה או סטטוס deploy — לא מוצגים נתונים שאינם אמיתיים.</li>
            </ul>
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
                אזור זה נגיש רק למנהל מחובר (Supabase Auth + תפקיד admin ב-DB + RLS). הגישה
                מאומתת בשרת, לא בהסתרת קישור.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-black">שלבים הבאים</h3>
            </div>
            <ul className="space-y-2">
              {NEXT_STEPS.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm font-medium text-slate-600">
                  <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0')} />
                  {s}
                </li>
              ))}
            </ul>
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
