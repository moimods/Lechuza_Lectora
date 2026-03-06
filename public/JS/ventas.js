// ================================================
// OBTENER USUARIO ACTUAL
// ================================================
function getUsuario() {
    return JSON.parse(localStorage.getItem("usuario"));
}

// ================================================
// OBTENER CARRITO
// ================================================
function getCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// ================================================
// CALCULAR TOTAL
// ================================================
function calcularTotal(carrito) {
    return carrito.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
}

// ================================================
// REGISTRAR VENTA
// ================================================
async function registrarVenta(idDireccion = null) {

    const usuario = getUsuario();
    const carrito = getCarrito();

    if (!usuario) {
        alert("Debes iniciar sesión");
        window.location.href = "/html/Inicio_de_sesion/Inicio_sesion.html";
        return;
    }

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const total = calcularTotal(carrito);

    try {

        const data = await apiRequest("/ventas/registrar", {
            method: "POST",
            body: JSON.stringify({
                id_direccion: idDireccion,
                items: carrito.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio: item.precio
                })),
                id_metodo_pago: null
            })
        });

        if (data.ok || data.success) {

            alert("Compra realizada con éxito 🎉");

            // Vaciar carrito
            localStorage.removeItem("carrito");

            // Redirigir
            window.location.href = "/html/Logeado/Inicio_Logeado.html";
        }

    } catch (error) {
        console.error("Error al registrar venta:", error.message);
    }
}