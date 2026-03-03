document.addEventListener('DOMContentLoaded', async () => {
    // 1. VALIDACIÓN DE SEGURIDAD
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario || usuario.rol !== 'admin') {
        window.location.href = '/login'; 
        return;
    }

    // 2. CARGAR DATOS REALES (ESTADÍSTICAS)
    await cargarEstadisticas();

    // 3. GESTIÓN DE CLICS EN MÓDULOS
    const modules = document.querySelectorAll('.action-module');
    modules.forEach(module => {
        module.addEventListener('click', () => {
            const titleElement = module.querySelector('h3');
            if (!titleElement) return;

            const moduleName = titleElement.innerText.trim();
            
            switch (moduleName) {
                case "Reporte Ventas": window.location.href = "/admin/reporte-ventas"; break;
                case "Inventario": window.location.href = "/admin/inventario"; break;
                case "Pedidos Clientes": window.location.href = "/admin/reporte-compras"; break;
                case "Nuevo Producto": window.location.href = "/admin/nuevo-producto"; break;
            }
        });
    });
});

// FUNCIÓN PARA OBTENER DATOS DEL SERVER
async function cargarEstadisticas() {
    try {
        // Llamamos a la API de productos que ya tienes en index.js
        const res = await fetch('/api/productos');
        const productos = await res.json();

        // Calculamos el total de stock
        const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);
        const totalLibros = productos.length;

        // Buscamos los elementos en tu HTML (asegúrate de que los IDs coincidan)
        const stockEl = document.getElementById('count-stock');
        const librosEl = document.getElementById('count-libros');

        if (stockEl) stockEl.innerText = `${totalStock} unidades`;
        if (librosEl) librosEl.innerText = `${totalLibros} títulos`;

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
}

// Lógica de contacto
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-contact-us')) {
        window.location.href = '/contacto';
    }
});