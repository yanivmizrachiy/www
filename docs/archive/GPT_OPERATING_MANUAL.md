# GPT Operating Manual

## חוקי ברזל
- לא למחוק עבודה טובה
- לא rewrite
- לא להחליף ארכיטקטורה
- לא לשנות שמות ישויות קיימות
- לא להמציא payloads או נתונים
- כל שינוי incremental בלבד

## ישויות קיימות
- launches
- teachers
- spaces
- students
- tasks
- grades
- activitySessions
- moodleCaptures
- settings

## API קיים
- /health
- /lti11/config
- /dev/login
- /lti/launch-1p1
- /api/bootstrap
- /api/launches
- /api/students
- /api/tasks
- /api/grades
- /api/activity
- /api/settings
- /api/moodle-captures
- /api/moodle-summary
- /api/export/grades.csv

## סדר עבודה
1. למפות קוד קיים
2. לשדרג launch capture
3. לשדרג bootstrap
4. לשדרג summary/captures
5. לתכנן integrations
6. לממש mappings
7. להוסיף activity summary
8. לשפר dashboard
9. לשפר exports
10. להכין deployment

## פורמט תשובה מחייב ל-GPT
1. מה הבנתי
2. מה אני מוסיף
3. אילו קבצים משתנים
4. קוד מלא רק לקבצים שהשתנו
5. מה לא שיניתי
6. איך לבדוק
7. מה חסר / סיכונים
