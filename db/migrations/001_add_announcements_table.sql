-- server/db/migrations/001_add_announcements_table.sql
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX idx_announcements_is_active ON announcements (is_active);

-- Insert default announcement
INSERT INTO
    announcements (text, is_active)
VALUES (
        'ANNOUNCEMENT: EXTENDING TVET TECHNICAL & ADVANCED UNIVERSITY ACCELERATION DIRECTIVES FOR 2026/2027',
        true
    );