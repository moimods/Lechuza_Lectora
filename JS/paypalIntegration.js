document.addEventListener('DOMContentLoaded', () => {
   
    paypal.Buttons({
      
        style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
        },

    
        createOrder: function(data, actions) {
           
            const totalText = document.getElementById('total-display').innerText;
            const totalValue = totalText.replace('$', '').trim();

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalValue 
                    }
                }]
            });
        },

        
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Pago completado con éxito por ' + details.payer.name.given_name + '!');
               
                window.location.href = "confirmacion_pago.html";
            });
        },

        
        onError: function(err) {
            console.error('Error en el pago con PayPal:', err);
            alert('Hubo un error al procesar el pago. Intente de nuevo.');
        }
    }).render('#paypal-button-container');
});