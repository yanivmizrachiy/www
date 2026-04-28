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
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Page() {
  const { data, loading, error } = useGradesMatrix();

  if (!loading && !data?.students.length && !error) {
    return (
      <SafePage title="ציונים" description="מטריצת ציונים מדוח Moodle אמיתי.">
        <EmptyDomain 
          domain="grades" 
          title="אין נתוני ציונים" 
          description="כדי לראות את מטריצת הציונים, עליך לייצא את ה-Gradebook ממודל ולהעלות אותו כאן."
        />
      </SafePage>
    );
  }

  return (
    <SafePage 
      title="ציונים" 
      description="מטריצת ציונים מדוח Moodle אמיתי. אין השלמות ואין ציונים מומצאים."
    >
      <div className="space-y-6">
        <Card className="shadow-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <Table dir="rtl">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right sticky right-0 bg-muted/50 z-10 w-[180px]">תלמיד</TableHead>
                  {data?.items.map(item => (
                    <TableHead key={item.id} className="text-center min-w-[100px] text-[10px] leading-tight">
                      <div className="line-clamp-2">{item.item_name}</div>
                      <div className="text-muted-foreground font-normal">מקסימום: {item.max_grade ?? "—"}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={(data?.items.length ?? 0) + 1} className="text-center py-10">טוען נתונים...</TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={(data?.items.length ?? 0) + 1} className="text-center py-10"><EmptyTruth>{error}</EmptyTruth></TableCell></TableRow>
                ) : !data?.students.length ? (
                  <TableRow><TableCell colSpan={(data?.items.length ?? 0) + 1} className="text-center py-10 text-muted-foreground">אין נתוני ציונים. ייבא דוח Gradebook.</TableCell></TableRow>
                ) : (
                  data.students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-right sticky right-0 bg-background z-10">
                        <Link to={`/students/${student.id}`} className="hover:underline text-primary">
                          {student.full_name}
                        </Link>
                      </TableCell>
                      {data.items.map(item => {
                        const grade = data.grades.find(g => g.student_id === student.id && g.grade_item_id === item.id);
                        return (
                          <TableCell key={item.id} className="text-center font-mono text-sm">
                            {grade?.is_missing ? (
                              <span className="text-muted-foreground/30">—</span>
                            ) : grade?.numeric_value !== null ? (
                              <span className={grade.numeric_value === 100 ? "text-status-proven font-bold" : ""}>
                                {grade.numeric_value}
                              </span>
                            ) : (
                              grade?.raw_value ?? <span className="text-muted-foreground/30">—</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        <div className="flex justify-end">
          <TruthBadge status="proven" />
        </div>
      </div>
    </SafePage>
  );
}

