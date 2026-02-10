let currentPage = 1;
const totalPages = 68;
const MAX_PAGES_VISIBLE = 7;

// Tus 8 libros reales con las rutas corregidas a tus archivos .png
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
    const productsContainer = document.getElementById('products-container');
    const paginationContainer = document.querySelector('.carousel-nav.catalog-pagination');

    if (!productsContainer || !paginationContainer) {
        console.error("No se encontraron los contenedores de productos o paginación.");
        return;
    }
    
    const prevBtn = paginationContainer.querySelector('#prev-page-btn');
    const nextBtn = paginationContainer.querySelector('#next-page-btn');
    const paginationDiv = paginationContainer.querySelector('.pagination');

    function loadProducts(page) {
        if (page < 1 || page > totalPages) return;

        currentPage = page;
        
        // Efecto de carga
        productsContainer.innerHTML = `
            <div class="loading-message">
                <h2>Cargando Catálogo...</h2>
                <p>Página ${page} de ${totalPages}</p>
            </div>
        `;

        setTimeout(() => {
            // Aquí cargamos los productos (Reales en pág 1, simulados en el resto)
            productsContainer.innerHTML = generateMockProducts(page);
            updatePaginationView();

            if (typeof initCartListeners === 'function') {
                initCartListeners(); 
            }
        }, 300);
    }
    
    function generateMockProducts(page) {
        let html = '';
        
        // PÁGINA 1: Tus libros reales con animación
        if (page === 1) {
            misLibrosReales.forEach((libro, index) => {
                html += crearHtmlTarjeta(libro, index);
            });
        } 
        // OTRAS PÁGINAS: Simulación para que no se vea vacío
        else {
            const itemsPerPage = 8;
            const start = (page - 1) * itemsPerPage;
            for (let i = 0; i < itemsPerPage; i++) {
                const mockId = start + i + 1;
                const libroSimulado = {
                    id: mockId,
                    titulo: `Libro de Terror #${mockId}`,
                    autor: "Autor de la Lechuza",
                    precio: 399 + (mockId * 2),
                    img: `../Imagenes/Libro${(i % 8) + 1}.png` // Rotamos tus portadas reales
                };
                html += crearHtmlTarjeta(libroSimulado, i);
            }
        }
        return html;
    }

    // Función unificada para crear el HTML de la tarjeta
    function crearHtmlTarjeta(libro, index) {
        return `
            <div class="book-product-card" style="opacity: 0; transform: translateY(30px); animation: entradaCascada 0.6s ease forwards ${index * 0.1}s;">
                <span class="book-tag-grid" style="background-color: var(--color-secondary);">Oferta</span>
                <img src="${libro.img}" alt="${libro.titulo}"> 
                <p class="book-title-grid">${libro.titulo}</p>
                <div class="rating-small">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <span>4.8</span>
                </div>
                <span class="book-price-grid">$${libro.precio}</span>
                <div class="product-actions">
                    <button class="btn-primary btn-add-to-cart" data-product-id="${libro.id}">
                        Añadir al Carrito
                    </button>
                    <button class="btn-secondary btn-buy-now">
                        Comprar
                    </button>
                </div>
            </div>
        `;
    }

    // --- TU LÓGICA DE PAGINACIÓN (Mantenida intacta) ---
    function calculatePaginationRange() {
        const pages = [];
        const delta = 2; 
        const start = Math.max(2, currentPage - delta);
        const end = Math.min(totalPages - 1, currentPage + delta);

        pages.push(1);
        if (start > 2) { pages.push('...'); }
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) { pages.push(i); }
        }
        if (end < totalPages - 1) { pages.push('...'); }
        if (totalPages > 1 && !pages.includes(totalPages)) { pages.push(totalPages); }
        
        const uniquePages = Array.from(new Set(pages));
        return uniquePages.filter((p, index) => {
            if (p === '...' && uniquePages[index - 1] === 1) return false;
            return true;
        });
    }

    function updatePaginationView() {
        const pages = calculatePaginationRange();
        let html = '';
        
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="page-ellipsis">...</span>`;
            } else {
                const isActive = (p == currentPage) ? 'active' : '';
                html += `<span class="page-number ${isActive}" data-page="${p}">${p}</span>`;
            }
        });

        paginationDiv.innerHTML = html;
        attachPaginationListeners();
    }

    function handleCustomPageInput(span) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 1;
        input.max = totalPages;
        input.value = span.getAttribute('data-page');
        input.className = 'custom-page-input';
        
        span.parentNode.replaceChild(input, span);
        input.focus();

        const finalizeInput = () => {
            const newPage = parseInt(input.value);
            if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
                loadProducts(newPage);
            } else {
                updatePaginationView();
            }
        };

        input.addEventListener('blur', finalizeInput);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finalizeInput();
        });
    }

    function attachPaginationListeners() {
        document.querySelectorAll('.page-number').forEach(span => {
            const page = parseInt(span.getAttribute('data-page'));
            span.addEventListener('click', () => loadProducts(page));
            if (page === totalPages) {
                 span.addEventListener('dblclick', () => handleCustomPageInput(span));
            }
        });

        if (prevBtn) prevBtn.onclick = () => loadProducts(currentPage - 1);
        if (nextBtn) nextBtn.onclick = () => loadProducts(currentPage + 1);
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }

    loadProducts(1);
});