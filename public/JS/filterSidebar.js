document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES ---
    const sidebar = document.getElementById('filter-sidebar');
    const toggleButton = document.getElementById('filter-toggle');
    const closeButton = document.getElementById('sidebar-close-btn');
    const priceRangeInput = document.getElementById('price-range-input');
    const priceMaxDisplay = document.getElementById('price-max-display');
    const pagesRangeInput = document.getElementById('pages-range-input');
    const pagesMaxDisplay = document.getElementById('pages-max-display');
    const activeFiltersContainer = document.getElementById('active-filters-tags');
    
    // Todos los inputs de filtro
    const filterOptions = document.querySelectorAll('.filter-options input');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    
    // IMPORTANTE: Selector de tus tarjetas de producto
    const productCards = document.querySelectorAll('.product-card'); 

    // --- 1. SIDEBAR ---
    const toggleSidebar = () => sidebar.classList.toggle('active');
    if (toggleButton) toggleButton.addEventListener('click', toggleSidebar);
    if (closeButton) closeButton.addEventListener('click', toggleSidebar);

    // --- 2. ACTUALIZACIÓN DE UI DE RANGOS ---
    function updateRangeUI(input, display, unit = '') {
        if (!input || !display) return;
        display.textContent = `${input.value}${unit}`;
        applyFilters(); // Aplicar filtros cada vez que se desliza
    }

    if (priceRangeInput) {
        priceRangeInput.addEventListener('input', () => updateRangeUI(priceRangeInput, priceMaxDisplay, '$'));
    }
    if (pagesRangeInput) {
        pagesRangeInput.addEventListener('input', () => updateRangeUI(pagesRangeInput, pagesMaxDisplay, ' págs'));
    }

    // --- 3. LÓGICA DE FILTRADO PRINCIPAL ---
    function applyFilters() {
        const filters = {
            generos: Array.from(document.querySelectorAll('input[name="genero"]:checked')).map(i => i.value),
            precioMax: priceRangeInput ? parseInt(priceRangeInput.value) : Infinity,
            paginasMax: pagesRangeInput ? parseInt(pagesRangeInput.value) : Infinity,
            color: document.querySelector('.color-swatch.selected')?.getAttribute('data-filter') || null
        };

        productCards.forEach(card => {
            // Extraer datos del HTML del producto (usando data-attributes)
            const pPrecio = parseInt(card.getAttribute('data-price'));
            const pPaginas = parseInt(card.getAttribute('data-pages'));
            const pGenero = card.getAttribute('data-genre');
            const pColor = card.getAttribute('data-color');

            // Validaciones
            const matchPrecio = pPrecio <= filters.precioMax;
            const matchPaginas = pPaginas <= filters.paginasMax;
            const matchGenero = filters.generos.length === 0 || filters.generos.includes(pGenero);
            const matchColor = !filters.color || pColor === filters.color;

            // Mostrar u Ocultar
            if (matchPrecio && matchPaginas && matchGenero && matchColor) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        renderTags(filters);
    }

    // --- 4. RENDERIZADO DE TAGS (Las etiquetas X) ---
    function renderTags(filters) {
        activeFiltersContainer.innerHTML = '';

        // Crear tags para géneros
        filters.generos.forEach(gen => createTag(gen, 'genero'));
        
        // Tag de Color
        if (filters.color) createTag(`Color: ${filters.color}`, 'color');

        // Tag de Precio (solo si no es el máximo)
        if (priceRangeInput && filters.precioMax < parseInt(priceRangeInput.max)) {
            createTag(`Bajo $${filters.precioMax}`, 'precio');
        }
    }

    function createTag(text, type) {
        const tag = document.createElement('span');
        tag.className = 'tag selected active-filter';
        tag.innerHTML = `${text} <i class="fa-solid fa-xmark" data-type="${type}" data-value="${text}"></i>`;
        
        tag.querySelector('i').addEventListener('click', () => {
            removeFilter(type, text);
        });
        
        activeFiltersContainer.appendChild(tag);
    }

    function removeFilter(type, value) {
        if (type === 'genero') {
            const check = document.querySelector(`input[value="${value}"]`);
            if (check) check.checked = false;
        } else if (type === 'color') {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        } else if (type === 'precio') {
            priceRangeInput.value = priceRangeInput.max;
        }
        applyFilters();
    }

    // --- 5. EVENTOS INICIALES ---
    filterOptions.forEach(input => input.addEventListener('change', applyFilters));
    
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            const isSelected = e.target.classList.contains('selected');
            colorSwatches.forEach(s => s.classList.remove('selected'));
            if (!isSelected) e.target.classList.add('selected'); // Toggle selección
            applyFilters();
        });
    });

    // Ejecutar al cargar
    applyFilters();
});