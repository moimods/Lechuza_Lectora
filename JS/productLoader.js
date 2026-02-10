let currentPage = 1;
const totalPages = 68;
const MAX_PAGES_VISIBLE = 7;

// Tus 8 libros reales con sus títulos y precios
const misLibrosReales = [
    { id: 1, titulo: "Sister brothers", autor: "Roald Dahl", precio: 399, img: "../Imagenes/Libro1.png" },
    { id: 2, titulo: "Perfume", autor: "Joe Hill", precio: 356, img: "../Imagenes/Libro2.png" },
    { id: 3, titulo: "Diario de ana frank", autor: "Stephen King", precio: 456, img: "../Imagenes/Libro3.png" },
    { id: 4, titulo: "Julio verde", autor: "Adam Nevill", precio: 764, img: "../Imagenes/Libro4.png" },
    { id: 5, titulo: "Cine de Terror", autor: "Antonio José", precio: 412, img: "../Imagenes/Libro5.png" },
    { id: 6, titulo: "Stephen King", autor: "Lázaro Berber", precio: 342, img: "../Imagenes/Libro6.png" },
    { id: 7, titulo: "El hobbit", autor: "By Mart", precio: 755, img: "../Imagenes/Libro7.png" },
    { id: 8, titulo: "cuando resolvamos la historia", autor: "J.R. Johansson", precio: 432, img: "../Imagenes/Libro8.png" }
];

document.addEventListener('DOMContentLoaded', () => {
    
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

        // Limpiamos y mostramos el mensaje de carga
        productsContainer.innerHTML = `
            <div class="loading-message" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h2 style="color: #5d4037;">Cargando Catálogo...</h2>
                <p>Página ${page} de ${totalPages}</p>
            </div>`;

        // Esperamos un momento para que se vea la transición
        setTimeout(() => {
            productsContainer.innerHTML = generateProducts(page);
            updatePaginationView();
        }, 300);
    }
    
    function generateProducts(page) {
        let html = '';
        
        // Página 1: Usamos tus libros reales con sus nombres
        if (page === 1) {
            misLibrosReales.forEach((libro, index) => {
                html += crearHtmlTarjeta(libro, index);
            });
        } 
        // Otras páginas: Simulamos el contenido usando tus portadas
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
        // El secreto de la animación está en el "animation-delay" (${index * 0.1}s)
        return `
            <div class="book-product-card" style="opacity: 0; animation: entradaCascada 0.6s ease forwards ${index * 0.1}s; background-color: rgba(240, 231, 203, 0.9); padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; position: relative;">
                <span class="book-tag-grid" style="background-color: #fbc02d; color: white; padding: 3px 10px; border-radius: 8px 0; position: absolute; top: 0; left: 0; font-size: 0.8em;">Oferta</span>
                <img src="${libro.img}" alt="${libro.titulo}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 4px;"> 
                <p class="book-title-grid" style="font-weight: bold; margin: 10px 0; color: #5d4037;">${libro.titulo}</p>
                <div class="rating-small" style="color: #fbc02d; margin-bottom: 5px;">
                    <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                </div>
                <span class="book-price-grid" style="color: #d32f2f; font-weight: bold; font-size: 1.2em;">$${libro.precio}</span>
                <div class="product-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn-primary" style="flex: 1; background-color: #5d4037; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Añadir</button>
                    <button class="btn-secondary" style="flex: 1; background-color: transparent; border: 2px solid #5d4037; color: #5d4037; padding: 8px; border-radius: 5px; cursor: pointer;">Comprar</button>
                </div>
            </div>`;
    }

    // --- MÓDULO DE PAGINACIÓN ---
    function updatePaginationView() {
        const pages = calculatePaginationRange();
        let html = '';
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="page-ellipsis" style="padding: 0 10px;">...</span>`;
            } else {
                const isActive = (p == currentPage) ? 'background-color: #fbc02d; color: #333; font-weight: bold;' : '';
                html += `<span class="page-number" data-page="${p}" style="cursor:pointer; padding: 5px 10px; margin: 0 2px; border: 1px solid #ccc; border-radius: 4px; ${isActive}">${p}</span>`;
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

    loadProducts(1);
});