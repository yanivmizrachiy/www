TASK: Luxury real Moodle Teacher Hub homepage — NO DEMO

You are editing repo: yanivmizrachiy/www.
Work only on the Moodle Teacher Hub product.
Current homepage route / renders src/pages/Dashboard.tsx through src/App.tsx.
Goal: upgrade the main dashboard/homepage to a premium, high-end, RTL Hebrew visual experience.

Hard rules:
NO demo data. Never invent students, teachers, grades, logs, time, course names, or Moodle status.
Keep all existing real data hooks and truth logic:
useImportsOverview
useSyncStatus
useLtiSession
useDashboardTeachers
useSourceStatus
useAutoSyncStatus
computeNextAction

Teacher Release remains NO. Do not change truth values.
Do not weaken RLS warnings or safety gates.
Do not touch secrets, env files, tokens, Supabase production, or migrations.
Do not remove existing working actions: sync, smart import, students, grades, reports, activity.
Keep Hebrew RTL.
Keep accessibility: semantic sections, readable contrast, keyboard focus, no tiny unreadable text.
Keep mobile layout excellent.
No fake marketing claims unless backed by real source status.

Design goal:
Make src/pages/Dashboard.tsx feel like a luxury control center:
premium hero with layered glass, glow, depth, elegant grid background.
large truthful title: "המודל החכם".
subtitle that explains this is a real Moodle teacher control center.
high-end action cards for: תלמידים, פרקים ופעילויות, ציונים, דוחות, ייבוא חכם.
real status strip: connected from Moodle / requires Moodle launch, course name if real, teacher name if safe, last updated.
better visual hierarchy for next best action.
better empty states that say what is missing, not demo placeholders.
premium but not noisy: dark navy, cyan/blue gradients, subtle white glass, soft shadows, rounded cards.

Specific implementation targets:
Refactor Dashboard.tsx only if needed, but keep it readable.
Create small local presentational components inside Dashboard.tsx if helpful:
LuxuryHero
LuxuryActionTile
LiveTruthPill
HomeSectionHeader

Use existing StatusBadge, OnboardingBanner, Button, Card, lucide icons, motion.
Prefer Tailwind classes already used in the project.
If adding global design tokens, only use src/index.css, no external package.
Add stable marker comments/classes:
MTH_LUXURY_HOME_V1
MTH_LUXURY_HOME_REAL_DATA_ONLY_V1
MTH_LUXURY_HOME_NO_DEMO_V1

Preserve current route /.
Do not create a separate fake landing page.

Make sure:
npm run check
npm run typecheck
npm run build
npm run doctor
npm run validate:moodle:static
pass.

Output expectation:
Implement the luxury homepage upgrade in code.
Do not only write documentation.
After editing, summarize changed files.
