function getUsuarioActual() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

function requireAdminOrRedirect() {
  const usuario = getUsuarioActual();
  if (!usuario || usuario.rol !== "admin") {
    window.location.href = "/html/Inicio_de_sesion/Inicio_sesion.html";
    return null;
  }
  return usuario;
}
