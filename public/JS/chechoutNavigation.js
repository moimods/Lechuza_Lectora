document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DE RUTAS ---
    const BASE_PAGES = {
        CARRITO: '../carrito.html',
        RESUMEN: 'resumen_compra.html',
        DOMICILIO: 'domicilio.html',
        PAGO: 'pago.html',
        FINALIZAR: 'finalizar.html'
    };

    const MODAL_PAGES = {
        AGREGAR_DOMICILIO_FORM: '../Agregar_domicilio.html' 
    };

    // --- 1. LÓGICA DE BOTÓN DE INICIO (LA CASITA) ---
    const setupHomeButton = () => {
        const homeBtn = document.querySelector('.icon-button i.fa-house')?.closest('button') || 
                        document.querySelector('.btn-home-redirect');

        if (homeBtn) {
            homeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const path = window.location.pathname;
                // Si está en /logeado/ lo manda a su principal, sino al index raíz
                const target = path.includes('/logeado/') ? 'Pagina_principal.html' : '../index.html';
                window.location.replace(target);
            });
        }
    };

    // --- 2. NAVEGACIÓN DE PASOS (CHECKOUT) ---
    const setupNavigationListeners = () => {
        // Botones Siguiente y Anterior
        document.querySelectorAll('.btn-next-step, .btn-prev-step').forEach(btn => {
            btn.addEventListener('click', () => {
                const isNext = btn.classList.contains('btn-next-step');
                const stepKey = btn.getAttribute(isNext ? 'data-next-step' : 'data-prev-step');

                if (BASE_PAGES[stepKey]) {
                    window.location.href = BASE_PAGES[stepKey];
                }
            });
        });

        // Botón Cancelar Checkout
        const cancelBtn = document.querySelector('.btn-cancel-checkout');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                // Usamos replace para que no pueda volver atrás al flujo de pago cancelado
                window.location.replace('../index.html'); 
            });
        }
    };

    // --- 3. ACCIONES DE DOMICILIO ---
    const setupDomicilioActions = () => {
        const addAddressBtn = document.querySelector('.btn-add-address');
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', () => {
                window.location.href = MODAL_PAGES.AGREGAR_DOMICILIO_FORM;
            });
        }
        
        const guardarDomicilioBtn = document.getElementById('btn-guardar-domicilio');
        if (guardarDomicilioBtn) {
            guardarDomicilioBtn.addEventListener('click', (event) => {
                event.preventDefault(); 
                if (typeof showSuccessModal === 'function') {
                    showSuccessModal('¡Dirección Agregada!', 'Tu nuevo domicilio ha sido guardado con éxito.');
                } else {
                    alert('¡Dirección Agregada con éxito!');
                }
            });
        }
    };

    // Ejecutar todas las funciones
    setupHomeButton();
    setupNavigationListeners();
    setupDomicilioActions();

    console.log("Sistema de navegación integrado cargado correctamente.");
});