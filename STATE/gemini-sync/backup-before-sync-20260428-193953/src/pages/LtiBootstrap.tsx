import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setLtiToken } from "@/hooks/useLtiSession";
import { SafePage } from "@/components/SafePage";

export default function LtiBootstrap() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const token = params.get("t") || new URLSearchParams(window.location.hash.split("?")[1] || "").get("t");
    if (token) { setLtiToken(token); navigate("/", { replace:true }); }
  }, [params, navigate]);
  return <SafePage title="כניסה מ־Moodle" description="אם התקבל token חוקי, הסשן יישמר ותועבר למרכז המורה." />;
}
