/*****************************************************************
 * 🦉 API CLIENT - LA LECHUZA LECTORA
 * Cliente centralizado con JWT y CSRF
 *****************************************************************/

// =============================
// CONFIGURACIÓN BASE
// =============================
const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "http://localhost:3000/api";
const TOKEN_KEY = "laLechuza_jwt_token";
const CART_OWNER_KEY = "laLechuza_cart_owner";
const CART_BACKUPS_KEY = "laLechuza_cart_backups";
const LOGIN_REMINDER_KEY = "laLechuza_login_reminder";
const SAVED_CREDENTIALS_KEY = "laLechuza_saved_credentials";
const SESSION_TIMEOUT_MS = Number((window.APP_CONFIG && window.APP_CONFIG.SESSION_TIMEOUT_MS) || (12 * 60 * 60 * 1000));

let csrfToken = null;
let sessionTimer = null;

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

function parseJwtPayload(token) {
  try {
    const base64Url = String(token || "").split(".")[1] || "";
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Eliminar JWT (logout)
 */
function eliminarToken() {
  localStorage.removeItem(TOKEN_KEY);
  csrfToken = null;

  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
}

/**
 * Verificar si hay sesión activa
 */
function tieneSesion() {
  return !!obtenerToken();
}

function hidratarUsuarioDesdeTokenLocal() {
  if (!tieneSesion()) return null;

  const usuarioLocal = localStorage.getItem("usuario");
  if (usuarioLocal) {
    try {
      return JSON.parse(usuarioLocal);
    } catch {
      localStorage.removeItem("usuario");
    }
  }

  const payload = parseJwtPayload(obtenerToken());
  if (!payload || typeof payload !== "object") return null;

  const usuario = {
    id_usuario: payload.id || payload.id_usuario || null,
    email: payload.email || "",
    rol: payload.rol || "cliente",
    nombre_completo: payload.nombre_completo || payload.nombre || "Usuario"
  };

  localStorage.setItem("usuario", JSON.stringify(usuario));
  localStorage.setItem("userId", String(usuario.id_usuario || ""));
  localStorage.setItem("userName", usuario.nombre_completo || "Usuario");
  localStorage.setItem("userRole", usuario.rol || "cliente");

  return usuario;
}

/**
 * Guarda un recordatorio de acceso sin almacenar contraseña real.
 */
function guardarRecordatorioLogin(email, password) {
  if (!email) return;

  const plain = String(password || "");
  const passwordHint = plain.length > 0 ? "*".repeat(Math.min(plain.length, 12)) : "(sin contraseña guardada)";

  localStorage.setItem(LOGIN_REMINDER_KEY, JSON.stringify({
    email: String(email).trim(),
    passwordHint,
    updatedAt: new Date().toISOString()
  }));
}

function obtenerRecordatorioLogin() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_REMINDER_KEY) || "null");
  } catch {
    return null;
  }
}

function limpiarRecordatorioLogin() {
  localStorage.removeItem(LOGIN_REMINDER_KEY);
}

function guardarCredenciales(email, password) {
  if (!email || !password) return;

  localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({
    email: String(email).trim(),
    password: String(password),
    updatedAt: new Date().toISOString()
  }));
}

function obtenerCredencialesGuardadas() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_CREDENTIALS_KEY) || "null");
  } catch {
    return null;
  }
}

function limpiarCredencialesGuardadas() {
  localStorage.removeItem(SAVED_CREDENTIALS_KEY);
}

function reiniciarTemporizadorSesion() {
  if (!tieneSesion()) return;

  if (sessionTimer) {
    clearTimeout(sessionTimer);
  }

  sessionTimer = setTimeout(() => {
    eliminarToken();
    alert("Tu sesión fue cerrada por inactividad.");
    window.location.href = "/html/Inicio_de_sesion/Inicio_sesion.html";
  }, SESSION_TIMEOUT_MS);
}

