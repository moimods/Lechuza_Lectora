require("dotenv").config();
const { Pool } = require("pg");

async function run() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  });

  try {
    const result = await pool.query(
      "SELECT titulo, imagen_url FROM productos WHERE titulo IN ($1, $2) ORDER BY titulo",
      ["The Sisters Brothers", "Cuando Reescribamos La Historia"]
    );

    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
