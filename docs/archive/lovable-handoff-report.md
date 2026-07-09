# Lovable Handoff Report — Synced 2026-04-28

דוח זה סונכרן מתוך דוח ה־handoff של Lovable שנשלח על ידי המשתמש. הדוח אינו מכיל secrets ואינו מהווה הוכחת build בריפו `yanivmizrachiy/www`; הוא מקור מידע לסנכרון, מיפוי פערים, והמשך פיתוח.

מקור אמת עליון ממשיך להיות `PROJECT_RULES.md`.

---

## 1. תקציר מצב Lovable

Lovable מדווח שהפרויקט הוא אפליקציית React 18 + Vite 5 + Tailwind 3 בעברית RTL בשם Moodle Teacher Hub / מרכז המורה.

ה־backend ב־Lovable מחובר ל־Supabase project:

```text
iibrglxkiszrbzakrnlo
```

מודל הכניסה:

- LTI 1.0/1.1 בלבד.
- אין login רגיל למורה.
- אין סיסמת Moodle בתוך האפליקציה.
- המורה פותח External Tool מתוך Moodle.
- `lti-launch` מאמת OAuth1 HMAC-SHA1.
- נוצרת `teacher_session` עם `session_token`.
- ה־SPA שומר token ב־`sessionStorage` וקורא ל־`lti_get_context`.

מודל הנתונים הפעיל:

- Manual Real Data Import.
- אין Moodle Web Services token תקין.
- Live Moodle Web Services sync קיים כקוד dormant בלבד, לא כיכולת פעילה.
- נתונים מוצגים מתוך דוחות Moodle אמיתיים שיובאו.

---

## 2. קבצים מרכזיים ש־Lovable מדווח שקיימים

### Frontend

```text
src/App.tsx
src/main.tsx
src/index.css
src/App.css
src/vite-env.d.ts
src/components/AppLayout.tsx
src/components/AppSidebar.tsx
src/components/StatusBadge.tsx
src/components/TruthBadge.tsx
src/components/EmptyDomain.tsx
src/components/ImportEmptyState.tsx
src/components/LaunchDiagnostics.tsx
src/components/NavLink.tsx
src/components/PageHeader.tsx
src/components/PracticeTimeSection.tsx
src/components/ui/*
src/hooks/useLtiSession.tsx
src/hooks/useMoodleConnection.tsx
src/hooks/useImports.tsx
src/hooks/useMoodleData.tsx
src/hooks/useChaptersIndex.tsx
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
src/lib/csv.ts
src/lib/duration.ts
src/lib/moodleImport.ts
src/lib/utils.ts
src/lib/dataAdapters/ManualImportAdapter.ts
src/lib/dataAdapters/MoodleWsAdapter.ts
src/lib/dataAdapters/index.ts
src/lib/dataAdapters/types.ts
src/integrations/supabase/client.ts
src/integrations/supabase/types.ts
```

### Pages

```text
src/pages/Dashboard.tsx
src/pages/Import.tsx
src/pages/Students.tsx
src/pages/StudentProfile.tsx
src/pages/Tasks.tsx
src/pages/Chapters.tsx
src/pages/ChapterDetail.tsx
src/pages/Grades.tsx
src/pages/ActivityPage.tsx
src/pages/Reports.tsx
src/pages/Export.tsx
src/pages/SettingsPage.tsx
src/pages/Setup.tsx
src/pages/Sites.tsx
src/pages/LtiBootstrap.tsx
src/pages/NotFound.tsx
src/pages/reports/StudentReport.tsx
src/pages/reports/TaskReport.tsx
src/pages/reports/DayReport.tsx
src/pages/reports/GapReport.tsx
```

### Supabase

```text
supabase/functions/lti-launch/index.ts
supabase/functions/lti-config/index.ts
supabase/functions/import-moodle-report/index.ts
supabase/functions/moodle-probe/index.ts
supabase/functions/moodle-proxy/index.ts
supabase/functions/site-admin/index.ts
supabase/migrations/*.sql
supabase/config.toml
```

---

## 3. Routes מדווחים מ־Lovable

| Route | Component | סטטוס Lovable | מקור נתונים |
|---|---|---|---|
| `/` | Dashboard | working | `lti_get_imports_overview` |
| `/sites` | Sites | working | `useLtiSession().site` |
| `/students` | Students | working | `lti_list_students` |
| `/students/:id` | StudentProfile | working | `lti_get_student_profile` |
| `/tasks` | Tasks | working | `lti_get_course_structure` |
| `/chapters` | Chapters | working | `lti_get_course_structure` |
| `/chapters/:sectionId` | ChapterDetail | working | derived course structure |
| `/grades` | Grades | working | `lti_get_grades_matrix` |
| `/activity` | ActivityPage | working | `lti_get_activity_overview`, `lti_get_practice_time` |
| `/reports` | Reports | working | hub |
| `/reports/students` | StudentReport | working | `lti_get_student_reports` |
| `/reports/tasks` | TaskReport | working | `lti_get_task_completion_detail` |
| `/reports/days` | DayReport | working | `lti_get_daily_activity` |
| `/reports/gaps` | GapReport | working | derived |
| `/export` | Export | partial | CSV only |
| `/settings` | SettingsPage | partial | `useLtiSession` |
| `/import` | Import | working | parse + `import-moodle-report` |
| `/setup` | Setup | docs page | static |
| `/lti` | LtiBootstrap | working | `?t=` token |

