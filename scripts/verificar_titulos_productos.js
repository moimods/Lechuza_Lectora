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
      "SELECT id_producto, titulo, imagen_url FROM productos ORDER BY id_producto LIMIT 30"
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
