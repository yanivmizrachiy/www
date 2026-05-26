import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Terminal, CheckCircle2, XCircle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTeacherDateTime } from "@/lib/teacherDateFormat";

export function LaunchDiagnostics() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttempts() {
      const { data } = await supabase
        .from('launch_attempts')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(5);
      
      if (data) setAttempts(data);
      setLoading(false);
    }
    fetchAttempts();
  }, []);

  if (loading) return <div className="text-xs text-muted-foreground animate-pulse">טוען דיאגנוסטיקה...</div>;
  if (!attempts.length) return null;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <Terminal className="h-4 w-4" />
        ניתוח ניסיונות כניסה (LTI)
      </div>
      
      {attempts.map((attempt) => (
        <Card key={attempt.id} className={`border-l-4 ${attempt.outcome === 'success' ? 'border-l-status-proven' : 'border-l-status-blocked'}`}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {attempt.outcome === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-status-proven" />
                ) : (
                  <XCircle className="h-4 w-4 text-status-blocked" />
                )}
                <CardTitle className="text-xs font-bold">
                  {formatTeacherDateTime(attempt.attempted_at)}
                </CardTitle>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${attempt.outcome === 'success' ? 'bg-status-proven-bg text-status-proven' : 'bg-status-blocked-bg text-status-blocked'}`}>
                {attempt.outcome.toUpperCase()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="py-2 px-4 space-y-2">
            <div className="text-[11px] text-muted-foreground flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{attempt.reason || "לא צוינה סיבה"}</span>
            </div>
            
            {!attempt.signature_valid && attempt.outcome !== 'success' && (
              <div className="rounded bg-muted p-2 text-[10px] font-mono space-y-2 overflow-hidden">
                <div className="text-status-blocked font-bold border-b border-status-blocked/20 pb-1 mb-1">
                  SIGNATURE_MISMATCH
                </div>
                <div className="space-y-1">
                  <div className="opacity-50">Received: {attempt.debug_received_signature?.substring(0, 10)}...</div>
                  <div className="opacity-50">Expected: {attempt.debug_expected_signature?.substring(0, 10)}...</div>
                </div>
                <div className="mt-2 text-primary">
                  בדוק ש-Secret ב-Moodle תואם ל-LTI_CONSUMER_SECRET ב-Supabase.
                </div>
              </div>
            )}
            
            <div className="flex gap-4 text-[9px] text-muted-foreground">
               <span>Course ID: {attempt.course_id || "—"}</span>
               <span>Consumer: {attempt.consumer_key || "—"}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
