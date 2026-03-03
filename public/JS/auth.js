// Verificar sesión
const usuario = localStorage.getItem("usuario");

if (!usuario) {
    window.location = "/index.html";
}

// obtener usuario
function getUsuario() {
    return JSON.parse(localStorage.getItem("usuario"));
}

// logout
function logout() {
    localStorage.removeItem("usuario");
    window.location = "/index.html";
}