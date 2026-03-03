const { Pool } = require('pg');
require('dotenv').config(); // Esto carga las variables del .env

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE, // Aquí usará "La_lechuza"
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Esto nos avisará si la conexión es exitosa
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error de conexión:', err.stack);
  } else {
    console.log('Conexión establecida con la base de datos a las:', res.rows[0].now);
  }
});

module.exports = pool;