document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const LOGOUT_REDIRECT_URL = '../../index.html';
    const API_LOGOUT_ENDPOINT = '/api/auth/logout';

    // Elementos del DOM
    const avatarButton = document.getElementById('avatar-btn');
    const dropdownMenu = document.getElementById('avatar-dropdown');
    const logoutButton = document.getElementById('logout-btn');

    // --- 1. GESTIÓN DEL MENÚ DESPLEGABLE ---
    function toggleDropdown(event) {
        // Evita que el clic se propague y cierre el menú inmediatamente
        event.stopPropagation();
        
        if (dropdownMenu) {
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
            
            // Log para debug profesional
            console.log(`🦉 Menú de usuario: ${!isVisible ? 'Abierto' : 'Cerrado'}`);
        }
    }

    // --- 2. DESTRUCCIÓN DE SESIÓN (ROBUSTA) ---
    async function handleLogout(event) {
        event.preventDefault();

        // Confirmación amistosa de la lechuza
        const confirmar = confirm("¿Estás seguro de que quieres cerrar tu nido de lectura?");
        if (!confirmar) return;

        console.log("Iniciando destrucción de sesión...");

        // A. Limpieza en el CLIENTE (Navegador)
        // Borramos TODO: IDs, Nombres, Carrito, Tokens
        localStorage.clear(); 
        sessionStorage.clear();
        console.log("Limpieza de LocalStorage completada.");

        try {
            // B. Limpieza en el SERVIDOR (Node.js)
            // Avisamos al servidor para que borre la sesión en la BD o cookies
            const token = localStorage.getItem('laLechuza_jwt_token');
            const response = await fetch(API_LOGOUT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (response.ok) {
                console.log("Sesión destruida con éxito en el servidor.");
            }
        } catch (error) {
            // Si el servidor está apagado o falla, igual redirigimos
            console.warn("No se pudo contactar al servidor para el logout, pero el cliente fue limpiado.");
        }

        // C. REDIRECCIÓN SEGURA
        // Usamos replace para que no puedan volver atrás con el historial
        window.location.replace(LOGOUT_REDIRECT_URL);
    }

    // --- 3. ASIGNACIÓN DE EVENTOS ---
    if (avatarButton) {
        avatarButton.addEventListener('click', toggleDropdown);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // --- 4. CIERRE AUTOMÁTICO AL HACER CLIC FUERA ---
    document.addEventListener('click', (event) => {
        if (dropdownMenu && dropdownMenu.style.display === 'block') {
            // Si el clic NO fue en el avatar ni en el menú mismo...
            if (!avatarButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
                console.log("Menú cerrado por clic externo.");
            }
        }
    });

    // --- 5. EXTRA: MOSTRAR NOMBRE DEL USUARIO ---
    // Si guardaste el nombre al hacer login, lo mostramos aquí
    const userName = localStorage.getItem('userName');
    const nameDisplay = document.getElementById('user-name-display');
    if (userName && nameDisplay) {
        nameDisplay.innerText = userName;
    }
});