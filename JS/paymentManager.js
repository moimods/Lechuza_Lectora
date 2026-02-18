document.addEventListener('DOMContentLoaded', () => {
    const btnMP = document.getElementById('btn-mercadopago');
    const btnPP = document.getElementById('btn-paypal');

    if (btnMP) {
        btnMP.addEventListener('click', () => {
            alert("Conectando con la API de Mercado Pago...");
            window.location.href = "https://www.mercadopago.com.mx/"; 
        });
    }

    if (btnPP) {
        btnPP.addEventListener('click', () => {
            alert("Iniciando sesión segura en PayPal...");
            window.location.href = "https://www.paypal.com/";
        });
    }
});