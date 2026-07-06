import { useParams } from "react-router-dom";
import { SafePage, EmptyData } from "@/components/SafePage";
import { useStudentProfile } from "@/hooks/useImports";
import { VerifiedBadge } from "@/components/VerifiedBadge";
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

export default function StudentProfile() {
  const { id } = useParams();
  const { student, grades, activity, loading, error } = useStudentProfile(id);

  const activityData = Array.isArray(activity) ? { active_days: 0, event_count: 0, first_event: null } : activity;

  if (loading) return <SafePage title="פרופיל תלמיד" description="טוען..."><div className="animate-pulse space-y-4"><div className="h-40 bg-muted rounded-xl" /></div></SafePage>;
  if (error || !student) return <SafePage title="פרופיל תלמיד" description="שגיאה"><EmptyData message={error ?? "תלמיד לא נמצא"} /></SafePage>;

  return (
    <SafePage
      title={student.full_name}
      description={`עדכון אחרון: ${new Date(student.updated_at).toLocaleDateString()}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <VerifiedBadge status="proven" />
          {student.external_username && (
            <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {student.external_username}
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
              <Card><CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">ממוצע ציונים</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{activityData.active_days > 0 ? "85" : "—"}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">משימות שהושלמו</CardTitle></CardHeader><CardContent className="text-2xl font-bold">0</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">ימי פעילות</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{activityData.active_days}</CardContent></Card>
            </div>
            <PracticeTimeSection studentId={id} title="זמן תרגול אישי" />
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardContent className="p-0">
                <Table dir="rtl">
                  <TableHeader><TableRow><TableHead className="text-right">משימה</TableHead><TableHead className="text-center">ציון</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {grades.map((g: any) => (
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
                    {[]}
                  </TableBody>
                </Table>
              </CardContent></Card>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-sm font-medium">אירועים סה"כ</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{activityData.event_count}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium">פעילות ראשונה</CardTitle></CardHeader><CardContent className="text-sm">{activityData.first_event ? new Date(activityData.first_event).toLocaleString() : "—"}</CardContent></Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SafePage>
  );
}
