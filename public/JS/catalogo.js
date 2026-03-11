let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let totalPages = 1;
const LIMIT = 12;

const bodyConfig = {
  mode: document.body?.dataset?.catalogMode || "public",
  loginPath: document.body?.dataset?.catalogLoginPath || "/html/Inicio_de_sesion/Inicio_sesion.html",
  homePath: document.body?.dataset?.catalogHomePath || "/index.html",
  cartPath: document.body?.dataset?.catalogCartPath || "/html/Logeado/carrito.html",
  detailPath: document.body?.dataset?.catalogDetailPath || "/html/Detalle_producto.html"
};

function toggleMobileMenu() {
  const nav = document.getElementById("mobile-nav");
  const toggleButton = document.getElementById("hamburger-btn");
  if (!nav || !toggleButton) return;

  const isOpen = !nav.classList.contains("active");
  nav.classList.toggle("active", isOpen);
  toggleButton.classList.toggle("is-open", isOpen);
  toggleButton.setAttribute("aria-expanded", String(isOpen));
}

function normalizeApiProducts(payload) {
  if (Array.isArray(payload)) {
    return { data: payload, pagination: null };
  }

  if (payload && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      pagination: payload.pagination || null
    };
  }

  return { data: [], pagination: null };
}

function getImageSrc(product) {
  const numericId = Number(product.id_producto || 1);
  const fallbackImages = [
    "/Imagenes/The_Sisters_Brothers.png",
    "/Imagenes/perfume.png",
    "/Imagenes/diario_de_ana_frank.png",
    "/Imagenes/viagem_ao_centro_da_terra.png",
    "/Imagenes/don_quijote_de_la_mancha.png",
    "/Imagenes/el_instituto.png",
    "/Imagenes/el_hobbit.png",
    "/Imagenes/Cuando_Reescribamos_La_Historia.png"
  ];
  const fallbackById = fallbackImages[((numericId - 1) % fallbackImages.length + fallbackImages.length) % fallbackImages.length];

  if (!product.imagen_url || typeof product.imagen_url !== "string") {
    return fallbackById;
  }

  if (product.imagen_url.startsWith("http://") || product.imagen_url.startsWith("https://") || product.imagen_url.startsWith("/")) {
    return product.imagen_url;
  }

  if (product.imagen_url.includes("Imagenes/")) {
    return `/${product.imagen_url.replace(/^\/+/, "")}`;
  }

  return fallbackById;
}

function getProductCategory(product) {
  return (
    product.categoria ||
    product.genero ||
    product.categoria_nombre ||
    product.genero_nombre ||
    ""
  );
}

