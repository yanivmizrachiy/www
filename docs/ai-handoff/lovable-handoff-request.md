# Lovable Handoff Request — Moodle Teacher Hub

מסמך זה מכיל את הפרומפט שמיועד להישלח ל־Lovable כדי לחלץ ממנו בדוח אחד את כל המידע שחסר לריפו `yanivmizrachiy/www`.

אין לחשוף secrets. אם קיים secret, יש לציין רק `EXISTS`, `MISSING` או `UNKNOWN` ואת שם משתנה הסביבה.

---

```text
I need a complete technical handoff report for this Lovable project in ONE response.

Context:
The project is Moodle Teacher Hub, a Hebrew RTL Moodle/LTI teacher dashboard.
Lovable created the beginning of the app, but I need to continue the work outside Lovable in the GitHub repo:

yanivmizrachiy/www

I have very limited remaining Lovable messages, so do not ask me questions first.
Produce one complete, structured report with everything needed for another AI/developer to continue the project accurately.

Important rules:
- Do not invent anything.
- Do not write generic advice.
- Do not say “check the project” without giving the exact details.
- Do not expose secrets.
- If a value is secret, write only: EXISTS / MISSING / UNKNOWN and the env variable name.
- Give current real project state only.
- If something is unfinished, say unfinished.
- If something is demo/placeholder, say demo/placeholder.
- If something is real and working, say exactly what proves it.

Project goal:
A real Hebrew RTL app that opens from inside each teacher’s Moodle learning space through LTI.
Each teacher sees only real data from their own Moodle course/space.
No demo data. No fake students. No fake grades. No fake Moodle API connection.
If Moodle Web Services key/token is missing, the app must work through the smartest possible manual real-data import from Moodle reports/tables/exports.

Return the following sections in order:

1. PROJECT SUMMARY
2. FULL FILE TREE
3. FILES THAT EXIST IN LOVABLE
4. FULL CODE EXPORT FOR CRITICAL FILES
5. ROUTES
6. UI / DASHBOARD STATE
7. MOODLE / LTI CONFIGURATION
8. SUPABASE CONFIGURATION
9. SUPABASE TABLES / VIEWS / RPCS
10. SUPABASE EDGE FUNCTIONS
11. MIGRATIONS
12. DATA IMPORT ARCHITECTURE
13. MOODLE REPORT TYPES SUPPORTED
14. TASKS BY CHAPTERS
15. GRADES
16. DAILY PRACTICE TIME
17. EXPORTS
18. BUILD / DEPENDENCIES
19. TESTING STATUS
20. CURRENT BLOCKERS
21. WHAT IS MISSING FROM GITHUB REPO
22. EXACT NEXT STEPS FOR EXTERNAL AI
23. FINAL HANDOFF SUMMARY

Critical files to export full code for, if possible:
- package.json
- vite.config.ts
- tailwind.config.ts
- tsconfig.json
- tsconfig.app.json
- tsconfig.node.json
- postcss.config.js
- index.html
- src/App.tsx
- src/main.tsx
- src/index.css
- src/App.css
- src/vite-env.d.ts
- src/components/AppLayout.tsx
- src/components/AppSidebar.tsx
- src/components/StatusBadge.tsx
- all src/components/ui files used by the app
- all src/hooks files
- src/hooks/useLtiSession.ts
- src/hooks/useMoodleConnection.ts
- src/hooks/useImports.tsx
- src/hooks/useMoodleData.ts
- src/hooks/useChaptersIndex.ts
- src/lib/utils.ts
- src/lib/moodleImport.ts
- src/lib/dataAdapters/* if exists
- src/pages/*
- src/pages/reports/*
- src/integrations/supabase/client.ts
- src/integrations/supabase/types.ts
- supabase/functions/*
- supabase/migrations/*

Known Moodle values from screenshots:
- tool name: Moodle Teacher Hub
- Tool URL: https://iibrglxkiszrbzakrnlo.functions.supabase.co/lti-launch
- LTI version: LTI 1.0/1.1
- Consumer Key: yaniv-lti-tool
- Secret exists but must not be exposed

Confirm whether Lovable matches these values.

Remember:
This must be a complete handoff report in one response.
Do not ask follow-up questions before giving the report.
Do not hide important missing details.
Do not expose secrets.
```
