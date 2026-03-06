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
        const token = localStorage.getItem("laLechuza_jwt_token");

        const res = await fetch("/api/productos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(producto)
        });

        const data = await res.json();

        if (data.ok || data.success) {

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