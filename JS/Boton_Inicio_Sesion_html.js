document.addEventListener('DOMContentLoaded', () => {
    // Definimos la ruta centralizada
    const USER_LOGIN_URL = '/html/Inicio_de_sesion/Inicio_sesion.html';

    // 1. Selector por ID (El más seguro y rápido)
    const btnLoginRedirect = document.getElementById('btn-login-redirect');
    if (btnLoginRedirect) {
        btnLoginRedirect.addEventListener('click', () => {
            window.location.href = USER_LOGIN_URL;
        });
    }

    // 2. Selector para botones del Header (Usamos una clase específica si es posible)
    // Tip: En tu HTML añade la clase 'btn-login-trigger' a esos botones
    const loginButtons = document.querySelectorAll('.btn-primary, .btn-login-trigger');

    loginButtons.forEach(button => {
        // Lógica de respaldo por texto (con limpieza de espacios y minúsculas)
        const text = button.textContent.trim().toLowerCase();
        
        if (text === 'iniciar sesión' || button.classList.contains('btn-login-trigger')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Redirigiendo al Login de usuario...");
                window.location.href = USER_LOGIN_URL;
            });
        }
    });
});