// --- CONFIGURACIÓN ---
let cartItems = []; 
const STORAGE_KEY = 'laLechuzaLectoraCart'; 
const CART_PAGE_URL = 'carrito.html';

// --- PERSISTENCIA ---
function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
}

function loadCart() {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    cartItems = storedCart ? JSON.parse(storedCart) : [];
}

// --- CÁLCULOS ---
function calculateTotals() {
    const subtotal = cartItems.reduce((sum, item) => {
        // Normalizar el nombre del campo de precio
        const price = parseFloat(item.price || item.precio || 0);
        const quantity = item.quantity || item.cantidad || 1;
        return sum + (price * quantity);
    }, 0);
    
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    return {
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`,
        total: total.toFixed(2),
        itemCount: cartItems.reduce((sum, item) => sum + (item.quantity || item.cantidad || 1), 0)
    };
}

// --- INTERFAZ DE USUARIO ---
function updateCartCount() {
    const totals = calculateTotals();
    const countElement = document.getElementById('cart-count');
    
    if (countElement) {
        countElement.textContent = totals.itemCount;
        countElement.style.display = totals.itemCount > 0 ? 'flex' : 'none';
    }
}

// --- ACCIONES DEL CARRITO ---
/**
 * Añade un producto al carrito con normalización de datos
 */
window.agregarAlCarrito = function(id, title, price, image = '../../Imagenes/logo.png') {
    loadCart(); 

    // Normalizar el ID a string para comparación
    const itemIndex = cartItems.findIndex(item => String(item.id || item.id_producto) === String(id));
    
    if (itemIndex > -1) {
        cartItems[itemIndex].quantity = (cartItems[itemIndex].quantity || 1) + 1;
    } else {
        cartItems.push({ 
            id: id,
            id_producto: id, // Duplicar para compatibilidad
            name: title,
            titulo: title, // Duplicar para compatibilidad
            price: parseFloat(price),
            precio: parseFloat(price), // Duplicar para compatibilidad
            quantity: 1,
            cantidad: 1, // Duplicar para compatibilidad
            image: image
        }); 
    }
    
    saveCart();
    updateCartCount();
    alert(`✅ "${title}" se añadió al carrito`);
};

window.comprarDirecto = function(id, title, price, image) {
    window.agregarAlCarrito(id, title, price, image);
    window.location.href = CART_PAGE_URL;
};

window.updateItemQuantity = function(productId, newQuantity) {
    loadCart();
    const itemIndex = cartItems.findIndex(item => String(item.id || item.id_producto) === String(productId));
    
    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            window.removeItem(productId);
        } else {
            cartItems[itemIndex].quantity = newQuantity;
            cartItems[itemIndex].cantidad = newQuantity; // Sincronizar ambos
            saveCart();
            updateCartCount();
            renderCart(); 
        }
    }
};

window.removeItem = function(productId) {
    loadCart();
    cartItems = cartItems.filter(item => String(item.id || item.id_producto) !== String(productId));
    saveCart();
    updateCartCount();
    renderCart();
};

// --- RENDERIZADO (PÁGINA CARRITO.HTML) ---
function generateCartItemHTML(item) {
    const price = item.price || item.precio || 0;
    const quantity = item.quantity || item.cantidad || 1;
    const itemTotal = (parseFloat(price) * quantity).toFixed(2);
    const id = item.id || item.id_producto;
    const name = item.name || item.titulo || 'Producto sin nombre';

    return `
        <div class="cart-item" data-product-id="${id}" style="display: flex; align-items: center; border-bottom: 1px solid #ddd; padding: 15px; background: white; margin-bottom: 10px; border-radius: 8px;">
            <img src="${item.image}" alt="${name}" style="width: 80px; height: 110px; object-fit: contain; margin-right: 20px;" onerror="this.src='../../Imagenes/logo.png'">
            <div class="item-details" style="flex-grow: 1;">
                <h2 style="font-size: 1.1rem; color: #5d4037; margin: 0 0 5px 0;">${name}</h2>
                <p style="color: #777; font-size: 0.9rem; margin-bottom: 10px;">Unitario: $${parseFloat(price).toFixed(2)}</p>
                <div class="item-quantity-controls" style="display: flex; align-items: center; gap: 10px;">
                    <button class="btn-qty-control" onclick="updateItemQuantity('${id}', ${quantity - 1})" style="width:25px; height:25px; cursor:pointer; background:#5d4037; color:white; border:none; border-radius:4px;">-</button>
                    <span class="item-quantity-display" style="font-weight: bold; min-width: 30px; text-align: center;">${quantity}</span>
                    <button class="btn-qty-control" onclick="updateItemQuantity('${id}', ${quantity + 1})" style="width:25px; height:25px; cursor:pointer; background:#5d4037; color:white; border:none; border-radius:4px;">+</button>
                    <button class="btn-remove" onclick="removeItem('${id}')" style="margin-left: 15px; color: #d32f2f; background: none; border: none; cursor: pointer; font-size: 0.8rem; text-decoration: underline;">Eliminar</button>
                </div>
            </div>
            <span class="item-price" style="font-weight: bold; color: #5d4037; font-size: 1.1rem; min-width: 80px; text-align: right;">$${itemTotal}</span>
        </div>
    `;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const totalDisplay = document.getElementById('total-display'); 
    const totals = calculateTotals();

    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (totalDisplay) totalDisplay.textContent = '$0.00';
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
        container.innerHTML = cartItems.map(generateCartItemHTML).join('');
        if (totalDisplay) totalDisplay.textContent = `$${totals.total}`;
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();

    if (document.getElementById('cart-items-container')) {
        renderCart();
    }

    const cartBtn = document.getElementById('cart-icon-btn');
    if (cartBtn) {
        cartBtn.onclick = function() {
            window.location.href = '/html/Logeado/carrito.html';
        };
    }
});