function ensureCategoryFilters(products) {
  const container = document.getElementById("categories-filter");
  if (!container) return;

  const categories = [...new Set(products.map((p) => getProductCategory(p)).filter(Boolean))];
  if (categories.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = categories
    .map((category) => `<label><input type="checkbox" class="genre-filter" value="${category}"> ${category}</label>`)
    .join("");
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "book-product-card";

  const safeTitle = product.titulo || "Sin título";
  const safeAuthor = product.autor || "Autor no disponible";
  const safePrice = Number(product.precio || 0);
  const imageSrc = getImageSrc(product);

  card.innerHTML = `
    <div>
      <img class="btn-open-detail" data-product-id="${product.id_producto}" src="${imageSrc}" alt="${safeTitle}" onerror="this.onerror=null;this.src='/Imagenes/The_Sisters_Brothers.png';" style="cursor:pointer;">
      <h3 style="font-size:1rem; margin:10px 0; color:#5d4037;">${safeTitle}</h3>
      <p style="font-size:0.8rem; color:#777; margin-bottom:10px;">${safeAuthor}</p>
    </div>
    <div>
      <span style="font-weight:bold; color:#d32f2f; font-size:1.2rem; display:block; margin-bottom:15px;">$${safePrice.toFixed(2)}</span>
      <div style="display:flex; gap:8px;">
        <button class="btn-open-detail" data-product-id="${product.id_producto}" style="flex:2; background:#fff; color:#5d4037; border:1px solid #5d4037; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">Detalle</button>
        <button class="btn-add-cart" data-product-id="${product.id_producto}" style="flex:1; background:#5d4037; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer;"><i class="fa-solid fa-cart-plus"></i></button>
        <button class="btn-buy-now" data-product-id="${product.id_producto}" style="flex:2; background:#fbc02d; color:#5d4037; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">Comprar</button>
      </div>
    </div>
  `;

  return card;
}

function renderBooks(books) {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = "";

  if (books.length === 0) {
    container.innerHTML = `<p style="color:white; grid-column: 1/-1; text-align:center;">No se encontraron libros que coincidan.</p>`;
    return;
  }

  books.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

function renderPagination(pagination) {
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const indicator = document.getElementById("page-indicator") || document.getElementById("page-info");

  if (!prevBtn || !nextBtn || !indicator) return;

  if (pagination) {
    totalPages = Math.max(1, Number(pagination.totalPages || 1));
    currentPage = Math.max(1, Number(pagination.page || currentPage));
  } else {
    totalPages = 1;
    currentPage = 1;
  }

  indicator.textContent = `Página ${currentPage}${totalPages > 1 ? ` de ${totalPages}` : ""}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function applyFilters(products) {
  const selectedGenres = Array.from(document.querySelectorAll(".genre-filter:checked")).map((input) => input.value);
  const priceValue = document.querySelector('input[name="price"]:checked')?.value || "all";
  const term = (document.getElementById("main-search")?.value || "").trim().toLowerCase();

  return products.filter((product) => {
    const title = (product.titulo || "").toLowerCase();
    const author = (product.autor || "").toLowerCase();
    const category = getProductCategory(product);
    const price = Number(product.precio || 0);

    const matchesTerm = !term || title.includes(term) || author.includes(term);
    const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(category);

    let matchesPrice = true;
    if (priceValue === "0-300") matchesPrice = price <= 300;
    if (priceValue === "300-600") matchesPrice = price >= 300 && price <= 600;
    if (priceValue === "600+") matchesPrice = price > 600;

    return matchesTerm && matchesGenre && matchesPrice;
  });
}

function guardCatalogAccess() {
  if (bodyConfig.mode !== "logged") return true;

  const usuario = JSON.parse(
    localStorage.getItem("usuario_logeado") ||
    localStorage.getItem("usuario") ||
    localStorage.getItem("usuarioCompleto") ||
    "null"
  );
  if (!usuario) {
    window.location.href = bodyConfig.loginPath;
    return false;
  }

  return true;
}

async function cargarProductos(page = 1) {
  try {
    const response = await fetch(`/api/productos?page=${page}&limit=${LIMIT}`, {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el catálogo");
    }

    const payload = await response.json();
    const normalized = normalizeApiProducts(payload);

    allProducts = normalized.data;
    ensureCategoryFilters(allProducts);
    filteredProducts = applyFilters(allProducts);

    renderBooks(filteredProducts);
    renderPagination(normalized.pagination);
  } catch (error) {
    const container = document.getElementById("products-container");
    if (container) {
      container.innerHTML = `<p style="color:white; grid-column: 1/-1; text-align:center;">Error al cargar productos. Intenta recargar la página.</p>`;
    }
    console.error(error);
  }
}

function setupFilterEvents() {
  const search = document.getElementById("main-search");

  search?.addEventListener("input", () => {
    filteredProducts = applyFilters(allProducts);
    renderBooks(filteredProducts);
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.classList.contains("genre-filter") && target.name !== "price") return;
    filteredProducts = applyFilters(allProducts);
    renderBooks(filteredProducts);
  });
}

function setupNavigationEvents() {
  const filterToggle = document.getElementById("filter-toggle");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("filter-sidebar");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  filterToggle?.addEventListener("click", () => sidebar?.classList.add("active"));
  sidebarCloseBtn?.addEventListener("click", () => sidebar?.classList.remove("active"));

  prevBtn?.addEventListener("click", async () => {
    if (currentPage <= 1) return;
    await cargarProductos(currentPage - 1);
    window.scrollTo(0, 0);
  });

  nextBtn?.addEventListener("click", async () => {
    if (currentPage >= totalPages) return;
    await cargarProductos(currentPage + 1);
    window.scrollTo(0, 0);
  });

  document.addEventListener("click", (event) => {
    const nav = document.getElementById("mobile-nav");
    const hamburger = document.getElementById("hamburger-btn");
    if (!nav || !hamburger) return;

    if (nav.classList.contains("active") && !hamburger.contains(event.target) && !nav.contains(event.target)) {
      nav.classList.remove("active");
      hamburger.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
}

function setupProductActions() {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.addEventListener("click", (event) => {
    const addBtn = event.target.closest(".btn-add-cart");
    const buyBtn = event.target.closest(".btn-buy-now");
    const detailBtn = event.target.closest(".btn-open-detail");

    if (!addBtn && !buyBtn && !detailBtn) return;

    const productId = Number((addBtn || buyBtn || detailBtn).dataset.productId);
    const product = allProducts.find((item) => Number(item.id_producto) === productId);
    if (!product) return;

    if (detailBtn) {
      window.location.href = `${bodyConfig.detailPath}?producto=${encodeURIComponent(product.id_producto)}&mode=${encodeURIComponent(bodyConfig.mode)}`;
      return;
    }

    if (typeof window.agregarAlCarrito === "function") {
      window.agregarAlCarrito(product);
    }

    if (buyBtn) {
      window.location.href = bodyConfig.cartPath;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!guardCatalogAccess()) return;
  setupFilterEvents();
  setupNavigationEvents();
  setupProductActions();
  await cargarProductos(1);
});
