import { SafePage } from "@/components/SafePage";
import { useLtiSession } from "@/hooks/useLtiSession";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Shield } from "lucide-react";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm text-muted-foreground w-24">{label}</span>
      <span className="text-sm font-semibold">{value ?? <span className="text-muted-foreground/50">—</span>}</span>
    </div>
  );
}

export default function TeacherProfile() {
  const { session } = useLtiSession();
  const s = session as any;
  const name = s?.teacher_name ?? s?.name ?? null;
  const username = s?.username ?? null;
  const role = s?.role ?? null;
  const course = s?.course_name ?? s?.context_title ?? null;
  return (
    <SafePage title="פרטי מורה" description="פרטים שהתקבלו מ-Moodle דרך LTI." backTo="/" backLabel="חזרה">
      <div className="max-w-lg">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {name ? name[0] : "?"}
              </div>
              <div>
                <div className="text-xl font-black text-primary">{name ?? <span className="text-sm text-muted-foreground">שם לא התקבל מ-LTI</span>}</div>
                {username && <div className="text-sm text-muted-foreground">{username}</div>}
              </div>
            </div>
            <div className="grid gap-2 pt-2 border-t">
              <Row icon={<Shield className="h-4 w-4"/>} label="תפקיד" value={role} />
              <Row icon={<BookOpen className="h-4 w-4"/>} label="מרחב לימוד" value={course} />
            </div>
            {!name && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                פרטי מורה יופיעו לאחר פתיחה מתוך Moodle דרך LTI.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SafePage>
  );
}
