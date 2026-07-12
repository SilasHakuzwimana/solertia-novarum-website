// src/services/database.service.ts
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: pg.Pool | null = null;
let isDbConnected: boolean = false;

// In-memory fallback storage
export const inMemoryPartnerships: any[] = [];
export const inMemoryApplications: any[] = [];

export const inMemoryAdminUsers: any[] = [
  {
    id: 1,
    username: "admin",
    email: "hakuzwisilas@gmail.com",
    password: "solvertia2026",
    is_verified: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const inMemoryOTPs: Map<string, { otp: string; expires: Date }> =
  new Map();
export const inMemoryAnnouncements: any[] = [
  {
    id: 1,
    text: "ANNOUNCEMENT: EXTENDING TVET TECHNICAL & ADVANCED UNIVERSITY ACCELERATION DIRECTIVES FOR 2026/2027",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getDbPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/solvertia_db";
    pool = new pg.Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err: Error) => {
      console.error("Unexpected error on idle pg client", err);
    });
  }
  return pool;
}

export async function initDatabase(): Promise<void> {
  try {
    const db = getDbPool();
    const client = await db.connect();
    isDbConnected = true;
    console.log("✅ Successfully connected to PostgreSQL database.");

    // ==================== CREATE ALL TABLES ====================

    // 1. Admin Users Table
    await client.query(`
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
    `);
    console.log("✅ Admin users table verified/created.");

    // 2. Admin OTP Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_otp (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_admin_otp_email ON admin_otp(email);
      CREATE INDEX IF NOT EXISTS idx_admin_otp_otp_code ON admin_otp(otp_code);
      CREATE INDEX IF NOT EXISTS idx_admin_otp_expires_at ON admin_otp(expires_at);
    `);
    console.log("✅ Admin OTP table verified/created.");

    // 3. Admin Sessions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        user_agent TEXT,
        ip_address VARCHAR(45),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
    `);
    console.log("✅ Admin sessions table verified/created.");

    // 4. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    console.log("✅ Users table verified/created.");

    // 5. Partnerships Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS partnerships (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        project_scope TEXT,
        budget_range VARCHAR(100),
        selected_services TEXT[],
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_partnerships_email ON partnerships(email);
      CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
      CREATE INDEX IF NOT EXISTS idx_partnerships_created_at ON partnerships(created_at);
    `);
    console.log("✅ Partnerships table verified/created.");

    // 6. Applications Table
    await client.query(`
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
      
      CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
      CREATE INDEX IF NOT EXISTS idx_applications_track_id ON applications(track_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
    `);
    console.log("✅ Applications table verified/created.");

    // 7. User Sessions Table (for regular users)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        user_agent TEXT,
        ip_address VARCHAR(45),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    `);
    console.log("✅ User sessions table verified/created.");

    // 8. Audit Logs Table (for tracking actions)
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        admin_id INTEGER,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `);
    console.log("✅ Audit logs table verified/created.");

    // ==================== ADD ANNOUNCEMENTS TABLE ====================

    // 9. Announcements Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
    `);
    console.log("✅ Announcements table verified/created.");

    // ==================== SEED DEFAULT ADMIN USER ====================

    // Check if admin user exists
    const adminCheck = await client.query(
      "SELECT * FROM admin_users WHERE username = 'admin' OR email = 'hakuzwisilas@gmail.com'",
    );

    if (adminCheck.rows.length === 0) {
      const defaultPasswordHash = "$2b$10$YourHashedPasswordHere";

      await client.query(
        `
        INSERT INTO admin_users (username, email, password_hash, is_verified, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `,
        ["admin", "hakuzwisilas@gmail.com", defaultPasswordHash, true, true],
      );

      console.log("✅ Default admin user created.");
    } else {
      console.log("✅ Admin user already exists.");
    }

    // ==================== SEED DEFAULT ANNOUNCEMENT ====================

    // Check if any announcement exists
    const announcementCheck = await client.query(
      "SELECT * FROM announcements LIMIT 1",
    );

    if (announcementCheck.rows.length === 0) {
      await client.query(
        `
        INSERT INTO announcements (text, is_active, created_at, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [
          "ANNOUNCEMENT: EXTENDING TVET TECHNICAL & ADVANCED UNIVERSITY ACCELERATION DIRECTIVES FOR 2026/2027",
          true,
        ],
      );
      console.log("✅ Default announcement created.");
    } else {
      console.log("✅ Announcement already exists.");
    }

    client.release();
    console.log("✅ All database tables verified/created successfully.");
  } catch (error) {
    isDbConnected = false;
    console.warn(
      "⚠️ PostgreSQL connection failed. Operating in memory-fallback mode:",
      (error as Error).message,
    );
  }
}

export function isDatabaseConnected(): boolean {
  return isDbConnected;
}

export function setDatabaseConnected(status: boolean): void {
  isDbConnected = status;
}

export async function tableExists(tableName: string): Promise<boolean> {
  if (!isDbConnected) return false;

  try {
    const db = getDbPool();
    const result = await db.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [tableName],
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

export async function getTableStats(): Promise<any> {
  if (!isDbConnected) return null;

  try {
    const db = getDbPool();
    const result = await db.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
        (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = t.table_name) as constraint_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    return result.rows;
  } catch (error) {
    console.error("Error getting table stats:", error);
    return null;
  }
}

export default {
  getDbPool,
  initDatabase,
  isDatabaseConnected,
  setDatabaseConnected,
  tableExists,
  getTableStats,
  inMemoryPartnerships,
  inMemoryApplications,
  inMemoryAdminUsers,
  inMemoryOTPs,
  inMemoryAnnouncements,
};
