document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos los módulos del panel de administración
    const modules = document.querySelectorAll('.action-module');

    modules.forEach(module => {
        module.addEventListener('click', () => {
            const titleElement = module.querySelector('h3');
            if (!titleElement) return;

            const moduleName = titleElement.innerText.trim();

            // CORRECCIÓN CRÍTICA: Aseguramos que los nombres de los archivos coincidan con Vercel
            if (moduleName === "Reportes de Ventas") {
                // Si el archivo en tu carpeta tiene mayúsculas, cámbialo aquí también
                window.location.href = "Reporte_de_ventas.html";
            } 
            else if (moduleName === "Almacén de Libros") {
                // Según tu código anterior, el archivo se llama Gestion_de_inventario.html
                window.location.href = "Gestion_de_inventario.html";
            }
            else if (moduleName === "Reportes de Compras") {
                window.location.href = "Reporte_de_compras.html";
            }
        });
    });
});