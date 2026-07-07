-- =========================================================
-- Sync Batches & Sync Logs — טבלאות מעקב סנכרון
-- =========================================================

-- טבלת סנכרונים (batch = ניסיון סנכרון אחד)
CREATE TABLE IF NOT EXISTS sync_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES moodle_sites(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running', -- running | success | partial | failed
    trigger TEXT NOT NULL DEFAULT 'manual', -- manual | scheduled | webhook
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    error_summary TEXT,

    -- ספירות לפי סוג
    students_synced INTEGER DEFAULT 0,
    grades_synced INTEGER DEFAULT 0,
    tasks_synced INTEGER DEFAULT 0,
    chapters_synced INTEGER DEFAULT 0,
    logs_synced INTEGER DEFAULT 0,
    completions_synced INTEGER DEFAULT 0,

    -- מטא-דאטה
    ws_token_used BOOLEAN DEFAULT false,
    lti_launch_id UUID REFERENCES teacher_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- למניעת סנכרונים כפולים בו-זמנית
    CONSTRAINT no_concurrent_syncs EXCLUDE USING gist (
        site_id WITH =,
        course_id WITH =,
        tsrange(started_at, COALESCE(finished_at, started_at + INTERVAL '1 hour')) WITH &&
    ) DEFERRABLE INITIALLY DEFERRED
);

-- טבלת לוגים של פעולות סנכרון (שורה לכל פעולה)
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES sync_batches(id) ON DELETE CASCADE,
    site_id UUID REFERENCES moodle_sites(id) ON DELETE CASCADE,

    -- מה ניסינו לסנכרן
    domain TEXT NOT NULL, -- students | grades | tasks | chapters | logs | completions

    -- ססמה
    severity TEXT NOT NULL DEFAULT 'info', -- debug | info | warn | error
    message TEXT NOT NULL,
    detail JSONB,

    -- תזמון
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקסים
CREATE INDEX IF NOT EXISTS idx_sync_batches_site_course ON sync_batches(site_id, course_id);
CREATE INDEX IF NOT EXISTS idx_sync_batches_started ON sync_batches(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_batches_status ON sync_batches(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_batch ON sync_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_site ON sync_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_domain_severity ON sync_logs(domain, severity);

-- RLS
ALTER TABLE sync_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- מורים יכולים לראות רק סנכרונים של האתר שלהם
CREATE POLICY "sync_batches_own_site" ON sync_batches
    FOR SELECT USING (
        site_id IN (
            SELECT site_id FROM teacher_sessions
            WHERE session_token = current_setting('app.lti_token', true)
        )
    );

CREATE POLICY "sync_batches_insert_own" ON sync_batches
    FOR INSERT WITH CHECK (
        site_id IN (
            SELECT site_id FROM teacher_sessions
            WHERE session_token = current_setting('app.lti_token', true)
        )
    );

CREATE POLICY "sync_logs_own_site" ON sync_logs
    FOR SELECT USING (
        site_id IN (
            SELECT site_id FROM teacher_sessions
            WHERE session_token = current_setting('app.lti_token', true)
        )
    );
