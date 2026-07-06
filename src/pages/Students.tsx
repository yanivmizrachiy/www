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
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Page() {
  const { data, loading, error } = useGradesMatrix();

  if (!loading && !data?.students?.length && !error) {
    return (
      <SafePage title="תלמידים" titleColor="text-blue-500" description="רשימת תלמידים מיובאת מדוח Moodle אמיתי.">
        <EmptyDomain
          domain="students"
          title="אין נתוני תלמידים"
          description="כדי לראות את רשימת התלמידים, עליך לייצא את דוח המשתמשים ממודל ולהעלות אותו כאן."
        />
      </SafePage>
    );
  }

  return (
    <SafePage
      title="תלמידים"
      description="רשימת תלמידים מיובאת מדוח Moodle אמיתי."
    >
      <div className="space-y-6">
        <Card className="shadow-elegant overflow-hidden">
          <CardContent className="p-6">
            {loading ? (
              <p className="text-center py-10 text-muted-foreground">טוען נתונים...</p>
            ) : error ? (
              <p className="text-center py-10 text-destructive">{error}</p>
            ) : !data?.students?.length ? (
              <p className="text-center py-10 text-muted-foreground">אין נתוני תלמידים. ייבא דוח משתמשים.</p>
            ) : (
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם מלא</TableHead>
                    <TableHead className="text-right">שם משתמש</TableHead>
                    <TableHead className="text-right">אימייל</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.students.map((student: any) => (
                    <TableRow key={student.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-right">
                        <Link to={`/students/${student.id}`} className="hover:underline text-primary">
                          {student.full_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.external_username ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.email ?? '—'}
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
