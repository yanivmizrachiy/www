# Dashboard iframe responsive fix v1

Status: implemented in branch fix/dashboard-iframe-responsive-v1

Problem fixed:
- Dashboard clipped inside Moodle/LTI iframe because viewport breakpoints created 3/4-column layouts while the right sidebar consumed width.
- Long real teacher/course labels could push hero cards horizontally.

Files changed:
- src/components/AppLayout.tsx
- src/components/ui/sidebar.tsx
- src/pages/Dashboard.tsx

Safety:
- No server.js changes.
- No Supabase changes.
- No import/parser changes.
- No Teacher Release change.
- No fake/demo data.

Expected result:
- Dashboard fits inside Moodle iframe.
- No horizontal clipping.
- Main action cards become 2 columns until wide desktop.
- Hero metadata cards become 3 columns only on wide screens.