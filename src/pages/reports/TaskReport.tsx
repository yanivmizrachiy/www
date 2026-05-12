import { SafePage } from "@/components/SafePage";
import { useTaskCompletionDetail } from "@/hooks/useImports";
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

export default function TaskReport() {
  const { data, loading } = useTaskCompletionDetail();

  const students = Array.from(new Set(data?.rows.map(r => r.student_id))).map(id => {
    const row = data?.rows.find(r => r.student_id === id);
    return { id, name: row?.student_name ?? "—" };
  });

  return (
    <SafePage 
      title="דוח משימות" 
      description="מעקב השלמת משימות בחתך תלמיד מנתוני Moodle אמיתיים."
    >
      <Card className="shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right sticky right-0 bg-muted/50 z-10 w-[200px]">תלמיד</TableHead>
                {data?.tasks.map(task => (
                  <TableHead key={task.id} className="text-center min-w-[120px] text-xs">
                    {task.task_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={(data?.tasks.length ?? 0) + 1} className="text-center py-8">טוען...</TableCell></TableRow>
              ) : !students.length ? (
                <TableRow><TableCell colSpan={(data?.tasks.length ?? 0) + 1} className="text-center py-8 text-muted-foreground">אין נתונים להצגה</TableCell></TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-right sticky right-0 bg-background z-10">{student.name}</TableCell>
                    {data?.tasks.map(task => {
                      const completion = data.rows.find(r => r.student_id === student.id && r.task_id === task.id);
                      return (
                        <TableCell key={task.id} className="text-center">
                          {completion?.is_complete ? (
                            <span className="text-status-proven">✅</span>
                          ) : completion?.is_complete === false ? (
                            <span className="text-status-blocked">❌</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
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
      <div className="mt-4 flex justify-end">
        <TruthBadge status="proven" />
      </div>
    </SafePage>
  );
}

