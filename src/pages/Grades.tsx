import { SafePage, EmptyData } from "@/components/SafePage";
import { useGradesMatrix } from "@/hooks/useImports";
import { VerifiedBadge } from "@/components/VerifiedBadge";
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
      <SafePage title="ציונים" titleColor="text-blue-500" description="מטריצת ציונים מתוך נתוני Moodle.">
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
      description="מטריצת ציונים מתוך נתוני Moodle."
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
                  <TableRow><TableCell colSpan={(data?.items.length ?? 0) + 1} className="text-center py-10"><EmptyData>{error}</EmptyData></TableCell></TableRow>
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
                        const val = grade?.grade_value;
                        const isNum = !isNaN(parseFloat(val));
                        const score = isNum ? parseFloat(val) : null;
                        
                        // Sophisticated Heatmap Color
                        let colorClass = "text-muted-foreground/30";
                        if (score !== null) {
                          if (score >= 90) colorClass = "text-green-600 font-bold";
                          else if (score >= 70) colorClass = "text-blue-600";
                          else if (score >= 55) colorClass = "text-amber-600";
                          else if (score < 55) colorClass = "text-red-600 font-bold";
                        }

                        return (
                          <TableCell key={item.id} className="text-center font-mono text-sm">
                            {score !== null ? (
                              <span className={colorClass}>
                                {score}
                              </span>
                            ) : (
                              grade?.raw_grade ?? <span className="text-muted-foreground/30">—</span>
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
          <VerifiedBadge status="proven" />
        </div>
      </div>
    </SafePage>
  );
}