async function sincronizarDomicilioRegistro() {
  const rawTempAddress =
    sessionStorage.getItem("direccion_temporal") ||
    localStorage.getItem("direccion_temporal") ||
    "";

  let domicilio = "";

  if (rawTempAddress) {
    try {
      const parsed = JSON.parse(rawTempAddress);
      domicilio = String(parsed?.direccion || "").trim();
    } catch {
      domicilio = "";
    }
  }

  if (!domicilio) {
    const pendingAddress =
      sessionStorage.getItem("registro_domicilio_preferido") ||
      localStorage.getItem("registro_domicilio_preferido") ||
      "";
    domicilio = String(pendingAddress).trim();
  }

  if (!domicilio) return;

  const limpiarPendientesRegistro = () => {
    sessionStorage.removeItem("direccion_temporal");
    localStorage.removeItem("direccion_temporal");
    sessionStorage.removeItem("registro_domicilio_preferido");
    localStorage.removeItem("registro_domicilio_preferido");
  };

  try {
    const existing = await API.get("/usuario/direcciones");
    const direcciones = Array.isArray(existing?.data) ? existing.data : [];

    if (direcciones.length > 0) {
      const idPrincipal = direcciones[0]?.id_direccion;
      if (idPrincipal) {
        localStorage.setItem("id_direccion_pedido", String(idPrincipal));
      }
      limpiarPendientesRegistro();
      return;
    }

    const nuevaDireccion = {
      calle_numero: domicilio,
      colonia: "Sin especificar",
      codigo_postal: "00000",
      ciudad_estado: "Sin especificar",
      es_principal: true
    };

    const created = await API.post("/usuario/direcciones", nuevaDireccion);
    const idNueva = created?.data?.id_direccion;
    if (idNueva) {
      localStorage.setItem("id_direccion_pedido", String(idNueva));
    }

    limpiarPendientesRegistro();
  } catch (error) {
    console.warn("No se pudo sincronizar el domicilio de registro:", error?.message || error);
  }
}

function activarDestruccionSesionPorInactividad() {
  const events = ["click", "keydown", "mousemove", "touchstart", "scroll"];
  events.forEach((evt) => {
    window.addEventListener(evt, reiniciarTemporizadorSesion, { passive: true });
  });

  if (tieneSesion()) {
    reiniciarTemporizadorSesion();
  }
}

function limpiarCarritoSesion() {
  localStorage.removeItem("carrito");
  localStorage.removeItem("laLechuzaLectoraCart");
}

function leerCarritoActual() {
  try {
    const primary = JSON.parse(localStorage.getItem("carrito") || "[]");
    if (Array.isArray(primary) && primary.length > 0) return primary;
  } catch {
    // Ignorar parseo invalido y probar respaldo.
  }

  try {
    const legacy = JSON.parse(localStorage.getItem("laLechuzaLectoraCart") || "[]");
    if (Array.isArray(legacy)) return legacy;
  } catch {
    // Sin accion.
  }

  return [];
}

function escribirCarritoSesion(items) {
  const safeItems = Array.isArray(items) ? items : [];
  localStorage.setItem("carrito", JSON.stringify(safeItems));
  localStorage.setItem("laLechuzaLectoraCart", JSON.stringify(safeItems));
}

function leerBackupsCarrito() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_BACKUPS_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function guardarBackupsCarrito(backups) {
  const safeBackups = backups && typeof backups === "object" ? backups : {};
  localStorage.setItem(CART_BACKUPS_KEY, JSON.stringify(safeBackups));
}

function guardarCarritoDeOwner(ownerKey) {
  if (!ownerKey) return;
  const backups = leerBackupsCarrito();
  backups[ownerKey] = leerCarritoActual();
  guardarBackupsCarrito(backups);
}

function restaurarCarritoDeOwner(ownerKey) {
  if (!ownerKey) {
    limpiarCarritoSesion();
    return;
  }

  const backups = leerBackupsCarrito();
  const restored = backups[ownerKey];

  if (Array.isArray(restored) && restored.length > 0) {
    escribirCarritoSesion(restored);
    return;
  }

  limpiarCarritoSesion();
}

