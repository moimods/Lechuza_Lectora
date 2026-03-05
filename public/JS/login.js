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
            const data = await apiRequest("/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            if (data.success) {
                // Guardar usuario en localStorage
                localStorage.setItem("usuario", JSON.stringify(data.user));
                localStorage.setItem("usuario_logeado", JSON.stringify(data.user));
                localStorage.setItem("usuarioCompleto", JSON.stringify(data.user));
                localStorage.setItem("userId", String(data.user.id_usuario || ""));
                localStorage.setItem("userName", data.user.nombre || "");
                localStorage.setItem("userRole", data.user.rol || "cliente");

                alert("Inicio de sesión exitoso");

                const redirectTo = localStorage.getItem("postLoginRedirect") || "/html/Logeado/Catalogo_Logeado.html";
                localStorage.removeItem("postLoginRedirect");

                // Redirección según rol (opcional)
                if (data.user.rol === "admin") {
                    window.location.href = "/html/Admin/panel_de_admin.html";
                } else {
                    window.location.href = redirectTo;
                }
            }

        } catch (error) {
            console.log("Error en login:", error.message);
        }
    });

});