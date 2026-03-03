document.addEventListener('DOMContentLoaded', () => {
    // Definimos la ruta centralizada (Ruta absoluta es mejor)
    const USER_LOGIN_URL = '/html/Inicio_de_sesion/Inicio_sesion.html';

    // 1. Selector por ID (El más seguro y rápido para el icono/botón específico)
    const loginIconBtn = document.getElementById('btn-login-redirect');
    if (loginIconBtn) {
        loginIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = USER_LOGIN_URL;
        });
    }

    // 2. Selector para botones del Header
    const headerButtons = document.querySelectorAll('.btn-primary');

    headerButtons.forEach(button => {
        // Limpiamos el texto para evitar errores por espacios o mayúsculas
        const buttonText = button.textContent.trim().toLowerCase();
        
        if (buttonText === 'iniciar sesión') {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Redirigiendo al Login de usuario...");
                window.location.href = USER_LOGIN_URL;
            });
        }
    });
});