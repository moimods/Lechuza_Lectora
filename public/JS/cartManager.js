function getCartItems() {
  return JSON.parse(localStorage.getItem("carrito") || "[]");
}

function updateCartBadge() {
  const total = getCartItems().reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);
  const badgeA = document.getElementById("cart-count");
  const badgeB = document.getElementById("cartCount");

  if (badgeA) badgeA.textContent = String(total);
  if (badgeB) badgeB.textContent = String(total);
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
