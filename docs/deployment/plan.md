# Deployment Plan

## יעד
כתובת HTTPS יציבה עבור Moodle Teacher Hub.

## כיוון נכון
- שרת מרכזי אחד
- דומיין/תת-דומיין קבוע
- TLS תקין
- Moodle External Tool מוגדר מול URL קבוע
- ללא תלות ב-Quick Tunnel לפרודקשן

## שלבים
1. להעלות staging יציב.
2. להגדיר Launch URL קבוע.
3. לבצע Launch אמיתי.
4. לשמור raw capture אמיתי.
5. למשוך נתונים אמיתיים דרך Moodle APIs.