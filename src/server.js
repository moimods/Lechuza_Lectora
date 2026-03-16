require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

async function iniciarServidor() {
  try {
    // Verificar conexión a BD
    const conexionOk = await pool.verificarConexion();
    
    if (!conexionOk) {
      console.error("❌ No se pudo conectar a la base de datos");
      process.exit(1);
    }

    app.listen(PORT, HOST, () => {
      console.log(`

LA LECHUZA LECTORA 

WEB URL: http://localhost:${PORT}
API URL: http://localhost:${PORT}/api

Ambiente: ${process.env.NODE_ENV || "development"}
BD: ${process.env.DB_NAME || "db_lechuza"}
JWT Secret: ${process.env.JWT_SECRET ? "Configurado" : "NO CONFIGURADO"}

      `);
    });
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error.message);
    process.exit(1);
  }
}

iniciarServidor();

