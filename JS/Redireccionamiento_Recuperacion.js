document.addEventListener('DOMContentLoaded', () => {
    // Definimos las rutas sin carpetas adicionales ya que están en el mismo nivel
    const TO_LOGIN_URL = 'inicio_sesion_admin.html'; 
    const TO_CHANGE_PASSWORD_URL = 'cambio_Contraseña.html'; 

    const btnRegresar = document.getElementById('btn-regresar');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');

    if (btnRegresar) {
        btnRegresar.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Navegando a:", TO_LOGIN_URL);
            // Usamos replace para evitar que el error 404 se guarde en el historial
            window.location.replace(TO_LOGIN_URL);
        });
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = TO_CHANGE_PASSWORD_URL;
        });
    }

    if (btnEnviarCodigo) {
        btnEnviarCodigo.addEventListener('click', () => {
            const correo = document.getElementById('correo').value;
            if (correo.trim() !== "") {
                alert("Código enviado con éxito.");
            } else {
                alert("Por favor, ingrese un correo válido.");
            }
        });
    }
});