חשוב: סטטוס `working` הוא לפי Lovable, לא אומת עדיין בריפו `yanivmizrachiy/www` אחרי build מקומי.

---

## 4. הגדרת LTI שדווחה ואושרה מול הצילומים

| שדה | ערך |
|---|---|
| Tool name | `Moodle Teacher Hub` |
| Tool URL | `https://iibrglxkiszrbzakrnlo.functions.supabase.co/lti-launch` |
| LTI version | `LTI 1.0/1.1` |
| Consumer Key | `yaniv-lti-tool` |
| Shared Secret | EXISTS, לא נשמר בריפו |
| Cartridge URL אופציונלי | `https://iibrglxkiszrbzakrnlo.functions.supabase.co/lti-config` |

ה־Shared Secret חייב להישמר רק ב־Supabase secrets / deployment secrets, לא בצ׳אט ולא בגיטהאב.

---

## 5. Supabase env / secrets לפי Lovable

### Frontend env

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

### Edge Function env / secrets

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY או SUPABASE_PUBLISHABLE_KEY
LTI_CONSUMER_KEY
LTI_CONSUMER_SECRET
LTI_LAUNCH_URL
APP_ORIGIN
LOVABLE_API_KEY - reserved / not currently used
```

הערה קריטית מ־Lovable:

```text
APP_ORIGIN חייב להצביע על כתובת ה־SPA שפורסמה, לא על functions.supabase.co.
```

אם `APP_ORIGIN` לא נכון, LTI launch עלול להצליח בצד ה־function אבל להפנות לכתובת שגויה.

---

## 6. Supabase objects שדווחו

### Tables

```text
moodle_sites
teacher_sessions
domain_probes
launch_attempts
import_batches
imported_students
imported_grade_items
imported_grades
imported_chapters
imported_tasks
imported_task_completion
imported_log_events
```

### RPCs

```text
lti_get_context
lti_get_imports_overview
lti_list_students
lti_get_grades_matrix
lti_get_course_structure
lti_get_activity_overview
lti_get_daily_activity
lti_get_student_reports
lti_get_task_completion_detail
lti_get_practice_time
lti_get_student_profile
lti_delete_batch
```

### Security

Lovable מדווח:

- כל טבלאות הייבוא עם RLS נעול.
- לקוח לא אמור לקרוא/לכתוב ישירות לטבלאות raw/imported.
- גישה דרך RPC security definer ו־Edge Functions בלבד.

---

## 7. Import architecture לפי Lovable

הזרימה:

1. `/import` מקבל upload או paste.
2. `moodleImport.ts` קורא XLSX/CSV/TSV.
3. `detectReportType` מזהה report type.
4. UI מציג preview.
5. המשתמש מאשר / ממפה עמודות.
6. `useSubmitImport` שולח ל־`import-moodle-report` עם `x-lti-session`.
7. Edge Function כותבת `import_batches` ו־`imported_*`.
8. RPCs משקפים את הנתונים במסכים.

נתונים נשמרים:

- raw values
- numeric values
- missing flags
- batch lineage
- provenance

לא נשמר:

- קובץ Moodle המקורי עצמו.

---

## 8. סוגי דוחות Moodle נתמכים לפי Lovable

| סוג | סטטוס |
|---|---|
| Participants / Students | supported |
| Gradebook / Grades | supported |
| Activity completion | supported |
| Logs | supported |
| Activity report | planned / only if matching columns |
| Participation report | planned |
| Quiz attempts | not implemented |
| Assignment submissions | not implemented |
| copied Moodle tables | supported via paste heuristics |
| pasted CSV/TSV | supported |

---

## 9. משימות לפי פרקים

Lovable מדווח:

- מקור: `imported_tasks` + `imported_chapters`.
- RPC: `lti_get_course_structure`.
- משימות בלי פרק מוצגות תחת `ללא פרק`.
- אין ספירת שאלות כי export רגיל לא נותן זאת.
- אין deep links למשימות כי URL/id לא נשמרים עדיין.
- `position` קיים למיון פרקים ומשימות.

---

## 10. ציונים

Lovable מדווח:

- מקור: `imported_grade_items` + `imported_grades`.
- RPC: `lti_get_grades_matrix`.
- התאמת תלמידים לפי שם מלא / username / external id אם קיים.
- ציונים חסרים נשמרים כ־`is_missing=true` ולא כ־0.
- ממוצעים מחושבים מ־numeric grades אמיתיים בלבד.
- סינון לפי תלמיד ומשימה אפשרי בצד לקוח.
- סינון לפי תאריך לא קיים אם Gradebook לא מכיל timestamps.
- CSV עובד.
- XLSX עדיין לא מחובר.

---

## 11. זמן תרגול יומי

Lovable מדווח:

- אין שדה משך רשמי ב־Moodle exports הרגילים.
- החישוב מתבצע מתוך `imported_log_events`.
- RPC: `lti_get_practice_time`.
- כלל sessionization: פער חוסר פעילות של 20 דקות / 1200 שניות מתחיל session חדש.
- session עם אירוע יחיד = 0 שניות.
- מוצג כ־calculated / estimated from Moodle logs, לא כמשך רשמי מוחלט.
- `PracticeTimeSection.tsx` כולל date range filter, expandable windows, CSV export.

---

## 12. ייצוא

| פורמט | סטטוס לפי Lovable |
|---|---|
| CSV | working |
| XLSX | not wired yet |
| PDF | not implemented |
| Print stylesheet | not implemented |

כל export חייב להישאר אמת בלבד, מתוך dataset אמיתי מסונן/נטען.

---

## 13. Build / dependencies לפי Lovable

Lovable מדווח שהפרויקט המקורי השתמש ב:

```text
vite 5.4.x
@vitejs/plugin-react-swc 3.11.x
lovable-tagger
```

אבל מחוץ ל־Lovable:

- יש להסיר `lovable-tagger`.
- ב־Termux/Android SWC עלול להיכשל בגלל native binding.
- בריפו `www` כבר נצפה כשל SWC, ולכן יש להעדיף פתרון build שתואם Termux ולא מסתמך על SWC native binding.

---

## 14. בדיקות לפי Lovable

Lovable מדווח:

| בדיקה | סטטוס Lovable |
|---|---|
| Supabase RPCs | verified לפי Lovable |
| Edge functions | deployed לפי Lovable |
| Manual import sample | verified לפי Lovable |
| CSV export | verified לפי Lovable |
| LTI launch end-to-end | not verified in that session |
| npm install/build outside Lovable | not verified |
| Automated tests | placeholder only |

לפי כלל הריפו שלנו, כל מה שלא נבדק בתוך `yanivmizrachiy/www` עדיין אינו Done.

---

## 15. חסמים שדווחו

```text
1. אין Moodle Web Services token תקין.
2. APP_ORIGIN חייב להיות נכון.
3. אין quiz import.
4. אין groups/cohorts.
5. אין PDF export.
6. אין print stylesheet.
7. SettingsPage חלקי.
8. lovable-tagger צריך הסרה מחוץ ל־Lovable.
9. SWC בעייתי ב־Termux.
10. MoodleWsAdapter dormant עד שיהיה token.
```

---

## 16. דברים שלפי Lovable אולי חסרים ב־www

Lovable סימן שכדאי לבדוק אם חסרים:

```text
src/components/PracticeTimeSection.tsx
src/components/TruthBadge.tsx
src/lib/duration.ts
src/pages/StudentProfile.tsx
src/hooks/useImports.tsx עם usePracticeTime/useStudentProfile/useDeleteBatch
supabase/functions/import-moodle-report/index.ts latest
migrations 20260427
```

---

## 17. סטטוס מסכם לפי Lovable

| תחום | סטטוס Lovable |
|---|---|
| Frontend RTL/Routing | stable |
| Supabase backend | stable |
| LTI 1.1 implementation | implemented, needs real Moodle install test |
| Manual import | working for students/grades/completion/logs |
| Reports | working from imported data |
| Practice time | working, log-derived |
| Student profile | working |
| CSV export | working |
| XLSX/PDF | not implemented |
| Live Moodle WS sync | dormant, no token |
| Quiz/Groups | not implemented |
| Tests | placeholder only |
| Production readiness | Lovable estimates about 75% for manual-import pilot, but repo `www` must verify independently |

---

## 18. פעולות סנכרון מומלצות לריפו `www`

1. להשוות את קבצי `src/components`, `src/hooks`, `src/lib`, `src/pages`, `supabase/functions`, `supabase/migrations` מול רשימת Lovable.
2. להוסיף קבצים חסרים שלא קיימים ב־www.
3. לא להכניס `lovable-tagger` לריפו production.
4. לא לחזור ל־SWC אם הוא שובר build ב־Termux.
5. להוסיף/לעדכן `PracticeTimeSection`, `TruthBadge`, `duration.ts`, `moodleImport.ts`, dataAdapters, migrations ו־functions אם חסרים.
6. לעדכן STATE אחרי כל build/test.
7. לא לסמן כ־Done עד build + route tests + import test.
