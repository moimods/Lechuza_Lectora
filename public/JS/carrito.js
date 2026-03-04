/**
 * CARRITO DE COMPRAS
 * La Lechuza Lectora
 * Conectado con CheckoutManager
 */

document.addEventListener("DOMContentLoaded", () => {

    const CART_KEY = "laLechuzaLectoraCart";

    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const countElement = document.getElementById("cart-count");

    // ==========================
    // UTILIDADES STORAGE
    // ==========================

    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // ==========================
    // AGREGAR PRODUCTO (GLOBAL)
    // ==========================

    window.agregarAlCarrito = function (producto) {

        let cart = getCart();

        const existente = cart.find(
            item => item.id_libro === producto.id_libro
        );

        if (existente) {
            existente.cantidad += 1;
        } else {
            cart.push({
                id_libro: producto.id_libro,
                titulo: producto.titulo,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen,
                cantidad: 1
            });
        }

        saveCart(cart);

        alert("✅ Producto agregado al carrito");
        actualizarIcono();
    };

    // ==========================
    // RENDER
    // ==========================

    function renderCart() {

        if (!container) return;

        const cart = getCart();

        container.innerHTML = "";

        if (cart.length === 0) {
            container.innerHTML =
                `<p class="empty-cart">Tu carrito está vacío 🛒</p>`;
            updateTotals();
            return;
        }

        cart.forEach(item => {

            const div = document.createElement("div");
            div.className = "cart-item";

            div.innerHTML = `
                <img src="${item.imagen}" class="cart-img">

                <div class="cart-info">
                    <h3>${item.titulo}</h3>
                    <p>$${item.precio}</p>

                    <div class="cart-controls">
                        <button onclick="cambiarCantidad(${item.id_libro}, -1)">−</button>
                        <span>${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${item.id_libro}, 1)">+</button>
                    </div>
                </div>

                <div class="cart-actions">
                    <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong>
                    <button onclick="eliminarProducto(${item.id_libro})">
                        🗑
                    </button>
                </div>
            `;

            container.appendChild(div);
        });

        updateTotals();
    }

    // ==========================
    // CANTIDAD
    // ==========================

    window.cambiarCantidad = function (id, cambio) {

        let cart = getCart();

        cart = cart.map(item => {
            if (item.id_libro === id) {
                item.cantidad += cambio;
                if (item.cantidad < 1) item.cantidad = 1;
            }
            return item;
        });

        saveCart(cart);
        renderCart();
        actualizarIcono();
    };

    // ==========================
    // ELIMINAR
    // ==========================

    window.eliminarProducto = function (id) {

        let cart = getCart();

        cart = cart.filter(item => item.id_libro !== id);

        saveCart(cart);
        renderCart();
        actualizarIcono();
    };

    // ==========================
    // TOTALES
    // ==========================

    function updateTotals() {

        const cart = getCart();

        const total = cart.reduce(
            (acc, item) => acc + (item.precio * item.cantidad),
            0
        );

        const count = cart.reduce(
            (acc, item) => acc + item.cantidad,
            0
        );

        if (totalElement)
            totalElement.textContent = `$${total.toFixed(2)}`;

        if (countElement)
            countElement.textContent = count;
    }

    // ==========================
    // ICONO NAVBAR
    // ==========================

    function actualizarIcono() {

        const cart = getCart();

        const count = cart.reduce(
            (acc, item) => acc + item.cantidad,
            0
        );

        const badge = document.getElementById("cart-badge");

        if (badge) badge.textContent = count;
    }

    // ==========================
    // IR A CHECKOUT
    // ==========================

    window.irAPagar = function () {

        const cart = getCart();

        if (cart.length === 0) {
            alert("Tu carrito está vacío");
            return;
        }

        window.location.href = "checkout/resumen_compra.html";
    };

    // ==========================
    // INIT
    // ==========================

    renderCart();
    actualizarIcono();
});