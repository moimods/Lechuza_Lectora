document.addEventListener('DOMContentLoaded', () => {
    let currentCaptcha = '';
    const captchaDisplay = document.getElementById('captcha-display');
    const captchaInput = document.getElementById('captcha-input');
    const refreshBtn = document.getElementById('captcha-refresh');

    // --- MEJORA: LÓGICA DE CAPTCHA ROBUSTA ---
    function displayNewCaptcha() {
        if (!captchaDisplay) return;

        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        captchaDisplay.innerHTML = ''; // Limpiamos el contenedor

        for (let i = 0; i < 6; i++) {
            const char = characters.charAt(Math.floor(Math.random() * characters.length));
            result += char;

            // Creamos un span por cada letra para aplicar distorsión individual
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.transform = `rotate(${Math.floor(Math.random() * 30) - 15}deg)`; // Rotación aleatoria
            span.style.margin = '0 3px';
            span.style.fontSize = `${Math.floor(Math.random() * 10) + 20}px`; // Tamaños variados
            span.style.userSelect = 'none'; // Evita que se pueda copiar y pegar
            
            captchaDisplay.appendChild(span);
        }

        currentCaptcha = result;
        if (captchaInput) captchaInput.value = ''; // Limpiar el input al refrescar
        console.log("Nuevo CAPTCHA generado");
    }

    // Botón de refresco
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            displayNewCaptcha();
        });
    }

    // --- INTEGRACIÓN EN TU VALIDACIÓN DE FORMULARIO ---
    const registrationForm = document.getElementById('registrationForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
            // ... (Tus otras validaciones de email, teléfono, edad y password) ...

            // VALIDACIÓN DEL CAPTCHA
            const userValue = captchaInput.value.trim().toUpperCase();
            
            if (userValue !== currentCaptcha) {
                event.preventDefault(); // Detener envío
                alert("🦉 El código CAPTCHA no coincide. Inténtalo de nuevo.");
                
                // Efecto visual de error
                captchaInput.style.borderColor = 'red';
                displayNewCaptcha(); // Cambiar el código inmediatamente
                return;
            }

            // Si pasa todas las validaciones, el formulario se envía o muestra el modal
            console.log("CAPTCHA válido. Procesando registro...");
        });
    }

    // Inicialización
    displayNewCaptcha();
});