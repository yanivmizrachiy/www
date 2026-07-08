import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Lock,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  Instagram,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Public teacher presentation — safe to link from anywhere.
const GUIDE_URL = 'https://www-tijc.onrender.com/guide';
const INSTAGRAM_URL = 'https://www.instagram.com/yani__raz';

// Security prerequisites that must exist before this page can expose any real
// control. Each is currently missing — see PROJECT_MEMORY.md.
const REQUIREMENTS: { label: string; detail: string }[] = [
  { label: 'אימות משתמש (Auth)', detail: 'התחברות אמיתית — אין כרגע מנגנון כניסה.' },
  { label: 'תפקיד מנהל (admin role)', detail: 'דרך לזהות שזה יניב בלבד — לא קיים.' },
  { label: 'הגנת נתונים (RLS)', detail: 'מדיניות שורות אמיתית מול המשתמש המחובר — לא קיימת.' },
  { label: 'נתיב מוגן (protected route)', detail: 'חסימה בצד השרת, לא הסתרת קישור בלבד.' },
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

export default function AdminHub() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white shadow-md">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">מרכז השליטה של יניב</h1>
        </div>

        {/* Locked banner — honest state, no fake controls */}
        <Card className="border-none shadow-luxury overflow-hidden">
          <div className="h-2 w-full bg-amber-500" />
          <CardContent className="p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">
                  המרכז חסום עד להגדרת הרשאות מנהל
                </h2>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  מרכז השליטה הפרטי עדיין חסום עד להגדרת הרשאות מנהל. עמוד זה אינו טוען נתונים
                  פרטיים, אינו מציג משתמשים או אנליטיקה, ואין בו כפתורי ניהול פעילים — כדי שלא
                  ייחשף מידע רגיש ללא אבטחה אמיתית.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public guide link — the one real, safe capability */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500 text-white shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-black text-slate-900">מצגת הדרכה למורים</h3>
              <p className="text-sm font-medium text-slate-500">
                קישור ציבורי — מוכן לשליחה למורים.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-2">
                <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer">
                  פתיחת המצגת
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <CopyGuideLink />
            </div>
          </CardContent>
        </Card>

        {/* Security requirements checklist */}
        <Card className="border-2 border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              דרישות אבטחה לפתיחת המרכז
            </h3>
            <ul className="space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r.label} className="flex items-start gap-3">
                  <span
                    className={cn(
                      'shrink-0 mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1',
                      'text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-200'
                    )}
                  >
                    חסר
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{r.label}</div>
                    <div className="text-xs font-medium text-slate-500 leading-relaxed">
                      {r.detail}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs font-medium text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
              עד שכל הדרישות יתקיימו — לא ייפתחו כאן כלים לניהול תוכן, סנכרון או הרשאות. הסתרת
              קישור בלבד אינה אבטחה.
            </p>
          </CardContent>
        </Card>

        {/* Footer — managed by + Instagram (site-wide rule) */}
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
