document.addEventListener('DOMContentLoaded', () => {
    const contactButton = document.querySelector('.btn-contact-us');

    if (contactButton) {
        contactButton.addEventListener('click', (e) => {
            e.preventDefault(); // Evita saltos bruscos si es un enlace <a>

            const path = window.location.pathname;
            let targetURL = 'Contacto.html';

            // Lógica de "Salto de carpeta":
            // Si el usuario está en la zona de logeado, debe subir un nivel
            // para encontrar el Contacto.html que está en la raíz o en /vistas/
            if (path.includes('/logeado/') || path.includes('/compra/')) {
                targetURL = '../Contacto.html'; 
            }

            console.log("Navegando a contacto desde:", path);
            window.location.href = targetURL;
        });
    }
});