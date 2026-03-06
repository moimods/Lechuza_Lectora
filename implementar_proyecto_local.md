# Guia rapida para usar el proyecto en otro dispositivo

## 1. Clonar el repositorio

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
