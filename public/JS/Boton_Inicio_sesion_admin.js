document.addEventListener('DOMContentLoaded', () => {
    const adminSwitchButton = document.querySelector('.btn-admin-switch');

    if (adminSwitchButton) {
        adminSwitchButton.addEventListener('click', (e) => {
            e.preventDefault(); // Previene comportamientos extraños si es un enlace

            const path = window.location.pathname;
            let targetURL = 'inicio_sesion_admin.html';

            // Lógica de "Escape" de carpetas:
            // Si el usuario está en una subcarpeta (como /logeado/ o /vistas/)
            // necesitamos subir un nivel para encontrar el login de admin.
            if (path.includes('/logeado/') || path.includes('/vistas/')) {
                targetURL = '../inicio_sesion_admin.html';
            }

            console.log("Acceso administrativo detectado. Redirigiendo a:", targetURL);
            window.location.href = targetURL;
        });
    }
});