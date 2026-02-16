document.addEventListener('DOMContentLoaded', () => {

    const modules = document.querySelectorAll('.action-module');

    modules.forEach(module => {
        module.addEventListener('click', () => {
           
            const moduleName = module.querySelector('h3').innerText.trim();

            if (moduleName === "Reportes de Ventas") {
              
                window.location.href = "Reporte_de_ventas.html";
            } 
            else if (moduleName === "Almacén de Libros") {
                window.location.href = "gestion_de_inventario.html";
            }
            else if (moduleName === "Reportes de Compras") {
                window.location.href = "Reporte_de_compras.html";
            }
        });
    });
});