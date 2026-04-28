// Supabase Edge Function: lti-launch
//
// SAFE BLOCKED VERSION FOR PR REVIEW.
//
// This branch must NOT pretend that LTI OAuth1 verification works.
// Real Moodle LTI 1.0/1.1 launch requires full OAuth1 HMAC-SHA1
// signature verification against the exact public Tool URL and the real
// deployment secret. Until that verification is implemented and tested
// from a real Moodle launch, this function must not create teacher sessions
// and must not log successful launches.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Intentionally parse only minimal safe metadata. Do not create a session.
  // Do not insert a success launch_attempt. Do not trust the request until
  // real OAuth1 HMAC-SHA1 verification exists.
  let consumerKey = "unknown";
  try {
    const formData = await req.formData();
    const rawConsumerKey = formData.get("oauth_consumer_key");
    if (typeof rawConsumerKey === "string" && rawConsumerKey.trim()) {
      consumerKey = rawConsumerKey.trim();
    }
  } catch (_err) {
    // Keep blocked response even if parsing fails.
  }

  const body = JSON.stringify({
    ok: false,
    status: "blocked_not_implemented",
    message: "LTI OAuth verification is not yet implemented in this branch",
    consumer_key_observed: consumerKey,
    required_before_deploy: [
      "Implement real OAuth1 HMAC-SHA1 signature verification",
      "Verify the exact Moodle Tool URL used in the signature base string",
      "Read LTI consumer secret only from deployment secrets",
      "Create teacher session only after verified signature",
      "Test a real launch from Moodle before marking LTI ready"
    ]
  });

  return new Response(body, {
    status: 501,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
});
