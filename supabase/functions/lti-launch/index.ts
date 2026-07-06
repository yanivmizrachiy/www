// Supabase Edge Function: lti-launch
// Description: Handles incoming LTI 1.1 POST requests from Moodle.
// Verifies OAuth1 signature and redirects to the SPA with a session token.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts"

const APP_ORIGIN = Deno.env.get("APP_ORIGIN"); // e.g. https://my-app.cloud.run
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const params = Object.fromEntries(formData.entries());

    // 1. Recover Consumer Secret from Database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const consumer_key = params.oauth_consumer_key;
    
    const { data: site } = await supabase
      .from("moodle_sites")
      .select("id, lti_consumer_secret")
      .eq("lti_consumer_key", consumer_key)
      .single();

    if (!site) {
      throw new Error(`Consumer key not found: ${consumer_key}`);
    }

    // 2. Verify OAuth1 Signature (HMAC-SHA1)
    // We need to reconstruct the base string used by Moodle to sign the request.
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
    const method = req.method.toUpperCase();

    // Collect all parameters except the signature itself
    const sigParams: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "oauth_signature") {
        sigParams[key] = value.toString();
      }
    }

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(sigParams).sort();
    const parameterString = sortedKeys
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sigParams[key])}`)
      .join("&");

    const baseString = `${method}&${encodeURIComponent(baseUrl)}&${encodeURIComponent(parameterString)}`;
    const signingKey = `${encodeURIComponent(site.lti_consumer_secret)}&`;

    const hmac = new crypto.HmacSha1(signingKey);
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(await hmac.sign(new TextEncoder().encode(baseString)))));

    const receivedSignature = params.oauth_signature;
    const is_valid = (receivedSignature === expectedSignature);

    if (!is_valid) {
       console.error("Invalid signature detected.");
       console.error("Expected:", expectedSignature);
       console.error("Received:", receivedSignature);
       
       await supabase.from("launch_attempts").insert({
         consumer_key,
         outcome: "failure",
         reason: "Invalid signature",
         debug_received_signature: receivedSignature
       });
       return new Response("Invalid signature (LTI OAuth Verification Failed)", { status: 403 });
    }

    // 3. Create Session
    const session_token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: session, error: sessionError } = await supabase
      .from("teacher_sessions")
      .insert({
        site_id: site.id,
        session_token,
        course_id: parseInt(params.context_id),
        course_title: params.context_title,
        moodle_username: params.ext_user_username || params.lis_person_name_full,
        role: params.roles?.includes("Instructor") ? "teacher" : "student",
        expires_at
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // 4. Log Success
    await supabase.from("launch_attempts").insert({
      consumer_key,
      outcome: "success",
      course_id: parseInt(params.context_id)
    });

    // 5. Redirect to SPA with token
    const redirectUrl = `${APP_ORIGIN}/lti-bootstrap?t=${session_token}`;
    return new Response(null, {
      status: 303,
      headers: { "Location": redirectUrl }
    });

  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
})
