import { useState, type ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabaseConfigured } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, ShieldAlert, Mail, LogOut, Loader2, CheckCircle2, ServerCog } from 'lucide-react';

function Shell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { loading, user, isAdmin, error, signInWithEmail, signInWithPassword, signOut } =
    useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  // 0. Supabase not configured on the host (Render env missing) — show a clear
  // operator message instead of a raw auth error. No env values are exposed.
  if (!supabaseConfigured) {
    return (
      <Shell>
        <Card className="border-none shadow-luxury overflow-hidden">
          <div className="h-2 w-full bg-amber-500" />
          <CardContent className="p-8 space-y-4 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-amber-100 text-amber-700">
              <ServerCog className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900">תצורת Supabase חסרה ב-Render</h1>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              יש להגדיר את משתני הסביבה <span dir="ltr">VITE_SUPABASE_URL</span> ו-
              <span dir="ltr">VITE_SUPABASE_PUBLISHABLE_KEY</span> בשירות ב-Render ולבצע
              deploy מחדש. עד אז מרכז השליטה אינו זמין.
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  // 1. Checking permissions — never reveal the hub before this resolves.
  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-bold">בודק הרשאות...</p>
        </div>
      </Shell>
    );
  }

  // 2. Not signed in — password sign-in (primary; the admin user has a
  // dashboard-created password) with magic-link email as fallback.
  if (!user) {
    async function submitPassword(e: React.FormEvent) {
      e.preventDefault();
      if (!email.trim() || !password) return;
      setBusy(true);
      await signInWithPassword(email.trim(), password);
      setBusy(false);
      // on success onAuthStateChange re-renders into the hub automatically
    }
    async function sendMagicLink() {
      if (!email.trim()) return;
      setBusy(true);
      const ok = await signInWithEmail(email.trim());
      setBusy(false);
      if (ok) setSent(true);
    }
    return (
      <Shell>
        <Card className="border-none shadow-luxury overflow-hidden">
          <div className="h-2 w-full bg-slate-900" />
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-900 text-white">
                <Lock className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">מרכז השליטה של יניב</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                אזור פרטי למנהל בלבד. מתחברים עם דוא״ל וסיסמה.
              </p>
            </div>

            {sent ? (
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                  נשלח קישור התחברות לדוא״ל. יש לפתוח את הקישור מאותו מכשיר כדי להיכנס.
                </p>
              </div>
            ) : (
              <form onSubmit={submitPassword} className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">כתובת דוא״ל</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  autoComplete="email"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
                <label className="block text-sm font-bold text-slate-700">סיסמה</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
                <Button type="submit" disabled={busy} className="w-full gap-2 h-12 font-bold">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  כניסה
                </Button>
                <button
                  type="button"
                  onClick={sendMagicLink}
                  disabled={busy || !email.trim()}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-primary transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 pt-1"
                >
                  <Mail className="h-3.5 w-3.5" />
                  או שליחת קישור התחברות לדוא״ל
                </button>
              </form>
            )}

            {error && <p className="text-xs font-medium text-rose-600 text-center">{error}</p>}
          </CardContent>
        </Card>
      </Shell>
    );
  }

  // 3. Signed in but not an admin — no access, offer sign out.
  if (!isAdmin) {
    return (
      <Shell>
        <Card className="border-none shadow-luxury overflow-hidden">
          <div className="h-2 w-full bg-rose-500" />
          <CardContent className="p-8 space-y-5 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-rose-100 text-rose-600">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900">אין הרשאת מנהל</h1>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              החשבון {user.email ?? ''} מחובר אך אינו מוגדר כמנהל. מרכז השליטה נגיש
              למנהלים מורשים בלבד.
            </p>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              התנתקות
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  // 4. Admin — render the real Control Center with a thin sign-out bar.
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            מחובר כמנהל · {user.email ?? ''}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-slate-600">
            <LogOut className="h-4 w-4" />
            התנתקות
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default ProtectedAdminRoute;
