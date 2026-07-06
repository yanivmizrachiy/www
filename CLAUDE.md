# CLAUDE.md — הוראות חובה לריפו www

הריפו היחיד הוא www. אין ליצור ריפו חדש, אתר חדש, אפליקציה נפרדת או deployment נפרד.

לפני שינוי קוד חובה לקרוא: PROJECT_MEMORY.md, STATE/PRINCIPLES_HEBREW_UI_REAL_PRODUCT.md, STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md, STATE/CLAUDE_READY_PACK_20260706_202318.md.

יש שני מוצרים באותו ריפו, באותו אתר, אבל בהפרדה מוחלטת:
1. Moodle Teacher Hub / WWW — כלי נתונים שמורה מפעיל מתוך מרחב Moodle שלו. המטרה: למצות שליפת נתונים אמיתית לפי ההקשר וההרשאות של Moodle.
2. Guide Presentation — מדריך/מצגת אינטרנטית חיה למורים על מרחבי למידה Moodle. המטרה: הדרכה ברורה לפי נושאים בעברית, עם תמונות אמיתיות מאושרות וכפתורי ניווט אמיתיים.

כללי UI מוחלטים:
- כל האתר בעברית.
- RTL מלא.
- כל כפתור בעברית.
- כל כפתור חייב לעבוד באמת.
- אין כפתורי דמו.
- אין כיתובי דמו.
- אין fake sync.
- אין fake data.
- אין קישורים מזויפים.
- אם פעולה עדיין לא מחוברת, לא להציג אותה ככפתור עובד. להציג מצב אמת בעברית או להסתיר עד חיבור אמיתי.

בכל עמוד באתר יופיע: מנוהל ע״י יניב רז. יש להוסיף קישור לאינסטגרם: https://www.instagram.com/yani__raz

חובה להשתמש קודם בקוד הקיים בריפו www. אין לבנות כפילויות לפני חיפוש references והבנת הארכיטקטורה.

סדר עבודה מחייב:
1. תקן typecheck בלי לשבור build.
2. תקן SafePageProps, children, titleColor, Table imports, exports חסרים ב-SafePage/useImports/useLtiSession.
3. תקן שמות טבלאות Supabase לפי הסכמה האמיתית: imported_students, imported_grades, imported_grade_items, imported_log_events וכו׳.
4. הוסף או תעד scripts חסרים כמו check ו-doctor.
5. בצע audit וניקוי בטוח: כפילויות, קוד מת, routes כפולים, כפתורים באנגלית, placeholders, demo/fake, ערבוב בין שני המוצרים.
6. לא למחוק קובץ לפני בדיקת references.
7. בסיום להריץ npm run build ו-npm run typecheck.

תוצאה נדרשת: אתר אחד, ריפו אחד, שני מוצרים מופרדים, כל הכפתורים בעברית ועובדים באמת, ללא דמו וללא זיופים.
