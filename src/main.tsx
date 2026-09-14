import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

const root = createRoot(rootElement);

async function bootstrap() {
  await import("./yaniv-premium-ui.css");
  const { default: App } = await import("./App.tsx");
  root.render(<App />);
}

void bootstrap();
