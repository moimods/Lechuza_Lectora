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
        window.location.href = "/html/Inicio_de_sesion/Inicio_sesion.html";
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
        window.location.href = "/html/Logeado/Inicio_Logeado.html";
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
    const doRedirect = () => {
        [
            "usuario",
            "usuario_logeado",
            "usuarioCompleto",
            "userId",
            "userName",
            "userRole",
            "admin_session",
            "postLoginRedirect"
        ].forEach((key) => localStorage.removeItem(key));

        if (window.API && typeof window.API.eliminarToken === "function") {
            window.API.eliminarToken();
        }

        window.location.href = "/html/Inicio_de_sesion/Inicio_sesion.html";
    };

    if (window.API && typeof window.API.logout === "function") {
        window.API.logout().finally(doRedirect);
        return;
    }

    doRedirect();
}