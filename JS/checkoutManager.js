document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURACIÓN Y CLAVES ---
    const STORAGE_KEY_CHECKOUT = 'laLechuzaCheckoutData';
    const CART_STORAGE_KEY = 'laLechuzaLectoraCart'; 
    const INDEX_PAGE_URL = '../../../index.html';
    const API_BASE_URL = 'http://localhost:3000/api'; 

    const STEP_PAGES = {
        resumen_compra: 'resumen_compra.html',
        domicilio: 'domicilio.html',
        pago: 'pago.html',
        finalizar: 'finalizar.html',
        carrito: '../carrito.html'
    };

    // Estado inicial de la compra
    let checkoutData = {
        selectedAddress: null,
        selectedPayment: 'paypal',
        totals: { itemCount: 0, total: 0 }
    };

    // --- 1. CARGA DE DATOS Y PERSISTENCIA ---
    async function loadAllData() {
        // 1.1 Cargar carrito y calcular totales
        const cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
        const total = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        
        checkoutData.totals = {
            itemCount: cartItems.length,
            total: total
        };

        // 1.2 Cargar selecciones previas del proceso de compra
        const stored = localStorage.getItem(STORAGE_KEY_CHECKOUT);
        if (stored) {
            const parsed = JSON.parse(stored);
            checkoutData.selectedAddress = parsed.selectedAddress || null;
            checkoutData.selectedPayment = parsed.selectedPayment || 'paypal';
        }

        // 1.3 Si estamos en la página de domicilio, cargar direcciones de la BD
        if (window.location.pathname.includes('domicilio.html')) {
            await fetchUserAddresses();
        }

        // 1.4 Si estamos en la página de pago, marcar la opción guardada
        if (window.location.pathname.includes('pago.html')) {
            syncPaymentUI();
        }
    }

    async function fetchUserAddresses() {
        const idUsuario = localStorage.getItem('userId');
        const container = document.getElementById('addresses-list-container');
        if (!container || !idUsuario) return;

        try {
            const response = await fetch(`${API_BASE_URL}/direcciones/usuario/${idUsuario}`);
            const direcciones = await response.json();

            if (direcciones.length === 0) {
                container.innerHTML = '<p style="text-align:center;">No tienes direcciones guardadas. <br><a href="Agregar_domicilio.html" class="btn-link">Agrega una aquí</a>.</p>';
                return;
            }

            container.innerHTML = direcciones.map(dir => `
                <div class="address-option ${checkoutData.selectedAddress == dir.id_direccion ? 'selected' : ''}" 
                     style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: 0.3s;"
                     onclick="window.selectAddress(${dir.id_direccion})">
                    <input type="radio" name="delivery_address" value="${dir.id_direccion}" 
                           ${checkoutData.selectedAddress == dir.id_direccion ? 'checked' : ''} 
                           style="margin-right: 10px;">
                    <span class="address-text">
                        <strong>${dir.tipo_domicilio || 'Domicilio'}</strong>: ${dir.direccion_texto}, ${dir.colonia || ''}
                    </span>
                </div>
            `).join('');
        } catch (error) {
            console.error("Error al cargar direcciones:", error);
            container.innerHTML = '<p>Error al conectar con el servidor.</p>';
        }
    }

    // Funciones globales para interacción con el HTML
    window.selectAddress = (id) => {
        checkoutData.selectedAddress = id;
        saveSelections();
        // Actualización visual inmediata
        document.querySelectorAll('.address-option').forEach(opt => opt.classList.remove('selected'));
        const selectedOpt = document.querySelector(`input[value="${id}"]`)?.closest('.address-option');
        if (selectedOpt) selectedOpt.classList.add('selected');
    };

    window.updatePaymentSelection = (input) => {
        checkoutData.selectedPayment = input.value;
        saveSelections();
        syncPaymentUI();
    };

    function syncPaymentUI() {
        document.querySelectorAll('.payment-option').forEach(label => {
            label.style.border = "1px solid #ddd";
            label.classList.remove('selected');
        });
        const selectedInput = document.querySelector(`input[name="payment_method"][value="${checkoutData.selectedPayment}"]`);
        if (selectedInput) {
            const parent = selectedInput.closest('.payment-option');
            parent.style.border = "2px solid #fbc02d";
            parent.classList.add('selected');
            selectedInput.checked = true;
        }
    }

    function saveSelections() {
        localStorage.setItem(STORAGE_KEY_CHECKOUT, JSON.stringify(checkoutData));
    }

    // --- 2. NAVEGACIÓN ENTRE PASOS ---
    function handleNavigation(btn, isNext) {
        const stepKey = btn.getAttribute(isNext ? 'data-next-step' : 'data-prev-step');
        
        // Validación: No avanzar a pago sin dirección
        if (isNext && stepKey === 'pago' && !checkoutData.selectedAddress) {
            alert("Por favor, selecciona una dirección de envío antes de continuar.");
            return;
        }

        if (STEP_PAGES[stepKey]) {
            window.location.href = STEP_PAGES[stepKey];
        }
    }

    // --- 3. PROCESAMIENTO FINAL (SIMULACIÓN DE PAGO Y GUARDADO EN BD) ---
    async function finalizePurchase() {
        const finalizeBtn = document.getElementById('btn-finalizar-compra');
        const idUsuario = localStorage.getItem('userId');
        const cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

        // Validaciones de seguridad
        if (!idUsuario) return alert("Debes iniciar sesión para comprar.");
        if (cartItems.length === 0) return alert("El carrito está vacío.");
        if (!checkoutData.selectedAddress) return alert("Falta seleccionar la dirección de envío.");

        // Bloqueo visual del botón (UX de carga)
        if (finalizeBtn) {
            finalizeBtn.disabled = true;
            finalizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando Pago...';
        }

        // Simulamos un retraso de red de 1.5 segundos para la tarea
        setTimeout(async () => {
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
                    // LIMPIEZA TRAS ÉXITO
                    localStorage.removeItem(CART_STORAGE_KEY);
                    localStorage.removeItem(STORAGE_KEY_CHECKOUT);
                    
                    window.location.href = STEP_PAGES.finalizar;
                } else {
                    alert("Hubo un problema al registrar tu pedido: " + (result.error || "Desconocido"));
                    if (finalizeBtn) {
                        finalizeBtn.disabled = false;
                        finalizeBtn.textContent = 'Reintentar Compra';
                    }
                }
            } catch (error) {
                console.error("Error de servidor:", error);
                alert("No se pudo conectar con el servidor para registrar el pedido.");
                if (finalizeBtn) finalizeBtn.disabled = false;
            }
        }, 1500);
    }
    
    // --- 4. INICIALIZACIÓN ---
    async function init() {
        await loadAllData();

        // Si el carrito está vacío y no estamos en la página de éxito, regresar al carrito
        if (checkoutData.totals.itemCount === 0 && !window.location.pathname.includes('finalizar.html')) {
            window.location.replace(STEP_PAGES.carrito);
            return;
        }

        // Eventos para botones de Siguiente / Anterior
        document.querySelectorAll('.btn-next-step').forEach(btn => {
            btn.onclick = () => handleNavigation(btn, true);
        });

        document.querySelectorAll('.btn-prev-step').forEach(btn => {
            btn.onclick = () => handleNavigation(btn, false);
        });

        // Evento para el botón final de pago
        const finalizeBtn = document.getElementById('btn-finalizar-compra');
        if (finalizeBtn) finalizeBtn.onclick = finalizePurchase;
    }

    init();
});