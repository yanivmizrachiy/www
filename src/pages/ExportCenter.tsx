import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExportCenter() {
  const reports = [
    { id: 'grades', name: 'דוח ציונים מלא', type: 'Excel', ready: true },
    { id: 'students', name: 'רשימת תלמידים', type: 'Excel', ready: true },
    { id: 'activity', name: 'דוח פעילות יומי', type: 'CSV', ready: true },
    { id: 'logs', name: 'דוגמת לוגים גולמית', type: 'CSV', ready: true },
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
              <Button disabled={!report.ready} variant={report.ready ? "default" : "secondary"} className="w-full gap-2">
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
