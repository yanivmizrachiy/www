import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { SafePage } from "@/components/SafePage";
import { TruthBadge } from "@/components/TruthBadge";
import { usePracticeTime } from "@/hooks/useImports";
import { secondsToHebrewHms } from "@/lib/duration";
import { formatTeacherDateDmyShort, formatTeacherTime } from "@/lib/teacherDateFormat";
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
import { Clock, Download, AlertTriangle } from "lucide-react";

type Range = "day" | "week" | "custom";

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function TimeRangeReport() {
  const [range, setRange] = useState<Range>("week");
  const [customFrom, setCustomFrom] = useState<string>(isoNDaysAgo(30));
  const [customTo, setCustomTo] = useState<string>(isoToday());

  const from = range === "day" ? isoToday() : range === "week" ? isoNDaysAgo(6) : customFrom;
  const to = range === "day" ? isoToday() : range === "week" ? isoToday() : customTo;

  const { data, loading } = usePracticeTime({ from, to });

  const perStudent = useMemo(() => {
    if (!data?.per_student?.length) return [];
    return [...data.per_student].sort((a, b) => b.total_seconds - a.total_seconds);
  }, [data]);

  function exportXlsx() {
    if (!perStudent.length) return;
    const rows = perStudent.map((s) => ({
      "שם תלמיד": s.student_name ?? "—",
      "זמן הערכה": secondsToHebrewHms(s.total_seconds),
      "אירועים": s.event_count,
      "סשנים": s.session_count,
      "ימי פעילות": s.active_days,
      "פעילות ראשונה": formatTeacherTime(s.first_at),
      "פעילות אחרונה": formatTeacherTime(s.last_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "זמן תרגול");
    XLSX.writeFile(wb, `practice_time_${from}_to_${to}.xlsx`);
  }

  return (
    <SafePage title="דוח זמנים" description="הערכת זמן תרגול לפי לוגים — לא מדידה מדויקת">
      <div className="space-y-5" dir="rtl">

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>הערכה לפי לוגים בלבד.</strong> זמן התרגול מחושב לפי חלונות פעילות (sessionization) מתוך לוגי Moodle שיובאו. אין מדידת משך מדויקת ממקור רשמי Moodle — אלו הערכות בלבד.
          </span>
        </div>

        {/* Range selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">טווח:</span>
          {(["day", "week", "custom"] as Range[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "outline"}
              onClick={() => setRange(r)}
            >
              {r === "day" ? "יום זה" : r === "week" ? "7 ימים אחרונים" : "מותאם אישית"}
            </Button>
          ))}
          {range === "custom" && (
            <div className="flex items-center gap-2 text-sm">
              <span>מ-</span>
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
              />
              <span>עד</span>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={isoToday()}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>

        {/* Showing range label */}
        <p className="text-xs text-muted-foreground">
          מציג: {formatTeacherDateDmyShort(from)} – {formatTeacherDateDmyShort(to)}
        </p>

        {/* Per-student table */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-bold">זמן לפי תלמיד</CardTitle>
              <TruthBadge status="calculated" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportXlsx}
              disabled={!perStudent.length}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              ייצוא Excel
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="h-40 animate-pulse bg-muted/30" />
            ) : !perStudent.length ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Clock className="h-10 w-10 text-muted-foreground/40" />
                <p className="font-semibold">אין נתוני זמן לטווח זה</p>
                <p className="text-sm text-muted-foreground">יש לייבא דוח לוגים (Logs) ממודל כדי לחשב זמני תרגול. בחר טווח תאריכים אחר או ייבא לוגים.</p>
              </div>
            ) : (
              <Table dir="rtl">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-right">תלמיד</TableHead>
                    <TableHead className="text-center">זמן הערכה</TableHead>
                    <TableHead className="text-center">ימי פעילות</TableHead>
                    <TableHead className="text-center">אירועים</TableHead>
                    <TableHead className="text-center">סשנים</TableHead>
                    <TableHead className="text-right">פעילות אחרונה</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perStudent.map((s) => (
                    <TableRow key={s.student_id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{s.student_name ?? "—"}</TableCell>
                      <TableCell className="text-center font-bold text-primary">
                        {secondsToHebrewHms(s.total_seconds)}
                      </TableCell>
                      <TableCell className="text-center">{s.active_days}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{s.event_count}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{s.session_count}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {s.last_at ? `${formatTeacherDateDmyShort(s.last_at)} ${formatTeacherTime(s.last_at)}` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SafePage>
  );
}
