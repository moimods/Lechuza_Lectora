function getCartItems() {
  const raw = JSON.parse(localStorage.getItem("carrito") || "[]");
  return Array.isArray(raw) ? raw : [];
}

function initializeCartForSession() {
  const initKey = "laLechuza_cart_initialized";
  if (sessionStorage.getItem(initKey) === "1") return;

  const token = localStorage.getItem("laLechuza_jwt_token");
  if (!token) {
    localStorage.removeItem("carrito");
    localStorage.removeItem("laLechuzaLectoraCart");
  }

  sessionStorage.setItem(initKey, "1");
}

function updateCartBadge() {
  const total = getCartItems().reduce(
    (sum, item) => sum + (Number(item.cantidad ?? item.qty ?? item.quantity) || 0),
    0
  );
  const badgeA = document.getElementById("cart-count");
  const badgeB = document.getElementById("cartCount");

  if (badgeA) badgeA.textContent = String(total);
  if (badgeB) badgeB.textContent = String(total);
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCartForSession();
  updateCartBadge();
});
window.addEventListener("storage", (event) => {
  if (event.key === "carrito") {
    updateCartBadge();
  }
});
