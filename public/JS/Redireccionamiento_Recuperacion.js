document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN DE RUTAS ---
    const TO_LOGIN_URL = 'Inicio_sesion.html'; 
    const TO_CHANGE_PASSWORD_URL = 'cambio_Contraseña.html'; 

    // Elementos del DOM
    const btnRegresar = document.getElementById('btn-regresar');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');
    const inputCorreo = document.getElementById('correo');

    // Función de validación (Reutilizada del login para consistencia)
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // --- LÓGICA DE BOTONES ---

    // 1. Regresar al Login
    if (btnRegresar) {
        btnRegresar.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = TO_LOGIN_URL;
        });
    }

    // 2. Enviar Código de Verificación
    if (btnEnviarCodigo) {
        btnEnviarCodigo.addEventListener('click', () => {
            const correo = inputCorreo ? inputCorreo.value.trim() : "";

            if (correo === "") {
                alert("🦉 ¡Oye! Necesito un correo para enviarte el código.");
                return;
            }

            if (!isValidEmail(correo)) {
                alert("Ese correo no parece ser válido en este nido.");
                return;
            }

            // Simulación de carga/envío
            btnEnviarCodigo.innerText = "Enviando...";
            btnEnviarCodigo.disabled = true;

            setTimeout(() => {
                alert("✨ Código enviado con éxito a: " + correo);
                btnEnviarCodigo.innerText = "Reenviar Código";
                btnEnviarCodigo.disabled = false;
                
                // Habilitamos el botón siguiente una vez enviado el código
                if (btnSiguiente) btnSiguiente.style.display = 'inline-block';
            }, 1500);
        });
    }

    // 3. Ir a Cambio de Contraseña (Siguiente)
    if (btnSiguiente) {
        // Opcional: Podrías ocultarlo inicialmente hasta que manden el código
        // btnSiguiente.style.display = 'none'; 

        btnSiguiente.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Verificación simple: ¿Hay algo en el campo de código?
            const codigoInput = document.getElementById('codigo-verificacion'); // Asegúrate de tener este ID en tu HTML
            if (codigoInput && codigoInput.value.trim() === "") {
                alert("Por favor, ingresa el código que te enviamos.");
                return;
            }

            window.location.href = TO_CHANGE_PASSWORD_URL;
        });
    }
});