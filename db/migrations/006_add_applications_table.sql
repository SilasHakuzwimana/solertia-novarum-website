CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    track_id VARCHAR(50) NOT NULL,
    education_level VARCHAR(100),
    institution VARCHAR(255),
    experience_level VARCHAR(100),
    statement TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_email ON applications (email);

CREATE INDEX IF NOT EXISTS idx_applications_track_id ON applications (track_id);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at);