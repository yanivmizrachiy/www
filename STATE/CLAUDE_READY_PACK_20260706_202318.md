# חבילת עבודה סופית לקלוד קוד - www

## קבצי אמת שחובה לקרוא
- PROJECT_MEMORY.md
- STATE/PRINCIPLES_HEBREW_UI_REAL_PRODUCT.md
- STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md
- C:\Users\yaniv\www\STATE\CLAUDE_HANDOFF_20260706_201004.md
- C:\Users\yaniv\www\STATE\CLAUDE_AUDIT_20260706_201120
- C:\Users\yaniv\www\STATE\CLAUDE_TESTS_20260706_201149

## מצב בדיקות ידוע
build עובר. typecheck נכשל. check script חסר. doctor script חסר.

## בעיות ראשונות לתיקון
1. להוסיף או לתעד npm scripts חסרים: check, doctor.
2. לתקן SafePageProps / children / titleColor.
3. לתקן imports חסרים של Table ב-StudentProfile.
4. לתקן exports חסרים ב-SafePage וב-useImports.
5. לתקן useImports מול שמות הטבלאות האמיתיים ב-Supabase: imported_students, imported_grade_items, imported_grades, imported_log_events וכו'.

## כללי מוצר מחייבים
1. כל האתר בעברית וב-RTL.
2. כל הכפתורים אמיתיים ועובדים.
3. אין דמו, אין כיתובי דמו, אין fake sync, אין נתונים מומצאים.
4. להשתמש קודם במה שכבר קיים בריפו www.
5. להפריד בין Guide Presentation לבין Moodle Teacher Hub / WWW.
6. בכל עמוד יופיע: מנוהל ע״י יניב רז, עם קישור לאינסטגרם: https://www.instagram.com/yani__raz
7. לא למחוק שום קובץ לפני בדיקת references.

## משימת קלוד הראשונה
קרא את כל קבצי האמת, את audit, ואת test summary. תקן קודם את typecheck בלי לשבור build. אחר כך בצע ניקוי ריפו בטוח: כפילויות, קוד מת, routes כפולים, כפתורים באנגלית, דמו/placeholder/fake. הפרד לחלוטין בין Guide Presentation לבין Moodle Teacher Hub / WWW. בסוף הרץ build/typecheck ודווח.

## סיכום בדיקות אחרון
SAFE TEST SUMMARY

LATEST TEST FOLDER: C:\Users\yaniv\www\STATE\CLAUDE_TESTS_20260706_201149

===== 00_scripts.txt =====
Scripts available in moodle-teacher-hub@0.2.0 via `npm run`:
  dev
    tsx server.ts
  build
    vite build
  preview
    vite preview --host 0.0.0.0
  typecheck
    tsc -b --pretty false

===== 01_check.txt =====
npm error Missing script: "check"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\yaniv\AppData\Local\npm-cache\_logs\2026-07-06T17_11_49_623Z-debug-0.log

===== 02_typecheck.txt =====
  Property 'student_id' does not exist on type 'SelectQueryError<"column 'student_id' does not exist on 'moodle_sites'.">'.
src/hooks/useImports.ts(378,45): error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"students"' is not assignable to parameter of type '"moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"'.
  Overload 2 of 2, '(relation: "moodle_sites_safe" | "launch_summary"): PostgrestQueryBuilder<{ PostgrestVersion: "14.5"; }, { Tables: { domain_probes: { Row: { domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; ... 5 more ...; ws_function_tested: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 10 more ...; teacher_sessions: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: {}; }, { ...; } | { ...; }, "moodle_sites_safe" | "launch_summary", []>', gave the following error.
    Argument of type '"students"' is not assignable to parameter of type '"moodle_sites_safe" | "launch_summary"'.
src/hooks/useImports.ts(378,64): error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 more ... | { ...; }, { ...; } | ... 10 more ... | { ...; }>, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ site_id: string; moodle_id: number; email: any; first_name: any; last_name: any; full_name: string; metadata: any; }[]' is not assignable to parameter of type 'RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 mor...'.
  Overload 2 of 2, '(values: RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 more ... | { ...; }, { ...; } | ... 10 more ... | { ...; }>[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ site_id: string; moodle_id: number; email: any; first_name: any; last_name: any; full_name: string; metadata: any; }[]' is not assignable to parameter of type 'RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 mor...'.
      Type '{ site_id: string; moodle_id: number; email: any; first_name: any; last_name: any; full_name: string; metadata: any; }' is not assignable to type 'RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 mor...'.
        Type '{ site_id: string; moodle_id: number; email: any; first_name: any; last_name: any; full_name: string; metadata: any; }' is not assignable to type '{ course_id: number; created_at?: string; email?: string; external_id?: string; external_username?: string; first_seen_batch?: string; full_name: string; id?: string; last_seen_batch?: string; site_id: string; updated_at?: string; } & {}'.
          Property 'course_id' is missing in type '{ site_id: string; moodle_id: number; email: any; first_name: any; last_name: any; full_name: string; metadata: any; }' but required in type '{ course_id: number; created_at?: string; email?: string; external_id?: string; external_username?: string; first_seen_batch?: string; full_name: string; id?: string; last_seen_batch?: string; site_id: string; updated_at?: string; }'.
