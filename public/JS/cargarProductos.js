async function cargarProductos(){

    const res = await fetch("/api/productos");
    const productos = await res.json();

    const tabla = document.getElementById("tablaProductos");
    tabla.innerHTML = "";

    productos.forEach(p => {

        tabla.innerHTML += `
            <tr>
                <td>${p.id_producto}</td>
                <td>${p.titulo}</td>
                <td>${p.autor}</td>
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
            </tr>
        `;
    });
}