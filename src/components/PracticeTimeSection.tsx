import React, { useState } from "react";
import { usePracticeTime, PracticeDayRow } from "@/hooks/useImports";
import { secondsToHebrewHms } from "@/lib/duration";
import { downloadCsv } from "@/lib/csv";
import { formatTeacherTime, formatTeacherDateDmyShort } from "@/lib/teacherDateFormat";
import { TruthBadge } from "@/components/TruthBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Calendar, Users, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface PracticeTimeSectionProps {
  studentId?: string | null;
  title?: string;
}

export function PracticeTimeSection({ studentId = null, title = "זמן תרגול יומי" }: PracticeTimeSectionProps) {
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const { data, loading, error } = usePracticeTime({ studentId });

  // Truth: estimate unless an official duration field exists.
  const hasOfficialDuration = data?.meta?.has_official_duration === true;
  const enoughLogs = data?.meta?.enough_logs !== false;

  const toggleDay = (day: string) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleExport = () => {
    if (!data?.days?.length) return;
    const headers = ["תאריך", "תלמיד", "זמן כולל", "אירועים", "סשנים", "התחלה", "סיום"];
    const csvRows = data.days.map(d => [
      d.day,
      d.student_name ?? "—",
      secondsToHebrewHms(d.total_seconds),
      d.event_count,
      d.session_count,
      d.first_at ? formatTeacherTime(d.first_at) : "—",
      d.last_at ? formatTeacherTime(d.last_at) : "—",
    ]);
    downloadCsv(`practice_time_${new Date().toISOString().split('T')[0]}.csv`, headers, csvRows);
  };

  if (loading) return <div className="space-y-4"><div className="h-40 animate-pulse rounded-lg bg-muted" /></div>;

  if (error || !data?.days?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Clock className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-semibold">אין נתוני זמן תרגול</h3>
          <p className="text-sm text-muted-foreground">נדרש ייבוא דוח לוגים כדי להציג הערכת חלונות פעילות. זמן רשמי דורש שדה משך מאומת.</p>
        </CardContent>
      </Card>
    );
  }

  if (!enoughLogs) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Clock className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-semibold">אין מספיק לוגים לחישוב זמן</h3>
          <p className="text-sm text-muted-foreground">נדרשים לפחות {data?.meta?.min_log_events ?? 2} אירועי לוג כדי להציג הערכת חלונות פעילות.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <TruthBadge status={hasOfficialDuration ? "proven" : "blocked"} label={hasOfficialDuration ? "משך רשמי" : "הערכה — לא מאומת"} />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          ייצוא CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">תלמיד</TableHead>
              <TableHead className="text-center">{hasOfficialDuration ? "זמן כולל" : "זמן כולל (הערכה)"}</TableHead>
              <TableHead className="text-center">אירועים</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.days.map((day) => (
              <React.Fragment key={`${day.day}-${day.student_id}`}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => toggleDay(`${day.day}-${day.student_id}`)}
                >
                  <TableCell className="font-medium">{formatTeacherDateDmyShort(day.day)}</TableCell>
                  <TableCell>{day.student_name}</TableCell>
                  <TableCell className="text-center font-bold text-primary">
                    {secondsToHebrewHms(day.total_seconds)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{day.event_count}</TableCell>
                  <TableCell>
                    {expandedDays.includes(`${day.day}-${day.student_id}`) ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                </TableRow>
                {expandedDays.includes(`${day.day}-${day.student_id}`) && (
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={5} className="p-4">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">סשנים מחושבים</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {day.windows.map((win, idx) => (
                            <div key={idx} className="flex flex-col rounded-lg border bg-background p-2 text-sm shadow-sm">
                              <div className="flex items-center justify-between font-medium">
                                <span>{secondsToHebrewHms(win.duration_seconds)}</span>
                                <span className="text-[10px] text-muted-foreground">{win.event_count} אירועים</span>
                              </div>
                              <div className="mt-1 text-[10px] text-muted-foreground">
                                {formatTeacherTime(win.started_at)} – {formatTeacherTime(win.ended_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
