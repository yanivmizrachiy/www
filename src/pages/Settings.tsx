import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { SafePage } from '@/components/SafePage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Globe,
  Key,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

type MoodleSite = Tables<'moodle_sites'>;

function ConnectionTest({ siteId }: { siteId: string }) {
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  async function test() {
    setStatus("testing");
    try {
      const { error } = await supabase
        .from("moodle_sites")
        .select("id")
        .eq("id", siteId)
        .single();
      setStatus(error ? "fail" : "ok");
    } catch {
      setStatus("fail");
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={test}
      disabled={status === "testing"}
      className="gap-2"
    >
      {status === "testing" && <Loader2 className="h-4 w-4 animate-spin" />}
      {status === "ok" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      {status === "fail" && <XCircle className="h-4 w-4 text-red-500" />}
      {status === "idle" && "בדיקה"}
      {status === "testing" && "בודק..."}
      {status === "ok" && "מחובר"}
      {status === "fail" && "שגיאה"}
    </Button>
  );
}

export default function Settings() {
  const [sites, setSites] = useState<MoodleSite[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [siteUrl, setSiteUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [saving, setSaving] = useState(false);

  const toolUrl = `${window.location.origin}/api/lti/launch`;

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    setLoading(true);
    const { data } = await supabase
      .from("moodle_sites")
      .select("*")
      .order("created_at", { ascending: false });
    setSites(data ?? []);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!siteUrl || !consumerKey || !consumerSecret) {
      toast.error("יש למלא את כל השדות");
      return;
    }

    const normalizedUrl = siteUrl.replace(/\/$/, "").trim();

    setSaving(true);
    try {
      const { error } = await supabase
        .from("moodle_sites")
        .upsert({
          site_url: normalizedUrl,
          site_name: siteName || normalizedUrl,
          lti_consumer_key: consumerKey.trim(),
          lti_consumer_secret: consumerSecret.trim(),
        }, {
          onConflict: "site_url",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      toast.success("האתר נשמר בהצלחה");
      setSiteUrl("");
      setSiteName("");
      setConsumerKey("");
      setConsumerSecret("");
      await loadSites();
    } catch (err: any) {
      toast.error(err.message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק את האתר? פעולה זו לא תמחק נתונים שיובאו.")) return;

    const { error } = await supabase.from("moodle_sites").delete().eq("id", id);
    if (error) {
      toast.error("שגיאה במחיקה");
    } else {
      toast.success("האתר נמחק");
      await loadSites();
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("הועתק ללוח");
  }

  return (
    <SafePage
      title="הגדרות"
      description="רישום אתרי Moodle ופרטי LTI לחיבור הכלי."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Site Registration Form */}
        <div className="lg:col-span-2 space-y-8">

          {/* Tool URL Card */}
          <Card className="border-none shadow-luxury bg-gradient-to-br from-slate-50 to-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Tool URL להעתקה במודל</CardTitle>
                  <CardDescription className="font-medium">
                    הכתובת שיש להזין בהגדרות הכלי החיצוני ב-Moodle
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-3 items-center">
                <code className="flex-1 p-4 bg-slate-100 rounded-xl border border-slate-200 text-sm font-mono overflow-auto text-slate-700">
                  {toolUrl}
                </code>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => copy(toolUrl)}
                  className="h-14 w-14 shrink-0 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-start gap-2 mt-4 text-sm text-amber-700 bg-amber-50 rounded-xl p-4 border border-amber-200">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  העתק את כתובת ה-Tool URL והדבק אותה בשדה <strong>"כתובת כלי" (Tool URL)</strong> בהגדרות
                  External Tool במודל. לאחר מכן הזן את <strong>Consumer Key</strong> ואת
                  <strong> Consumer Secret</strong> שיוצרו במודל בטופס למטה.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent rounded-xl text-white shadow-lg shadow-accent/20">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">רישום אתר Moodle</CardTitle>
                  <CardDescription className="font-medium">
                    הזן את פרטי אתר ה-Moodle שלך ואת פרטי ה-LTI
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      כתובת אתר Moodle <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        dir="ltr"
                        placeholder="https://moodlemoe.lms.education.gov.il"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        className="pr-10 font-mono text-sm text-left"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      שם האתר (אופציונלי)
                    </label>
                    <Input
                      placeholder="מודל מכללת חינוך"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-dashed pt-5">
                  <h4 className="text-sm font-black mb-4 text-slate-600">פרטי LTI (מ-Moodle)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Consumer Key <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Key className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          dir="ltr"
                          placeholder="moodle_college_teacher_hub"
                          value={consumerKey}
                          onChange={(e) => setConsumerKey(e.target.value)}
                          className="pr-10 font-mono text-sm text-left"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Consumer Secret <span className="text-red-400">*</span>
                      </label>
                      <Input
                        dir="ltr"
                        type="password"
                        placeholder="••••••••••••"
                        value={consumerSecret}
                        onChange={(e) => setConsumerSecret(e.target.value)}
                        className="font-mono text-sm text-left"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full gap-2 font-black"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {saving ? "שומר..." : "שמור אתר"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registered Sites */}
          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-xl text-white shadow-lg shadow-green-600/20">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">אתרים רשומים</CardTitle>
                  <CardDescription className="font-medium">
                    {sites.length > 0
                      ? `${sites.length} אתרים מחוברים`
                      : "אין אתרים רשומים עדיין"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sites.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground space-y-2">
                  <Globe className="h-12 w-12 mx-auto opacity-20" />
                  <p className="font-bold">לא נמצאו אתרים רשומים</p>
                  <p className="text-sm">הוסף אתר Moodle בטופס למעלה כדי להתחיל</p>
                </div>
              ) : (
                sites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black truncate">{site.site_name ?? site.site_url}</h4>
                        {site.lti_consumer_key ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                        {site.site_url}
                      </p>
                      {site.lti_consumer_key && (
                        <div className="flex items-center gap-1 mt-1">
                          <Key className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/50 font-mono">
                            {site.lti_consumer_key.slice(0, 20)}...
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ConnectionTest siteId={site.id} />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(site.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Help & Info */}
        <div className="space-y-6">
          <Card className="bg-primary text-white shadow-luxury">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-black leading-tight">אבטחה מובנית</h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                כל חיבור מאומת באמצעות OAuth 1.0a HMAC-SHA1.
                הססמה לעולם אינה נשמרת בקליפבורד או מועברת ברשת.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 bg-accent/5 rounded-[2rem] border border-accent/10 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-accent">איך ליצור LTI במודל</h3>
            <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
              {[
                "1. היכנס לניהול קורס במודל",
                "2. הוסף פעילות → כלי חיצוני (External Tool)",
                '3. ב"כתובת כלי" — הדבק את ה-Tool URL',
                "4. שמור והפעל LTI",
                '5. העתק את Consumer Key + Secret והדבק בטופס'
              ].map((step, i) => (
                <p key={i}>{step}</p>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-100/50 rounded-[2rem] border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle className="h-5 w-5" />
              <span className="font-black text-xs uppercase tracking-wider">חשוב לדעת</span>
            </div>
            <div className="text-sm text-slate-500 font-medium leading-relaxed space-y-2">
              <p>לאחר חיבור הכלי במודל, המערכת תיפתח אוטומטית מתוך הקורס שלך עם הרשאות מלאות.</p>
              <p>אין צורך בססמה נפרדת — האימות מתבצע דרך LTI של מודל.</p>
            </div>
          </div>
        </div>
      </div>
    </SafePage>
  );
}
