#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

require("dotenv").config();

const root = process.cwd();

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

async function checkHealth(port) {
  const url = `http://localhost:${port}/health`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      fail(`Healthcheck local falló en ${url} (status ${response.status}).`);
      return;
    }

    const body = await response.json().catch(() => ({}));
    if (body && body.status !== "ok") {
      warn(`Healthcheck respondió 200 pero status="${String(body.status || "(vacío)")}".`);
    }

    ok(`Healthcheck local OK en ${url}`);
  } catch (error) {
    fail(`No se pudo consultar ${url}. ¿El servidor está corriendo? (${error.message})`);
  }
}

async function main() {
  console.log("\n=== Pre-flight Railway ===");

  const packageJsonPath = path.join(root, "package.json");
  const railwayJsonPath = path.join(root, "railway.json");
  const serverRootPath = path.join(root, "server.js");

  if (!exists(packageJsonPath)) {
    fail("No existe package.json en la raíz del proyecto.");
    process.exit(process.exitCode || 1);
  }

  const pkg = readJson(packageJsonPath);
  const scripts = pkg.scripts || {};

  if (!scripts.start) {
    fail("Falta script npm 'start'.");
  } else {
    ok(`Script start detectado: ${scripts.start}`);
  }

  if (!scripts["start:railway"]) {
    fail("Falta script npm 'start:railway'.");
  } else {
    ok(`Script start:railway detectado: ${scripts["start:railway"]}`);
  }

  if (!exists(serverRootPath)) {
    fail("No existe server.js en la raíz (entrypoint recomendado para Railway).");
  } else {
    ok("server.js raíz detectado.");
  }

  if (!exists(railwayJsonPath)) {
    fail("No existe railway.json en la raíz.");
  } else {
    const railway = readJson(railwayJsonPath);
    const healthPath = railway?.deploy?.healthcheckPath;
    const startCommand = railway?.deploy?.startCommand;

    if (healthPath !== "/health") {
      fail(`railway.json debe usar deploy.healthcheckPath='/health' (actual: '${String(healthPath)}').`);
    } else {
      ok("railway.json healthcheckPath='/health'.");
    }

    if (!startCommand || !String(startCommand).includes("start:railway")) {
      fail(`railway.json startCommand debería apuntar a start:railway (actual: '${String(startCommand)}').`);
    } else {
      ok(`railway.json startCommand detectado: ${startCommand}`);
    }
  }

  const requiredEnv = ["MP_ACCESS_TOKEN", "APP_BASE_URL", "DATABASE_URL", "JWT_SECRET"];
  const missing = requiredEnv.filter((key) => !String(process.env[key] || "").trim());

  if (missing.length) {
    fail(`Faltan variables requeridas para Railway: ${missing.join(", ")}`);
  } else {
    ok("Variables requeridas detectadas (MP_ACCESS_TOKEN, APP_BASE_URL, DATABASE_URL, JWT_SECRET).");
  }

  const port = Number(process.env.PORT || 3000);
  await checkHealth(port);

  if (process.exitCode) {
    console.error("\nPre-flight Railway: FALLÓ");
    process.exit(process.exitCode);
  }

  console.log("\nPre-flight Railway: OK");
}

main().catch((error) => {
  fail(`Error inesperado en pre-flight: ${error.message}`);
  process.exit(process.exitCode || 1);
});
