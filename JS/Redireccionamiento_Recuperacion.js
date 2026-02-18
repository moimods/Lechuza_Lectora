document.addEventListener('DOMContentLoaded', () => {
    
    const TO_CHANGE_PASSWORD_URL = 'cambio_Contraseña.html'; 
    const TO_LOGIN_URL = 'inicio_sesion_admin.html'; 

    const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnRegresar = document.getElementById('btn-regresar');

    if (btnEnviarCodigo) {
        btnEnviarCodigo.addEventListener('click', () => {
            const emailInput = document.getElementById('correo');
            
            if (emailInput && emailInput.value.trim() !== '') {
                alert(`Simulación: Código enviado a ${emailInput.value.trim()}.`); 
            } else {
                alert("Por favor, introduce tu correo electrónico.");
            }
        });
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', (e) => {
            e.preventDefault(); // Evita comportamientos extraños del botón
            console.log("Redirigiendo a: " + TO_CHANGE_PASSWORD_URL);
            window.location.href = TO_CHANGE_PASSWORD_URL;
        });
    }

    if (btnRegresar) {
        btnRegresar.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Regresando a: " + TO_LOGIN_URL);
            
            window.location.href = TO_LOGIN_URL;
        });
    }
});