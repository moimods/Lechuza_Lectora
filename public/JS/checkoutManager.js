/**
 * GESTOR DE COMPRAS (CheckoutManager) - La Lechuza Lectora
 * Maneja la lógica de negocio, persistencia y navegación del proceso de pago.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN Y CONSTANTES ---
    const STORAGE_KEY_CHECKOUT = 'laLechuzaCheckoutData';
    const CART_STORAGE_KEY = 'laLechuzaLectoraCart'; 
    const API_BASE_URL = 'http://localhost:3000/api'; 

    // Mapeo de páginas para navegación
    const STEP_PAGES = {
        resumen_compra: 'resumen_compra.html',
        domicilio: 'domicilio.html',
        pago: 'pago.html',
        finalizar: 'finalizar.html',
        carrito: '../carrito.html'
    };

    // Estado global de la compra
    let checkoutData = {
        selectedAddress: null,
        selectedPayment: 'paypal',
        totals: { itemCount: 0, total: 0 }
    };

    // --- 2. CARGA INICIAL Y PERSISTENCIA ---

    async function initCheckout() {
        const currentPage = window.location.pathname.split('/').pop();

        // 2.1 Cargar datos del carrito de LocalStorage
        const cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
        const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
        
        checkoutData.totals = {
            itemCount: cartItems.length,
            total: total
        };

        // Redirigir si el carrito está vacío (excepto en la página de éxito)
        if (checkoutData.totals.itemCount === 0 && currentPage !== 'finalizar.html') {
            console.warn("Carrito vacío, redirigiendo...");
            window.location.replace(STEP_PAGES.carrito);
            return;
        }

        // 2.2 Recuperar selecciones previas (Dirección/Pago)
        const stored = localStorage.getItem(STORAGE_KEY_CHECKOUT);
        if (stored) {
            const parsed = JSON.parse(stored);
            checkoutData.selectedAddress = parsed.selectedAddress || null;
            checkoutData.selectedPayment = parsed.selectedPayment || 'paypal';
        }

        // 2.3 Cargar datos específicos según la página
        if (currentPage === 'domicilio.html') {
            await fetchUserAddresses();
        } else if (currentPage === 'pago.html') {
            syncPaymentUI();
        }

        setupEventListeners();
    }

    // --- 3. GESTIÓN DE DIRECCIONES (API) ---

    async function fetchUserAddresses() {
        const idUsuario = localStorage.getItem('userId');
        const container = document.getElementById('addresses-list-container');
        
        if (!container) return;
        if (!idUsuario) {
            container.innerHTML = '<p>Por favor, <a href="../../login.html">inicia sesión</a> para ver tus direcciones.</p>';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/direcciones/usuario/${idUsuario}`);
            if (!response.ok) throw new Error("Error al obtener direcciones");
            
            const direcciones = await response.json();

            if (direcciones.length === 0) {
                container.innerHTML = `
                    <div class="empty-address">
                        <p>No tienes direcciones guardadas.</p>
                        <a href="Agregar_domicilio.html" class="btn-link">Agregar nueva dirección</a>
                    </div>`;
                return;
            }

            container.innerHTML = direcciones.map(dir => `
                <div class="address-option ${checkoutData.selectedAddress == dir.id_direccion ? 'selected' : ''}" 
                     onclick="window.selectAddress(${dir.id_direccion})">
                    <input type="radio" name="delivery_address" value="${dir.id_direccion}" 
                           ${checkoutData.selectedAddress == dir.id_direccion ? 'checked' : ''}>
                    <div class="address-info">
                        <strong>${dir.tipo_domicilio || 'Domicilio'}</strong>
                        <p>${dir.direccion_texto}, Col. ${dir.colonia || 'S/N'}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Error:", error);
            container.innerHTML = '<p>Error al conectar con el servidor de direcciones.</p>';
        }
    }

    // --- 4. FUNCIONES GLOBALES DE INTERACCIÓN ---

    window.selectAddress = (id) => {
        checkoutData.selectedAddress = id;
        saveState();
        document.querySelectorAll('.address-option').forEach(opt => opt.classList.remove('selected'));
        const input = document.querySelector(`input[value="${id}"]`);
        if (input) input.closest('.address-option').classList.add('selected');
    };

    window.updatePaymentSelection = (input) => {
        checkoutData.selectedPayment = input.value;
        saveState();
        syncPaymentUI();
    };

    function syncPaymentUI() {
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
        const selectedInput = document.querySelector(`input[name="payment_method"][value="${checkoutData.selectedPayment}"]`);
        if (selectedInput) {
            selectedInput.closest('.payment-option').classList.add('selected');
            selectedInput.checked = true;
        }
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY_CHECKOUT, JSON.stringify(checkoutData));
    }

    // --- 5. NAVEGACIÓN Y VALIDACIÓN ---

    function handleNavigation(btn, isNext) {
        const stepKey = btn.getAttribute(isNext ? 'data-next-step' : 'data-prev-step');
        
        // Validación estricta: No avanzar al pago sin domicilio
        if (isNext && stepKey === 'pago' && !checkoutData.selectedAddress) {
            alert("⚠️ Debes seleccionar una dirección de envío para continuar.");
            return;
        }

        if (STEP_PAGES[stepKey]) {
            window.location.href = STEP_PAGES[stepKey];
        }
    }

    // --- 6. PROCESAMIENTO FINAL DE LA COMPRA ---

    async function finalizePurchase() {
        const finalizeBtn = document.getElementById('btn-finalizar-compra');
        const idUsuario = localStorage.getItem('userId');
        const cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

        if (!idUsuario) return alert("Sesión expirada. Por favor, inicia sesión de nuevo.");
        if (!checkoutData.selectedAddress) return alert("Selecciona un domicilio de entrega.");

        // Feedback visual de carga
        if (finalizeBtn) {
            finalizeBtn.disabled = true;
            finalizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando Pedido...';
        }

        const payload = {
            id_usuario: parseInt(idUsuario),
            id_direccion: parseInt(checkoutData.selectedAddress),
            total: checkoutData.totals.total,
            metodo_pago: checkoutData.selectedPayment,
            productos: cartItems.map(item => ({
                id_libro: item.id_libro,
                cantidad: item.cantidad,
                precio: item.precio
            }))
        };

        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/crear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Limpieza de datos
                localStorage.removeItem(CART_STORAGE_KEY);
                localStorage.removeItem(STORAGE_KEY_CHECKOUT);
                
                // Redirigir a página de éxito
                window.location.href = STEP_PAGES.finalizar;
            } else {
                throw new Error(result.error || "Error al procesar la compra");
            }
        } catch (error) {
            alert("Error: " + error.message);
            if (finalizeBtn) {
                finalizeBtn.disabled = false;
                finalizeBtn.textContent = 'Confirmar y Pagar';
            }
        }
    }

    // --- 7. CONFIGURACIÓN DE EVENTOS ---

    function setupEventListeners() {
        document.querySelectorAll('.btn-next-step').forEach(btn => {
            btn.addEventListener('click', () => handleNavigation(btn, true));
        });

        document.querySelectorAll('.btn-prev-step').forEach(btn => {
            btn.addEventListener('click', () => handleNavigation(btn, false));
        });

        const finalizeBtn = document.getElementById('btn-finalizar-compra');
        if (finalizeBtn) finalizeBtn.addEventListener('click', finalizePurchase);
    }

    // Ejecutar inicialización
    initCheckout();
});