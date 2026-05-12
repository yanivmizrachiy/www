# LTI session bridge fix — 2026-05-03

Added a real Node session bridge so React can resolve the verified Moodle LTI token created by /api/lti/launch.

This is not demo data. It uses only the real session token created from Moodle launch data.

Expected flow:
Moodle POST /api/lti/launch -> OAuth verified -> Node creates sessionToken -> redirect /lti?t=sessionToken -> React calls /api/bootstrap?t=sessionToken -> dashboard connected.

Still missing:
- Supabase persistence while /health says supabaseConfigured:false.
- Real student/grade/task/log data until Moodle reports are imported.
