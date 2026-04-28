import { AlertCircle, HelpCircle, Import } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyDomainProps {
  domain: "students" | "grades" | "completion" | "logs";
  title: string;
  description: string;
}

export function EmptyDomain({ domain, title, description }: EmptyDomainProps) {
  const instructions = {
    students: "ייצא רשימת משתתפים ממודל (XLSX/CSV) והעלה אותה כאן.",
    grades: "עבור ל-Gradebook ב-Moodle, בחר 'ייצוא' כגיליון Excel והעלה.",
    completion: "עבור ל'ניהול קורס' -> 'דוחות' -> 'השלמת פעילות', והורד כקובץ.",
    logs: "עבור ל'ניהול קורס' -> 'דוחות' -> 'יומני מעקב', בחר את כל הימים והורד.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto space-y-6" dir="rtl">
      <div className="rounded-full bg-status-blocked-bg p-6 text-status-blocked ring-8 ring-status-blocked-bg/30">
        <AlertCircle className="h-10 w-10" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="bg-muted/30 border-none">
        <CardContent className="p-4 flex gap-3 text-right">
          <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">איך להשיג את הנתונים?</span>
            <p className="text-muted-foreground leading-relaxed">{instructions[domain]}</p>
          </div>
        </CardContent>
      </Card>

      <Button asChild className="w-full shadow-lg h-12">
        <Link to="/import" className="flex items-center gap-2">
          <Import className="h-4 w-4" />
          עבור לממשק הייבוא
        </Link>
      </Button>
    </div>
  );
}