src/hooks/useImports.ts(400,15): error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"grade_items"' is not assignable to parameter of type '"moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"'.
  Overload 2 of 2, '(relation: "moodle_sites_safe" | "launch_summary"): PostgrestQueryBuilder<{ PostgrestVersion: "14.5"; }, { Tables: { domain_probes: { Row: { domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; ... 5 more ...; ws_function_tested: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 10 more ...; teacher_sessions: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: {}; }, { ...; } | { ...; }, "moodle_sites_safe" | "launch_summary", []>', gave the following error.
    Argument of type '"grade_items"' is not assignable to parameter of type '"moodle_sites_safe" | "launch_summary"'.
src/hooks/useImports.ts(401,17): error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 more ... | { ...; }, { ...; } | ... 10 more ... | { ...; }>, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ site_id: string; course_id: number; item_name: string; item_type: string; }[]' is not assignable to parameter of type 'RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 mor...'.
  Overload 2 of 2, '(values: RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 more ... | { ...; }, { ...; }>[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ site_id: string; course_id: number; item_name: string; item_type: string; }[]' is not assignable to parameter of type 'RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 mor...'.
      Type '{ site_id: string; course_id: number; item_name: string; item_type: string; }' is not assignable to type 'RejectExcessProperties<{ domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; id?: string; probed_at?: string; reason: string; site_id: string; status?: "proven" | ... 1 more ... | "blocked"; ws_function_tested?: string; } | ... 10 mor...'.
        Type '{ site_id: string; course_id: number; item_name: string; item_type: string; }' is not assignable to type '{ site_id: never; course_id: never; item_name: never; item_type: never; }'.
          Types of property 'site_id' are incompatible.
            Type 'string' is not assignable to type 'never'.
src/hooks/useImports.ts(415,19): error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"students"' is not assignable to parameter of type '"moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"'.
  Overload 2 of 2, '(relation: "moodle_sites_safe" | "launch_summary"): PostgrestQueryBuilder<{ PostgrestVersion: "14.5"; }, { Tables: { domain_probes: { Row: { domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; ... 5 more ...; ws_function_tested: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 10 more ...; teacher_sessions: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: {}; }, { ...; } | { ...; }, "moodle_sites_safe" | "launch_summary", []>', gave the following error.
    Argument of type '"students"' is not assignable to parameter of type '"moodle_sites_safe" | "launch_summary"'.
src/hooks/useImports.ts(417,17): error TS2345: Argument of type '"site_id"' is not assignable to parameter of type '"id"'.
src/hooks/useImports.ts(418,17): error TS2345: Argument of type '"email"' is not assignable to parameter of type '"id"'.
src/hooks/useImports.ts(424,34): error TS2339: Property 'item_name' does not exist on type '{ consumer_guid: string; consumer_key: string; consumer_secret: string; created_at: string; id: string; last_probed_at: string; lti_consumer_key: string; lti_consumer_secret: string; site_name: string; site_url: string; updated_at: string; ws_token: string; ws_token_status: string; } | ... 10 more ... | { ...; }'.
  Property 'item_name' does not exist on type '{ consumer_guid: string; consumer_key: string; consumer_secret: string; created_at: string; id: string; last_probed_at: string; lti_consumer_key: string; lti_consumer_secret: string; site_name: string; site_url: string; updated_at: string; ws_token: string; ws_token_status: string; }'.
src/hooks/useImports.ts(436,58): error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"grades"' is not assignable to parameter of type '"moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"'.
  Overload 2 of 2, '(relation: "moodle_sites_safe" | "launch_summary"): PostgrestQueryBuilder<{ PostgrestVersion: "14.5"; }, { Tables: { domain_probes: { Row: { domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; ... 5 more ...; ws_function_tested: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 10 more ...; teacher_sessions: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: {}; }, { ...; } | { ...; }, "moodle_sites_safe" | "launch_summary", []>', gave the following error.
    Argument of type '"grades"' is not assignable to parameter of type '"moodle_sites_safe" | "launch_summary"'.
