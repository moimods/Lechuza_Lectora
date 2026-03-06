require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"];

function validateEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key] || String(process.env[key]).trim() === "");
  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing.join(", "));
    process.exit(1);
  }
}

async function run() {
  validateEnv();

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  });

  const schemaPath = path.resolve(__dirname, "..", "db_lechuza.sql");
  const indexesPath = path.resolve(__dirname, "..", "db_lechuza_indices.sql");

  try {
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schemaSql);
    console.log("OK: db_lechuza.sql imported");

    const indexesSql = fs.readFileSync(indexesPath, "utf8");
    await pool.query(indexesSql);
    console.log("OK: db_lechuza_indices.sql imported");

    console.log("Setup completed successfully.");
  } catch (err) {
    console.error("Setup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
