function getCartItems() {
  const raw = JSON.parse(localStorage.getItem("carrito") || "[]");
  return Array.isArray(raw) ? raw : [];
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

document.addEventListener("DOMContentLoaded", updateCartBadge);
window.addEventListener("storage", (event) => {
  if (event.key === "carrito") {
    updateCartBadge();
  }
});
