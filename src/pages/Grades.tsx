import { useMemo, useState } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useGradesMatrix } from "@/hooks/useImports";
import { TruthBadge } from "@/components/TruthBadge";
import { EmptyDomain } from "@/components/EmptyDomain";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SkeletonTableRows } from "@/components/Skeleton";
import { Link } from "react-router-dom";
import { REPORT_STATUS_LABEL } from "@/lib/reportStatus";

// MTH_GRADES_REALITY_V1
// Grades matrix built only from imported Gradebook source data. We never infer a
// grade from absence: a missing grade is not zero. Averages are computed solely
// from grades that actually exist (is_missing === false and a numeric value is
// present). Cells with no source value show "חסר ציון"; cells with no grade row
// at all show "אין נתון". The grades source carries no date dimension, so there
// is no date-range filter — adding one would imply a source we do not have.

function avgOf(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function Page() {
  const { data, loading, error } = useGradesMatrix();
  const [studentFilter, setStudentFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");

  const items = useMemo(() => {
    const all = data?.items ?? [];
    const q = itemFilter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(it => it.item_name.toLowerCase().includes(q));
  }, [data, itemFilter]);

  const students = useMemo(() => {
    const all = data?.students ?? [];
    const q = studentFilter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(s => s.full_name.toLowerCase().includes(q));
  }, [data, studentFilter]);

  // Numeric grade lookup keyed by student+item. Only real, non-missing numeric
  // grades are kept, so every average below is computed from existing grades only.
  const numericByStudentItem = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of data?.grades ?? []) {
      if (!g.is_missing && g.numeric_value !== null && g.numeric_value !== undefined) {
        m.set(g.student_id + "|" + g.grade_item_id, g.numeric_value);
      }
    }
    return m;
  }, [data]);

  const studentAvg = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const s of students) {
      const vals: number[] = [];
      for (const it of items) {
        const v = numericByStudentItem.get(s.id + "|" + it.id);
        if (v !== undefined) vals.push(v);
      }
      m.set(s.id, avgOf(vals));
    }
    return m;
  }, [students, items, numericByStudentItem]);

  const itemAvg = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const it of items) {
      const vals: number[] = [];
      for (const s of students) {
        const v = numericByStudentItem.get(s.id + "|" + it.id);
        if (v !== undefined) vals.push(v);
      }
      m.set(it.id, avgOf(vals));
    }
    return m;
  }, [students, items, numericByStudentItem]);

  if (!loading && !data?.students.length && !error) {
    return (
      <SafePage title="ציונים" description="מטריצת ציונים מדוח Moodle." backTo="/" backLabel="חזרה למרכז המורה">
        <EmptyDomain
          domain="grades"
          title="אין נתוני ציונים"
          description="ייצא Gradebook ממודל והעלה לכאן."
        />
      </SafePage>
    );
  }

  const colCount = items.length + 2; // student + items + avg

  return (
    <SafePage
      title="ציונים"
      description="מטריצת ציונים מדוח Moodle. ממוצע מחושב מציונים קיימים בלבד — חסר ציון אינו אפס."
    >
      <div className="space-y-4" dir="rtl">
        {data?.students.length ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">סינון לפי תלמיד</label>
              <Input
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                placeholder="שם תלמיד"
                className="h-9 w-56"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">סינון לפי פריט ציון</label>
              <Input
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
                placeholder="שם משימה / פריט"
                className="h-9 w-56"
              />
            </div>
            <span className="text-xs text-muted-foreground pb-2">
              {students.length} תלמידים · {items.length} פריטי ציון
            </span>
          </div>
        ) : null}

        <Card className="shadow-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <Table dir="rtl">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right sticky right-0 bg-muted/50 z-10 w-[180px]">תלמיד</TableHead>
                  <TableHead className="text-center min-w-[80px] font-bold">ממוצע</TableHead>
                  {items.map(item => (
                    <TableHead key={item.id} className="text-center min-w-[100px] text-[10px] leading-tight">
                      <div className="line-clamp-2">{item.item_name}</div>
                      <div className="text-muted-foreground font-normal">מקסימום: {item.max_grade ?? "—"}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <SkeletonTableRows columns={colCount} />
                ) : error ? (
                  <TableRow><TableCell colSpan={colCount} className="text-center py-10"><EmptyTruth>{error}</EmptyTruth></TableCell></TableRow>
                ) : !students.length ? (
                  <TableRow><TableCell colSpan={colCount} className="text-center py-10 text-muted-foreground">אין תלמידים התואמים לסינון.</TableCell></TableRow>
                ) : (
                  students.map((student) => {
                    const avg = studentAvg.get(student.id) ?? null;
                    return (
                      <TableRow key={student.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-right sticky right-0 bg-background z-10">
                          <Link to={`/students/${student.id}`} className="hover:underline text-primary">
                            {student.full_name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center font-bold font-mono text-sm">
                          {avg !== null ? (
                            Math.round(avg)
                          ) : (
                            <span className="text-[10px] font-normal text-muted-foreground/60">{REPORT_STATUS_LABEL.no_data}</span>
                          )}
                        </TableCell>
                        {items.map(item => {
                          const grade = data?.grades.find(g => g.student_id === student.id && g.grade_item_id === item.id);
                          return (
                            <TableCell key={item.id} className="text-center font-mono text-sm">
                              {grade === undefined ? (
                                <span className="text-[10px] text-muted-foreground/60">{REPORT_STATUS_LABEL.no_data}</span>
                              ) : grade.is_missing ? (
                                <span className="text-[10px] text-status-pending">{REPORT_STATUS_LABEL.missing_grade}</span>
                              ) : grade.numeric_value !== null && grade.numeric_value !== undefined ? (
                                <span className={grade.numeric_value === 100 ? "text-status-proven font-bold" : ""}>
                                  {grade.numeric_value}
                                </span>
                              ) : grade.raw_value ? (
                                grade.raw_value
                              ) : (
                                <span className="text-[10px] text-muted-foreground/60">{REPORT_STATUS_LABEL.unknown}</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              {!loading && !error && students.length ? (
                <tfoot className="bg-muted/40 font-medium">
                  <TableRow>
                    <TableCell className="text-right sticky right-0 bg-muted/40 z-10 text-xs">ממוצע פריט</TableCell>
                    <TableCell className="text-center text-[10px] text-muted-foreground/60">—</TableCell>
                    {items.map(item => {
                      const a = itemAvg.get(item.id) ?? null;
                      return (
                        <TableCell key={item.id} className="text-center font-mono text-sm">
                          {a !== null ? (
                            Math.round(a)
                          ) : (
                            <span className="text-[10px] font-normal text-muted-foreground/60">{REPORT_STATUS_LABEL.no_data}</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </tfoot>
              ) : null}
            </Table>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            ממוצע מחושב מציונים קיימים בלבד. <span className="font-bold">{REPORT_STATUS_LABEL.missing_grade}</span> — פריט ללא ערך (לא אפס) ·{" "}
            <span className="font-bold">{REPORT_STATUS_LABEL.no_data}</span> — אין שורת ציון מיובאת. למקור הציונים אין ממד תאריך, לכן אין סינון טווח תאריכים.
          </p>
          <TruthBadge status={students.length ? "proven" : "missing"} />
        </div>
      </div>
    </SafePage>
  );
}
