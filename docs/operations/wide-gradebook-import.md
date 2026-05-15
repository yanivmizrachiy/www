# Moodle Teacher Hub — Wide Gradebook Import

This implements real Moodle wide Gradebook import.

## Supported structure

- One student per row.
- Identity columns such as `שם פרטי`, `שם משפחה`, `מספר זיהוי`, `דוא"ל`.
- Each grade activity is a column, such as:
  - `בוחן:... (מספרי)`
  - `תוכן אינטראקטיבי H5P:... (מספרי)`
  - `דפי עבודה:... (מספרי)`
  - `סך הכל של מרחב־הלימוד (מספרי)`

## Safety

- Empty/missing grade cells are not saved as zero.
- No fake grades.
- No SQL is executed by the app.
- Teacher Release remains false.
- Public diagnostics return aggregate counts only.

## Next step

Open `/gradebook-import`, upload the real Gradebook export, and click `ייבא Gradebook אמיתי`.
