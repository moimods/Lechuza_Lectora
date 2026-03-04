const API = async (endpoint, options = {}) => {

    const response = await fetch(`${APP_CONFIG.API_BASE}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error API");
    }

    return data;
};