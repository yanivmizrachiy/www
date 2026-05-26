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

export default function StudentReport() {
  const { data, loading } = useStudentReports();

  return (
    <SafePage 
      title="דוח תלמידים" 
      description="סקירת ביצועים ופעילות בחתך תלמיד."
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
              ) : !data?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">אין נתונים להצגה</TableCell></TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.student_id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-right">
                      <Link to={`/students/${row.student_id}`} className="hover:underline text-primary">
                        {row.full_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {row.avg_grade !== null ? Math.round(row.avg_grade) : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col text-[10px] items-center">
                        <span className="text-status-proven font-bold">{row.tasks_complete} בוצעו</span>
                        <span className="text-muted-foreground">{row.tasks_incomplete} חסרות</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col text-[10px] items-center">
                        <span className="font-bold">{row.event_count} אירועים</span>
                        <span className="text-muted-foreground">{row.active_days} ימים</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {row.last_event ? new Date(row.last_event).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <TruthBadge status="proven" />
      </div>
    </SafePage>
  );
}

