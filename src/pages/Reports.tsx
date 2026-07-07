import { Link } from "react-router-dom";
import { SafePage } from "@/components/SafePage";
import { Button } from "@/components/ui/button";
export default function Reports() { return <SafePage title="דוחות" description="דוחות רק על בסיס נתונים שיובאו או אומתו."><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/reports/students">דוח תלמידים</Link></Button><Button asChild variant="outline"><Link to="/reports/tasks">דוח משימות</Link></Button><Button asChild variant="outline"><Link to="/reports/days">דוח ימים</Link></Button><Button asChild variant="outline"><Link to="/reports/gap">פערים</Link></Button></div></SafePage>; }
