import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLtiSession } from '@/hooks/useLtiSession';
import { exportGradesCsv, exportStudentsCsv } from '@/lib/exportGrades';
import { toast } from 'sonner';

export default function ExportCenter() {
  const { session } = useLtiSession();

  async function handleExport(reportId: string) {
    if (!session) {
      toast.error("יש לפתוח את המערכת מתוך Moodle כדי לייצא נתונים");
      return;
    }
    try {
      if (reportId === 'grades') {
        await exportGradesCsv(session.site_id, session.course_id);
        toast.success("הקובץ הורד בהצלחה");
      } else if (reportId === 'students') {
        await exportStudentsCsv(session.site_id, session.course_id);
        toast.success("הקובץ הורד בהצלחה");
      }
    } catch (err: any) {
      toast.error(err.message || "שגיאה בייצוא");
    }
  }

  const reports = [
    { id: 'grades', name: 'דוח ציונים מלא', type: 'Excel', ready: true },
    { id: 'students', name: 'רשימת תלמידים', type: 'Excel', ready: true },
    { id: 'activity', name: 'דוח פעילות יומי', type: 'CSV', ready: false },
    { id: 'logs', name: 'לוגים גולמיים', type: 'CSV', ready: false },
    { id: 'gaps', name: 'דוח פערים ונתונים חסרים', type: 'PDF', ready: false },
  ];

  return (
    <div className="p-8 space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">מרכז ייצוא נתונים</h1>
        <p className="text-muted-foreground mt-2">ייצוא דוחות מנתוני המערכת לקבצי Excel ו-CSV.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="group hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="p-2 rounded-md bg-primary/10 text-primary">
                   <FileSpreadsheet className="h-5 w-5" />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                   {report.type}
                 </span>
              </div>
              <CardTitle className="text-lg mt-4">{report.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button disabled={!report.ready} variant={report.ready ? "default" : "secondary"} className="w-full gap-2" onClick={() => handleExport(report.id)}>
                {report.ready ? (
                  <>
                    <Download className="h-4 w-4" />
                    הורדה
                  </>
                ) : "בקרוב"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
