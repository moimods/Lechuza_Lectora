/*****************************************************************
 * 🦉 API CLIENT - LA LECHUZA LECTORA
 * Cliente centralizado seguro
 *****************************************************************/

// =============================
// CONFIGURACIÓN BASE
// =============================
const API_BASE = "http://localhost:3000/api";

let csrfToken = null;

// =============================
// OBTENER CSRF TOKEN ⭐
// =============================
async function getCSRFToken() {

    if (csrfToken) return csrfToken;

    const response = await fetch(`${API_BASE}/csrf-token`, {
        credentials: "include"
    });

    const data = await response.json();
    csrfToken = data.csrfToken;

    return csrfToken;
}

// =============================
// FUNCIÓN CENTRAL API ⭐⭐⭐
// =============================
async function apiRequest(endpoint, options = {}) {

    try {

        // Obtener CSRF automáticamente
        const token = await getCSRFToken();

        const config = {
            method: "GET",
            credentials: "include", // 🔥 IMPORTANTE (cookies auth)
            headers: {
                "Content-Type": "application/json",
                "CSRF-Token": token
            },
            ...options
        };

        const response = await fetch(API_BASE + endpoint, config);

        // Intentar leer JSON seguro
        let data;
        try {
            data = await response.json();
        } catch {
            data = { error: "Respuesta inválida del servidor" };
        }

        // =============================
        // MANEJO GLOBAL ERRORES
        // =============================
        if (!response.ok) {

            // Sesión expirada
            if (response.status === 401) {
                alert("Sesión expirada. Inicia sesión nuevamente.");
                window.location.href = "/login.html";
                return;
            }

            throw new Error(data.error || "Error en la petición");
        }

        return data;

    } catch (error) {

        console.error("🚨 API Error:", error);

        alert(error.message || "Error de conexión con el servidor");

        throw error;
    }
}

// =============================
// HELPERS (OPCIONAL PERO PRO)
// =============================
const API = {

    get: (url) => apiRequest(url),

    post: (url, body) =>
        apiRequest(url, {
            method: "POST",
            body: JSON.stringify(body)
        }),

    put: (url, body) =>
        apiRequest(url, {
            method: "PUT",
            body: JSON.stringify(body)
        }),

    delete: (url) =>
        apiRequest(url, {
            method: "DELETE"
        })
};

// Export global (para HTML clásicos)
window.API = API;