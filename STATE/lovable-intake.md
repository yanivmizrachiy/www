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
- `src/main.tsx` — React entrypoint.
- `src/vite-env.d.ts` — טיפוסי Vite.
- `src/index.css` — מערכת עיצוב RTL, HSL tokens, dark mode, status tokens ו־sidebar tokens.
- `src/components/AppLayout.tsx` — shell ראשי, header, LTI status ו־Outlet.
- `src/components/AppSidebar.tsx` — ניווט צד ימין מלא בעברית.
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

## `src/main.tsx` — נקלט וסונכרן

הקובץ מאשר:

- React root דרך `createRoot`.
- טעינת `App.tsx`.
- טעינת `index.css`.
- mount על `div#root`.

---

## `src/index.css` — נקלט וסונכרן

הקובץ מאשר:

- Tailwind base/components/utilities.
- RTL גלובלי דרך `html { direction: rtl; }`.
- פונטים Heebo + Assistant.
- צבעי HSL בלבד.
- design tokens ל־primary/secondary/muted/accent/destructive.
- status tokens: proven / missing / blocked.
- sidebar tokens.
- dark mode.
- gradient utilities.
- shadow utilities.

---

## `src/components/AppLayout.tsx` — נקלט וסונכרן

הקובץ מאשר:

- App shell RTL.
- Header sticky.
- שימוש ב־`useLtiSession`.
- status גלובלי משקף LTI context בלבד.
- manual import availability לא מוצגת כסטטוס גלובלי, אלא per-screen.
- Outlet לכל המסכים תחת layout.

---

## `src/components/AppSidebar.tsx` — נקלט וסונכרן

הקובץ מאשר:

- Sidebar ימני.
- ניווט עברי לכל מסכי הליבה.
- תמיכה ב־collapsed state.
- הודעת אמת: ממתין ל־LTI launch מתוך Moodle.
- כפתור סיום סשן רק כאשר יש session.

---

## משמעות מקצועית של App.tsx + Layout + Sidebar

החומרים מאשרים:

- שימוש ב־React Router.
- שימוש ב־TanStack Query.
- שימוש ב־TooltipProvider.
- שימוש בשני Toasters.
- אין login עצמאי למורה.
- הכניסה האמיתית אמורה להיות דרך LTI או setup.
- כל מסכי הליבה נמצאים תחת `AppLayout`.
- הניווט תואם את דרישות המוצר: תלמידים, משימות, פרקים, ציונים, פעילות/זמנים, דוחות, ייצוא והגדרות.

---

## קבצים חסרים להשלמת שחזור/אימות

עדיין חסרים קבצי ליבה:

- `src/components/StatusBadge.tsx`
- `src/hooks/useLtiSession.ts`
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
- `supabase/functions/*`
- `supabase/migrations/*`

---

## סטטוס אמת

```text
Lovable intake: active
App routes: synced
Entrypoint: synced
Design system CSS: synced
Layout shell: synced
Sidebar navigation: synced
Full source sync: incomplete
Build verification: not completed
Runtime verification: not completed
```
