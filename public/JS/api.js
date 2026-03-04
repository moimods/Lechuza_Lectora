const API_BASE = "";

// Función central para todas las peticiones
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(API_BASE + endpoint, {
            headers: {
                "Content-Type": "application/json"
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error en la petición");
        }

        return data;

    } catch (error) {
        console.error("API Error:", error.message);
        alert(error.message);
        throw error;
    }
}