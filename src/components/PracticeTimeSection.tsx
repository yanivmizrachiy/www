import React from "react";
import { usePracticeTime } from "@/hooks/useImports";
import { secondsToHebrewHms } from "@/lib/duration";
import { exportToCsv } from "@/lib/csv";
import { VerifiedBadge } from "@/components/VerifiedBadge";
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
import { Download, Clock } from "lucide-react";

interface PracticeTimeSectionProps {
  studentId?: string | null;
  title?: string;
}

export function PracticeTimeSection({ studentId = null, title = "זמן תרגול יומי" }: PracticeTimeSectionProps) {
  const { rows, loading, error } = usePracticeTime({ studentId });

  const handleExport = () => {
    if (!rows?.length) return;

    const rowsToExport = [
      ["תאריך", "תלמיד", "זמן כולל (שניות)", "אירועים"],
      ...rows.map(d => [
        d.day,
        d.student_name ?? "—",
        d.total_seconds,
        d.event_count,
      ])
    ];

    exportToCsv(`practice_time_${new Date().toISOString().split('T')[0]}.csv`, rowsToExport);
  };

  if (loading) return <div className="space-y-4"><div className="h-40 animate-pulse rounded-lg bg-muted" /></div>;

  if (error || !rows?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Clock className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-semibold">אין נתוני זמן תרגול</h3>
          <p className="text-sm text-muted-foreground">נדרש ייבוא של דוח לוגים (Logs) כדי לחשב זמנים.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <VerifiedBadge status="calculated" />
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
              <TableHead className="text-center">זמן כולל</TableHead>
              <TableHead className="text-center">אירועים</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((day) => (
              <TableRow key={`${day.day}-${day.student_id}`} className="hover:bg-muted/30">
                <TableCell className="font-medium">{day.day}</TableCell>
                <TableCell>{day.student_name}</TableCell>
                <TableCell className="text-center font-bold text-primary">
                  {secondsToHebrewHms(day.total_seconds)}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{day.event_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
