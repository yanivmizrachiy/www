import React, { useState } from "react";
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
import { Download, Clock, Lock, AlertCircle } from "lucide-react";

interface PracticeTimeSectionProps {
  studentId?: string | null;
  title?: string;
  showPeriodFilter?: boolean;
}

type Period = '24h' | '7d' | '30d' | 'custom';

function getCutoff(period: Period, customRange?: { from: string; to: string }): Date {
  const now = new Date();
  if (period === '24h') return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (period === 'custom' && customRange) return new Date(customRange.from);
  return new Date(0);
}

function getMaxDate(period: Period, customRange?: { from: string; to: string }): Date {
  const now = new Date();
  if (period === 'custom' && customRange) return new Date(customRange.to);
  return now;
}

const PERIOD_LABELS: Record<Period, string> = {
  '24h': '24 שעות אחרונות',
  '7d': '7 ימים אחרונים',
  '30d': '30 ימים אחרונים',
  'custom': 'טווח מותאם',
};

const PERIOD_ICONS: Record<Period, string> = {
  '24h': 'יממה',
  '7d': 'שבוע',
  '30d': 'חודש',
  'custom': 'מותאם',
};

export function PracticeTimeSection({ studentId = null, title = "זמן תרגול", showPeriodFilter = true }: PracticeTimeSectionProps) {
  const [period, setPeriod] = useState<Period>('24h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const cutoff = getCutoff(period, customFrom ? { from: customFrom, to: customTo } : undefined);
  const maxDate = getMaxDate(period, customFrom ? { from: customFrom, to: customTo } : undefined);

  const { rows, loading, error } = usePracticeTime({
    studentId,
    // Pass date range to hook if supported, otherwise filter client-side
  });

  const filteredRows = rows?.filter(r => {
    const d = new Date(r.day);
    return d >= cutoff && d <= maxDate;
  }) ?? [];

  const handleExport = () => {
    if (!filteredRows.length) return;
    const rowsToExport = [
      ["תאריך", "תלמיד", "זמן כולל (שניות)", "אירועים"],
      ...filteredRows.map(d => [
        d.day,
        d.student_name ?? "—",
        d.total_seconds,
        d.event_count,
      ])
    ];
    exportToCsv(`practice_time_${new Date().toISOString().split('T')[0]}.csv`, rowsToExport);
  };

  if (loading) return <div className="space-y-4"><div className="h-40 animate-pulse rounded-lg bg-muted" /></div>;

  if (error || !rows || rows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <Lock className="h-10 w-10 text-muted-foreground/40" />
          <h3 className="font-bold">אין נתוני זמן תרגול</h3>
          <p className="text-sm text-muted-foreground">
            מדידת זמן תרגול דורשת סנכרון פעילות/לוגים ממודל. כרגע מוצגים רק נתונים אמיתיים זמינים.
          </p>
          <p className="text-xs text-muted-foreground">
            יש לייבא דוח לוגים (Logs) או להפעיל סנכרון אוטומטי.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-elegant">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <VerifiedBadge status="calculated" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="text-xs gap-1"
            >
              {PERIOD_LABELS[p]}
            </Button>
          ))}
        </div>
      </CardHeader>

      {period === 'custom' && (
        <div className="flex items-center gap-4 px-6 py-3 bg-amber-50 border-b border-amber-100">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm font-medium text-amber-700">טווח מותאם:</span>
          <input
            type="date"
            value={customFrom}
            onChange={e => setCustomFrom(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          />
          <span className="text-sm text-muted-foreground">עד</span>
          <input
            type="date"
            value={customTo}
            onChange={e => setCustomTo(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          />
        </div>
      )}

      <CardContent className="p-0">
        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <Clock className="h-10 w-10 text-muted-foreground/40" />
            <h3 className="font-bold text-muted-foreground">אין פעילות בטווח הנבחר</h3>
            <p className="text-sm text-muted-foreground">
              נסה טווח זמן אחר או בדוק שהלוגים מכילים נתונים בתקופה זו.
            </p>
          </div>
        ) : (
          <>
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
                {filteredRows.map((day) => (
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
            <div className="flex justify-end px-4 py-3 border-t">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                ייצוא CSV
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
