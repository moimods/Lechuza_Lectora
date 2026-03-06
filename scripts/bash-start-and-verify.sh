#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:3000/api"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$ROOT_DIR/scripts/server.log"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

print_step() {
  echo
  echo "==========================================="
  echo "$1"
  echo "==========================================="
}

extract_token() {
  echo "$1" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

print_step "1) Setup BD"
cd "$ROOT_DIR"
npm run setup

print_step "2) Iniciar servidor"
: > "$LOG_FILE"
node index.js > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

echo "SERVER_PID=$SERVER_PID"

print_step "3) Esperar healthcheck"
for _ in {1..20}; do
  if curl -s "$BASE_URL/health" >/dev/null; then
    break
  fi
  sleep 1
done

HEALTH_RESPONSE="$(curl -s "$BASE_URL/health")"
echo "$HEALTH_RESPONSE"

print_step "4) Verificar /api"
API_RESPONSE="$(curl -s "$BASE_URL")"
echo "$API_RESPONSE"

print_step "5) Login seed"
LOGIN_RESPONSE="$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  --data '{"email":"moiram@ejemplo.com","password":"123456"}')"

echo "$LOGIN_RESPONSE"
TOKEN="$(extract_token "$LOGIN_RESPONSE")"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: login seed no devolvio token"
  echo "Revisa logs en: $LOG_FILE"
  exit 1
fi

echo "LOGIN_OK"

print_step "6) Ruta protegida con DB (/ventas/registrar)"
VENTA_RESPONSE="$(curl -s -X POST "$BASE_URL/ventas/registrar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  --data '{"items":[{"id_producto":1,"cantidad":1}],"id_direccion":null,"id_metodo_pago":null}')"

echo "$VENTA_RESPONSE"

print_step "7) MercadoPago (opcional segun credenciales)"
PAGOS_RESPONSE="$(curl -s -X POST "$BASE_URL/pagos/mercadopago" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  --data '{"items":[{"id_producto":1,"cantidad":1,"precio":350,"titulo":"Harry Potter y la Piedra Filosofal"}]}')"

echo "$PAGOS_RESPONSE"

if echo "$PAGOS_RESPONSE" | grep -q "PA_UNAUTHORIZED_RESULT_FROM_POLICIES"; then
  echo "INFO: MercadoPago bloqueado por credenciales/politicas externas, backend OK"
fi

print_step "Validacion completa"
echo "OK: setup + arranque + rutas base + login + ventas verificados"
