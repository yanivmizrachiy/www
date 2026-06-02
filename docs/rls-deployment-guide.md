# RLS Deployment Guide

## מתי להריץ
רק אחרי בדיקת dev מלאה ואישור מפורש.

## איך להריץ
1. פתח Supabase Dashboard → SQL Editor
2. העתק את תוכן `supabase/migrations/20260531_teacher_rls_policies.sql`
3. הרץ על dev database קודם
4. בדוק עם 2 מורים שונים
5. תעד ב-STATE/evidence-log.md
6. רק אחר כך הרץ על production

## אל תרוץ ישירות על production
