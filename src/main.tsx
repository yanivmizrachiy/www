import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

const pathname = window.location.pathname;
const guideMarker = "/guide";
const guideIndex = pathname.indexOf(guideMarker);
const isGuideRoute =
  guideIndex >= 0 &&
  (guideIndex + guideMarker.length === pathname.length || pathname[guideIndex + guideMarker.length] === "/");

async function bootstrap() {
  if (isGuideRoute) {
    // The Guide is a standalone presentation surface. Do not load Teacher Hub,
    // Supabase, LTI/session hooks or premium Hub CSS on the Guide entry path.
    // The marker-based check also supports static hosts with a repository base
    // path, for example /www/guide/ on GitHub Pages.
    const { default: Guide } = await import("./pages/Guide.tsx");
    root.render(<Guide />);
    return;
  }

  await import("./yaniv-premium-ui.css");
  const { default: App } = await import("./App.tsx");
  root.render(<App />);
}

void bootstrap();
