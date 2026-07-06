import { SafePage } from "@/components/SafePage";
import { useDailyActivity } from "@/hooks/useImports";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export default function DayReport() {
  const { data, loading } = useDailyActivity();

  return (
    <SafePage 
      title="דוח ימים" 
      description="פעילות יומית וספירת תלמידים פעילים."
    >
      <div className="space-y-6">
        <Card className="shadow-elegant overflow-hidden">
          <CardContent className="p-0">
            <Table dir="rtl">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-center">אירועים</TableHead>
                  <TableHead className="text-center">תלמידים פעילים</TableHead>
                  <TableHead className="text-right">פעילות יחסית</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">טוען...</TableCell></TableRow>
                ) : !data?.length ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">אין נתוני לוגים לפעילות יומית</TableCell></TableRow>
                ) : (
                  data.map((row) => {
                    const maxEvents = Math.max(...data.map(d => d.events), 1);
                    const width = (row.events / maxEvents) * 100;
                    return (
                      <TableRow key={row.day} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{new Date(row.day).toLocaleDateString("he-IL")}</TableCell>
                        <TableCell className="text-center font-bold text-primary">{row.events}</TableCell>
                        <TableCell className="text-center">{row.active_students}</TableCell>
                        <TableCell className="text-right w-[200px]">
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${width}%` }} 
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <VerifiedBadge status="calculated" />
        </div>
      </div>
    </SafePage>
  );
}

