document.addEventListener('DOMContentLoaded', () => {
    // Definimos la ruta exacta según lo que muestra tu navegador en Vercel
    // IMPORTANTE: 'Inicio_sesion.html' con I mayúscula como se ve en tu captura
    const TO_LOGIN_URL = 'Inicio_sesion.html'; 
    const TO_CHANGE_PASSWORD_URL = 'cambio_Contraseña.html'; 

    const btnRegresar = document.getElementById('btn-regresar');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');

    if (btnRegresar) {
        btnRegresar.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Navegando a la pantalla de inicio de sesión...");
            // Al estar en la misma carpeta, solo necesitamos el nombre del archivo
            window.location.href = TO_LOGIN_URL;
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
                alert("Por favor, ingrese un correo.");
            }
        });
    }
});