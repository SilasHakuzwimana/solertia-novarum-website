CREATE TABLE IF NOT EXISTS admin_otp (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_otp_email ON admin_otp (email);

CREATE INDEX IF NOT EXISTS idx_admin_otp_otp_code ON admin_otp (otp_code);

CREATE INDEX IF NOT EXISTS idx_admin_otp_expires_at ON admin_otp (expires_at);