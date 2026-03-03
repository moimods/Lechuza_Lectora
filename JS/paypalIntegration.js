document.addEventListener('DOMContentLoaded', () => {
    const PAYPAL_CONTAINER = '#paypal-button-container';
    
    // Verificamos que el contenedor exista para evitar errores en otras páginas
    if (!document.querySelector(PAYPAL_CONTAINER)) return;

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
        },

        createOrder: function(data, actions) {
            // 1. Obtener el total del elemento visible (final-total)
            const totalElement = document.getElementById('final-total');
            const totalText = totalElement ? totalElement.innerText : "0";
            
            // Limpieza robusta: elimina todo lo que no sea número o punto
            const totalValue = totalText.replace(/[^0-9.]/g, '').trim();

            // 2. Validaciones previas al cobro
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert("🦉 Debes iniciar sesión para completar la compra.");
                return actions.reject();
            }

            if (parseFloat(totalValue) <= 0 || isNaN(parseFloat(totalValue))) {
                alert("🦉 Tu carrito parece estar vacío.");
                return actions.reject();
            }

            // 3. Crear la orden en PayPal
            return actions.order.create({
                purchase_units: [{
                    description: "Compra de Libros - La Lechuza Lectora",
                    amount: {
                        currency_code: 'MXN', 
                        value: totalValue 
                    }
                }]
            });
        },

        onApprove: function(data, actions) {
            // Bloqueamos el botón o mostramos un loader mientras procesamos
            const container = document.querySelector(PAYPAL_CONTAINER);
            container.style.pointerEvents = 'none';
            container.style.opacity = '0.5';

            return actions.order.capture().then(async function(details) {
                
                // Extraer datos necesarios del almacenamiento local
                const cart = JSON.parse(localStorage.getItem('laLechuzaLectoraCart')) || [];
                const userId = localStorage.getItem('userId');
                const checkoutData = JSON.parse(localStorage.getItem('laLechuzaCheckoutData')) || {};

                // Mapeo seguro de productos: asegura que los nombres coincidan con tu API
                const productosProcesados = cart.map(item => ({
                    id_libro: item.id_libro || item.id, // Soporta ambos nombres
                    cantidad: item.cantidad || item.quantity || 1,
                    precio: item.precio || item.price
                }));

                const pedidoFinal = {
                    id_usuario: parseInt(userId),
                    id_direccion: checkoutData.selectedAddress ? parseInt(checkoutData.selectedAddress) : null,
                    total: details.purchase_units[0].amount.value,
                    metodo_pago: 'PayPal',
                    id_transaccion: details.id, // Folio de PayPal
                    productos: productosProcesados
                };

                try {
                    // Enviar al Backend (Node.js)
                    const response = await fetch('http://localhost:3000/api/pedidos/crear', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(pedidoFinal)
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        // LIMPIEZA POST-VENTA
                        localStorage.removeItem('laLechuzaLectoraCart');
                        localStorage.removeItem('laLechuzaCheckoutData');
                        
                        // Guardar el ID de transacción para mostrarlo en la confirmación
                        sessionStorage.setItem('lastOrderId', details.id);

                        // Redirigir a la página de éxito
                        window.location.href = "confirmacion_pago.html";
                    } else {
                        throw new Error(result.error || "Error al registrar el pedido");
                    }
                } catch (error) {
                    console.error("Error crítico en el flujo de pago:", error);
                    alert("⚠️ El pago se realizó en PayPal (ID: " + details.id + "), pero hubo un error al guardarlo en nuestra base de datos. Por favor, toma captura de este mensaje y contáctanos.");
                }
            });
        },

        onCancel: function (data) {
            console.log("El usuario cerró la ventana de PayPal.");
        },

        onError: function(err) {
            console.error('Error técnico de PayPal SDK:', err);
            alert('Hubo un error con la conexión de PayPal. Intenta de nuevo.');
        }
    }).render(PAYPAL_CONTAINER);
});