# הפעלת מרכז השליטה של יניב

מסמך הפעלה קצר ל-`/admin-hub`. כל התשתית קיימת בקוד — נותרה הגדרה חד-פעמית ב-Render, ב-Supabase Auth וב-DB.

קישור Admin: https://www-tijc.onrender.com/admin-hub
קישור מצגת (ציבורי): https://www-tijc.onrender.com/guide

---

## 1. מה כבר קיים בקוד

- **Supabase Auth** (email / magic link) — `src/hooks/useAdminAuth.ts`
- **טבלת `admin_users`** — `supabase/migrations/20260708_admin_users.sql`
- **פונקציית `is_admin()`** — `SECURITY DEFINER`, `search_path` נעול
- **RLS** על `admin_users` — קריאה למנהל בלבד, אין insert מה-client
- **`ProtectedAdminRoute`** — `src/components/ProtectedAdminRoute.tsx`
- **נתיב `/admin-hub`** — מוגן, standalone, מופרד מ-Teacher Hub

---

## 2. הגדרות ב-Render (Environment)

בשירות `www` (id: `srv-d7t5b93rjlhs73db5m20`) → Environment:

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | כתובת פרויקט ה-Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | המפתח הציבורי (anon/publishable) בלבד |

לאחר עדכון — לבצע **Deploy** מחדש (הערכים נצרבים ל-build של Vite).
אם חסרים — `/admin-hub` יציג "תצורת Supabase חסרה ב-Render".

---

## 3. הגדרות ב-Supabase Auth

Authentication → URL Configuration:

- **Site URL:** `https://www-tijc.onrender.com`
- **Redirect URL:** `https://www-tijc.onrender.com/admin-hub`
- **Email / Magic Link:** מופעל (Enabled)

---

## 4. הפעלת ה-DB

ב-Supabase → SQL editor, להריץ את המיגרציה:

```
supabase/migrations/20260708_admin_users.sql
```

זה יוצר את `admin_users`, את `is_admin()` ואת מדיניות ה-RLS. **אינו** מכניס אף מנהל.

---

## 5. יצירת המנהל הראשון

1. ליצור/לאשר משתמש Supabase **Auth** ליניב (Authentication → Users → Add user, או דרך magic link ראשוני).
2. למצוא את ה-`id` של המשתמש ב-`auth.users`.
3. ב-SQL editor להריץ:

```sql
insert into public.admin_users (user_id, email, role)
values ('<AUTH_USERS_ID_OF_YANIV>', 'yanivmiz77@gmail.com', 'owner');
```

עד שהשורה קיימת — `is_admin()` מחזיר `false` לכולם, ואין admin פתוח.

---

## 6. בדיקת הצלחה

1. לפתוח: https://www-tijc.onrender.com/admin-hub
2. להכניס כתובת דוא״ל ולשלוח קישור התחברות.
3. לפתוח את ה-magic link מאותו מכשיר.
4. **מנהל** → רואה את מרכז השליטה.
5. **משתמש שאינו מנהל** → מקבל "אין הרשאת מנהל".

---

## 7. אזהרות

- **לא** לשים `service_role` key בצד ה-client — רק המפתח הציבורי.
- **לא** להכניס secrets ל-git.
- **לא** לבטל RLS על `admin_users`.
- **לא** לפתוח את `admin_users` לקריאה ציבורית.
