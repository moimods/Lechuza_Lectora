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
        window.location.href = "/html/Inicio_de_sesion/login.html";
        return;
    }

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const total = calcularTotal(carrito);

    try {

        const data = await apiRequest("/api/ventas/registrar", {
            method: "POST",
            body: JSON.stringify({
                id_usuario: usuario.id_usuario,
                id_direccion: idDireccion,
                total: total,
                productos: carrito.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio: item.precio
                }))
            })
        });

        if (data.success) {

            alert("Compra realizada con éxito 🎉");

            // Vaciar carrito
            localStorage.removeItem("carrito");

            // Redirigir
            window.location.href = "/html/Logeado/dashboard.html";
        }

    } catch (error) {
        console.error("Error al registrar venta:", error.message);
    }
}