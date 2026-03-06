document.addEventListener('DOMContentLoaded', async () => {
    // 1. VALIDACIÓN DE SEGURIDAD
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
        window.location.href = '/html/Inicio_de_sesion/Inicio_sesion.html';
        return;
    }

    const usuario = JSON.parse(usuarioStr);
    if (usuario.rol !== 'admin') {
        window.location.href = '/';
        return;
    }

    // 2. CARGAR ESTADÍSTICAS REALES
    await cargarEstadisticas();

    // 3. GESTIÓN DE CLICS EN MÓDULOS
    const modules = document.querySelectorAll('.action-module');
    modules.forEach(module => {
        module.addEventListener('click', () => {
            const titleElement = module.querySelector('h3');
            if (!titleElement) return;

            const moduleName = titleElement.innerText.trim();
            
            switch (moduleName) {
                case "Reporte Ventas":
                    window.location.href = "/admin/reporte-ventas";
                    break;
                case "Inventario":
                    window.location.href = "/admin/inventario";
                    break;
                case "Pedidos Clientes":
                    window.location.href = "/admin/reporte-compras";
                    break;
                case "Nuevo Producto":
                    window.location.href = "/admin/nuevo-producto";
                    break;
            }
        });
    });
});

// ✅ FUNCIÓN MEJORADA CON ENDPOINTS CORRECTOS
async function cargarEstadisticas() {
    try {
        // Obtener estadísticas del admin (requiere JWT)
        const token = localStorage.getItem('laLechuza_jwt_token');
        const response = await fetch('/api/admin/estadisticas', {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }

        const raw = await response.json();
        const stats = raw.data || raw;

        // Actualizar elementos DOM
        const stockEl = document.getElementById('count-stock');
        const librosEl = document.getElementById('count-libros');
        const pedidosEl = document.getElementById('count-pedidos');
        const ingresosEl = document.getElementById('count-ingresos');

        const totalProductos = stats?.productos?.total_productos ?? 0;
        const totalVentas = stats?.ventas?.total_ventas ?? 0;
        const totalIngresos = stats?.ventas?.total_ingresos ?? 0;
        const totalUsuarios = stats?.usuarios?.total_usuarios ?? 0;

        if (stockEl) {
            stockEl.innerText = `${totalProductos} unidades`;
        }
        if (librosEl) {
            librosEl.innerText = `${totalProductos} títulos`;
        }
        if (pedidosEl) {
            pedidosEl.innerText = `${totalVentas} pedidos`;
        }
        if (ingresosEl) {
            ingresosEl.innerText = `$${parseFloat(totalIngresos || 0).toFixed(2)} | ${totalUsuarios} clientes`;
        }

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        alert("⚠️ No se pudieron cargar las estadísticas. Intenta recargar.");
    }
}

// Lógica de contacto
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-contact-us')) {
        window.location.href = '/html/Contacto.html';
    }
});