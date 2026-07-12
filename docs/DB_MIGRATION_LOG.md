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

## 2026-07-10 — זריעת ה-admin הושלמה ✅

מסלול ה-magic-link נכשל (תקלה פעילה ב-Supabase + מגבלות מייל במסלול חינמי), לכן:
1. יניב יצר משתמש Auth בדשבורד (Authentication → Users → Add user → Create new user, עם ✓ Auto-Confirm): `yanivmiz77@gmail.com`, UID `be498e6a-141f-47e5-85e0-f85f3a35670e`, כולל סיסמה שבחר.
2. הורצה הזריעה ב-SQL Editor:
   ```sql
   insert into public.admin_users (user_id, email, role)
   select id, email, 'owner' from auth.users where email = 'yanivmiz77@gmail.com'
   on conflict (user_id) do nothing;
   ```
3. **אומת במסד:** `admin_users` מכילה שורה אחת — `yanivmiz77@gmail.com` / role **owner**.
4. נוספה ל-`/admin-hub` התחברות עם **סיסמה** (`signInWithPassword`) כדרך ראשית; magic-link נשאר כגיבוי.

**מצב סופי: שער ה-Admin פתוח.** יניב מתחבר ב-`/admin-hub` עם המייל + הסיסמה שבחר בדשבורד. `is_admin()` מחזיר true עבורו בלבד.
