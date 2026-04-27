# Lovable Intake — www / Moodle Teacher Hub

מסמך זה מרכז את קבצי Lovable והחומרים שהמשתמש מסר כדי לסנכרן אותם לריפו `yanivmizrachiy/www` בצורה מסודרת.

---

## קבצים/חומרים שנקלטו עד כה

- `index.html` — מעטפת Vite/React בעברית RTL.
- `Index.tsx` — מפנה ל־Dashboard.
- `package.json` — Vite React shadcn TypeScript stack.
- `postcss.config.js` — Tailwind + Autoprefixer.
- `tailwind.config.ts` — design tokens, Heebo/Assistant, status colors, sidebar tokens.
- `tsconfig` root.
- `tsconfig.app` לפי חומרים שנמסרו.
- `tsconfig.node` / Vite config TypeScript לפי חומרים שנמסרו.
- `src/App.tsx` — מפת routes מלאה של אפליקציית React.
- צילומי מסך של Dashboard ומבנה Code View ב־Lovable.
- דוח טכני קודם על מסכים, RPCs, imports, Supabase ו־manual Moodle data import.

---

## `src/App.tsx` — נקלט וסונכרן

הקובץ נוצר בריפו תחת:

```text
src/App.tsx
```

Routes שנקלטו:

- `/install` -> redirect ל־`/setup`
- `/lti` -> `LtiBootstrap`
- `/auth`, `/login`, `/signup` -> redirect ל־`/setup`
- `/` -> Dashboard
- `/sites`
- `/students`
- `/students/:id`
- `/tasks`
- `/chapters`
- `/chapters/:sectionId`
- `/grades`
- `/activity`
- `/reports`
- `/reports/students`
- `/reports/tasks`
- `/reports/days`
- `/reports/gaps`
- `/export`
- `/settings`
- `/import`
- `/setup`
- `*` -> NotFound

---

## משמעות מקצועית של App.tsx

הקובץ מאשר:

- שימוש ב־React Router.
- שימוש ב־TanStack Query.
- שימוש ב־TooltipProvider.
- שימוש בשני Toasters.
- אין login עצמאי למורה.
- הכניסה האמיתית אמורה להיות דרך LTI או setup.
- כל מסכי הליבה נמצאים תחת `AppLayout`.

---

## קבצים חסרים להשלמת שחזור/אימות

עדיין חסרים קבצי ליבה:

- `src/main.tsx`
- `src/components/AppLayout.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Import.tsx`
- `src/pages/Students.tsx`
- `src/pages/StudentProfile.tsx`
- `src/pages/Tasks.tsx`
- `src/pages/Chapters.tsx`
- `src/pages/ChapterDetail.tsx`
- `src/pages/Grades.tsx`
- `src/pages/ActivityPage.tsx`
- `src/pages/Reports.tsx`
- `src/pages/Export.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/Setup.tsx`
- `src/pages/LtiBootstrap.tsx`
- `src/hooks/useImports.tsx`
- `src/lib/moodleImport.ts`
- `src/lib/dataAdapters/*`
- `src/integrations/supabase/client.ts`
- `src/index.css`
- `supabase/functions/*`
- `supabase/migrations/*`

---

## סטטוס אמת

```text
Lovable intake: active
App routes: synced
Full source sync: incomplete
Build verification: not completed
Runtime verification: not completed
```
