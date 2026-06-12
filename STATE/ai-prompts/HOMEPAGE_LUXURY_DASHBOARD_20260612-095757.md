# TASK: Luxury real Moodle Teacher Hub homepage — NO DEMO

You are editing repo: yanivmizrachiy/www.
Work only on the Moodle Teacher Hub product.
Current homepage route / renders src/pages/Dashboard.tsx through src/App.tsx.
Goal: upgrade the main dashboard/homepage to a premium, high-end, RTL Hebrew visual experience.

## Hard rules
1. NO demo data. Never invent students, teachers, grades, logs, time, course names, or Moodle status.
2. Keep all existing real data hooks and truth logic:
   - useImportsOverview
   - useSyncStatus
   - useLtiSession
   - useDashboardTeachers
   - useSourceStatus
   - useAutoSyncStatus
   - computeNextAction
3. Teacher Release remains NO. Do not change truth values.
4. Do not weaken RLS warnings or safety gates.
5. Do not touch secrets, env files, tokens, Supabase production, or migrations.
6. Do not remove existing working actions: sync, smart import, students, grades, reports, activity.
7. Keep Hebrew RTL.
8. Keep accessibility: semantic sections, readable contrast, keyboard focus, no tiny unreadable text.
9. Keep mobile layout excellent.
10. No raw fake marketing claims like "AI proves" or "automatic everything" unless backed by real source status.

## Design goal
Make src/pages/Dashboard.tsx feel like a luxury control center:
- premium hero with layered glass, glow, depth, elegant grid background
- large truthful title: "המודל החכם"
- subtitle that explains this is a real Moodle teacher control center
- high-end action cards for:
  - תלמידים
  - פרקים ופעילויות
  - ציונים
  - דוחות
  - ייבוא חכם
- real status strip:
  - connected from Moodle / requires Moodle launch
  - course name if real
  - teacher name if safe
  - last updated
- better visual hierarchy for next best action
- better empty states that say what is missing, not demo placeholders
- premium but not noisy: dark navy, cyan/blue gradients, subtle white glass, soft shadows, rounded cards

## Specific implementation targets
1. Refactor Dashboard.tsx only if needed, but keep it readable.
2. Create small local presentational components inside Dashboard.tsx if helpful:
   - LuxuryHero
   - LuxuryActionTile
   - LiveTruthPill
   - HomeSectionHeader
3. Use existing StatusBadge, OnboardingBanner, Button, Card, lucide icons, motion.
4. Prefer Tailwind classes already used in the project.
5. If adding global design tokens, only use src/index.css, no external package.
6. Add stable marker comments/classes:
   - MTH_LUXURY_HOME_V1
   - MTH_LUXURY_HOME_REAL_DATA_ONLY_V1
   - MTH_LUXURY_HOME_NO_DEMO_V1
7. Preserve current route /.
8. Do not create a separate fake landing page.
9. Make sure 
pm run check, 
pm run typecheck, 
pm run build, 
pm run doctor, and 
pm run validate:moodle:static pass.

## Output expectation
Implement the luxury homepage upgrade in code.
Do not only write documentation.
After editing, summarize changed files.
