# יומן הרצות מול מסד הנתונים החי (Supabase)

תיעוד קבוע של מה שהורץ בפועל מול פרויקט ה-Supabase החי `ncoqanascubqkxfvucfz` ("moodle-teacher-hub"), כדי שכל אדם/AI יידע מה מצב ה-DB האמיתי מול הקוד.

## 2026-07-09 — הרצת migration של admin_users (בוצע, מאומת)

**מי:** דרך SQL Editor של Supabase, בהרשאת יניב (אישור מפורש להרצה על production).

**מה הורץ:** תוכן `supabase/migrations/20260708_admin_users.sql` —
- `create table public.admin_users` (user_id → auth.users, role, email, created_at)
- `create function public.is_admin()` — SECURITY DEFINER, `search_path=public`
- `revoke ... from public; grant execute ... to authenticated`
- `enable row level security` + policy `"admins can read admin_users"` (admin בלבד קורא)

**אימות אחרי ההרצה (query מול ה-DB):**
| בדיקה | תוצאה |
| --- | --- |
| `to_regclass('public.admin_users')` | ✅ קיים |
| `to_regprocedure('public.is_admin()')` | ✅ קיים |
| `rowsecurity` על admin_users | ✅ true |
| `count(*)` ב-admin_users | 0 (טרם נזרע admin — מכוון) |

## ממצאים על מצב ה-DB (אומת 2026-07-09)

- **טבלאות שקיימות בסכמה public לפני ה-migration:** רק `moodle_sites` ו-`teacher_sessions` (שתיהן RLS=true).
- **טבלאות `imported_*` אינן קיימות במסד** — הקוד (`useImports.ts`) קורא `imported_students`/`imported_grades`/`imported_grade_items` אך הן לא נוצרו. לכן חשש ה-RLS על `imported_*` שנרשם ב-PROJECT_MEMORY **אינו רלוונטי כרגע** (אין טבלאות). כשייווצרו — יש להגדיר להן RLS מחמיר.
- **`auth.users` ריק (0 שורות)** — אף אחד עדיין לא התחבר ל-Supabase Auth של האפליקציה.

## הצעד היחיד שנותר לזריעת admin

לא ניתן לזרוע admin ללא `auth.users.id` אמיתי. הצעד:
1. יניב פותח את `https://www-tijc.onrender.com/admin-hub`, מזין `yanivmiz77@gmail.com`, ולוחץ "שליחת קישור התחברות".
2. פותח את ה-magic link מהמייל → נוצרת שורה ב-`auth.users`.
3. ואז (SQL editor):
   ```sql
   insert into public.admin_users (user_id, email, role)
   select id, email, 'owner' from auth.users where email = 'yanivmiz77@gmail.com';
   ```
4. אחרי הזריעה — `/admin-hub` יציג את מרכז השליטה ליניב בלבד.
