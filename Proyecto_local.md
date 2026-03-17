
## 1. Clonar el repo

```bash
git clone https://github.com/moimods/Lechuza_Lectora.git
cd Lechuza_Lectora
```

## 2. Instalar dependencias

```bash
npm install
```


Si estas en PowerShell y falla `npm` por politica de scripts, usa una de estas opciones:

- Abrir `cmd` o Git Bash y correr `npm install` / `npm run dev`
- O habilitar scripts en PowerShell (como administrador):

```powershell
Set-ExecutionPolicy RemoteSigned
```

## 3. Configurar variables de entorno

Crea el archivo `.env` (puedes copiar `.env.example`) y usa algo como:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=db_lechuza
DB_PASSWORD=TU_PASSWORD
DB_PORT=5432

PORT=3000
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=lechuza_access_secret
JWT_REFRESH_SECRET=lechuza_refresh_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
NODE_ENV=development
JWT_EXPIRES=2h

MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxx
PAYMENT_PROVIDER=mercadopago
```

## 4. Crear la base de datos local

En PostgreSQL, crea la base `db_lechuza` y ejecuta:

```bash
psql -U postgres -d db_lechuza -f db_lechuza.sql
psql -U postgres -d db_lechuza -f db_lechuza_indices.sql
```

## 5. Levantar el proyecto

```bash
npm run dev
```

Backend esperado:
- API: `http://localhost:3000/api`
- Frontend: `http://localhost:3000`

## 6. Prueba minima

1. Abrir `http://localhost:3000`
2. Iniciar sesion con:
- `moiram@ejemplo.com`
- password: `123456`
3. Verificar que cargue catalogo (`/api/productos`)

## 7. Subir cambios al repositorio

```bash
git add .
git commit -m "docs: agrega guia local de instalacion"
git push origin main
```

Si usas otra rama:

```bash
git checkout -b mi-rama
git push -u origin mi-rama
```

## Recomendaciones antes de subir

- No subir `.env`
- Verificar que `.gitignore` incluya `node_modules/` y `.env`
- Ejecutar una prueba rapida de login y productos

## Despliegue en Vercel

### 1. Preparacion ya incluida en este repo

- `vercel.json`: enruta todo el trafico a `api/index.js`.
- `api/index.js`: entrypoint serverless que carga tu app Express.
- `src/config/db.js`: compatible con `DATABASE_URL` y SSL para produccion.

### 2. Crear proyecto en Vercel

1. Entra a Vercel y conecta tu repositorio GitHub.
2. Framework preset: `Other`.
3. Root directory: deja la raiz del repositorio.
4. Build command: vacio (no aplica build frontend separado).
5. Output directory: vacio.

### 3. Variables de entorno en Vercel (Project Settings -> Environment Variables)

Configura como minimo:

```env
NODE_ENV=production
CORS_ORIGIN=https://TU_DOMINIO_VERCEL.vercel.app

JWT_SECRET=tu_jwt_secret_fuerte
JWT_REFRESH_SECRET=tu_refresh_secret_fuerte
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
JWT_EXPIRES=2h

# Base URL publica del proyecto
APP_BASE_URL=https://TU_DOMINIO_VERCEL.vercel.app

# PostgreSQL (recomendado usar DATABASE_URL)
DATABASE_URL=postgresql://usuario:password@host:5432/dbname
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=3

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx
PAYMENT_PROVIDER=mercadopago

# SMTP (recuperacion por correo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM="La Lechuza Lectora <tu_correo@gmail.com>"
```

### 3.1 Plantillas listas por proveedor de base de datos

Usa una sola plantilla segun tu proveedor. En todos los casos, reemplaza `TU_DOMINIO_VERCEL`.

#### Opcion A: Neon (recomendada)

```env
NODE_ENV=production
CORS_ORIGIN=https://TU_DOMINIO_VERCEL.vercel.app
APP_BASE_URL=https://TU_DOMINIO_VERCEL.vercel.app

JWT_SECRET=pon_un_secret_largo_y_unico
JWT_REFRESH_SECRET=pon_otro_secret_largo_y_unico
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
JWT_EXPIRES=2h

DATABASE_URL=postgresql://usuario:password@ep-xxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=3

MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxx
PAYMENT_PROVIDER=mercadopago

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM="La Lechuza Lectora <tu_correo@gmail.com>"
```

#### Opcion B: Supabase Postgres

```env
NODE_ENV=production
CORS_ORIGIN=https://TU_DOMINIO_VERCEL.vercel.app
APP_BASE_URL=https://TU_DOMINIO_VERCEL.vercel.app

JWT_SECRET=pon_un_secret_largo_y_unico
JWT_REFRESH_SECRET=pon_otro_secret_largo_y_unico
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
JWT_EXPIRES=2h

DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=3

MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxx
PAYMENT_PROVIDER=mercadopago

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM="La Lechuza Lectora <tu_correo@gmail.com>"
```

#### Opcion C: Railway Postgres

