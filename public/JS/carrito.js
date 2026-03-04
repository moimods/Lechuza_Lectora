// ===============================
// STORAGE
// ===============================

const CART_KEY = APP_CONFIG.STORAGE_KEYS.CART;

// Obtener carrito
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Guardar carrito
function guardarCarrito(carrito) {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
}

// ===============================
// AGREGAR AL CARRITO
// ===============================

function agregarAlCarrito(producto) {

    const carrito = obtenerCarrito();

    const existente = carrito.find(p => p.id_producto === producto.id_producto);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id_producto: producto.id_producto,
            titulo: producto.titulo,
            precio: producto.precio,
            imagen_url: producto.imagen_url,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    actualizarContador();

    alert("🛒 Producto agregado");
}

// ===============================
// ELIMINAR
// ===============================

function eliminarDelCarrito(id) {

    let carrito = obtenerCarrito();

    carrito = carrito.filter(p => p.id_producto !== id);

    guardarCarrito(carrito);
    pintarCarrito();
}

// ===============================
// CAMBIAR CANTIDAD
// ===============================

function cambiarCantidad(id, cambio) {

    const carrito = obtenerCarrito();

    const producto = carrito.find(p => p.id_producto === id);

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }

    guardarCarrito(carrito);
    pintarCarrito();
}

// ===============================
// TOTAL
// ===============================

function calcularTotal() {
    return obtenerCarrito().reduce(
        (total, p) => total + (p.precio * p.cantidad),
        0
    );
}

// ===============================
// PINTAR CARRITO
// ===============================

function pintarCarrito() {

    const contenedor = document.getElementById("carritoLista");

    if (!contenedor) return;

    const carrito = obtenerCarrito();

    contenedor.innerHTML = carrito.map(p => `
        <div class="item-carrito">
            <h4>${p.titulo}</h4>
            <p>$${p.precio}</p>

            <button onclick="cambiarCantidad(${p.id_producto},-1)">-</button>
            ${p.cantidad}
            <button onclick="cambiarCantidad(${p.id_producto},1)">+</button>

            <button onclick="eliminarDelCarrito(${p.id_producto})">
                ❌
            </button>
        </div>
    `).join('');

    const total = document.getElementById("totalCarrito");

    if (total)
        total.textContent = "$" + calcularTotal().toFixed(2);
}

// ===============================
// CONTADOR NAVBAR
// ===============================

function actualizarContador() {

    const contador = document.getElementById("cartCount");

    if (!contador) return;

    const cantidad = obtenerCarrito()
        .reduce((sum, p) => sum + p.cantidad, 0);

    contador.textContent = cantidad;
}

// ===============================
// VACIAR
// ===============================

function vaciarCarrito() {
    localStorage.removeItem(CART_KEY);
    pintarCarrito();
    actualizarContador();
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    pintarCarrito();
    actualizarContador();
});

