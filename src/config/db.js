const { Pool } = require("pg");

const isVercel = Boolean(process.env.VERCEL);
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const sslEnabled = String(process.env.DB_SSL || process.env.PGSSLMODE || "false").toLowerCase();

const poolConfig = {
  max: Number(process.env.DB_POOL_MAX || (isVercel ? 3 : 10)),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS || 5000)
};

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
} else {
  poolConfig.user = process.env.DB_USER || "postgres";
  poolConfig.host = process.env.DB_HOST || "localhost";
  poolConfig.database = process.env.DB_NAME || process.env.DB_DATABASE || "db_lechuza";
  poolConfig.password = process.env.DB_PASSWORD || "password";
  poolConfig.port = Number(process.env.DB_PORT || 5432);
}

if (sslEnabled === "true" || sslEnabled === "require") {
  poolConfig.ssl = {
    rejectUnauthorized: String(process.env.DB_SSL_REJECT_UNAUTHORIZED || "false").toLowerCase() === "true"
  };
}

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  console.error("[DB Error]", error.message);
  if (!isVercel && !isRailway) {
    process.exit(-1);
  }
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

