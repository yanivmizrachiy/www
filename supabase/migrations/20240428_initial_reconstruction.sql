-- =========================================================
-- Moodle Teacher Hub - Database Schema (AI Reconstructed)
-- יעד: Supabase SQL Editor
-- =========================================================

-- 1. טבלת אתרי מודל
CREATE TABLE IF NOT EXISTS moodle_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_url TEXT UNIQUE NOT NULL,
    lti_consumer_key TEXT UNIQUE NOT NULL,
    lti_consumer_secret TEXT NOT NULL,
    moodle_ws_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. סשנים פעילים (LTI Sessions)
CREATE TABLE IF NOT EXISTS teacher_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES moodle_sites(id),
    session_token TEXT UNIQUE NOT NULL,
    course_id BIGINT,
    course_title TEXT,
    moodle_username TEXT,
    role TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. לוג ניסיונות כניסה (לדיבג)
CREATE TABLE IF NOT EXISTS launch_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_key TEXT,
    outcome TEXT,
    reason TEXT,
    course_id BIGINT,
    debug_received_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. הגדרה ראשונית לאתר שלך (דוגמה)
-- שנה את הערכים למטה והרץ במידת הצורך:
-- INSERT INTO moodle_sites (site_url, lti_consumer_key, lti_consumer_secret)
-- VALUES ('https://moodle.example.com', 'yaniv-lti-tool', 'MY_SECRET_KEY');
