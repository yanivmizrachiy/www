-- =========================================================
-- Moodle Teacher Hub - Data Schema
-- =========================================================

-- 1. טבלת תלמידים
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES moodle_sites(id) ON DELETE CASCADE,
    moodle_id BIGINT,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, moodle_id),
    UNIQUE(site_id, email)
);

-- 2. טבלת פריטי ציון (Activities/Grade Items)
CREATE TABLE IF NOT EXISTS grade_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES moodle_sites(id) ON DELETE CASCADE,
    course_id BIGINT,
    moodle_id BIGINT,
    item_name TEXT NOT NULL,
    item_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, course_id, moodle_id),
    UNIQUE(site_id, course_id, item_name)
);

-- 3. טבלת ציונים
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    grade_item_id UUID REFERENCES grade_items(id) ON DELETE CASCADE,
    grade_value NUMERIC,
    raw_grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, grade_item_id)
);

-- 4. טבלת לוגים של פעילות
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES moodle_sites(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT,
    event_time TIMESTAMP WITH TIME ZONE,
    event_name TEXT,
    event_context TEXT,
    origin_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. טבלת פרקים / נושאים (למיפוי)
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES moodle_sites(id) ON DELETE CASCADE,
    course_id BIGINT,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, course_id, name)
);

-- 6. מיפוי משימות לפרקים
CREATE TABLE IF NOT EXISTS chapter_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    grade_item_id UUID REFERENCES grade_items(id) ON DELETE CASCADE,
    UNIQUE(chapter_id, grade_item_id)
);
