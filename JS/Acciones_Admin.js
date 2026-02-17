document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos todos los módulos del panel
    const modules = document.querySelectorAll('.action-module');

    modules.forEach(module => {
        module.addEventListener('click', () => {
            // Obtenemos el nombre del módulo para saber a dónde redirigir
            const titleElement = module.querySelector('h3');
            if (!titleElement) return;

            const moduleName = titleElement.innerText.trim();

            // Usamos rutas relativas simples para evitar el error 404
            if (moduleName === "Reportes de Ventas") {
                window.location.href = "Reporte_de_ventas.html";
            } 
            else if (moduleName === "Almacén de Libros") {
                // Forzamos el nombre exacto del archivo en minúsculas
                window.location.href = "gestion_de_inventario.html";
            }
            else if (moduleName === "Reportes de Compras") {
                window.location.href = "Reporte_de_compras.html";
            }
        });
    });
});