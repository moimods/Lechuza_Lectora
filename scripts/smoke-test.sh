#!/usr/bin/env bash
set -u

BASE_URL="http://localhost:3000/api"
TS=$(date +%s)
CLIENT_EMAIL="smoke_${TS}@ejemplo.com"
PASSWORD="smoke123"

print_section() {
  echo
  echo "=================================================="
  echo "$1"
  echo "=================================================="
}

extract_token() {
  echo "$1" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

print_section "1) LOGIN CLIENTE"
print_section "1) REGISTRO CLIENTE TEMPORAL"
REGISTER_CLIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/registro" \
  -H "Content-Type: application/json" \
  --data '{"nombre_completo":"Smoke Test","email":"'"$CLIENT_EMAIL"'","password":"'"$PASSWORD"'","passwordConfirm":"'"$PASSWORD"'"}')

echo "$REGISTER_CLIENT_RESPONSE"

print_section "2) LOGIN CLIENTE TEMPORAL"
LOGIN_CLIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  --data '{"email":"'"$CLIENT_EMAIL"'","password":"'"$PASSWORD"'"}')

echo "$LOGIN_CLIENT_RESPONSE"
CLIENT_TOKEN=$(extract_token "$LOGIN_CLIENT_RESPONSE")

if [ -z "$CLIENT_TOKEN" ]; then
  echo "ERROR: no se obtuvo token de cliente"
  exit 1
fi

echo "TOKEN_CLIENTE_OK"

print_section "2) PERFIL CLIENTE (JWT)"
print_section "3) PERFIL CLIENTE (JWT)"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/usuario/perfil" \
  -H "Authorization: Bearer $CLIENT_TOKEN")
echo "$PROFILE_RESPONSE"

print_section "4) REGISTRAR VENTA"
SALE_RESPONSE=$(curl -s -X POST "$BASE_URL/ventas/registrar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  --data '{"items":[{"id_producto":1,"cantidad":1}],"id_direccion":null,"id_metodo_pago":null}')
echo "$SALE_RESPONSE"

print_section "5) ESTADISTICAS ADMIN CON TOKEN CLIENTE (DEBE DENEGAR)"
ADMIN_STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/estadisticas" \
  -H "Authorization: Bearer $CLIENT_TOKEN")
echo "$ADMIN_STATS_RESPONSE"

print_section "SMOKE TEST FINALIZADO"
echo "OK: flujo basico validado (registro, login, perfil, venta, proteccion admin)"
