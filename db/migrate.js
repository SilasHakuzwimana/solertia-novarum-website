const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  user: process.env.DB_USER || "solvertia",
  password: process.env.DB_PASSWORD || "solvertia123",
  host: process.env.DB_HOST || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "solvertia_db",
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of already executed migrations
    const { rows: executedMigrations } = await client.query(
      "SELECT name FROM migrations ORDER BY id",
    );
    const executedNames = new Set(executedMigrations.map((row) => row.name));

    // Read migration files
    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`⏭️  Skipping ${file} - already executed`);
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`❌ Migration ${file} failed:`, err);
        throw err;
      }
    }

    console.log("✅ All migrations completed successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
}

module.exports = runMigrations;
