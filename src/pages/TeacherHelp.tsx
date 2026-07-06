import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, FileText, Video, MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function TeacherHelp() {
  const steps = [
    {
      title: "איך מוציאים דוח ציונים ממודל?",
      content: "כנס לקורס -> ציונים -> ייצוא -> בחר 'קובץ Excel' -> הורד. את הקובץ הזה העלה ב'ייבוא נתונים'."
    },
    {
      title: "איך מוציאים דוח לוגים?",
      content: "כנס לניהול הקורס -> דוחות -> יומני פעילות (Logs) -> בחר את כל המשתתפים ואת כל הימים -> הורד כ-CSV או Excel."
    },
    {
      title: "מה זה דוח השלמת פעילות?",
      content: "דוח המראה אילו תלמידים סיימו אילו משימות. נמצא תחת ניהול קורס -> דוחות -> השלמת פעילות."
    },
    {
      title: "למה אני לא רואה נתוני זמן תרגול?",
      content: "זמן תרגול מחושב מתוך דוח הלוגים. אם לא העלית דוח לוגים, המערכת לא יודעת מתי התלמידים נכנסו ויצאו."
    }
  ];

  return (
    <div className="p-8 space-y-8" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">מרכז עזרה למורה</h1>
          <p className="text-muted-foreground">מדריכים מהירים להוצאת נתונים ממודל ושימוש במערכת.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {steps.map((step, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-right font-bold text-lg">{step.title}</AccordionTrigger>
              <AccordionContent className="text-right text-muted-foreground leading-relaxed">
                {step.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="grid gap-6 md:grid-cols-3 pt-8 border-top">
         <Card className="text-center p-6 space-y-2">
            <FileText className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-bold">מדריך PDF</h3>
            <p className="text-xs text-muted-foreground">הורד את המדריך המלא למורה</p>
         </Card>
         <Card className="text-center p-6 space-y-2">
            <Video className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-bold">סרטוני הדרכה</h3>
            <p className="text-xs text-muted-foreground">צפה בקיצור איך להפעיל את הכלי</p>
         </Card>
         <Card className="text-center p-6 space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-bold">תמיכה</h3>
            <p className="text-xs text-muted-foreground">צרו קשר עם מנהל המערכת</p>
         </Card>
      </div>
    </div>
  );
}
