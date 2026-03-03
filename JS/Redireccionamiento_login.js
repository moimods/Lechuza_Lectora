document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DE RUTAS ---
    const TO_CANCEL_URL = '../../index.html'; 
    const TO_SUCCESS_PAGE_URL = '../Logeado/Pagina_principal.html'; 
    const TO_REGISTER_URL = 'Registro.html'; 
    const TO_RECOVERY_URL = 'Recuperacion.html';
    const API_BASE_URL = 'http://localhost:3000/api';

    // Función de validación de formato
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Elementos del DOM
    const loginSubmitButton = document.querySelector('.btn-primary');
    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasena'); 

    if (loginSubmitButton) {
        loginSubmitButton.addEventListener('click', async (event) => {
            event.preventDefault(); 
            
            const email = correoInput ? correoInput.value.trim() : '';
            const password = contrasenaInput ? contrasenaInput.value.trim() : '';

            // 1. Validaciones básicas de cliente
            if (!email || !password) {
                alert("🦉 ¡Oye! La lechuza necesita tu correo y contraseña.");
                return;
            }
            if (!isValidEmail(email)) {
                alert("El formato del correo no parece ser de este nido. Verifica tu email.");
                return;
            }

            // Mostrar carga
            loginSubmitButton.disabled = true;
            loginSubmitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

            try {
                // --- LLAMADA REAL AL BACKEND ---
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (response.ok && data.success) {
                    // ✅ LOGIN EXITOSO - Guardamos datos del usuario
                    localStorage.setItem('userId', data.user.id_usuario);
                    localStorage.setItem('userName', data.user.nombre);
                    localStorage.setItem('userRole', data.user.rol);
                    localStorage.setItem('usuario', JSON.stringify(data.user)); // Para compatibilidad con Acciones_Admin.js

                    // Redirigir según el rol
                    if (data.user.rol === 'admin') {
                        window.location.href = '../../admin/panel';
                    } else {
                        window.location.href = TO_SUCCESS_PAGE_URL;
                    }
                } else {
                    // ❌ LOGIN FALLIDO
                    alert(data.error || "Credenciales incorrectas");
                    loginSubmitButton.disabled = false;
                    loginSubmitButton.innerHTML = 'Iniciar Sesión';
                }
            } catch (error) {
                console.error("Error en login:", error);
                alert("Error al conectar con el servidor. Intenta más tarde.");
                loginSubmitButton.disabled = false;
                loginSubmitButton.innerHTML = 'Iniciar Sesión';
            }
        });
    }

    // --- BOTONES DE NAVEGACIÓN ---

    // Cancelar / Volver
    const cancelButton = document.querySelector('.btn-cancel');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = TO_CANCEL_URL;
        });
    }

    // Ir a Registro
    const createAccountButton = document.querySelector('.btn-create-account');
    if (createAccountButton) {
        createAccountButton.addEventListener('click', () => {
            window.location.href = TO_REGISTER_URL; 
        });
    }

    // Recuperar Contraseña
    const forgotPasswordButton = document.querySelector('.btn-forgot-password');
    if (forgotPasswordButton) {
        forgotPasswordButton.addEventListener('click', () => {
            window.location.href = TO_RECOVERY_URL;
        });
    }
});