```env
NODE_ENV=production
CORS_ORIGIN=https://TU_DOMINIO_VERCEL.vercel.app
APP_BASE_URL=https://TU_DOMINIO_VERCEL.vercel.app

JWT_SECRET=pon_un_secret_largo_y_unico
JWT_REFRESH_SECRET=pon_otro_secret_largo_y_unico
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
JWT_EXPIRES=2h

DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=3

MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxx
PAYMENT_PROVIDER=mercadopago

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM="La Lechuza Lectora <tu_correo@gmail.com>"
```

Nota:
`DB_SSL_REJECT_UNAUTHORIZED=false` suele ser necesario en serverless con certificados gestionados. Si tu proveedor entrega CA valida y verificable, puedes subirlo a `true`.

### 4. Base de datos

- Vercel NO incluye PostgreSQL automaticamente.
- Usa Neon, Supabase, Render Postgres, Railway u otro proveedor.
- Importa tus scripts SQL (`db_lechuza.sql` y `db_lechuza_indices.sql`) en esa base.

### 5. Verificaciones despues de desplegar

1. `https://TU_DOMINIO/api/health` debe responder `ok: true`.
2. `https://TU_DOMINIO/api/payments/health` debe indicar Mercado Pago configurado.
3. Abre `https://TU_DOMINIO/` y prueba login, catalogo y checkout.

### 6. Webhook de Mercado Pago

En Mercado Pago configura esta URL de webhook:

```text
https://TU_DOMINIO_VERCEL.vercel.app/api/payments/webhook
```

### 7. Comandos utiles

```bash
# instalar CLI (opcional)
npm i -g vercel

# despliegue manual desde local
vercel

# produccion
vercel --prod
```

## Despliegue en Railway (Recomendado para este proyecto)

### 1. Preparacion ya aplicada al repo

- `railway.json` configurado con:
	- start command: `npm run start:railway`
	- healthcheck: `/health`
	- timeout de healthcheck: `300s`
	- reinicio automatico en fallo
- `src/app.js` optimizado para produccion:
	- `trust proxy` habilitado
	- compresion HTTP (`compression`)
	- CORS con lista de dominios separada por comas
	- endpoint `GET /health` con verificacion de BD
- `src/config/db.js` compatible con `DATABASE_URL` y SSL.

### 2. Crear el proyecto en Railway

1. Entra a Railway y crea `New Project`.
2. Selecciona `Deploy from GitHub repo` y elige este repositorio.
3. Railway detectara Node.js automaticamente (Nixpacks).

### 3. Agregar PostgreSQL en Railway

1. En el mismo proyecto, agrega `New -> Database -> PostgreSQL`.
2. Railway inyecta `DATABASE_URL` automaticamente al servicio.
3. Importa estructura SQL en esa base:
	 - `db_lechuza.sql`
	 - `db_lechuza_indices.sql`

### 4. Variables de entorno en Railway (Service -> Variables)

Configura estas variables (ademas de `DATABASE_URL`):

```env
NODE_ENV=production

# Dominio publico de Railway (te lo da Railway tras deploy)
APP_BASE_URL=https://TU_SERVICIO.up.railway.app

# Puedes poner uno o varios dominios separados por coma
CORS_ORIGIN=https://TU_SERVICIO.up.railway.app,https://www.tu-dominio.com

JWT_SECRET=pon_un_secret_largo_y_unico
JWT_REFRESH_SECRET=pon_otro_secret_largo_y_unico
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
JWT_EXPIRES=2h

# DB SSL para proveedores cloud
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=3

MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxx
PAYMENT_PROVIDER=mercadopago

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM="La Lechuza Lectora <tu_correo@gmail.com>"
```

### 4.1 Bloque exacto para pegar en Railway

Pega este bloque en `Service -> Variables` y reemplaza solo los valores de ejemplo:

```env
NODE_ENV=production
PORT=3000

APP_BASE_URL=https://TU_SERVICIO.up.railway.app
CORS_ORIGIN=https://TU_SERVICIO.up.railway.app

JWT_SECRET=CAMBIA_ESTE_SECRET_POR_UNO_LARGO_Y_UNICO
JWT_REFRESH_SECRET=CAMBIA_ESTE_REFRESH_SECRET_POR_UNO_LARGO_Y_UNICO
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
JWT_EXPIRES=2h

# Railway Postgres (usar Variable Reference)
# DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_URL=postgresql://usuario:password@host:5432/dbname
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=3

MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx
PAYMENT_PROVIDER=mercadopago

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM="La Lechuza Lectora <tu_correo@gmail.com>"
```

Notas rapidas:

- `PORT` debe existir y tu app ya escucha en `process.env.PORT` + `0.0.0.0`.
- Si usas dominio propio, agrega ese dominio tambien en `CORS_ORIGIN` separado por coma.
- En Railway, usa referencia `DATABASE_URL -> Postgres.DATABASE_URL`.
- No pegues credenciales de DB manualmente cuando tengas Variable Reference disponible.

