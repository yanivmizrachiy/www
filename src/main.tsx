import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

const root = createRoot(rootElement);
const isGuideRoute = window.location.pathname === "/guide" || window.location.pathname.startsWith("/guide/");

async function bootstrap() {
  if (isGuideRoute) {
    // The Guide is a standalone presentation surface. Do not load Teacher Hub,
    // Supabase, LTI/session hooks or premium Hub CSS on the Guide entry path.
    const { default: Guide } = await import("./pages/Guide.tsx");
    root.render(<Guide />);
    return;
  }

  await import("./yaniv-premium-ui.css");
  const { default: App } = await import("./App.tsx");
  root.render(<App />);
}

void bootstrap();
