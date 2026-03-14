param(
  [string]$BaseUrl = "http://localhost:3000/api"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Prueba de recuperacion de contraseña ===" -ForegroundColor Cyan
Write-Host "API Base: $BaseUrl"

$email = Read-Host "Correo del usuario"
if ([string]::IsNullOrWhiteSpace($email)) {
  throw "Debes indicar un correo."
}

Write-Host "`n1) Enviando codigo..." -ForegroundColor Yellow
$sendBody = @{
  email = $email
  purpose = "password-recovery"
} | ConvertTo-Json

$sendResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/enviar-codigo" -ContentType "application/json" -Body $sendBody
$sendResp | ConvertTo-Json -Depth 8

$devCode = $null
if ($sendResp.data -and $sendResp.data.devCode) {
  $devCode = [string]$sendResp.data.devCode
  Write-Host "Codigo de desarrollo detectado: $devCode" -ForegroundColor Green
}

$codigo = $null
if ($devCode) {
  $useDevCode = Read-Host "Usar devCode automaticamente? (s/n)"
  if ($useDevCode -match "^(s|S|y|Y)$") {
    $codigo = $devCode
  }
}

if (-not $codigo) {
  $codigo = Read-Host "Codigo recibido por correo (6 digitos)"
}

if ([string]::IsNullOrWhiteSpace($codigo)) {
  throw "Debes indicar un codigo."
}

Write-Host "`n2) Verificando codigo..." -ForegroundColor Yellow
$verifyBody = @{
  email = $email
  code = $codigo
  purpose = "password-recovery"
} | ConvertTo-Json

$verifyResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/verificar-codigo" -ContentType "application/json" -Body $verifyBody
$verifyResp | ConvertTo-Json -Depth 8

$newPassword = Read-Host "Nueva contraseña (6-10 chars, 1 numero, 1 especial)"
$confirmPassword = Read-Host "Confirmar nueva contraseña"

if ($newPassword -ne $confirmPassword) {
  throw "La confirmacion no coincide."
}

Write-Host "`n3) Restableciendo contraseña..." -ForegroundColor Yellow
$resetBody = @{
  email = $email
  code = $codigo
  passwordNueva = $newPassword
  passwordConfirm = $confirmPassword
} | ConvertTo-Json

$resetResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/recuperar-password" -ContentType "application/json" -Body $resetBody
$resetResp | ConvertTo-Json -Depth 8

Write-Host "`nFlujo completado. Ahora prueba login con la nueva contraseña." -ForegroundColor Green
