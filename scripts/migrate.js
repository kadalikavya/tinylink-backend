import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found. Add it to .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS links (
      code VARCHAR(12) PRIMARY KEY,
      url TEXT NOT NULL,
      clicks INT DEFAULT 0,
      last_clicked TIMESTAMP
    );
  `;

  await pool.query(query);
  console.log("✔️ Migration completed.");
  pool.end();
}

migrate();
