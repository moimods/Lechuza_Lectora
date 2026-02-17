let cartItems = []; 
const CHECKOUT_START_URL = 'compra/resumen_compra.html'; 
const CART_PAGE_URL = 'carrito.html'; 
const STORAGE_KEY = 'laLechuzaLectoraCart'; 

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
}

function loadCart() {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
    }
}

function calculateTotals() {
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shippingCost = 0; 
    const total = subtotal + shippingCost;

    return {
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`,
        total: total.toFixed(2),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
}

function updateCartCount() {
    const totals = calculateTotals();
    const countElement = document.getElementById('cart-count');
    
    if (countElement) {
        countElement.textContent = totals.itemCount;
        countElement.style.display = totals.itemCount > 0 ? 'block' : 'none';
    }
}

function addToCart(producto, buyNow = false) {
    loadCart(); 
    if (buyNow) cartItems = []; 

    const itemIndex = cartItems.findIndex(item => String(item.id) === String(producto.id));
    
    if (itemIndex > -1) {
        cartItems[itemIndex].quantity += 1;
    } else {
        cartItems.push({ 
            id: producto.id, 
            quantity: 1, 
            price: parseFloat(producto.price), 
            name: producto.name,
            image: producto.image
        }); 
    }
    
    saveCart();
    updateCartCount();

    if (buyNow) {
        startCheckout();
    } else {
        alert(`${producto.name} se añadió al carrito.`);
    }
}

window.updateItemQuantity = function(productId, newQuantity) {
    const itemIndex = cartItems.findIndex(item => String(item.id) === String(productId));
    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            cartItems.splice(itemIndex, 1);
        } else {
            cartItems[itemIndex].quantity = newQuantity;
        }
        saveCart();
        updateCartCount();
        renderCart(); 
    }
};

window.removeItem = function(productId) {
    cartItems = cartItems.filter(item => String(item.id) !== String(productId));
    saveCart();
    updateCartCount();
    renderCart();
};

function generateCartItemHTML(item) {
    const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
    return `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="Portada de ${item.name}" onerror="this.src='../../Imagenes/logo.png'">
            <div class="item-details">
                <h2>${item.name}</h2>
                <p>Precio unitario: $${parseFloat(item.price).toFixed(2)}</p>
                <div class="item-quantity-controls">
                    <button class="btn-qty-control" onclick="updateItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="item-quantity-display">${item.quantity}</span>
                    <button class="btn-qty-control" onclick="updateItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <button class="btn-remove" onclick="removeItem('${item.id}')">Eliminar</button>
            </div>
            <span class="item-price">$${itemTotal}</span>
        </div>
    `;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totals = calculateTotals();
    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Tu carrito está vacío.</p>';
        document.getElementById('empty-cart-message').style.display = 'block';
    } else {
        document.getElementById('empty-cart-message').style.display = 'none';
        container.innerHTML = cartItems.map(generateCartItemHTML).join('');
    }

    const totalItemsDisplay = document.getElementById('total-items-display');
    if (totalItemsDisplay) totalItemsDisplay.textContent = totals.itemCount;
    const subtotalDisplay = document.getElementById('subtotal-display');
    if (subtotalDisplay) subtotalDisplay.textContent = `$${totals.subtotal}`;
    const totalDisplay = document.getElementById('total-display');
    if (totalDisplay) totalDisplay.textContent = `$${totals.total}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();

    // --- SOLUCIÓN PARA EL BOTÓN QUE NO REACCIONA ---
    const cartBtn = document.getElementById('cart-icon-btn');
    if (cartBtn) {
        cartBtn.onclick = function() {
            window.location.href = 'carrito.html';
        };
    }

    if (window.location.pathname.includes(CART_PAGE_URL)) {
        renderCart();
    }
});