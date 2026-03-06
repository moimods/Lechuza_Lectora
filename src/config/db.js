const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || process.env.DB_DATABASE || "db_lechuza",
  password: process.env.DB_PASSWORD || "password",
  port: Number(process.env.DB_PORT || 5432),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on("error", (error) => {
  console.error("[DB Error]", error.message);
  process.exit(-1);
});

pool.on("connect", () => {
  console.log("✅ Conectado a PostgreSQL");
});

/**
 * Verificar conexión a la BD
 */
async function verificarConexion() {
  try {
    const resultado = await pool.query("SELECT NOW()");
    console.log("✅ Conexión verificada:", resultado.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Error verificando conexión BD:", error.message);
    return false;
  }
}

module.exports = pool;
module.exports.verificarConexion = verificarConexion;

