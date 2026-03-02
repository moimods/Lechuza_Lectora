document.addEventListener('DOMContentLoaded', () => {
    // Verificamos que el contenedor del botón exista para evitar errores en consola
    if (!document.getElementById('paypal-button-container')) return;

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
        },

        createOrder: function(data, actions) {
            // Obtenemos el total actualizado del DOM
            const totalElement = document.getElementById('total-display');
            const totalText = totalElement ? totalElement.innerText : "0";
            const totalValue = totalText.replace('$', '').trim();

            // Validación: No permitir abrir PayPal si el carrito es $0
            if (parseFloat(totalValue) <= 0 || isNaN(parseFloat(totalValue))) {
                alert("Tu carrito está vacío. ¡Añade algunas historias antes de pagar!");
                return actions.reject();
            }

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        currency_code: 'MXN', // Es buena práctica especificar la moneda
                        value: totalValue 
                    }
                }]
            });
        },

        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // 1. Limpiar el carrito de la base de datos local
                localStorage.removeItem('laLechuzaLectoraCart'); 
                
                // 2. (Opcional) Guardar ID de transacción para la confirmación
                sessionStorage.setItem('lastOrderId', details.id);

                // 3. Redirigir al éxito
                window.location.href = "confirmacion_pago.html";
            });
        },

        onError: function(err) {
            console.error('Error en el pago con PayPal:', err);
            // Si el error es porque el usuario cerró la ventana, PayPal lo maneja, 
            // pero si es técnico, avisamos:
            if (err) alert('Hubo un problema técnico con PayPal. Por favor, intenta más tarde.');
        }
    }).render('#paypal-button-container');
});