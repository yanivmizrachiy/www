// useKeepAlive — pings server every 4 minutes to prevent Render cold start
import { useEffect } from "react";

export function useKeepAlive() {
  useEffect(() => {
    const ping = () => fetch("/ping", { method: "GET" }).catch(() => {});
    ping(); // ping מיד בטעינה
    const interval = setInterval(ping, 4 * 60 * 1000); // כל 4 דקות
    return () => clearInterval(interval);
  }, []);
}
