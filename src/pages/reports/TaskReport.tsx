import * as XLSX from "xlsx";
import { useMemo } from "react";
import { SafePage } from "@/components/SafePage";
import { useTaskCompletionDetail } from "@/hooks/useImports";
import { TruthBadge } from "@/components/TruthBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { formatTeacherDateDmyShort } from "@/lib/teacherDateFormat";

function CompletionCell({ isComplete, completedAt }: { isComplete: boolean | null; completedAt: string | null }) {
  if (isComplete === null) {
    return (
      <span className="flex flex-col items-center gap-0.5">
        <HelpCircle className="h-4 w-4 text-slate-300" />
        <span className="text-[9px] text-slate-400">אין נתון</span>
      </span>
    );
  }
  if (isComplete) {
    return (
      <span className="flex flex-col items-center gap-0.5">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        {completedAt && (
          <span className="text-[9px] text-muted-foreground">{formatTeacherDateDmyShort(completedAt)}</span>
        )}
      </span>
    );
  }
  return (
    <span className="flex flex-col items-center gap-0.5">
      <XCircle className="h-4 w-4 text-red-500" />
      <span className="text-[9px] text-slate-400">לא הושלם</span>
    </span>
  );
}

export default function TaskReport() {
  const { data, loading } = useTaskCompletionDetail();

  const students = useMemo(() => {
    if (!data?.rows.length) return [];
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    for (const r of data.rows) {
      if (r.student_id && !seen.has(r.student_id)) {
        seen.add(r.student_id);
        result.push({ id: r.student_id, name: r.student_name ?? "—" });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [data]);

  function exportXlsx() {
    if (!data?.tasks.length || !students.length) return;
    const rows = students.map((student) => {
      const row: Record<string, string> = { "שם תלמיד": student.name };
      for (const task of data.tasks) {
        const c = data.rows.find(r => r.student_id === student.id && r.task_id === task.id);
        if (c === undefined || c.is_complete === null) {
          row[task.task_name] = "אין נתון";
        } else if (c.is_complete) {
          row[task.task_name] = c.completed_at ? `הושלם ${formatTeacherDateDmyShort(c.completed_at)}` : "הושלם";
        } else {
          row[task.task_name] = "לא הושלם";
        }
      }
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "דוח משימות");
    XLSX.writeFile(wb, `task_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const colCount = (data?.tasks.length ?? 0) + 1;

  return (
    <SafePage
      title="דוח משימות"
      description="מעקב השלמת משימות לפי תלמיד. ✓ הושלם · ✗ לא הושלם · אין נתון = חסר מקור."
    >
      <div className="space-y-4" dir="rtl">
        <Card className="overflow-hidden shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-bold">השלמת משימות</CardTitle>
              <TruthBadge status="proven" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportXlsx}
              disabled={!students.length}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              ייצוא Excel
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table dir="rtl">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right sticky right-0 bg-muted/50 z-10 w-[180px]">תלמיד</TableHead>
                  {data?.tasks.map(task => (
                    <TableHead key={task.id} className="text-center min-w-[100px] text-xs leading-tight">
                      {task.task_name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colCount} className="text-center py-10 text-muted-foreground">טוען...</TableCell>
                  </TableRow>
                ) : !students.length ? (
                  <TableRow>
                    <TableCell colSpan={colCount} className="text-center py-10 text-muted-foreground">
                      אין נתוני השלמת משימות. יש לייבא דוח Activity Completion מ-Moodle.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium text-right sticky right-0 bg-background z-10 border-l">
                        {student.name}
                      </TableCell>
                      {data?.tasks.map(task => {
                        const c = data.rows.find(r => r.student_id === student.id && r.task_id === task.id);
                        return (
                          <TableCell key={task.id} className="text-center py-2">
                            <CompletionCell
                              isComplete={c?.is_complete ?? null}
                              completedAt={c?.completed_at ?? null}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> הושלם</span>
          <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-500" /> לא הושלם (יש נתון)</span>
          <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5 text-slate-300" /> אין נתון (חסר מקור)</span>
        </div>
      </div>
    </SafePage>
  );
}
