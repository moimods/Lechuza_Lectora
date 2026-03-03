document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DE RUTAS ---
    const TO_CANCEL_URL = '../../index.html'; 
    const TO_SUCCESS_PAGE_URL = '../Logeado/Pagina_principal.html'; 
    const TO_REGISTER_URL = 'Registro.html'; 
    const TO_RECOVERY_URL = 'Recuperacion.html';

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

            // --- INTEGRACIÓN CON BACKEND (Simulación o Real) ---
            // IMPORTANTE: Aquí deberías hacer un fetch a tu API de Node.js
            /*
            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                
                if (response.ok) {
                    // Guardamos los datos que PayPal y el Carrito necesitarán después
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('userName', data.user.nombre);
                    window.location.href = TO_SUCCESS_PAGE_URL;
                } else {
                    alert(data.message || "Credenciales incorrectas");
                }
            } catch (error) {
                console.error("Error en login:", error);
            }
            */

            // POR AHORA (Simulación para que tus filtros y pago funcionen):
            console.log("Accediendo como usuario simulado...");
            localStorage.setItem('userId', '12345'); // ID Ficticio para pruebas
            localStorage.setItem('userName', 'Lector Afortunado');
            
            window.location.href = TO_SUCCESS_PAGE_URL;
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