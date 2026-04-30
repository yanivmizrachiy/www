import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // API Route: LTI Launch
  app.post("/api/lti/launch", async (req, res) => {
    try {
      console.log("--- New LTI Launch Received ---");
      const params = req.body;
      const consumerKey = params.oauth_consumer_key;
      const sharedSecret = process.env.LTI_SHARED_SECRET || "teacher_hub_secret_2026";

      // Session generation
      const session_token = crypto.randomUUID();
      
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Log the session to Supabase
        await supabase.from("teacher_sessions").insert({
          session_token,
          course_id: params.context_id || "unknown",
          course_title: params.context_title || "מרחב למידה",
          moodle_username: params.ext_user_username || params.lis_person_name_full || "מורה",
          role: params.roles?.includes("Instructor") ? "teacher" : "student"
        });
      }

      // Final Redirect to Frontend
      const redirectUrl = `/lti-bootstrap?t=${session_token}&course=${encodeURIComponent(params.context_title || '')}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("LTI Launch Error:", error);
      res.status(500).send("שגיאת שרת פנימית בחיבור למודל");
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
