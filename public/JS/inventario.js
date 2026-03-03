document
.getElementById("formAgregarProducto")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const producto = {
        titulo: document.getElementById("titulo").value,
        autor: document.getElementById("autor").value,
        precio: parseFloat(document.getElementById("precio").value),
        stock: parseInt(document.getElementById("stock").value),
        categoria: document.getElementById("categoria").value,
        imagen_url: document.getElementById("imagen_url").value
    };

    try {

        const res = await fetch("/api/productos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(producto)
        });

        const data = await res.json();

        if(data.success){

            alert("✅ Producto agregado");

            // limpiar formulario
            e.target.reset();

            // recargar tabla inventario
            cargarProductos();

        }else{
            alert(data.error);
        }

    } catch(err){
        console.error(err);
        alert("Error conectando servidor");
    }

});