src/hooks/useImports.ts(448,20): error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"students"' is not assignable to parameter of type '"moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"'.
  Overload 2 of 2, '(relation: "moodle_sites_safe" | "launch_summary"): PostgrestQueryBuilder<{ PostgrestVersion: "14.5"; }, { Tables: { domain_probes: { Row: { domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; ... 5 more ...; ws_function_tested: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 10 more ...; teacher_sessions: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: {}; }, { ...; } | { ...; }, "moodle_sites_safe" | "launch_summary", []>', gave the following error.
    Argument of type '"students"' is not assignable to parameter of type '"moodle_sites_safe" | "launch_summary"'.
src/hooks/useImports.ts(450,18): error TS2345: Argument of type '"site_id"' is not assignable to parameter of type '"id"'.
src/hooks/useImports.ts(451,18): error TS2345: Argument of type '"full_name"' is not assignable to parameter of type '"id"'.
src/hooks/useImports.ts(468,46): error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"activity_logs"' is not assignable to parameter of type '"moodle_sites" | "teacher_sessions" | "import_batches" | "imported_grade_items" | "imported_students" | "imported_tasks" | "imported_chapters" | "domain_probes" | "imported_grades" | "imported_log_events" | "imported_task_completion" | "launch_attempts"'.
  Overload 2 of 2, '(relation: "moodle_sites_safe" | "launch_summary"): PostgrestQueryBuilder<{ PostgrestVersion: "14.5"; }, { Tables: { domain_probes: { Row: { domain: "students" | "tasks" | "chapters" | "grades" | "activity" | "time_accumulated" | "reports" | "export_data" | "settings_write"; ... 5 more ...; ws_function_tested: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 10 more ...; teacher_sessions: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: {}; }, { ...; } | { ...; }, "moodle_sites_safe" | "launch_summary", []>', gave the following error.
    Argument of type '"activity_logs"' is not assignable to parameter of type '"moodle_sites_safe" | "launch_summary"'.
src/hooks/useMoodleConnection.ts(7,3): error TS2305: Module '"./useLtiSession"' has no exported member 'DomainKey'.
src/hooks/useMoodleConnection.ts(8,3): error TS2305: Module '"./useLtiSession"' has no exported member 'DomainStatus'.
src/hooks/useMoodleConnection.ts(9,3): error TS2305: Module '"./useLtiSession"' has no exported member 'DomainState'.
src/hooks/useMoodleConnection.ts(13,35): error TS2339: Property 'domains' does not exist on type '{ session: any; site: any; loading: boolean; error: string; }'.
src/hooks/useMoodleConnection.ts(13,44): error TS2339: Property 'refresh' does not exist on type '{ session: any; site: any; loading: boolean; error: string; }'.
src/hooks/useMoodleData.ts(2,10): error TS2724: '"@/hooks/useLtiSession"' has no exported member named 'getLtiToken'. Did you mean 'setLtiToken'?
src/pages/ChapterDetail.tsx(3,86): error TS2741: Property 'children' is missing in type '{ title: string; description: string; }' but required in type 'SafePageProps'.
src/pages/Chapters.tsx(1,20): error TS2614: Module '"@/components/SafePage"' has no exported member 'EmptyTruth'. Did you mean to use 'import EmptyTruth from "@/components/SafePage"' instead?
src/pages/Export.tsx(1,93): error TS2741: Property 'children' is missing in type '{ title: string; description: string; }' but required in type 'SafePageProps'.
src/pages/Grades.tsx(21,32): error TS2322: Type '{ children: Element; title: string; titleColor: string; description: string; }' is not assignable to type 'IntrinsicAttributes & SafePageProps'.
  Property 'titleColor' does not exist on type 'IntrinsicAttributes & SafePageProps'.
