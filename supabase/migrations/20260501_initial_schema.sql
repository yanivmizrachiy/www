-- טבלת סשנים של מורים
CREATE TABLE IF NOT EXISTS teacher_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT UNIQUE NOT NULL,
    course_id TEXT,
    course_title TEXT,
    moodle_username TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- הפעלת RLS (Row Level Security)
ALTER TABLE teacher_sessions ENABLE ROW LEVEL SECURITY;
