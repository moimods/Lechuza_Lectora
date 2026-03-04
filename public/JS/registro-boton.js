document.addEventListener('DOMContentLoaded', () => {
    // 1. Selector más específico para evitar conflictos con otros botones secondary
    const registerButton = document.querySelector('.btn-create-account') || document.querySelector('.btn-secondary');
    
    // 2. Ruta base configurada
    const REGISTER_URL = 'html/inicio_de_sesion/Registro.html'; 

    if (registerButton) {
        registerButton.addEventListener('click', (e) => {
            e.preventDefault(); // Evitamos cualquier comportamiento por defecto del form

            // 3. Feedback visual (Opcional pero profesional)
            registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Abriendo Registro...';
            registerButton.style.opacity = '0.7';
            registerButton.style.pointerEvents = 'none';

            console.log("Iniciando navegación hacia:", REGISTER_URL);

            // 4. Redirección con manejo de error básico
            try {
                window.location.href = REGISTER_URL;
            } catch (error) {
                console.error("Error al intentar redirigir:", error);
                // Si falla, intentamos una ruta alternativa relativa simple
                window.location.href = 'Registro.html'; 
            }
        });
    } else {
        console.warn("🦉 La Lechuza no encontró el botón de registro en esta página.");
    }
});