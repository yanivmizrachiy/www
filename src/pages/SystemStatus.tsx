import React, { useState } from 'react';
import { useLtiSession } from '@/hooks/useLtiSession';
import { useImportsOverview } from '@/hooks/useImports';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Info, Activity, Database, Server } from 'lucide-react';

export default function SystemStatus() {
  const { session, site, loading: sessionLoading } = useLtiSession();
  const { data, loading: dataLoading } = useImportsOverview();
  const [dbStatus, setDbStatus] = useState<"connected" | "missing" | "checking">("checking");

  React.useEffect(() => {
    (async () => {
      try {
        const { error } = await supabase.from("moodle_sites").select("id").limit(1);
        setDbStatus(error ? "missing" : "connected");
      } catch {
        setDbStatus("missing");
      }
    })();
  }, []);

  const statuses = [
    {
      name: "חיבור LTI (Moodle)",
      status: session ? "connected" : "missing",
      description: session ? `מחובר כ-${session.moodle_username} ב-Moodle` : "לא נמצא חיבור LTI פעיל (עובד במצב Offline)",
      icon: Server
    },
    {
      name: "Supabase (Database)",
      status: dbStatus,
      description: dbStatus === "checking" ? "בודק חיבור..." :
                   dbStatus === "connected" ? "בסיס הנתונים מחובר וזמין" : "בסיס הנתונים אינו זמין",
      icon: Database
    },
    {
      name: "סטטוס נתוני ייבוא",
      status: data?.students_count > 0 ? "connected" : "missing",
      description: data?.students_count > 0 ? `נקלטו ${data.students_count} תלמידים בייבוא האחרון` : "עדיין לא יובאו נתונים",
      icon: Activity
    }
  ];

  return (
    <div className="p-8 space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">סטטוס חיבור ונתונים</h1>
        <p className="text-muted-foreground mt-2">מעקב אחר בריאות החיבור למודל ולבסיס הנתונים.</p>
      </div>

      <div className="grid gap-6">
        {statuses.map((item) => (
          <Card key={item.name} className="overflow-hidden">
            <div className="flex items-center gap-6 p-6">
              <div className={`p-4 rounded-full ${item.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <item.icon className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl">{item.name}</h3>
                  {item.status === 'connected' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {session && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">פרטי LTI Session</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm font-mono">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Session Token:</span>
              <span>{localStorage.getItem('lti_token')?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Moodle Site:</span>
              <span>{site?.site_url}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course ID:</span>
              <span>{session.course_id}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
