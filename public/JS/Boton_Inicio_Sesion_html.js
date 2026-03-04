/**
 * BOTÓN DE INICIO DE SESIÓN - VERSIÓN CONSOLIDADA
 * Maneja todas las variantes de botones de login
 */

document.addEventListener('DOMContentLoaded', () => {
    // Rutas centralizadas
    const LOGIN_URL = '/html/Inicio_de_sesion/Inicio_sesion.html';
    
    // --- ESTRATEGIA 1: Por ID ---
    const loginIconBtn = document.getElementById('btn-login-redirect');
    if (loginIconBtn) {
        loginIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = LOGIN_URL;
        });
    }

    // --- ESTRATEGIA 2: Por Clase (Botones Primarios) ---
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(button => {
        const text = button.textContent.trim().toLowerCase();
        
        if (text.includes('iniciar sesión') || text.includes('login')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = LOGIN_URL;
            });
        }
    });

    // --- ESTRATEGIA 3: Por atributo data ---
    const dataButtons = document.querySelectorAll('[data-action="login"]');
    dataButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = LOGIN_URL;
        });
    });
});