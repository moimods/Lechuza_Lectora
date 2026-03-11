// ===============================
// STORAGE
// ===============================

const CART_KEY = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_KEYS && window.APP_CONFIG.STORAGE_KEYS.CART) || "carrito";

function normalizarItemCarrito(item) {
    const id = Number(item?.id_producto ?? item?.id);
    const cantidad = Number(item?.cantidad ?? item?.qty ?? item?.quantity ?? 1);

    return {
        ...item,
        id_producto: Number.isFinite(id) ? id : null,
        cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1
    };
}

// Obtener carrito
function obtenerCarrito() {
    const raw = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizarItemCarrito).filter((item) => item.id_producto !== null);
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

    const idProducto = Number(producto.id_producto ?? producto.id);
    if (!Number.isFinite(idProducto)) {
        alert("No se pudo agregar el producto al carrito.");
        return;
    }

    const existente = carrito.find(p => Number(p.id_producto) === idProducto);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id_producto: idProducto,
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
    const contadorAlt = document.getElementById("cart-count");

    const cantidad = obtenerCarrito()
        .reduce((sum, p) => sum + Number(p.cantidad || p.qty || p.quantity || 0), 0);

    if (contador) contador.textContent = cantidad;
    if (contadorAlt) contadorAlt.textContent = cantidad;
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

