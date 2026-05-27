import { useParams } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useStudentProfile } from "@/hooks/useImports";
import { TruthBadge } from "@/components/TruthBadge";
import { PracticeTimeSection } from "@/components/PracticeTimeSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, ClipboardList, GraduationCap, History } from "lucide-react";
import { formatTeacherDateDmyShort, formatTeacherDateTime } from "@/lib/teacherDateFormat";

export default function StudentProfile() {
  const { id } = useParams();
  const { data, loading, error } = useStudentProfile(id);

  if (loading) {
    return (
      <SafePage title="פרופיל תלמיד" description="טוען...">
        <div className="animate-pulse space-y-4"><div className="h-40 bg-muted rounded-xl" /></div>
      </SafePage>
    );
  }

  if (error || !data) {
    return <SafePage title="פרופיל תלמיד" description="מידע התלמיד מתוך Moodle." backTo="/students" backLabel="חזרה לתלמידים"><EmptyTruth>אין עדיין מידע מפורט על תלמיד זה. ייבא דוח ציונים או פעילות כדי לראות פרטים.</EmptyTruth></SafePage>;
  }

  const numericGrades = data.grades
    .filter((grade) => !grade.is_missing && typeof grade.numeric_value === "number")
    .map((grade) => grade.numeric_value as number);

  const averageGrade = numericGrades.length > 0
    ? Math.round(numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length)
    : null;

  return (
    <SafePage
      title={data.student.full_name}
      description={`עדכון אחרון: ${formatTeacherDateDmyShort(data.student.updated_at)}`}
      backTo="/students"
      backLabel="חזרה לתלמידים"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <TruthBadge status="proven" />
          {data.student.external_username && (
            <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {data.student.external_username}
            </span>
          )}
        </div>

        <Tabs dir="rtl" defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="gap-2"><User className="h-4 w-4" />סקירה</TabsTrigger>
            <TabsTrigger value="grades" className="gap-2"><GraduationCap className="h-4 w-4" />ציונים</TabsTrigger>
            <TabsTrigger value="completion" className="gap-2"><ClipboardList className="h-4 w-4" />משימות</TabsTrigger>
            <TabsTrigger value="activity" className="gap-2"><History className="h-4 w-4" />פעילות</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">ממוצע ציונים</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">{averageGrade ?? "—"}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">משימות שהושלמו</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">{data.completion.filter(c => c.is_complete).length}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">ימי פעילות</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">{data.activity.active_days}</CardContent>
              </Card>
            </div>
            <PracticeTimeSection studentId={id} title="זמן תרגול אישי" />
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardContent className="p-0">
                <Table dir="rtl">
                  <TableHeader><TableRow><TableHead className="text-right">משימה</TableHead><TableHead className="text-center">ציון</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.grades.map((g) => (
                      <TableRow key={g.grade_item_id}>
                        <TableCell className="text-right">{g.item_name}</TableCell>
                        <TableCell className="text-center font-bold">{g.is_missing ? "—" : g.numeric_value ?? g.raw_value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion">
            <Card><CardContent className="p-0">
              <Table dir="rtl">
                <TableHeader><TableRow><TableHead className="text-right">משימה</TableHead><TableHead className="text-center">סטטוס</TableHead><TableHead className="text-right">בוצע ב-</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.completion.map((c) => (
                    <TableRow key={c.task_id}>
                      <TableCell className="text-right">{c.task_name}</TableCell>
                      <TableCell className="text-center">{c.is_complete ? "✓" : "—"}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{c.completed_at ? formatTeacherDateTime(c.completed_at) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-sm font-medium">אירועים סה\"כ</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{data.activity.event_count}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium">פעילות ראשונה</CardTitle></CardHeader><CardContent className="text-sm">{data.activity.first_event ? formatTeacherDateTime(data.activity.first_event) : "—"}</CardContent></Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SafePage>
  );
}
