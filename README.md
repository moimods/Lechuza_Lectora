# La Lechuza Lectora

Aplicación web con frontend estático en `public/` y backend Node.js + Express en `src/`.

## Estructura

```text
.
├─ public/                  # Sitio web estático (HTML, CSS, JS, imágenes)
├─ src/
│  ├─ app.js                # Configuración de Express
│  ├─ server.js             # Arranque del servidor
│  ├─ config/               # Configuración DB y MercadoPago
│  ├─ controllers/          # Lógica de negocio por módulo
│  ├─ routes/               # Rutas API organizadas por dominio
│  └─ middlewares/          # Manejo global de errores y 404
├─ db_lechuza.sql           # Script de base de datos
├─ index.js                 # Entrada raíz (redirige a src/server)
└─ package.json
```

## Scripts

- `npm start`: inicia servidor en producción.
- `npm run dev`: inicia servidor con `nodemon`.

## Variables de entorno

Usa `.env.example` como base y crea tu archivo `.env`.

Variables clave:
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `CORS_ORIGIN`
- `MP_ACCESS_TOKEN` (opcional para MercadoPago)

## Ejecución

1. Instala dependencias: `npm install`
2. Configura `.env`
3. Ejecuta: `npm run dev`
