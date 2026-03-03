async function cargarProductos(){

    const res = await fetch('/api/productos');
    const productos = await res.json();

    const contenedor = document.getElementById("listaProductos");

    contenedor.innerHTML = productos.map(p => `
        <div class="producto">
            <h3>${p.titulo}</h3>
            <p>$${p.precio}</p>
        </div>
    `).join('');
}

cargarProductos();