function construirCartOwner(usuario, fallbackEmail = "") {
  const userId = String(usuario?.id_usuario || usuario?.id || "").trim();
  if (userId) return `id:${userId}`;

  const email = String(usuario?.email || fallbackEmail || "").trim().toLowerCase();
  if (email) return `email:${email}`;

  return "";
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

    const path = String(window.location.pathname || "").toLowerCase();
    const isAuthPage =
      path.includes("inicio_sesion") ||
      path.includes("inicio-de-sesion") ||
      path.includes("login") ||
      path.includes("registro") ||
      path.includes("recuperacion");

    // MANEJO DE ERRORES
    if (!response.ok) {
      // Sesión expirada o no autorizado
      if (response.status === 401) {
        eliminarToken();
        console.warn("⚠️ Sesión expirada");
        
        // Solo redirigir si no estamos ya en una pantalla de autenticación.
        if (!isAuthPage) {
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
API.login = async (email, password, options = {}) => {
  const response = await API.post("/auth/login", { email, password });
  const token = response.token || response.data?.token;
  const usuario = response.usuario || response.data?.usuario || response.user || response.data?.user;
  const rememberCredentials = options.rememberCredentials;

  if (token) {
    const ownerAnterior = String(localStorage.getItem(CART_OWNER_KEY) || "");
    const ownerNuevo = construirCartOwner(usuario, email);

    if (ownerAnterior) {
      guardarCarritoDeOwner(ownerAnterior);
    }

    if (ownerNuevo) {
      restaurarCarritoDeOwner(ownerNuevo);
    } else if (ownerAnterior && ownerAnterior !== ownerNuevo) {
      limpiarCarritoSesion();
    }

    guardarToken(token);
    reiniciarTemporizadorSesion();

    if (ownerNuevo) {
      localStorage.setItem(CART_OWNER_KEY, ownerNuevo);
    }

    if (usuario && typeof usuario === "object") {
      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("userId", String(usuario.id_usuario || usuario.id || ""));
      localStorage.setItem("userName", usuario.nombre_completo || usuario.nombre || "Usuario");
      localStorage.setItem("userRole", usuario.rol || "cliente");
    }

    if (rememberCredentials === true) {
      guardarCredenciales(email, password);
    } else if (rememberCredentials === false) {
      limpiarCredencialesGuardadas();
    }

    await sincronizarDomicilioRegistro();
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
  const ownerActual = String(localStorage.getItem(CART_OWNER_KEY) || "");
  if (ownerActual) {
    guardarCarritoDeOwner(ownerActual);
  }

  try {
    await API.post("/auth/logout", {});
  } catch (error) {
    console.warn("Error en logout:", error);
  }
  eliminarToken();
  localStorage.removeItem(CART_OWNER_KEY);
};

API.tieneSesion = tieneSesion;
API.obtenerToken = obtenerToken;
API.guardarToken = guardarToken;
API.eliminarToken = eliminarToken;
API.guardarRecordatorioLogin = guardarRecordatorioLogin;
API.obtenerRecordatorioLogin = obtenerRecordatorioLogin;
API.limpiarRecordatorioLogin = limpiarRecordatorioLogin;
API.guardarCredenciales = guardarCredenciales;
API.obtenerCredencialesGuardadas = obtenerCredencialesGuardadas;
API.limpiarCredencialesGuardadas = limpiarCredencialesGuardadas;
API.reiniciarTemporizadorSesion = reiniciarTemporizadorSesion;
API.persistCartSnapshot = () => {
  const ownerActual = String(localStorage.getItem(CART_OWNER_KEY) || "");
  if (ownerActual) {
    guardarCarritoDeOwner(ownerActual);
  }
};

async function hidratarSesionDesdeToken() {
  if (!tieneSesion()) return;

  const usuarioLocal = localStorage.getItem("usuario");
  if (usuarioLocal) return;

  const usuarioLegacy = localStorage.getItem("usuario_logeado") || localStorage.getItem("usuarioCompleto");
  if (usuarioLegacy) {
    localStorage.setItem("usuario", usuarioLegacy);
    localStorage.removeItem("usuario_logeado");
    localStorage.removeItem("usuarioCompleto");
    return;
  }

  try {
    const response = await API.get("/usuario/perfil");
    const usuario = response && response.data ? response.data : null;

    if (!usuario || typeof usuario !== "object") return;

    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("userId", String(usuario.id_usuario || usuario.id || ""));
    localStorage.setItem("userName", usuario.nombre_completo || usuario.nombre || "Usuario");
    localStorage.setItem("userRole", usuario.rol || "cliente");
  } catch (error) {
    console.warn("No se pudo hidratar la sesión desde token:", error.message || error);
  }
}

API.hidratarSesionDesdeToken = hidratarSesionDesdeToken;
API.hidratarUsuarioDesdeTokenLocal = hidratarUsuarioDesdeTokenLocal;

API.requireSession = async (options = {}) => {
  const {
    redirectToLogin = true,
    loginPath = "/html/Inicio_de_sesion/Inicio_sesion.html",
    rememberCurrentPath = true
  } = options;

  if (tieneSesion()) {
    const usuarioRapido = hidratarUsuarioDesdeTokenLocal();
    if (usuarioRapido) return usuarioRapido;

    await hidratarSesionDesdeToken();
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      if (usuario) return usuario;
    } catch {
      // Sin accion: se maneja abajo con redireccion si aplica.
    }
  }

  if (redirectToLogin) {
    if (rememberCurrentPath) {
      const currentPath = `${window.location.pathname || ""}${window.location.search || ""}`;
      if (currentPath) {
        localStorage.setItem("postLoginRedirect", currentPath);
      }
    }
    alert("Tu sesión no es válida. Inicia sesión nuevamente.");
    window.location.href = loginPath;
  }

  return null;
};

window.appLogout = function appLogout(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  API.logout()
    .catch(() => {})
    .finally(() => {
      [
        "usuario",
        "usuario_logeado",
        "usuarioCompleto",
        "userId",
        "userName",
        "userRole",
        "laLechuza_cart_owner",
        "admin_session",
        "postLoginRedirect"
      ].forEach((key) => localStorage.removeItem(key));

      window.location.href = "/index.html";
    });

  return false;
};

// Export global para HTML clásicos
window.API = API;
window.apiRequest = apiRequest;

hidratarUsuarioDesdeTokenLocal();
activarDestruccionSesionPorInactividad();
hidratarSesionDesdeToken();

console.log("✅ API Client cargado correctamente");