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
            const data = await apiRequest("/api/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            if (data.success) {
                // Guardar usuario en localStorage
                localStorage.setItem("usuario", JSON.stringify(data.user));

                alert("Inicio de sesión exitoso");

                // Redirección según rol (opcional)
                if (data.user.rol === "admin") {
                    window.location.href = "/html/Admin/dashboard.html";
                } else {
                    window.location.href = "/html/Logeado/dashboard.html";
                }
            }

        } catch (error) {
            console.log("Error en login:", error.message);
        }
    });

});