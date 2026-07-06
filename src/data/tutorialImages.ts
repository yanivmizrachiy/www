/**
 * ניהול תמונות הדרכה מ-Moodle אמיתי
 * כל תמונה מגיעה ממרחב Moodle שלך ומאושרת לשימוש
 */

export interface TutorialImage {
  id: string;
  step: number;
  title: string;
  description: string;
  fileName: string; // שם הקובץ ב-public/tutorial-images/
  placeholder?: string;
  alt: string;
}

export const tutorialSteps = [
  {
    id: "moodle-login",
    step: 1,
    title: "כניסה ל-Moodle",
    description: "התחבר למרחב ה-Moodle שלך באמצעות שם משתמש וסיסמה",
    fileName: "01-moodle-login.png",
    alt: "מסך כניסה ל-Moodle",
  },
  {
    id: "course-home",
    step: 2,
    title: "מסך הקורס",
    description: "היכנס לקורס הרלוונטי והכר את מסך הבית",
    fileName: "02-course-home.png",
    alt: "מסך בית הקורס ב-Moodle",
  },
  {
    id: "view-tasks",
    step: 3,
    title: "צפייה במשימות",
    description: "נווט למשימות הקורס וצפה ברשימת הפעילויות",
    fileName: "03-view-tasks.png",
    alt: "רשימת משימות בקורס",
  },
  {
    id: "upload-file",
    step: 4,
    title: "העלאת קובץ",
    description: "למד כיצד להעלות קבצים למשימות",
    fileName: "04-upload-file.png",
    alt: "העלאת קובץ למשימה",
  },
  {
    id: "check-grades",
    step: 5,
    title: "בדיקת ציונים",
    description: "גש ל-Gradebook וצפה בציונים שלך",
    fileName: "05-check-grades.png",
    alt: "גיליון ציונים ב-Moodle",
  },
  {
    id: "view-feedback",
    step: 6,
    title: "צפייה במשוב",
    description: "קרא את הערות המורה והמשוב על העבודה",
    fileName: "06-view-feedback.png",
    alt: "משוב מהמורה",
  },
  {
    id: "messages",
    step: 7,
    title: "הודעות ועדכונים",
    description: "עקוב אחר הודעות והתראות מהמורה ומהמערכת",
    fileName: "07-messages.png",
    alt: "הודעות ב-Moodle",
  },
] as const;

export type TutorialStepId = typeof tutorialSteps[number]["id"];

export function getTutorialImage(stepId: TutorialStepId): TutorialImage | undefined {
  return tutorialSteps.find((s) => s.id === stepId);
}

export function getImagePath(fileName: string): string {
  return `/tutorial-images/${fileName}`;
}

export function getImageUrl(stepId: TutorialStepId): string | null {
  const step = getTutorialImage(stepId);
  if (!step) return null;
  return getImagePath(step.fileName);
}
