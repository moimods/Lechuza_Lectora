
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
	- healthcheck: `/api/health`
	- reinicio automatico en fallo
- `src/app.js` optimizado para produccion:
	- `trust proxy` habilitado
	- compresion HTTP (`compression`)
	- CORS con lista de dominios separada por comas
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

### 5. Configuracion de red en Railway

1. En `Settings -> Networking`, genera dominio publico si aun no existe.
2. Copia ese dominio y actualiza:
	 - `APP_BASE_URL`
	 - `CORS_ORIGIN`

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