### 4.2 Checklist operativo (60 segundos) post-deploy

Usa este orden despues de cada despliegue en Railway:

1. Health principal (debe dar 200):

```text
https://TU_SERVICIO.up.railway.app/health
```

2. Health API + DB (debe dar `ok: true` y `database: up`):

```text
https://TU_SERVICIO.up.railway.app/api/health
```

3. Health pagos (debe indicar Mercado Pago configurado):

```text
https://TU_SERVICIO.up.railway.app/api/payments/health
```

4. Frontend carga:

```text
https://TU_SERVICIO.up.railway.app/
```

5. Login de usuario:

- Inicia sesion normal.
- Verifica que cargue catalogo y no haya error CORS en consola.

6. Checkout rapido:

- Entra a pago y confirma que redirige a Mercado Pago.

7. Recuperacion por correo:

- Solicita codigo en `Recuperacion.html`.
- Confirma recepcion del correo y restablece contraseña.

8. Webhook Mercado Pago:

- Verifica en dashboard de Mercado Pago que webhook apunta a:

```text
https://TU_SERVICIO.up.railway.app/api/payments/webhook
```

Si falla algo, revisa en este orden:

1. Variables (`APP_BASE_URL`, `CORS_ORIGIN`, `DATABASE_URL`, `MP_ACCESS_TOKEN`, `SMTP_*`).
2. Dominio activo de Railway.
3. Logs del servicio en Railway (`Deployments -> View Logs`).

### 4.3 Pre-flight automatico antes de push/deploy

Comando:

```bash
npm run preflight:railway
```

Que valida automaticamente:

- script `start` y `start:railway`
- `server.js` raiz
- `railway.json` con `healthcheckPath=/health`
- variables requeridas: `MP_ACCESS_TOKEN`, `APP_BASE_URL`, `DATABASE_URL`, `JWT_SECRET`
- respuesta local de `http://localhost:PORT/health`

Nota:

- Si usas PowerShell y falla `npm`, ejecuta:

```powershell
cmd /c npm run preflight:railway
```

## Estructura recomendada (evolucion)

Para mantener el proyecto ordenado a mediano plazo en Railway/Node, esta es la estructura recomendada:

```text
Lechuza_Lectora
|
|-- backend
|   |-- server.js
|   |-- routes
|   |-- controllers
|   |-- config
|
|-- public
|   |-- html
|   |-- css
|   |-- js
|
|-- package.json
|-- railway.json
```

Nota:

- La estructura actual ya funciona en Railway.
- Esta estructura se recomienda como refactor futuro para separar backend/frontend con claridad.

### 5. Configuracion de red en Railway

1. En `Settings -> Networking`, genera dominio publico si aun no existe.
2. Copia ese dominio y actualiza:
	 - `APP_BASE_URL`
	 - `CORS_ORIGIN`

### 5.1 Reglas clave de Healthcheck (Railway)

1. Tu app debe escuchar SIEMPRE en la variable `PORT` inyectada por Railway.
2. El endpoint `/health` debe responder HTTP `200` solo cuando la app esta lista.
3. Si tienes validacion de host estricta, permite `healthcheck.railway.app`.
4. Si necesitas mas tiempo de arranque, puedes aumentar:
	- en UI de Railway, o
	- con variable `RAILWAY_HEALTHCHECK_TIMEOUT_SEC`.

### 6. Webhook de Mercado Pago (obligatorio)

Configura en Mercado Pago:

```text
https://TU_SERVICIO.up.railway.app/api/payments/webhook
```

### 7. Verificacion post-deploy

1. `https://TU_SERVICIO.up.railway.app/api/health` -> debe responder `ok: true`.
2. `https://TU_SERVICIO.up.railway.app/api/payments/health` -> Mercado Pago listo/configurado.
3. Abre `https://TU_SERVICIO.up.railway.app/`.
4. Prueba login, catalogo, carrito y flujo de pago.
5. Prueba recuperacion de contraseña por correo.

### 8. Troubleshooting rapido

- Si responde 503 en `/api/health`: revisa `DATABASE_URL` y estado de Postgres en Railway.
- Si falla CORS: valida `CORS_ORIGIN` exacto (incluye `https://`).
- Si no manda correos: revisa `SMTP_*` y usa app password en Gmail.
- Si falla retorno de pago: valida `APP_BASE_URL` y webhook en Mercado Pago.

#### Error comun: `connect ECONNREFUSED ::1:5432`

Este error significa que la app intento conectar a `localhost` dentro del contenedor porque no encontro `DATABASE_URL` en Railway.

Solucion:

1. En Railway, agrega un servicio PostgreSQL en el mismo proyecto.
2. En el servicio API, crea variable `DATABASE_URL` usando referencia al Postgres del proyecto.
3. Redeploy del servicio API.

Validacion:

- `https://TU_SERVICIO.up.railway.app/health` -> `{"status":"ok"}`
- `https://TU_SERVICIO.up.railway.app/api/health` -> `ok: true` y `database: up`
