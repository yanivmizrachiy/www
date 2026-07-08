# סטטוס שחרור — תמונת מצב

זהו snapshot בלבד — מדריך ההפעלה המלא נמצא ב-`docs/ADMIN_SETUP.md`.

## פרטי גרסה
- **Branch:** `gemini/recovery-sync-20260503-073319`
- **Latest commit:** `8f8be5b chore(release): add final activation readiness pack` (hardening קודם: `30bf343`)
- **קישור מצגת (ציבורי):** https://www-tijc.onrender.com/guide
- **קישור Admin:** https://www-tijc.onrender.com/admin-hub

## סטטוס נוכחי
| רכיב | סטטוס |
| --- | --- |
| `/guide` (מצגת למורים) | ✅ חי, מאומת חיצונית (asset מכיל את כל הטקסטים) |
| `/admin-hub` (מרכז שליטה) | ✅ פרוס ומוגן ב-`ProtectedAdminRoute`; אין admin פתוח |
| Server API (Express) | ✅ מוקשח: teacher endpoints דורשים session (401), raw captures חסומים (403 ADMIN_ONLY), `/health` + LTI פתוחים |
| Supabase env ב-Render | ✅ מוגדר (bundle לא מכיל placeholder) |
| Supabase Auth URLs | ⏳ ידני — Site URL + Redirect (`/admin-hub`) |
| Migration `admin_users` | ⏳ ידני — להריץ על ה-DB |
| Admin ראשון | ⏳ ידני — ליצור user ולזרוע ב-`admin_users` |

## מה עובד עכשיו
- המצגת מוכנה לשליחה למורים.
- Teacher Hub פעיל (דורש LTI launch להקשר נתונים).
- שער האבטחה של Admin עובד: לא-מנהל אינו רואה את מרכז השליטה; תצורת Supabase חסרה מציגה הודעה ברורה.

## מה עדיין דורש פעולה ידנית
לפי `docs/ADMIN_SETUP.md` (סעיפים 3–5): הגדרת Supabase Auth URLs, הרצת ה-migration, ויצירת ה-admin הראשון.

## פעולה ידנית אחת מדויקת (להפעלת admin ראשון)
להריץ את `supabase/migrations/20260708_admin_users.sql`, ליצור/לאשר משתמש Supabase Auth ליניב, ואז ב-SQL editor:
```sql
insert into public.admin_users (user_id, email, role)
values ('<AUTH_USERS_ID_OF_YANIV>', 'yanivmiz77@gmail.com', 'owner');
```

## אזהרות
- לא להכניס secrets ל-git.
- לא להשתמש ב-`service_role` key בצד client — רק המפתח הציבורי.
- לא לכבות RLS על `admin_users`, ולא לפתוח אותה לקריאה ציבורית.
