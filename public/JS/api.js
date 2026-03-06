/*****************************************************************
 * 🦉 API CLIENT - LA LECHUZA LECTORA
 * Cliente centralizado con JWT y CSRF
 *****************************************************************/

// =============================
// CONFIGURACIÓN BASE
// =============================
const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "http://localhost:3000/api";
const TOKEN_KEY = "laLechuza_jwt_token";

let csrfToken = null;

// =============================
// GESTIÓN DE JWT
// =============================

/**
 * Guardar JWT en localStorage
 */
function guardarToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Obtener JWT de localStorage
 */
function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Eliminar JWT (logout)
 */
function eliminarToken() {
  localStorage.removeItem(TOKEN_KEY);
  csrfToken = null;
}

/**
 * Verificar si hay sesión activa
 */
function tieneSesion() {
  return !!obtenerToken();
}

// =============================
// OBTENER CSRF TOKEN
// =============================
async function getCSRFToken() {
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch(`${API_BASE}/csrf-token`, {
      credentials: "include"
    });

    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.warn("⚠️ No se pudo obtener CSRF token:", error);
    return null;
  }
}

// =============================
// FUNCIÓN CENTRAL API
// =============================
async function apiRequest(endpoint, options = {}) {
  try {
    // Obtener headers base
    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };

    // Agregar JWT si existe
    const token = obtenerToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Agregar CSRF token si está disponible
    const csrf = await getCSRFToken();
    if (csrf) {
      headers["CSRF-Token"] = csrf;
    }

    // Configurar petición
    const config = {
      method: "GET",
      credentials: "include",
      headers,
      ...options
    };

    // Realizar petición
    const response = await fetch(API_BASE + endpoint, config);

    // Intenta leer JSON de respuesta
    let data;
    try {
      data = await response.json();
    } catch {
      data = { error: "Respuesta inválida del servidor" };
    }

    // MANEJO DE ERRORES
    if (!response.ok) {
      // Sesión expirada o no autorizado
      if (response.status === 401) {
        eliminarToken();
        console.warn("⚠️ Sesión expirada");
        
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes("login") && 
            !window.location.pathname.includes("registro")) {
          alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
          window.location.href = "/html/Inicio_de_sesion/Inicio_sesion.html";
        }
        throw new Error("No autorizado");
      }

      // Acceso denegado (forbidden)
      if (response.status === 403) {
        throw new Error("No tienes permiso para acceder a este recurso");
      }

      // Recurso no encontrado
      if (response.status === 404) {
        throw new Error("Recurso no encontrado");
      }

      // Erro de validación
      if (response.status === 400) {
        const errorMsg = data.error || data.details?.join(", ") || "Error de validación";
        throw new Error(errorMsg);
      }

      // Error del servidor
      if (response.status >= 500) {
        throw new Error("Error del servidor. Por favor intenta más tarde.");
      }

      throw new Error(data.error || "Error en la petición");
    }

    const normalized = (data && typeof data === "object") ? { ...data } : { data };

    // Compatibilidad entre respuestas antiguas (success) y nuevas (ok)
    if (normalized.ok === undefined && normalized.success !== undefined) {
      normalized.ok = Boolean(normalized.success);
    }
    if (normalized.success === undefined && normalized.ok !== undefined) {
      normalized.success = Boolean(normalized.ok);
    }

    // Compatibilidad para token/usuario en raíz o dentro de data
    if (normalized.data && typeof normalized.data === "object") {
      if (normalized.token === undefined && normalized.data.token !== undefined) {
        normalized.token = normalized.data.token;
      }
      if (normalized.usuario === undefined && normalized.data.usuario !== undefined) {
        normalized.usuario = normalized.data.usuario;
      }
      if (normalized.user === undefined && normalized.data.user !== undefined) {
        normalized.user = normalized.data.user;
      }
    }

    return normalized;
  } catch (error) {
    console.error("🚨 API Error:", error);
    throw error;
  }
}

// =============================
// HELPERS DE MÉTODOS HTTP
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

  patch: (url, body) =>
    apiRequest(url, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),

  delete: (url) =>
    apiRequest(url, {
      method: "DELETE"
    })
};

// =============================
// HELPERS ESPECÍFICOS
// =============================

/**
 * Login - Guarda JWT automáticamente
 */
API.login = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  const token = response.token || response.data?.token;
  const usuario = response.usuario || response.data?.usuario || response.user || response.data?.user;

  if (token) {
    guardarToken(token);
  }

  return {
    ...response,
    token,
    usuario
  };
};

/**
 * Logout - Elimina JWT
 */
API.logout = async () => {
  try {
    await API.post("/auth/logout", {});
  } catch (error) {
    console.warn("Error en logout:", error);
  }
  eliminarToken();
};

API.tieneSesion = tieneSesion;
API.obtenerToken = obtenerToken;
API.guardarToken = guardarToken;
API.eliminarToken = eliminarToken;

// Export global para HTML clásicos
window.API = API;
window.apiRequest = apiRequest;

console.log("✅ API Client cargado correctamente");