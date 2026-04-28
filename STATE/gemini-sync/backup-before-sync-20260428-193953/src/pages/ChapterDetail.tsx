import { useParams } from "react-router-dom";
import { SafePage } from "@/components/SafePage";
export default function ChapterDetail() { const { sectionId } = useParams(); return <SafePage title="פרק" description={`תצוגת פרק ${sectionId ?? "—"}. הנתונים יוצגו רק ממקור Moodle אמיתי.`} />; }
