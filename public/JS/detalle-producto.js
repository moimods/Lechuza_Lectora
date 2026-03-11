(function () {
  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("producto"));
  const mode = (params.get("mode") || "public").toLowerCase();

  const statusEl = document.getElementById("detail-status");
  const contentEl = document.getElementById("detail-content");
  const backLink = document.getElementById("link-back-catalog");

  if (backLink) {
    backLink.href = mode === "logged" ? "/html/Logeado/Catalogo_Logeado.html" : "/html/Catalogo.html";
  }

  function setStatus(message) {
    if (statusEl) {
      statusEl.style.display = "block";
      statusEl.textContent = message;
    }
    if (contentEl) {
      contentEl.style.display = "none";
    }
  }

  function showContent() {
    if (statusEl) {
      statusEl.style.display = "none";
    }
    if (contentEl) {
      contentEl.style.display = "grid";
    }
  }

  function buildDescription(product) {
    if (product.descripcion && product.descripcion.trim()) {
      return product.descripcion;
    }

    const titulo = product.titulo || "Este libro";
    const autor = product.autor || "un autor destacado";
    const categoria = product.categoria || "la colección de la librería";

    return `${titulo} de ${autor} forma parte de ${categoria}. Disponible en La Lechuza Lectora con envío a domicilio y compra segura.`;
  }

  function normalizeImage(product) {
    if (!product?.imagen_url) {
      return "/Imagenes/The_Sisters_Brothers.png";
    }

    if (product.imagen_url.startsWith("http://") || product.imagen_url.startsWith("https://") || product.imagen_url.startsWith("/")) {
      return product.imagen_url;
    }

    return `/${String(product.imagen_url).replace(/^\/+/, "")}`;
  }

  function renderProduct(product) {
    const title = product.titulo || "Sin título";
    const author = product.autor || "Autor no disponible";
    const category = product.categoria || "Sin categoría";
    const stock = Number(product.stock || 0);
    const price = Number(product.precio || 0);

    const imageEl = document.getElementById("book-image");
    const titleEl = document.getElementById("book-title");
    const authorEl = document.getElementById("book-author");
    const categoryEl = document.getElementById("book-category");
    const stockEl = document.getElementById("book-stock");
    const priceEl = document.getElementById("book-price");
    const descEl = document.getElementById("book-description");

    if (imageEl) {
      imageEl.src = normalizeImage(product);
      imageEl.onerror = function () {
        this.onerror = null;
        this.src = "/Imagenes/The_Sisters_Brothers.png";
      };
    }
    if (titleEl) titleEl.textContent = title;
    if (authorEl) authorEl.textContent = author;
    if (categoryEl) categoryEl.textContent = category;
    if (stockEl) stockEl.textContent = stock > 0 ? `${stock} unidades` : "Agotado";
    if (priceEl) priceEl.textContent = `$${price.toFixed(2)}`;
    if (descEl) descEl.textContent = buildDescription(product);

    const addButton = document.getElementById("btn-add-cart");
    const buyButton = document.getElementById("btn-buy");

    addButton?.addEventListener("click", () => {
      if (typeof window.agregarAlCarrito === "function") {
        window.agregarAlCarrito(product);
      }
      if (typeof window.updateCartBadge === "function") {
        window.updateCartBadge();
      }
    });

    buyButton?.addEventListener("click", () => {
      if (typeof window.agregarAlCarrito === "function") {
        window.agregarAlCarrito(product);
      }
      window.location.href = "/html/Logeado/carrito.html";
    });

    showContent();
  }

  async function loadProduct() {
    if (!Number.isFinite(productId) || productId <= 0) {
      setStatus("No se encontró el producto solicitado.");
      return;
    }

    try {
      const response = await fetch(`/api/productos/${productId}`, { credentials: "include" });
      if (!response.ok) {
        throw new Error("No se pudo cargar el producto");
      }

      const payload = await response.json();
      const product = payload?.data || payload;
      if (!product || !product.id_producto) {
        throw new Error("Producto inválido");
      }

      renderProduct(product);
    } catch (error) {
      console.error(error);
      setStatus("No fue posible cargar este producto. Intenta de nuevo.");
    }
  }

  document.addEventListener("DOMContentLoaded", loadProduct);
})();