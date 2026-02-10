let currentPage = 1;
const totalPages = 68;
const MAX_PAGES_VISIBLE = 7;

// Tus 8 libros reales con las rutas exactas
const misLibrosReales = [
    { id: 1, titulo: "Los fantasmas favoritos", autor: "Roald Dahl", precio: 399, img: "../Imagenes/Libro1.png" },
    { id: 2, titulo: "Joe Hill Fantasmas", autor: "Joe Hill", precio: 399, img: "../Imagenes/Libro2.png" },
    { id: 3, titulo: "Stephen King", autor: "Stephen King", precio: 399, img: "../Imagenes/Libro3.png" },
    { id: 4, titulo: "El Ritual", autor: "Adam Nevill", precio: 399, img: "../Imagenes/Libro4.png" },
    { id: 5, titulo: "Cine de Terror", autor: "Antonio José", precio: 399, img: "../Imagenes/Libro5.png" },
    { id: 6, titulo: "La noche del terror ciego", autor: "Lázaro Berber", precio: 399, img: "../Imagenes/Libro6.png" },
    { id: 7, titulo: "El sótano del terror", autor: "By Mart", precio: 399, img: "../Imagenes/Libro7.png" },
    { id: 8, titulo: "Hasta los huesos", autor: "J.R. Johansson", precio: 399, img: "../Imagenes/Libro8.png" }
];

document.addEventListener('DOMContentLoaded', () => {
    // REFERENCIA A TU ID REAL DEL HTML
    const productsContainer = document.getElementById('products-container');
    const paginationContainer = document.querySelector('.carousel-nav.catalog-pagination');

    if (!productsContainer || !paginationContainer) {
        console.error("No se encontró el contenedor 'products-container'. Revisa tu HTML.");
        return;
    }
    
    const prevBtn = paginationContainer.querySelector('#prev-page-btn');
    const nextBtn = paginationContainer.querySelector('#next-page-btn');
    const paginationDiv = paginationContainer.querySelector('.pagination');

    function loadProducts(page) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;

        // Limpiamos el contenedor y mostramos carga
        productsContainer.innerHTML = `
            <div class="loading-message" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h2>Cargando Catálogo...</h2>
                <p>Página ${page} de ${totalPages}</p>
            </div>`;

        setTimeout(() => {
            productsContainer.innerHTML = generateProducts(page);
            updatePaginationView();
        }, 300);
    }
    
    function generateProducts(page) {
        let html = '';
        // Si es la página 1, usamos tus libros reales
        if (page === 1) {
            misLibrosReales.forEach((libro, index) => {
                html += crearHtmlTarjeta(libro, index);
            });
        } 
        // Si es otra página, simulamos usando tus mismas portadas
        else {
            for (let i = 0; i < 8; i++) {
                const mockId = ((page - 1) * 8) + i + 1;
                const libroSimulado = {
                    id: mockId,
                    titulo: `Libro de Terror #${mockId}`,
                    precio: 399 + (i * 10),
                    img: `../Imagenes/Libro${(i % 8) + 1}.png`
                };
                html += crearHtmlTarjeta(libroSimulado, i);
            }
        }
        return html;
    }

    function crearHtmlTarjeta(libro, index) {
        // Aquí aplicamos la animación de cascada que pegaste en el CSS
        return `
            <div class="book-product-card" style="opacity: 0; animation: entradaCascada 0.6s ease forwards ${index * 0.1}s;">
                <span class="book-tag-grid" style="background-color: var(--color-secondary);">Oferta</span>
                <img src="${libro.img}" alt="${libro.titulo}"> 
                <p class="book-title-grid" style="font-weight: bold; margin: 10px 0;">${libro.titulo}</p>
                <div class="rating-small" style="color: #fbc02d; margin-bottom: 5px;">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                </div>
                <span class="book-price-grid" style="color: #d32f2f; font-weight: bold; font-size: 1.2em;">$${libro.precio}</span>
                <div class="product-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn-primary" style="flex: 1;">Añadir</button>
                    <button class="btn-secondary" style="flex: 1;">Comprar</button>
                </div>
            </div>`;
    }

    // --- LÓGICA DE PAGINACIÓN ---
    function updatePaginationView() {
        const pages = calculatePaginationRange();
        let html = '';
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="page-ellipsis" style="padding: 0 10px;">...</span>`;
            } else {
                const isActive = (p == currentPage) ? 'active' : '';
                html += `<span class="page-number ${isActive}" data-page="${p}" style="cursor:pointer; padding: 5px 10px; margin: 0 2px; border: 1px solid #ccc; border-radius: 4px;">${p}</span>`;
            }
        });
        paginationDiv.innerHTML = html;
        attachPaginationListeners();
    }

    function calculatePaginationRange() {
        const pages = [1];
        const delta = 2;
        const start = Math.max(2, currentPage - delta);
        const end = Math.min(totalPages - 1, currentPage + delta);
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);
        return Array.from(new Set(pages));
    }

    function attachPaginationListeners() {
        document.querySelectorAll('.page-number').forEach(span => {
            span.onclick = () => loadProducts(parseInt(span.dataset.page));
        });
        if (prevBtn) prevBtn.onclick = () => loadProducts(currentPage - 1);
        if (nextBtn) nextBtn.onclick = () => loadProducts(currentPage + 1);
        if (prevBtn) prevBtn.disabled = (currentPage === 1);
        if (nextBtn) nextBtn.disabled = (currentPage === totalPages);
    }

    loadProducts(1); // Carga inicial
});