import { SafePage } from "@/components/SafePage";
import { useStudentReports } from "@/hooks/useImports";
import { TruthBadge } from "@/components/TruthBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { formatTeacherDateDmyShort } from "@/lib/teacherDateFormat";
import { REPORT_STATUS_LABEL, REPORT_STATUS_LEGEND } from "@/lib/reportStatus";

// MTH_STUDENT_REPORT_REALITY_V1
// Per-student summary built only from imported source data. We never infer a
// status from the absence of another: a missing grade is not zero, no logs is
// not "did not work", and an unknown task state is not "did not do".

export default function StudentReport() {
  const { data, loading } = useStudentReports();
  const hasRows = !!data?.length;

  return (
    <SafePage
      title="דוח תלמידים"
      description="סקירת ביצועים ופעילות בחתך תלמיד — נתונים אמיתיים בלבד, חוסר נתון נשאר חוסר."
    >
      <Card className="shadow-elegant">
        <CardContent className="p-0">
          <Table dir="rtl">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right">תלמיד</TableHead>
                <TableHead className="text-center">ממוצע</TableHead>
                <TableHead className="text-center">משימות</TableHead>
                <TableHead className="text-center">פעילות (לוגים)</TableHead>
                <TableHead className="text-right">עדכון אחרון</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">טוען נתונים...</TableCell></TableRow>
              ) : !hasRows ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">אין נתונים להצגה</TableCell></TableRow>
              ) : (
                data!.map((row) => {
                  const hasTaskData = row.tasks_complete + row.tasks_incomplete + row.tasks_unknown > 0;
                  return (
                    <TableRow key={row.student_id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-right">
                        <Link to={`/students/${row.student_id}`} className="hover:underline text-primary">
                          {row.full_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {row.avg_grade !== null ? (
                          Math.round(row.avg_grade)
                        ) : (
                          <span className="text-[10px] font-normal text-muted-foreground/60">
                            {row.graded_items > 0 ? REPORT_STATUS_LABEL.missing_grade : REPORT_STATUS_LABEL.no_data}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {!hasTaskData ? (
                          <span className="text-[10px] text-muted-foreground/60">{REPORT_STATUS_LABEL.no_data}</span>
                        ) : (
                          <div className="flex flex-col text-[10px] items-center">
                            <span className="text-status-proven font-bold">{row.tasks_complete} בוצעו</span>
                            {row.tasks_incomplete > 0 && (
                              <span className="text-status-blocked">{row.tasks_incomplete} {REPORT_STATUS_LABEL.not_done}</span>
                            )}
                            {row.tasks_unknown > 0 && (
                              <span className="text-muted-foreground/60">{row.tasks_unknown} {REPORT_STATUS_LABEL.no_data}</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.event_count > 0 ? (
                          <div className="flex flex-col text-[10px] items-center">
                            <span className="font-bold">{row.event_count} אירועים</span>
                            <span className="text-muted-foreground">{row.active_days} ימים</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60">{REPORT_STATUS_LABEL.no_data}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {row.last_event ? formatTeacherDateDmyShort(row.last_event) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3" dir="rtl">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {REPORT_STATUS_LEGEND.map((s) => (
            <span key={s.key}>
              <span className="font-bold">{s.label}</span> — {s.desc}
            </span>
          ))}
        </div>
        <TruthBadge status={hasRows ? "proven" : "missing"} />
      </div>
    </SafePage>
  );
}
