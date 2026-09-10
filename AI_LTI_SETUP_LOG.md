# HISTORICAL SNAPSHOT — LTI Setup Documentation & AI Memory

**Date:** 2026-05-01  
**Developer:** Yaniv Raz

> זהו log היסטורי של סביבת ההקמה ב-2026-05-01. הוא אינו מקור אמת נוכחי ואסור להשתמש בסעיפי הסטטוס שבו כדי להסיק readiness כיום.  
> מקור האמת הקנוני ברמת הריפו: `PROJECT_MEMORY.md`. אמת Teacher Hub מפורטת: `PROJECT_RULES.md`. ראיות מתוארכות: `STATE/`.

## Architecture Setup recorded at that time
- **Environment:** Windows PowerShell (Local Dev)
- **Database:** Supabase (Project ID: ncoqanascubqkxxfvucfz)
- **Local Tunneling:** Localtunnel (`npx localtunnel --port 3000`)

Localtunnel הוא נתיב היסטורי לפיתוח בלבד ואינו runtime קנוני. ה-runtime הקנוני של Teacher Hub כיום הוא `https://www-tijc.onrender.com`.

## Moodle Configuration recorded at that time
- **Consumer Key:** `yaniv-lti-tool`
- **Shared Secret:** EXISTS — value redacted and must never be committed to GitHub.

## Secret Safety Notice
A real LTI shared secret was previously written in this file on a PR branch. The value was redacted from the branch history represented here, but this log does **not** prove whether rotation was later completed. Treat rotation/current-secret state according to current secure environment evidence; never restore or infer the old value.

Do not store any of the following in GitHub:
- LTI shared secret
- SUPABASE_SERVICE_ROLE_KEY
- Moodle Web Services token
- `.env` files
- private Moodle reports or student data

## Notes for AI Context
A local testing environment was set up from GitHub using a PowerShell workflow. The server was intended to accept Moodle LTI launches only after real OAuth1 HMAC-SHA1 verification succeeds. Any wording from this snapshot that implied safe production use without verified signature validation is not authoritative.

## Historical status recorded on 2026-05-01

The following bullets are preserved exactly as the operational conclusion from that date, **not** as current truth:
- Real Moodle LTI launch was not verified yet.
- Supabase SQL had not been applied.
- Supabase functions had not been deployed.
- The exposed LTI shared secret was considered to require rotation before real use.

For current status, use the canonical documents and current evidence rather than replaying these setup tasks automatically.
