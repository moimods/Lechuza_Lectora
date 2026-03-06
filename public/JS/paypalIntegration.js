document.addEventListener('DOMContentLoaded', () => {
    const PAYPAL_CONTAINER = '#paypal-button-container';
    
    if (!document.querySelector(PAYPAL_CONTAINER)) return;

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
        },

        createOrder: function(data, actions) {
            const totalElement = document.getElementById('final-total');
            const totalText = totalElement ? totalElement.innerText : "0";
            const totalValue = totalText.replace(/[^0-9.]/g, '').trim();

            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert("🦉 Debes iniciar sesión para completar la compra.");
                return actions.reject();
            }

            if (parseFloat(totalValue) <= 0 || isNaN(parseFloat(totalValue))) {
                alert("🦉 Tu carrito parece estar vacío.");
                return actions.reject();
            }

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
            const container = document.querySelector(PAYPAL_CONTAINER);
            container.style.pointerEvents = 'none';
            container.style.opacity = '0.5';

            return actions.order.capture().then(async function(details) {
                
                // Cargar carrito y normalizar datos
                const cart = JSON.parse(localStorage.getItem('laLechuza_carrito') || localStorage.getItem('laLechuzaLectoraCart') || '[]');
                const userId = localStorage.getItem('userId');
                const checkoutData = JSON.parse(localStorage.getItem('laLechuzaCheckoutData')) || {};
                const token = localStorage.getItem('laLechuza_jwt_token');

                // Normalizar items para /api/ventas/registrar
                const itemsProcesados = cart.map(item => ({
                    id_producto: item.id_producto || item.id,
                    cantidad: item.cantidad || item.quantity || 1,
                    precio: item.precio || item.price
                }));

                const pedidoFinal = {
                    id_direccion: checkoutData.selectedAddress ? parseInt(checkoutData.selectedAddress) : null,
                    id_metodo_pago: checkoutData.selectedPaymentMethod ? parseInt(checkoutData.selectedPaymentMethod) : null,
                    items: itemsProcesados
                };

                try {
                    const response = await fetch('http://localhost:3000/api/ventas/registrar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify(pedidoFinal)
                    });

                    const result = await response.json();

                    if (response.ok && (result.ok || result.success)) {
                        localStorage.removeItem('laLechuza_carrito');
                        localStorage.removeItem('laLechuzaLectoraCart');
                        localStorage.removeItem('laLechuzaCheckoutData');
                        sessionStorage.setItem('lastOrderId', details.id);
                        window.location.href = "confirmacion_pago.html";
                    } else {
                        throw new Error(result.error || "Error al registrar el pedido");
                    }
                } catch (error) {
                    console.error("Error en flujo de pago:", error);
                    alert("⚠️ El pago se realizó (ID: " + details.id + "), pero hubo un error. Contacta soporte.");
                    container.style.pointerEvents = 'auto';
                    container.style.opacity = '1';
                }
            });
        },

        onCancel: function (data) {
            console.log("El usuario cerró la ventana de PayPal.");
        },

        onError: function(err) {
            console.error('Error de PayPal:', err);
            alert('Hubo un error con PayPal. Intenta de nuevo.');
        }
    }).render(PAYPAL_CONTAINER);
});