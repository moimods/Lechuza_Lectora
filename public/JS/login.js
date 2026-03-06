// Esperar a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("formLogin");

    if (!form) {
        console.error("No se encontró el formulario con id 'formLogin'");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validación básica frontend
        if (!email || !password) {
            alert("Por favor completa todos los campos");
            return;
        }

        try {
            // Usar API.login que maneja JWT automáticamente
            const data = await API.login(email, password);

            if (data.ok) {
                // Guardar usuario en localStorage
                const usuario = data.usuario;
                localStorage.setItem("usuario", JSON.stringify(usuario));
                localStorage.setItem("usuario_logeado", JSON.stringify(usuario));
                localStorage.setItem("usuarioCompleto", JSON.stringify(usuario));
                localStorage.setItem("userId", String(usuario.id_usuario || ""));
                localStorage.setItem("userName", usuario.nombre_completo || "");
                localStorage.setItem("userRole", usuario.rol || "cliente");

                alert("Inicio de sesión exitoso");

                const redirectTo = localStorage.getItem("postLoginRedirect") || "/html/Logeado/Catalogo_Logeado.html";
                localStorage.removeItem("postLoginRedirect");

                // Redirección según rol
                if (usuario.rol === "admin") {
                    window.location.href = "/html/Admin/panel_de_admin.html";
                } else {
                    window.location.href = redirectTo;
                }
            } else {
                alert(data.error || "Error al iniciar sesión");
            }

        } catch (error) {
            console.error("Error en login:", error.message);
            alert(error.message || "Error de conexión");
        }
    });

});