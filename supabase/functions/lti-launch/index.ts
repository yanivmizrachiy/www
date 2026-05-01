// Supabase Edge Function: lti-launch
// Status: BLOCKED BY DESIGN until real OAuth1 HMAC-SHA1 verification is implemented and tested.
//
// This function must not create a Moodle teacher session from unverified request data.
// It returns a truthful 501 response so the UI/repo never claim fake LTI readiness.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function jsonResponse(body: Record<string, unknown>, status = 501) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        status: "method_not_allowed",
        message_he: "נקודת LTI מקבלת כרגע רק בקשות POST מתוך Moodle.",
      },
      405,
    );
  }

  return jsonResponse(
    {
      ok: false,
      status: "blocked_until_verified_oauth1_hmac_sha1",
      ready_for_real_moodle_use: false,
      message_he:
        "חיבור LTI אמיתי עדיין חסום בכוונה. אין ליצור session למורה עד שממומש ונבדק אימות OAuth1 HMAC-SHA1 אמיתי מתוך Moodle.",
      required_before_enable: [
        "מימוש OAuth1 HMAC-SHA1 מלא לפי ה-Tool URL הציבורי המדויק",
        "בדיקת launch אמיתי מתוך Moodle",
        "תיעוד ב-STATE/evidence-log.md",
        "אישור שאין נתוני דמו או session מזויף",
      ],
    },
    501,
  );
});
