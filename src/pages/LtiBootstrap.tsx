import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setLtiToken } from "@/hooks/useLtiSession";
import { SafePage } from "@/components/SafePage";
import { LaunchDiagnostics } from "@/components/LaunchDiagnostics";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function LtiBootstrap() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "missing" | "success">("pending");

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
    const token = params.get("t") || hashParams.get("t");
    const nextPath = params.get("next") || hashParams.get("next") || "/import";
    const safeNextPath = nextPath.startsWith("/") && !nextPath.startsWith("/api/") ? nextPath : "/import";

    if (token) { 
      setLtiToken(token); 
      setStatus("success");
      setTimeout(() => navigate(safeNextPath, { replace:true }), 250); 
    } else {
      setStatus("missing");
    }
  }, [params, navigate]);

  return (
    <SafePage 
      title="כניסה מתוך Moodle" 
      description="מערכת LTI מאמתת את הזהות שלך מול השרתים של משרד החינוך."
    >
      <div className="mx-auto max-w-lg space-y-8">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          {status === "pending" && (
            <>
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <h2 className="text-xl font-bold">מאמת סשן...</h2>
              <p className="text-sm text-muted-foreground">מפענח את ה-token שהתקבל ממודל</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <ShieldCheck className="mb-4 h-10 w-10 text-status-proven" />
              <h2 className="text-xl font-bold text-status-proven">הכניסה הצליחה!</h2>
              <p className="text-sm text-muted-foreground">מעביר אותך לייבוא הנתונים...</p>
            </>
          )}

          {status === "missing" && (
            <>
              <AlertCircle className="mb-4 h-10 w-10 text-status-blocked" />
              <h2 className="text-xl font-bold text-status-blocked">לא נמצא Token</h2>
              <p className="text-sm text-muted-foreground">פנל זה נועד לשימוש מתוך Moodle בלבד כ-External Tool.</p>
            </>
          )}
        </div>

        {status === "missing" && (
          <div className="border-t pt-8">
            <LaunchDiagnostics />
          </div>
        )}
      </div>
    </SafePage>
  );
}

