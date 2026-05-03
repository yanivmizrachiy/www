# LTI Setup Documentation & AI Memory
**Date:** 2026-05-01
**Developer:** Yaniv Raz

## Architecture Setup
- **Environment:** Windows PowerShell (Local Dev)
- **Database:** Supabase (Project ID: ncoqanascubqkxxfvucfz)
- **Local Tunneling:** Localtunnel (npx localtunnel --port 3000)

## Moodle Configuration
- **Consumer Key:** yaniv-lti-tool
- **Shared Secret:** EXISTS — value redacted and must never be committed to GitHub.

## Secret Safety Notice
A real LTI shared secret was previously written in this file on the PR branch. The value has now been redacted from the current branch head, but it must be treated as exposed and rotated before any real Moodle/production use.

Do not store any of the following in GitHub:
- LTI shared secret
- SUPABASE_SERVICE_ROLE_KEY
- Moodle Web Services token
- `.env` files
- private Moodle reports or student data

## Notes for AI Context
A local testing environment was set up from GitHub using a PowerShell workflow. The server is intended to accept Moodle LTI launches only after real OAuth1 HMAC-SHA1 verification succeeds. Any previous wording that implied safe production use without verified signature validation is not authoritative.

Current truth:
- Real Moodle LTI launch is not verified yet.
- Supabase SQL has not been applied.
- Supabase functions have not been deployed.
- The exposed LTI shared secret must be rotated before real use.
