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
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shippingCost = 0; // Puedes cambiarlo a un valor fijo si lo deseas
    const total = subtotal + shippingCost;

    return {
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`,
        total: total.toFixed(2),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
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
 * Añade un producto al carrito. 
 * 'producto' debe ser un objeto: {id, title, price, image}
 */
window.agregarAlCarrito = function(id, title, price, image = '../../Imagenes/logo.png') {
    loadCart(); 

    const itemIndex = cartItems.findIndex(item => String(item.id) === String(id));
    
    if (itemIndex > -1) {
        cartItems[itemIndex].quantity += 1;
    } else {
        cartItems.push({ 
            id: id, 
            name: title, // Lo guardamos como name para el HTML
            price: parseFloat(price), 
            quantity: 1, 
            image: image
        }); 
    }
    
    saveCart();
    updateCartCount();
    alert(`¡"${title}" se añadió al carrito!`);
};

window.comprarDirecto = function(id, title, price, image) {
    window.agregarAlCarrito(id, title, price, image);
    window.location.href = CART_PAGE_URL;
};

window.updateItemQuantity = function(productId, newQuantity) {
    const itemIndex = cartItems.findIndex(item => String(item.id) === String(productId));
    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            window.removeItem(productId);
        } else {
            cartItems[itemIndex].quantity = newQuantity;
            saveCart();
            updateCartCount();
            renderCart(); 
        }
    }
};

window.removeItem = function(productId) {
    cartItems = cartItems.filter(item => String(item.id) !== String(productId));
    saveCart();
    updateCartCount();
    renderCart();
};

// --- RENDERIZADO (PÁGINA CARRITO.HTML) ---
function generateCartItemHTML(item) {
    const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
    return `
        <div class="cart-item" data-product-id="${item.id}" style="display: flex; align-items: center; border-bottom: 1px solid #ddd; padding: 15px; background: white; margin-bottom: 10px; border-radius: 8px;">
            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 110px; object-fit: contain; margin-right: 20px;" onerror="this.src='../../Imagenes/logo.png'">
            <div class="item-details" style="flex-grow: 1;">
                <h2 style="font-size: 1.1rem; color: #5d4037; margin: 0 0 5px 0;">${item.name}</h2>
                <p style="color: #777; font-size: 0.9rem; margin-bottom: 10px;">Unitario: $${parseFloat(item.price).toFixed(2)}</p>
                <div class="item-quantity-controls" style="display: flex; align-items: center; gap: 10px;">
                    <button class="btn-qty-control" onclick="updateItemQuantity('${item.id}', ${item.quantity - 1})" style="width:25px; cursor:pointer;">-</button>
                    <span class="item-quantity-display" style="font-weight: bold;">${item.quantity}</span>
                    <button class="btn-qty-control" onclick="updateItemQuantity('${item.id}', ${item.quantity + 1})" style="width:25px; cursor:pointer;">+</button>
                    <button class="btn-remove" onclick="removeItem('${item.id}')" style="margin-left: 15px; color: #d32f2f; background: none; border: none; cursor: pointer; font-size: 0.8rem;">Eliminar</button>
                </div>
            </div>
            <span class="item-price" style="font-weight: bold; color: #5d4037; font-size: 1.1rem;">$${itemTotal}</span>
        </div>
    `;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const totalDisplay = document.getElementById('total-display'); 
    const totals = calculateTotals();

    if (!container) return; // No estamos en la página de carrito

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

    // Redirigir si existe el contenedor de items
    if (document.getElementById('cart-items-container')) {
        renderCart();
    }

    // Asegurar que el icono del carrito funcione
    const cartBtn = document.getElementById('cart-icon-btn');
    if (cartBtn) {
        cartBtn.onclick = function() {
            window.location.href = '/html/Logeado/carrito.html';
        };
    }
});