import { AlertCircle, Import } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyDomainProps {
  domain: "students" | "grades" | "completion" | "logs";
  title: string;
  description: string;
}

export function EmptyDomain({ domain, title }: EmptyDomainProps) {
  const instructions = {
    students: "ייצא רשימת משתתפים ממודל (XLSX/CSV) והעלה אותה כאן.",
    grades: "עבור לגיליון הציונים ב-Moodle, בחר 'ייצוא' כגיליון Excel והעלה.",
    completion: "עבור ל'ניהול קורס' -> 'דוחות' -> 'השלמת פעילות', והורד כקובץ.",
    logs: "עבור ל'ניהול קורס' -> 'דוחות' -> 'יומני מעקב', בחר את כל הימים והורד.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto space-y-5" dir="rtl">
      <div className="rounded-full bg-status-blocked-bg p-5 text-status-blocked ring-8 ring-status-blocked-bg/30">
        <AlertCircle className="h-9 w-9" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{instructions[domain]}</p>
      </div>

      <Button asChild className="w-full shadow-lg h-12">
        <Link to="/smart-import" className="flex items-center gap-2">
          <Import className="h-4 w-4" />
          ייבוא נתונים
        </Link>
      </Button>
    </div>
  );
}
