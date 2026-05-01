# LTI Setup Documentation & AI Memory
**Date:** 2026-05-01
**Developer:** Yaniv Raz

## Architecture Setup
- **Environment:** Windows PowerShell (Local Dev)
- **Database:** Supabase (Project ID: ncoqanascubqkxxfvucfz)
- **Local Tunneling:** Localtunnel (npx localtunnel --port 3000)

## Moodle Configuration
- **Consumer Key:** yaniv-lti-tool
- **Shared Secret:** JerusalemMath2026

## Notes for AI Context
We successfully set up a local testing environment pulling from GitHub, using a custom PowerShell auto-locator script. The server accepts LTI launches and logs the Teacher's identity bypassing RLS via service_role key.