src/pages/Grades.tsx(55,111): error TS2741: Property 'message' is missing in type '{ children: string; }' but required in type '{ message: string; }'.
src/pages/NotFound.tsx(2,42): error TS2741: Property 'children' is missing in type '{ title: string; description: string; }' but required in type 'SafePageProps'.
src/pages/reports/DayReport.tsx(2,10): error TS2305: Module '"@/hooks/useImports"' has no exported member 'useDailyActivity'.
src/pages/reports/StudentReport.tsx(2,10): error TS2305: Module '"@/hooks/useImports"' has no exported member 'useStudentReports'.
src/pages/reports/TaskReport.tsx(2,10): error TS2305: Module '"@/hooks/useImports"' has no exported member 'useTaskCompletionDetail'.
src/pages/reports/TaskReport.tsx(47,29): error TS2322: Type 'unknown' is not assignable to type 'Key'.
src/pages/SettingsPage.tsx(2,42): error TS2741: Property 'children' is missing in type '{ title: string; description: string; }' but required in type 'SafePageProps'.
src/pages/Setup.tsx(2,42): error TS2741: Property 'children' is missing in type '{ title: string; description: string; }' but required in type 'SafePageProps'.
src/pages/Sites.tsx(2,42): error TS2741: Property 'children' is missing in type '{ title: string; description: string; }' but required in type 'SafePageProps'.
src/pages/StudentProfile.tsx(12,11): error TS2339: Property 'data' does not exist on type '{ student: any; grades: any[]; activity: any[]; loading: boolean; error: any; }'.
src/pages/StudentProfile.tsx(52,18): error TS2304: Cannot find name 'Table'.
src/pages/StudentProfile.tsx(53,20): error TS2304: Cannot find name 'TableHeader'.
src/pages/StudentProfile.tsx(53,33): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(53,43): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(53,83): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(53,94): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(53,134): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(53,146): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(53,157): error TS2304: Cannot find name 'TableHeader'.
src/pages/StudentProfile.tsx(54,20): error TS2304: Cannot find name 'TableBody'.
src/pages/StudentProfile.tsx(56,24): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(57,26): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(57,74): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(58,26): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(58,125): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(59,25): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(61,21): error TS2304: Cannot find name 'TableBody'.
src/pages/StudentProfile.tsx(62,19): error TS2304: Cannot find name 'Table'.
src/pages/StudentProfile.tsx(69,18): error TS2304: Cannot find name 'Table'.
src/pages/StudentProfile.tsx(70,20): error TS2304: Cannot find name 'TableHeader'.
src/pages/StudentProfile.tsx(70,33): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(70,43): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(70,83): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(70,94): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(70,135): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(70,146): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(70,188): error TS2304: Cannot find name 'TableHead'.
src/pages/StudentProfile.tsx(70,200): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(70,211): error TS2304: Cannot find name 'TableHeader'.
src/pages/StudentProfile.tsx(71,20): error TS2304: Cannot find name 'TableBody'.
src/pages/StudentProfile.tsx(73,24): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(74,26): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(74,74): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(75,26): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(75,89): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(76,26): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(76,157): error TS2304: Cannot find name 'TableCell'.
src/pages/StudentProfile.tsx(77,25): error TS2304: Cannot find name 'TableRow'.
src/pages/StudentProfile.tsx(79,21): error TS2304: Cannot find name 'TableBody'.
src/pages/StudentProfile.tsx(80,19): error TS2304: Cannot find name 'Table'.
src/pages/Students.tsx(1,20): error TS2614: Module '"@/components/SafePage"' has no exported member 'EmptyTruth'. Did you mean to use 'import EmptyTruth from "@/components/SafePage"' instead?
src/pages/Students.tsx(2,10): error TS2305: Module '"@/hooks/useImports"' has no exported member 'useImportedStudents'.
src/pages/Tasks.tsx(25,39): error TS2322: Type '{ children: Element; title: string; titleColor: string; description: string; }' is not assignable to type 'IntrinsicAttributes & SafePageProps'.
  Property 'titleColor' does not exist on type 'IntrinsicAttributes & SafePageProps'.
src/pages/Tasks.tsx(46,12): error TS2741: Property 'message' is missing in type '{ children: string; }' but required in type '{ message: string; }'.

===== 03_build.txt =====

> moodle-teacher-hub@0.2.0 build
> vite build

[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 2228 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                                         [39m[1m[2m    0.86 kB[22m[1m[22m[2m │ gzip:   0.54 kB[22m
[2mdist/[22m[32massets/geist-cyrillic-wght-normal-CHSlOQsW.woff2   [39m[1m[2m   14.69 kB[22m[1m[22m
[2mdist/[22m[32massets/geist-latin-ext-wght-normal-DMtmJ5ZE.woff2  [39m[1m[2m   15.31 kB[22m[1m[22m
[2mdist/[22m[32massets/geist-latin-wght-normal-Dm3htQBi.woff2      [39m[1m[2m   28.40 kB[22m[1m[22m
[2mdist/[22m[35massets/index-CS86Tkmx.css                          [39m[1m[2m   61.26 kB[22m[1m[22m[2m │ gzip:  10.86 kB[22m
[2mdist/[22m[36massets/index-BnEb7B5r.js                           [39m[1m[33m1,007.90 kB[39m[22m[2m │ gzip: 313.23 kB[22m
[33m
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 5.08s[39m

===== 04_doctor.txt =====
npm error Missing script: "doctor"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\yaniv\AppData\Local\npm-cache\_logs\2026-07-06T17_12_01_677Z-debug-0.log
