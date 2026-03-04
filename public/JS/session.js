// ================================================
// OBTENER USUARIO ACTUAL
// ================================================
function getUsuario() {
    return JSON.parse(localStorage.getItem("usuario"));
}

// ================================================
// VERIFICAR SESIÓN
// Redirige si no hay usuario logueado
// ================================================
function verificarSesion() {
    const usuario = getUsuario();

    if (!usuario) {
        alert("Debes iniciar sesión");
        window.location.href = "/html/Inicio_de_sesion/login.html";
    }

    return usuario;
}

// ================================================
// PROTEGER PÁGINAS SOLO ADMIN (opcional)
// ================================================
function verificarAdmin() {
    const usuario = verificarSesion();

    if (usuario.rol !== "admin") {
        alert("No tienes permisos para acceder aquí");
        window.location.href = "/html/Logeado/dashboard.html";
    }
}

// ================================================
// MOSTRAR NOMBRE DEL USUARIO EN PÁGINA
// (si tienes un elemento con id="nombreUsuario")
// ================================================
function mostrarUsuario() {
    const usuario = getUsuario();

    if (usuario) {
        const elemento = document.getElementById("nombreUsuario");
        if (elemento) {
            elemento.textContent = usuario.nombre;
        }
    }
}

// ================================================
// CERRAR SESIÓN
// ================================================
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "/html/Inicio_de_sesion/login.html";
}