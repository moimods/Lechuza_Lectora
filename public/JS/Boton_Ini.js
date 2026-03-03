document.addEventListener('DOMContentLoaded', () => {
    // Buscamos el icono de la casa
    const homeIcon = document.querySelector('.icon-button i.fa-house');

    if (homeIcon) {
        // Obtenemos el botón padre
        const btn = homeIcon.closest('button');

        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Evitamos cualquier comportamiento por defecto

            const path = window.location.pathname;
            let targetURL = '';

            // Lógica de redirección basada en la ubicación actual
            if (path.includes('/logeado/')) {
                // Si estamos dentro de cualquier página de logeado, 
                // buscamos la principal en la raíz de esa carpeta.
                // Nota: Si tus archivos están en carpetas muy profundas, 
                // es mejor usar rutas absolutas como '/logeado/Pagina_principal.html'
                targetURL = 'Pagina_principal.html';
            } else {
                // Si no está logeado, vuelve al index general
                targetURL = '../index.html';
            }

            console.log(`Navegando a: ${targetURL}`);
            window.location.replace(targetURL);
        });
    }
});