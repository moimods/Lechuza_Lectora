const { Pool } = require("pg");

const isVercel = Boolean(process.env.VERCEL);
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const sslEnabled = String(process.env.DB_SSL || process.env.PGSSLMODE || (isRailway ? "false" : "false")).toLowerCase();
const databaseUrl = String(process.env.DATABASE_URL || "").trim();

const poolConfig = {
  max: Number(process.env.DB_POOL_MAX || ((isVercel || isRailway) ? 3 : 10)),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS || 5000)
};

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL no definida. En Railway crea una Variable Reference: DATABASE_URL -> Postgres.DATABASE_URL"
  );
}

poolConfig.connectionString = databaseUrl;

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
  try {
    const parsed = new URL(databaseUrl);
    console.log(`✅ Conectado a PostgreSQL (${parsed.hostname}:${parsed.port || "5432"})`);
  } catch {
    console.log("✅ Conectado a PostgreSQL");
  }
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

