# Moodle Teacher Hub — Real Gradebook File Structure

Source file analyzed in ChatGPT: `grad.ods`.

## File structure

- Sheet name: `ציונים`
- Student rows: 59
- Columns: 250
- Identity columns:
  - שם פרטי
  - שם משפחה
  - מספר זיהוי
  - מוסד
  - מחלקה
  - דוא"ל
- Grade item columns:
  - Many columns named like `בוחן:... (מספרי)`
  - Some columns named like `דפי עבודה:... (מספרי)`
  - One course total column: `סך הכל של מרחב־הלימוד (מספרי)`
- Non-grade metadata column:
  - `תאריך הפקת הדוח (בשניות)`

## Observed data

- Numeric grade values found: 1752
- Students with at least one numeric grade: 59
- Missing grades are represented mostly by `-`
- Missing grades must remain missing; never convert to 0.

## Import mapping rule

Each grade item column should become one row in `grade_items`.

Each numeric cell under a grade item should become one row in `grade_results`.

Student matching order should be:

1. email / דוא"ל
2. מספר זיהוי
3. full name from שם פרטי + שם משפחה

## Safety rule

Do not commit the uploaded gradebook file or private grade rows to GitHub.

Only aggregate counts and structure documentation are allowed.
