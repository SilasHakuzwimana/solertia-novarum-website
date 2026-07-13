CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Primary index for email lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users (username);

-- Index for active users (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users (is_active);

-- Index for verified status (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_admin_users_is_verified ON admin_users (is_verified);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_admin_users_active_verified ON admin_users (is_active, is_verified);

-- Index for last_login for sorting/analytics
CREATE INDEX IF NOT EXISTS idx_admin_users_last_login ON admin_users (last_login);

-- Index for created_at for sorting (recent users)
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON admin_users (created_at);

-- Partial index for active and verified users (most common query)
CREATE INDEX IF NOT EXISTS idx_admin_users_active_verified_lookup ON admin_users (email)
WHERE
    is_active = true
    AND is_verified = true;